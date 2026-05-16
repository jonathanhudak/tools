import { useRef, useEffect, useCallback, useState } from 'react';
import { useStore } from './lib/store';
import { getCtx, getMasterGain, startRecording } from './lib/audio-engine';
import type { Clip } from './lib/types';

/* ── SVG Pattern Defs ── */
function PatternDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <pattern id="pat-dots" patternUnits="userSpaceOnUse" width="6" height="6">
          <rect width="6" height="6" fill="#fff" />
          <circle cx="3" cy="3" r="1.2" fill="#000" />
        </pattern>
        <pattern id="pat-diag" patternUnits="userSpaceOnUse" width="6" height="6">
          <rect width="6" height="6" fill="#fff" />
          <path d="M0,6 L6,0" stroke="#000" strokeWidth="1" />
          <path d="M-1,1 L1,-1" stroke="#000" strokeWidth="1" />
          <path d="M5,7 L7,5" stroke="#000" strokeWidth="1" />
        </pattern>
        <pattern id="pat-cross" patternUnits="userSpaceOnUse" width="6" height="6">
          <rect width="6" height="6" fill="#fff" />
          <path d="M0,6 L6,0 M0,0 L6,6" stroke="#000" strokeWidth="1" />
        </pattern>
        <pattern id="pat-lines" patternUnits="userSpaceOnUse" width="6" height="6">
          <rect width="6" height="6" fill="#fff" />
          <line x1="0" y1="3" x2="6" y2="3" stroke="#000" strokeWidth="1.2" />
        </pattern>
        <pattern id="pat-brick" patternUnits="userSpaceOnUse" width="12" height="12">
          <rect width="12" height="12" fill="#fff" />
          <path d="M0,0 L12,0 M0,6 L12,6 M0,12 L12,12" stroke="#000" strokeWidth="0.8" />
          <path d="M6,0 L6,6 M0,6 L0,12 M12,6 L12,12" stroke="#000" strokeWidth="0.8" />
        </pattern>
        <pattern id="pat-solid" patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill="#000" />
        </pattern>
      </defs>
    </svg>
  );
}

const TRACK_PATTERNS = ['pat-dots', 'pat-diag', 'pat-cross', 'pat-lines', 'pat-brick'];

/* ── Shared: pixels per second for the timeline ── */
const PX_PER_SEC = 80;

/* ── Transport Bar ── */
function TransportBar({
  playheadTime,
  onPlay,
  onRecord,
}: {
  playheadTime: number;
  onPlay: () => void;
  onRecord: () => void;
}) {
  const transport = useStore((s) => s.transport);
  const bpm = useStore((s) => s.bpm);
  const armedTrackId = useStore((s) => s.armedTrackId);

  const fmtTime = (t: number) => {
    const m = Math.floor(Math.max(0, t) / 60);
    const s = Math.floor(Math.max(0, t) % 60);
    const ms = Math.floor((Math.max(0, t) % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const isPlaying = transport === 'playing' || transport === 'recording';

  return (
    <div className="transport-bar">
      <button
        className={`transport-btn ${isPlaying ? 'active' : ''}`}
        onClick={onPlay}
        title="Space: Play/Stop"
      >
        {isPlaying ? '■' : '▶'}
      </button>
      <button
        className={`transport-btn record ${transport === 'recording' ? 'active armed' : armedTrackId ? 'armed' : ''}`}
        onClick={onRecord}
        title="R: Record/Stop (arm a track first)"
      >
        ●
      </button>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700 }}>{bpm}</div>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>BPM</span>
      <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 16 }}>
        {fmtTime(playheadTime)}
      </div>
    </div>
  );
}

/* ── Track Lane ── */
function TrackLane({
  clips,
  patternIdx,
  playheadTime,
}: {
  clips: Clip[];
  patternIdx: number;
  playheadTime: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = rect.width;
    const h = rect.height;

    // Background: white (inverted in dark mode via CSS filter)
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    // Subtle horizontal texture lines (always black on white)
    ctx.strokeStyle = patternIdx === 0 ? '#e0e0e0' : '#d5d5d5';
    ctx.lineWidth = 0.5;
    for (let y = 4; y < h; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // If no clips, show empty state
    if (clips.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No clips recorded yet — arm track & press ● to record', w / 2, h / 2);
      ctx.textAlign = 'start';
    }

    // Draw each clip
    for (const clip of clips) {
      const x = clip.startTime * PX_PER_SEC;
      const clipW = Math.max(30, clip.duration * PX_PER_SEC);

      // Clip block (black)
      ctx.fillStyle = '#000';
      ctx.fillRect(x, 2, clipW, h - 4);

      // Waveform (white line inside black block)
      const data = clip.buffer.getChannelData(0);
      if (data.length > 0) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let px = 0; px < clipW; px += 2) {
          const idx = Math.floor((px / clipW) * data.length);
          const sample = data[Math.min(idx, data.length - 1)];
          const y = 2 + ((sample + 1) / 2) * (h - 4);
          if (px === 0) ctx.moveTo(x + px, y);
          else ctx.lineTo(x + px, y);
        }
        ctx.stroke();
      }

      // Clip label
      ctx.fillStyle = '#fff';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(clip.name, x + 4, 14);
    }

    // Draw playhead
    const px = playheadTime * PX_PER_SEC;
    if (px >= 0 && px < w + 50) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();

      // Small triangle at top
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.moveTo(px - 5, 0);
      ctx.lineTo(px + 5, 0);
      ctx.lineTo(px, 8);
      ctx.closePath();
      ctx.fill();
    }
  }, [clips, playheadTime, patternIdx]);

  return (
    <div className="track-lane">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

/* ── Track Row ── */
function TrackRow({
  track,
  idx,
  playheadTime,
}: {
  track: { id: string; name: string; armed: boolean; muted: boolean; solo: boolean; clips: Clip[] };
  idx: number;
  playheadTime: number;
}) {
  const toggleMute = useStore((s) => s.toggleMute);
  const toggleSolo = useStore((s) => s.toggleSolo);
  const toggleArm = useStore((s) => s.toggleArm);
  const removeTrack = useStore((s) => s.removeTrack);
  const trackCount = useStore((s) => s.tracks.length);
  const armedTrackId = useStore((s) => s.armedTrackId);
  const transport = useStore((s) => s.transport);

  // Only one track can be armed at a time, and only when stopped
  const canArm = transport === 'stopped' || (transport === 'recording' && track.armed);

  return (
    <div className="track-row">
      <div className="track-controls">
        <div className="track-name">{track.name}</div>
        <div className="track-btns">
          <button
            className={`track-btn arm ${track.armed ? 'on' : ''}`}
            onClick={() => canArm && toggleArm(track.id)}
            disabled={!canArm}
            title="Arm for recording"
          >
            {track.armed ? '⬤ REC' : 'REC'}
          </button>
          <button
            className={`track-btn ${track.muted ? 'on' : ''}`}
            onClick={() => toggleMute(track.id)}
            title="Mute"
          >
            M
          </button>
          <button
            className={`track-btn ${track.solo ? 'on' : ''}`}
            onClick={() => toggleSolo(track.id)}
            title="Solo"
          >
            S
          </button>
          {trackCount > 1 && (
            <button
              className="track-btn"
              onClick={() => removeTrack(track.id)}
              title="Remove track"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <TrackLane clips={track.clips} patternIdx={idx} playheadTime={playheadTime} />
    </div>
  );
}

/* ── Main App ── */
export function App() {
  const tracks = useStore((s) => s.tracks);
  const addTrack = useStore((s) => s.addTrack);
  const transport = useStore((s) => s.transport);
  const setTransport = useStore((s) => s.setTransport);
  const armedTrackId = useStore((s) => s.armedTrackId);
  const clearArmed = useStore((s) => s.clearArmed);
  const overwriteClip = useStore((s) => s.overwriteClip);

  const [playheadTime, setPlayheadTime] = useState(0);

  // Refs for the transport engine
  const playingSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const recordingRef = useRef<{ stop: () => Promise<AudioBuffer> } | null>(null);
  const recordStartTimeRef = useRef(0);
  const playheadRef = useRef(0);
  const startCtxTimeRef = useRef(0);
  const rafRef = useRef(0);

  // Playhead animation
  useEffect(() => {
    if (transport === 'playing' || transport === 'recording') {
      startCtxTimeRef.current = getCtx().currentTime - playheadRef.current;
      const tick = () => {
        const t = getCtx().currentTime - startCtxTimeRef.current;
        playheadRef.current = t;
        setPlayheadTime(t);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [transport]);

  // Stop all playing sources
  const stopAllSources = useCallback(() => {
    playingSourcesRef.current.forEach((s) => {
      try { s.stop(); } catch {}
    });
    playingSourcesRef.current = [];
  }, []);

  // Start playing all clips from current playhead position
  const startPlayback = useCallback(() => {
    stopAllSources();
    const ctx = getCtx();
    const master = getMasterGain();
    const anySolo = tracks.some((t) => t.solo);

    for (const track of tracks) {
      const effectiveMute = anySolo ? !track.solo : track.muted;
      if (effectiveMute) continue;

      for (const clip of track.clips) {
        const clipEnd = clip.startTime + clip.duration;
        // Skip clips entirely before the playhead
        if (clipEnd <= playheadRef.current) continue;

        const offset = playheadRef.current - clip.startTime;
        const clipOffset = Math.max(0, offset);
        const when = Math.max(0, -offset);
        const remaining = clip.duration - clipOffset;

        const gain = ctx.createGain();
        gain.gain.value = 0.8;
        gain.connect(master);

        const src = ctx.createBufferSource();
        src.buffer = clip.buffer;
        src.connect(gain);
        src.start(ctx.currentTime + when, clipOffset, remaining);
        playingSourcesRef.current.push(src);
      }
    }
  }, [tracks, stopAllSources]);

  // ── Transport handlers ──
  const handlePlay = useCallback(() => {
    if (transport === 'playing') {
      // Stop
      stopAllSources();
      setTransport('stopped');
      return;
    }
    if (transport === 'recording') {
      // Can't play while recording — stop recording first
      return;
    }
    // Start playing
    startPlayback();
    setTransport('playing');
  }, [transport, setTransport, stopAllSources, startPlayback]);

  const handleRecord = useCallback(async () => {
    if (transport === 'recording') {
      // Stop recording
      stopAllSources();

      if (recordingRef.current) {
        const buffer = await recordingRef.current.stop();
        recordingRef.current = null;

        const armedId = armedTrackId;
        if (armedId && buffer.duration > 0.1) {
          const startTime = recordStartTimeRef.current - startCtxTimeRef.current;
          overwriteClip(armedId, buffer, Math.max(0, startTime));
        }
      }

      // Don't reset playhead — it stays where recording stopped
      clearArmed();
      setTransport('stopped');
      return;
    }

    if (transport === 'playing') {
      // Can't start recording while playing — stop first
      return;
    }

    if (!armedTrackId) return; // nothing armed

    // Start recording: begin playback for monitoring + start mic capture
    startPlayback();
    const rec = startRecording();
    recordingRef.current = rec;
    recordStartTimeRef.current = getCtx().currentTime;
    setTransport('recording');
  }, [transport, armedTrackId, setTransport, clearArmed, overwriteClip, stopAllSources, startPlayback]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlay();
          break;
        case 'KeyR':
          e.preventDefault();
          handleRecord();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePlay, handleRecord]);

  return (
    <div className="daw-app">
      <PatternDefs />
      <TransportBar playheadTime={playheadTime} onPlay={handlePlay} onRecord={handleRecord} />
      <div className="tracks-container">
        {tracks.map((track, i) => (
          <TrackRow key={track.id} track={track} idx={i} playheadTime={playheadTime} />
        ))}
        <button className="add-track-btn" onClick={addTrack}>
          + Add Track
        </button>
      </div>
      <div className="help-bar">
        [SPACE] play/stop &nbsp; [R] record/stop &nbsp; arm a track (REC) before recording
        {armedTrackId && transport === 'stopped' && (
          <span style={{ marginLeft: 12, fontWeight: 700 }}>
            ⬤ {tracks.find((t) => t.id === armedTrackId)?.name} armed — press ● or R to record
          </span>
        )}
        {!armedTrackId && transport === 'stopped' && (
          <span style={{ marginLeft: 12, color: 'var(--color-text-muted)' }}>
            Arm a track first, then record
          </span>
        )}
      </div>
    </div>
  );
}

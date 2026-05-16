import { useRef, useEffect, useCallback, useState } from 'react';
import { useStore } from './lib/store';
import { getCtx, getMasterGain, startRecording, boostGain } from './lib/audio-engine';
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
      </defs>
    </svg>
  );
}

const PX_PER_SEC = 80;

/* ── Transport Bar ── */
function TransportBar({
  playheadTime,
  onPlay,
  onRecord,
  onSeekToStart,
}: {
  playheadTime: number;
  onPlay: () => void;
  onRecord: () => void;
  onSeekToStart: () => void;
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
        className="transport-btn"
        onClick={onSeekToStart}
        title="Jump to start"
        disabled={isPlaying}
      >
        ⏮
      </button>
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
  transport,
  onSeek,
}: {
  clips: Clip[];
  patternIdx: number;
  playheadTime: number;
  transport: string;
  onSeek: (time: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef(false);
  const isSeeking = transport === 'stopped';

  // Draw the lane contents
  const drawLane = useCallback(() => {
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

    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    // Texture lines
    ctx.strokeStyle = patternIdx === 0 ? '#e0e0e0' : '#d5d5d5';
    ctx.lineWidth = 0.5;
    for (let y = 4; y < h; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Empty state
    if (clips.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No clips recorded yet — arm track & press ● to record', w / 2, h / 2);
      ctx.textAlign = 'start';
    }

    // Draw clips
    for (const clip of clips) {
      const x = clip.startTime * PX_PER_SEC;
      const clipW = Math.max(30, clip.duration * PX_PER_SEC);

      ctx.fillStyle = '#000';
      ctx.fillRect(x, 2, clipW, h - 4);

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

      ctx.fillStyle = '#fff';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(clip.name, x + 4, 14);
    }

    // Draw playhead
    const px = playheadTime * PX_PER_SEC;
    if (px >= 0) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();

      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.moveTo(px - 5, 0);
      ctx.lineTo(px + 5, 0);
      ctx.lineTo(px, 8);
      ctx.closePath();
      ctx.fill();
    }
  }, [clips, playheadTime, patternIdx]);

  // Redraw on state changes
  useEffect(() => {
    drawLane();
  }, [drawLane]);

  // Also redraw on resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const ro = new ResizeObserver(() => drawLane());
    ro.observe(parent);
    return () => ro.disconnect();
  }, [drawLane]);

  // Click-to-seek and playhead drag
  const getTimeFromEvent = useCallback((e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return Math.max(0, x / PX_PER_SEC);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isSeeking) return;
    const t = getTimeFromEvent(e);
    onSeek(t);
    dragRef.current = true;
    e.preventDefault();
  }, [isSeeking, getTimeFromEvent, onSeek]);

  useEffect(() => {
    if (!isSeeking) return;
    const handleMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const t = getTimeFromEvent(e);
      onSeek(t);
    };
    const handleUp = () => { dragRef.current = false; };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isSeeking, getTimeFromEvent, onSeek]);

  return (
    <div
      className="track-lane"
      onMouseDown={handleMouseDown}
      style={{ cursor: isSeeking ? 'col-resize' : 'default' }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
    </div>
  );
}

/* ── Track Row ── */
function TrackRow({
  track,
  idx,
  playheadTime,
  transport,
  onSeek,
}: {
  track: { id: string; name: string; armed: boolean; muted: boolean; solo: boolean; clips: Clip[] };
  idx: number;
  playheadTime: number;
  transport: string;
  onSeek: (time: number) => void;
}) {
  const toggleMute = useStore((s) => s.toggleMute);
  const toggleSolo = useStore((s) => s.toggleSolo);
  const toggleArm = useStore((s) => s.toggleArm);
  const removeTrack = useStore((s) => s.removeTrack);
  const trackCount = useStore((s) => s.tracks.length);

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
            <button className="track-btn" onClick={() => removeTrack(track.id)} title="Remove track">
              ✕
            </button>
          )}
        </div>
      </div>
      <TrackLane
        clips={track.clips}
        patternIdx={idx}
        playheadTime={playheadTime}
        transport={transport}
        onSeek={onSeek}
      />
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

  const playingSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const recordingRef = useRef<{ stop: () => Promise<AudioBuffer> } | null>(null);
  const recordStartTimeRef = useRef(0);
  const playheadRef = useRef(0);
  const startCtxTimeRef = useRef(0);
  const rafRef = useRef(0);

  // Seek: move playhead to a specific time (only when stopped)
  const seekTo = useCallback((time: number) => {
    if (transport !== 'stopped') return;
    const t = Math.max(0, time);
    playheadRef.current = t;
    setPlayheadTime(t);
    startCtxTimeRef.current = getCtx().currentTime - t;
  }, [transport]);

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

  const stopAllSources = useCallback(() => {
    playingSourcesRef.current.forEach((s) => {
      try { s.stop(); } catch {}
    });
    playingSourcesRef.current = [];
  }, []);

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

  const handlePlay = useCallback(() => {
    if (transport === 'playing') {
      stopAllSources();
      setTransport('stopped');
      return;
    }
    if (transport === 'recording') {
      // Stop recording the same way handleRecord does
      stopRecording();
      return;
    }
    startPlayback();
    setTransport('playing');
  }, [transport, setTransport, stopAllSources, startPlayback]);

  const stopRecording = useCallback(async () => {
    stopAllSources();
    if (recordingRef.current) {
      const buffer = await recordingRef.current.stop();
      recordingRef.current = null;
      const armedId = armedTrackId;
      if (armedId && buffer.duration > 0.1) {
        const boosted = boostGain(buffer, 4.0);
        const startTime = recordStartTimeRef.current - startCtxTimeRef.current;
        overwriteClip(armedId, boosted, Math.max(0, startTime));
      }
    }
    clearArmed();
    setTransport('stopped');
  }, [armedTrackId, setTransport, clearArmed, overwriteClip, stopAllSources]);

  const handleRecord = useCallback(async () => {
    if (transport === 'recording') {
      await stopRecording();
      return;
    }
    if (transport === 'playing') return;
    if (!armedTrackId) return;

    startPlayback();
    const rec = startRecording();
    recordingRef.current = rec;
    recordStartTimeRef.current = getCtx().currentTime;
    setTransport('recording');
  }, [transport, armedTrackId, setTransport, stopRecording, startPlayback]);

  const handleSeekToStart = useCallback(() => {
    seekTo(0);
  }, [seekTo]);

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
        case 'KeyH':
        case 'Home':
          e.preventDefault();
          handleSeekToStart();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePlay, handleRecord, handleSeekToStart]);

  return (
    <div className="daw-app">
      <PatternDefs />
      <TransportBar
        playheadTime={playheadTime}
        onPlay={handlePlay}
        onRecord={handleRecord}
        onSeekToStart={handleSeekToStart}
      />
      <div className="tracks-container">
        {tracks.map((track, i) => (
          <TrackRow
            key={track.id}
            track={track}
            idx={i}
            playheadTime={playheadTime}
            transport={transport}
            onSeek={seekTo}
          />
        ))}
        <button className="add-track-btn" onClick={addTrack}>
          + Add Track
        </button>
      </div>
      <div className="help-bar">
        [SPACE] play/stop &nbsp; [R] record/stop &nbsp; [H] jump to start &nbsp; click/drag playhead to seek
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

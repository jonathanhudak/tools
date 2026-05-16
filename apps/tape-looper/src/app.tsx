import { useRef, useEffect, useCallback, useState } from 'react';
import { useStore } from './lib/store';
import { getCtx, getMasterGain, startRecording } from './lib/audio-engine';
import type { Clip } from './lib/types';

/* ── SVG Pattern Defs (same style as Blockworld) ── */
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

const TRACK_PATTERNS = [
  { bg: '#fff', texId: 'pat-dots' },
  { bg: '#fff', texId: 'pat-diag' },
  { bg: '#fff', texId: 'pat-cross' },
  { bg: '#fff', texId: 'pat-lines' },
  { bg: '#fff', texId: 'pat-brick' },
];

/* ── Transport Bar ── */
function TransportBar() {
  const transport = useStore((s) => s.transport);
  const bpm = useStore((s) => s.bpm);
  const armedTrackId = useStore((s) => s.armedTrackId);
  const setTransport = useStore((s) => s.setTransport);
  const [time, setTime] = useState(0);
  const timeRef = useRef(0);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  // Recording orchestration
  const recordingRef = useRef<{ stop: () => Promise<AudioBuffer> } | null>(null);
  const recordStartRef = useRef(0);
  const overwriteClip = useStore((s) => s.overwriteClip);

  // Playing orchestration
  const playingSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const tracks = useStore((s) => s.tracks);

  // Timer RAF
  useEffect(() => {
    if (transport === 'playing' || transport === 'recording') {
      startRef.current = getCtx().currentTime - timeRef.current;
      const tick = () => {
        setTime(getCtx().currentTime - startRef.current);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [transport]);

  const handlePlay = useCallback(() => {
    if (transport === 'playing') {
      // Stop
      playingSourcesRef.current.forEach((s) => {
        try { s.stop(); } catch {}
      });
      playingSourcesRef.current = [];
      setTransport('stopped');
      timeRef.current = getCtx().currentTime - startRef.current;
      return;
    }

    // Play all clips
    const ctx = getCtx();
    const master = getMasterGain();
    const anySolo = tracks.some((t) => t.solo);

    for (const track of tracks) {
      const effectiveMute = anySolo ? !track.solo : track.muted;
      if (effectiveMute) continue;

      for (const clip of track.clips) {
        const gain = ctx.createGain();
        gain.gain.value = 0.8;
        gain.connect(master);

        const src = ctx.createBufferSource();
        src.buffer = clip.buffer;
        src.connect(gain);
        const offset = timeRef.current - clip.startTime;
        if (offset >= clip.duration) continue; // clip already finished
        const when = Math.max(0, -offset); // start delay if we're past clip start
        const clipOffset = Math.max(0, offset);
        src.start(ctx.currentTime + when, clipOffset, clip.duration - clipOffset);
        playingSourcesRef.current.push(src);
      }
    }

    setTransport('playing');
  }, [transport, tracks, setTransport]);

  const handleRecord = useCallback(async () => {
    if (transport === 'recording') {
      // Stop recording
      if (!recordingRef.current) return;
      const buffer = await recordingRef.current.stop();
      recordingRef.current = null;

      const armedId = armedTrackId;
      if (armedId && buffer.duration > 0.1) {
        overwriteClip(armedId, buffer, recordStartRef.current - startRef.current);
      }
      setTransport('stopped');
      timeRef.current = getCtx().currentTime - startRef.current;
      return;
    }

    if (!armedTrackId) return;

    // Start recording
    const rec = startRecording();
    recordingRef.current = rec;
    recordStartRef.current = getCtx().currentTime;

    // Also play existing clips for monitoring
    handlePlay();
    setTransport('recording');
  }, [transport, armedTrackId, setTransport, overwriteClip, handlePlay]);

  const fmtTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="transport-bar">
      <button
        className={`transport-btn ${transport === 'playing' || transport === 'recording' ? 'active' : ''}`}
        onClick={handlePlay}
        title="Space: Play/Stop"
      >
        {transport === 'playing' || transport === 'recording' ? '■' : '▶'}
      </button>
      <button
        className={`transport-btn record ${transport === 'recording' ? 'active armed' : armedTrackId ? 'armed' : ''}`}
        onClick={handleRecord}
        title="R: Record (arms last selected track)"
        disabled={!armedTrackId && transport !== 'recording'}
      >
        ●
      </button>
      <div className="bpm-display">{bpm}</div>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>BPM</span>
      <div className="time-display mono">{fmtTime(time)}</div>
    </div>
  );
}

/* ── Track Lane Canvas ── */
function TrackLane({ clips, patternIdx }: { clips: Clip[]; patternIdx: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);

    // Background with texture pattern
    const pat = TRACK_PATTERNS[patternIdx % TRACK_PATTERNS.length];
    ctx.fillStyle = pat.bg;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw texture overlay via a small canvas trick
    // (simplified — just draw thin horizontal lines for the pattern feel)
    ctx.strokeStyle = patternIdx === 0 ? '#eee' : '#ddd';
    ctx.lineWidth = 0.5;
    for (let y = 2; y < rect.height; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Draw clips
    const pixelsPerSecond = 80;
    for (const clip of clips) {
      const x = clip.startTime * pixelsPerSecond;
      const clipW = Math.max(20, clip.duration * pixelsPerSecond);

      // Clip background
      ctx.fillStyle = '#000';
      ctx.fillRect(x, 2, clipW, rect.height - 4);

      // Waveform inside clip
      const data = clip.buffer.getChannelData(0);
      const step = Math.max(1, Math.floor(data.length / clipW));
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let px = 0; px < clipW; px++) {
        const idx = Math.floor((px / clipW) * data.length);
        const sample = data[Math.min(idx, data.length - 1)];
        const y = 2 + ((sample + 1) / 2) * (rect.height - 4);
        if (px === 0) ctx.moveTo(x + px, y);
        else ctx.lineTo(x + px, y);
      }
      ctx.stroke();

      // Clip label
      ctx.fillStyle = '#fff';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(clip.name, x + 4, 14);
    }
  }, [clips, patternIdx]);

  return (
    <div className="track-lane">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

/* ── Track Row ── */
function TrackRow({ track, idx }: { track: { id: string; name: string; armed: boolean; muted: boolean; solo: boolean; clips: Clip[] }; idx: number }) {
  const toggleMute = useStore((s) => s.toggleMute);
  const toggleSolo = useStore((s) => s.toggleSolo);
  const toggleArm = useStore((s) => s.toggleArm);
  const removeTrack = useStore((s) => s.removeTrack);
  const trackCount = useStore((s) => s.tracks.length);

  return (
    <div className="track-row">
      <div className="track-controls">
        <div className="track-name">{track.name}</div>
        <div className="track-btns">
          <button
            className={`track-btn arm ${track.armed ? 'on' : ''}`}
            onClick={() => toggleArm(track.id)}
          >
            REC
          </button>
          <button
            className={`track-btn ${track.muted ? 'on' : ''}`}
            onClick={() => toggleMute(track.id)}
          >
            M
          </button>
          <button
            className={`track-btn ${track.solo ? 'on' : ''}`}
            onClick={() => toggleSolo(track.id)}
          >
            S
          </button>
          {trackCount > 1 && (
            <button className="track-btn" onClick={() => removeTrack(track.id)}>
              ✕
            </button>
          )}
        </div>
      </div>
      <TrackLane clips={track.clips} patternIdx={idx} />
    </div>
  );
}

/* ── Main App ── */
export function App() {
  const tracks = useStore((s) => s.tracks);
  const addTrack = useStore((s) => s.addTrack);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          // Trigger play button
          const playBtn = document.querySelector<HTMLButtonElement>('.transport-btn:first-of-type');
          playBtn?.click();
          break;
        case 'KeyR':
          e.preventDefault();
          const recBtn = document.querySelector<HTMLButtonElement>('.transport-btn.record');
          recBtn?.click();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="daw-app">
      <PatternDefs />
      <TransportBar />
      <div className="tracks-container">
        {tracks.map((track, i) => (
          <TrackRow key={track.id} track={track} idx={i} />
        ))}
        <button className="add-track-btn" onClick={addTrack}>
          + Add Track
        </button>
      </div>
      <div className="help-bar">
        [SPACE] play/stop &nbsp; [R] record &nbsp; REC=arm track &nbsp; M=mute &nbsp; S=solo
      </div>
    </div>
  );
}

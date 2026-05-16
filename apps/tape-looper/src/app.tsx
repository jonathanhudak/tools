import { useRef, useEffect, useCallback, useState } from 'react';
import { useStore } from './lib/store';
import { getCtx, getMasterGain, startRecording, boostGain } from './lib/audio-engine';
import { synthTrack } from './lib/midi-engine';
import { initMIDI, setMIDICallbacks, hasMIDI, disposeMIDI } from './lib/midi-input';
import { PianoKeyboard } from './components/piano-keyboard';
import {
  serializeTracks, deserializeTracks, saveProject, listProjects,
  getProject, newProjectId, deleteProject, renameProject,
  getCurrentProjectId, setCurrentProjectId,
} from './lib/storage';
import type { Clip, NoteEvent } from './lib/types';

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
        <pattern id="pat-piano" patternUnits="userSpaceOnUse" width="16" height="16">
          <rect width="16" height="16" fill="#fff" />
          <line x1="0" y1="16" x2="16" y2="16" stroke="#000" strokeWidth="1" />
          <line x1="8" y1="0" x2="8" y2="16" stroke="#ddd" strokeWidth="0.5" />
        </pattern>
      </defs>
    </svg>
  );
}

const TRACK_PATTERNS = ['pat-dots', 'pat-diag', 'pat-cross', 'pat-lines', 'pat-brick'];

/* ── Piano key mapping: 2 rows of computer keyboard → 1 octave ── */
const PIANO_KEYS: { key: string; midiNote: number; label: string }[] = [
  { key: 'a', midiNote: 60, label: 'C' },
  { key: 'w', midiNote: 61, label: 'C#' },
  { key: 's', midiNote: 62, label: 'D' },
  { key: 'e', midiNote: 63, label: 'D#' },
  { key: 'd', midiNote: 64, label: 'E' },
  { key: 'f', midiNote: 65, label: 'F' },
  { key: 't', midiNote: 66, label: 'F#' },
  { key: 'g', midiNote: 67, label: 'G' },
  { key: 'y', midiNote: 68, label: 'G#' },
  { key: 'h', midiNote: 69, label: 'A' },
  { key: 'u', midiNote: 70, label: 'A#' },
  { key: 'j', midiNote: 71, label: 'B' },
  { key: 'k', midiNote: 72, label: 'C' },
];
const PIANO_KEY_SET = new Set(PIANO_KEYS.map((k) => k.key));
const PIANO_NOTE_MAP = Object.fromEntries(PIANO_KEYS.map((k) => [k.key, k.midiNote]));

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
  const inputGain = useStore((s) => s.inputGain);
  const setInputGain = useStore((s) => s.setInputGain);
  const zoom = useStore((s) => s.zoom);
  const setZoom = useStore((s) => s.setZoom);

  const fmtTime = (t: number) => {
    const m = Math.floor(Math.max(0, t) / 60);
    const s = Math.floor(Math.max(0, t) % 60);
    const ms = Math.floor((Math.max(0, t) % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const isPlaying = transport === 'playing' || transport === 'recording';

  return (
    <div className="transport-bar">
      <button className="transport-btn" onClick={onSeekToStart} title="Jump to start [H]" disabled={isPlaying}>⏮</button>
      <button className={`transport-btn ${isPlaying ? 'active' : ''}`} onClick={onPlay} title="Play/Stop [Space]">{isPlaying ? '■' : '▶'}</button>
      <button className={`transport-btn record ${transport === 'recording' ? 'active armed' : armedTrackId ? 'armed' : ''}`} onClick={onRecord} title="Record [R]">●</button>

      <span style={{ width: 8 }} />

      {/* Gain */}
      <select
        className="gain-select"
        value={inputGain}
        onChange={(e) => setInputGain(Number(e.target.value))}
        title="Input gain"
      >
        {[1, 2, 3, 4, 6, 8, 10, 14, 20].map((g) => (
          <option key={g} value={g}>{g}× gain</option>
        ))}
      </select>

      {/* Zoom */}
      <button className="transport-btn" onClick={() => setZoom(Math.max(10, zoom - 30))} title="Zoom out [↓]">−</button>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, minWidth: 36, textAlign: 'center' }}>{zoom}px/s</span>
      <button className="transport-btn" onClick={() => setZoom(Math.min(500, zoom + 30))} title="Zoom in [↑]">+</button>

      <span style={{ width: 8 }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700 }}>{bpm}</span>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>BPM</span>

      <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 16 }}>{fmtTime(playheadTime)}</div>
    </div>
  );
}

/* ── Piano Roll HUD ── */
function PianoHUD({
  activeNotes,
}: {
  activeNotes: Set<number>;
}) {
  const whiteKeys = PIANO_KEYS.filter((k) => !k.label.includes('#'));
  return (
    <div className="piano-hud">
      {whiteKeys.map((k) => {
        const isActive = activeNotes.has(k.midiNote);
        return (
          <div key={k.midiNote} className={`piano-key ${isActive ? 'active' : ''}`}>
            <span className="piano-key-label">{k.key.toUpperCase()}</span>
            <span className="piano-key-note">{k.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Track Lane ── */
function TrackLane({
  track,
  patternIdx,
  playheadTime,
  transport,
  onSeek,
  zoom,
}: {
  track: { id: string; trackType: string; clips: Clip[]; notes: NoteEvent[] };
  patternIdx: number;
  playheadTime: number;
  transport: string;
  onSeek: (time: number) => void;
  zoom: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef(false);
  const isSeeking = transport === 'stopped';
  const isMIDI = track.trackType === 'midi';

  const drawLane = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Compute total width based on content + zoom
    const totalDuration = computeTotalDuration(track);
    const contentWidth = Math.max(rect.width, totalDuration * zoom + 200);

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== contentWidth * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = contentWidth * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = contentWidth + 'px';
      canvas.style.height = rect.height + 'px';
    }

    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = contentWidth;
    const h = rect.height;

    // Background
    ctx.fillStyle = isMIDI ? '#fff' : '#fff';
    ctx.fillRect(0, 0, w, h);

    // Texture lines
    if (!isMIDI) {
      ctx.strokeStyle = patternIdx === 0 ? '#e0e0e0' : '#d5d5d5';
      ctx.lineWidth = 0.5;
      for (let y = 4; y < h; y += 8) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    }

    if (isMIDI) {
      drawPianoRoll(ctx, track.notes, w, h, zoom);
    } else {
      drawAudioClips(ctx, track.clips, w, h, zoom);
    }

    // Playhead
    const px = playheadTime * zoom;
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
    ctx.fillStyle = '#ff0000';
    ctx.beginPath(); ctx.moveTo(px - 5, 0); ctx.lineTo(px + 5, 0); ctx.lineTo(px, 8); ctx.closePath(); ctx.fill();
  }, [track, playheadTime, patternIdx, zoom, isMIDI]);

  useEffect(() => { drawLane(); }, [drawLane]);
  useEffect(() => {
    const parent = canvasRef.current?.parentElement;
    if (!parent) return;
    const ro = new ResizeObserver(() => drawLane());
    ro.observe(parent);
    return () => ro.disconnect();
  }, [drawLane]);

  const getTimeFromEvent = useCallback((e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + (canvas.parentElement?.scrollLeft ?? 0);
    return Math.max(0, x / zoom);
  }, [zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isSeeking) return;
    onSeek(getTimeFromEvent(e));
    dragRef.current = true;
    e.preventDefault();
  }, [isSeeking, getTimeFromEvent, onSeek]);

  useEffect(() => {
    if (!isSeeking) return;
    const hm = (e: MouseEvent) => { if (dragRef.current) onSeek(getTimeFromEvent(e)); };
    const hu = () => { dragRef.current = false; };
    window.addEventListener('mousemove', hm);
    window.addEventListener('mouseup', hu);
    return () => { window.removeEventListener('mousemove', hm); window.removeEventListener('mouseup', hu); };
  }, [isSeeking, getTimeFromEvent, onSeek]);

  return (
    <div className="track-lane" onMouseDown={handleMouseDown} style={{ cursor: isSeeking ? 'col-resize' : 'default' }}>
      <canvas ref={canvasRef} style={{ height: '100%', pointerEvents: 'none' }} />
    </div>
  );
}

function computeTotalDuration(track: { trackType: string; clips: Clip[]; notes: NoteEvent[] }): number {
  if (track.trackType === 'midi') {
    return track.notes.length > 0
      ? Math.max(...track.notes.map((n) => n.startTime + n.duration))
      : 0;
  }
  return track.clips.length > 0
    ? Math.max(...track.clips.map((c) => c.startTime + c.duration))
    : 0;
}

function drawAudioClips(ctx: CanvasRenderingContext2D, clips: Clip[], w: number, h: number, zoom: number) {
  if (clips.length === 0) {
    ctx.fillStyle = '#999';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('No clips — arm track & press ● to record', w / 2, h / 2);
    ctx.textAlign = 'start';
    return;
  }
  for (const clip of clips) {
    const x = clip.startTime * zoom;
    const clipW = Math.max(30, clip.duration * zoom);
    ctx.fillStyle = '#000';
    ctx.fillRect(x, 2, clipW, h - 4);
    const data = clip.buffer.getChannelData(0);
    if (data.length > 0) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const ampScale = 3.0; // scale waveform vertically for visibility
      for (let px = 0; px < clipW; px += 2) {
        const idx = Math.floor((px / clipW) * data.length);
        const sample = data[Math.min(idx, data.length - 1)] * ampScale;
        const y = h / 2 - sample * (h / 2 - 4);
        if (px === 0) ctx.moveTo(x + px, y);
        else ctx.lineTo(x + px, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = '#fff';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText(clip.name, x + 4, 14);
  }
}

function drawPianoRoll(ctx: CanvasRenderingContext2D, notes: NoteEvent[], w: number, h: number, zoom: number) {
  const minNote = 60; // C4
  const maxNote = 72; // C5
  const noteRange = maxNote - minNote + 1;
  const rowH = h / noteRange;

  // Grid lines
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 0.5;
  for (let n = minNote; n <= maxNote; n++) {
    const y = h - (n - minNote + 1) * rowH;
    const isBlack = [61, 63, 66, 68, 70].includes(n);
    ctx.fillStyle = isBlack ? '#f0f0f0' : '#fff';
    ctx.fillRect(0, y, w, rowH);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Beat lines
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 6]);
  for (let t = 0; t < w / zoom; t += 0.5) {
    const x = t * zoom;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  ctx.setLineDash([]);

  if (notes.length === 0) {
    ctx.fillStyle = '#999';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('No notes — arm track, press ●, play keys (A-K row)', w / 2, h / 2);
    ctx.textAlign = 'start';
    return;
  }

  // Note blocks
  for (const note of notes) {
    const x = note.startTime * zoom;
    const nw = Math.max(4, note.duration * zoom);
    const ny = h - (note.midiNote - minNote + 1) * rowH;
    ctx.fillStyle = '#000';
    ctx.fillRect(x, ny + 1, nw, rowH - 2);
    // Label
    if (nw > 20) {
      ctx.fillStyle = '#fff';
      ctx.font = '8px "JetBrains Mono", monospace';
      const noteName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][note.midiNote % 12];
      ctx.fillText(noteName, x + 3, ny + rowH - 4);
    }
  }
}

/* ── Track Row ── */
function TrackRow({
  track,
  idx,
  playheadTime,
  transport,
  onSeek,
  zoom,
}: {
  track: { id: string; name: string; armed: boolean; muted: boolean; solo: boolean; trackType: string; clips: Clip[]; notes: NoteEvent[] };
  idx: number;
  playheadTime: number;
  transport: string;
  onSeek: (time: number) => void;
  zoom: number;
}) {
  const toggleMute = useStore((s) => s.toggleMute);
  const toggleSolo = useStore((s) => s.toggleSolo);
  const toggleArm = useStore((s) => s.toggleArm);
  const removeTrack = useStore((s) => s.removeTrack);
  const canArm = transport === 'stopped' || (transport === 'recording' && track.armed);
  const isMIDI = track.trackType === 'midi';

  return (
    <div className={`track-row ${isMIDI ? 'midi-track' : 'audio-track'}`}>
      <div className="track-controls">
        <div className="track-name">{track.name}</div>
        <div className="track-type-badge" style={{
          fontSize: 10, fontWeight: 700, marginBottom: 4,
          background: isMIDI ? 'none' : 'var(--color-text)',
          padding: isMIDI ? 0 : '1px 6px',
          display: 'inline-block',
          color: isMIDI ? 'var(--color-text)' : 'var(--color-bg)',
        }}>
          {isMIDI ? '🎹 MIDI' : '🎤 AUDIO'}
        </div>
        <div className="track-btns">
          <button className={`track-btn arm ${track.armed ? 'on' : ''}`} onClick={() => canArm && toggleArm(track.id)} disabled={!canArm}>
            {track.armed ? '⬤ REC' : 'REC'}
          </button>
          <button className={`track-btn ${track.muted ? 'on' : ''}`} onClick={() => toggleMute(track.id)}>M</button>
          <button className={`track-btn ${track.solo ? 'on' : ''}`} onClick={() => toggleSolo(track.id)}>S</button>
          <button className="track-btn" onClick={() => removeTrack(track.id)}>✕</button>
        </div>
      </div>
      <TrackLane track={track} patternIdx={idx} playheadTime={playheadTime} transport={transport} onSeek={onSeek} zoom={zoom} />
    </div>
  );
}

/* ── Main App ── */
export function App() {
  const tracks = useStore((s) => s.tracks);
  const addAudioTrack = useStore((s) => s.addAudioTrack);
  const addMidiTrack = useStore((s) => s.addMidiTrack);
  const transport = useStore((s) => s.transport);
  const setTransport = useStore((s) => s.setTransport);
  const armedTrackId = useStore((s) => s.armedTrackId);
  const clearArmed = useStore((s) => s.clearArmed);
  const overwriteClip = useStore((s) => s.overwriteClip);
  const overwriteNotes = useStore((s) => s.overwriteNotes);
  const inputGain = useStore((s) => s.inputGain);
  const zoom = useStore((s) => s.zoom);

  const [playheadTime, setPlayheadTime] = useState(0);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [midiConnected, setMIDIConnected] = useState(false);

  const playingSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const recordingRef = useRef<{ stop: () => Promise<AudioBuffer> } | null>(null);
  const recordStartTimeRef = useRef(0);
  const playheadRef = useRef(0);
  const startCtxTimeRef = useRef(0);
  const rafRef = useRef(0);

  // Transport ref for keyboard handler (avoids stale closure)
  const transportRef = useRef(transport);
  transportRef.current = transport;

  // MIDI recording state
  const midiRecordingRef = useRef(false);
  const midiNotesRef = useRef<NoteEvent[]>([]);
  const midiNoteStartRef = useRef<Map<number, number>>(new Map());
  const activeOscillatorsRef = useRef<Map<number, OscillatorNode>>(new Map());

  // Project state
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const setProjectId = useStore((s) => s.setProjectId);
  const setProjectName = useStore((s) => s.setProjectName);
  const setTracks = useStore((s) => s.setTracks);
  const projectId = useStore((s) => s.projectId);
  const projectName = useStore((s) => s.projectName);
  const hasHydrated = useRef(false);

  // Hydrate: load the last project on mount
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    const savedId = getCurrentProjectId();
    if (savedId) {
      const project = getProject(savedId);
      if (project) {
        deserializeTracks(project.tracks).then((loadedTracks) => {
          if (loadedTracks.length > 0) setTracks(loadedTracks);
          setProjectId(project.id);
          setProjectName(project.name);
        });
        return;
      }
    }
    // No saved project — create a fresh one
    const id = newProjectId();
    setProjectId(id);
    setProjectName('Untitled');
  }, [setTracks, setProjectId, setProjectName]);

  // Auto-save on track changes (debounced)
  useEffect(() => {
    if (!hasHydrated.current || !projectId) return;
    const timer = setTimeout(() => {
      const proj = {
        id: projectId,
        name: projectName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tracks: serializeTracks(tracks),
      };
      saveProject(proj);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }, 2000);
    return () => clearTimeout(timer);
  }, [tracks, projectId, projectName]);

  // Save handlers
  const handleSave = useCallback(() => {
    if (!projectId) return;
    const proj = {
      id: projectId,
      name: projectName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tracks: serializeTracks(tracks),
    };
    saveProject(proj);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1500);
  }, [projectId, projectName, tracks]);

  const handleNewProject = useCallback(async () => {
    handleSave();
    const id = newProjectId();
    setProjectId(id);
    setProjectName('Untitled');
    setTracks([{ id: 't1', name: 'Audio 1', armed: false, muted: false, solo: false, trackType: 'audio' as const, clips: [], notes: [] }]);
    setProjectsOpen(false);
  }, [handleSave, setProjectId, setProjectName, setTracks]);

  const handleLoadProject = useCallback(async (id: string) => {
    handleSave();
    const project = getProject(id);
    if (!project) return;
    const loaded = await deserializeTracks(project.tracks);
    setTracks(loaded.length > 0 ? loaded : [{ id: 't1', name: 'Audio 1', armed: false, muted: false, solo: false, trackType: 'audio' as const, clips: [], notes: [] }]);
    setProjectId(project.id);
    setProjectName(project.name);
    setProjectsOpen(false);
  }, [handleSave, setTracks, setProjectId, setProjectName]);

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
    playingSourcesRef.current.forEach((s) => { try { s.stop(); } catch {} });
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

      if (track.trackType === 'midi') {
        // Synthesize MIDI notes into audio buffer and play
        const buf = synthTrack(track.notes, ctx);
        if (buf) {
          const offset = playheadRef.current;
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const gain = ctx.createGain();
          gain.gain.value = 1.0;
          gain.connect(master);
          src.connect(gain);
          src.start(ctx.currentTime, offset);
          playingSourcesRef.current.push(src);
        }
      } else {
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
    }
  }, [tracks, stopAllSources, playheadRef]);

  const stopRecording = useCallback(async () => {
    stopAllSources();
    const armedTrack = tracks.find((t) => t.id === armedTrackId);

    if (armedTrack?.trackType === 'midi') {
      // End any held MIDI notes
      endAllMIDINotes();
      midiRecordingRef.current = false;
      if (midiNotesRef.current.length > 0) {
        overwriteNotes(armedTrackId!, [...midiNotesRef.current], 0);
        midiNotesRef.current = [];
      }
    } else {
      if (recordingRef.current) {
        const buffer = await recordingRef.current.stop();
        recordingRef.current = null;
        if (armedTrackId && buffer.duration > 0.1) {
          const boosted = boostGain(buffer, inputGain);
          const startTime = recordStartTimeRef.current - startCtxTimeRef.current;
          overwriteClip(armedTrackId, boosted, Math.max(0, startTime));
        }
      }
    }
    clearArmed();
    setTransport('stopped');
  }, [armedTrackId, tracks, clearArmed, overwriteClip, overwriteNotes, inputGain, stopAllSources, setTransport]);

  const handlePlay = useCallback(() => {
    if (transport === 'playing') { stopAllSources(); setTransport('stopped'); return; }
    if (transport === 'recording') { stopRecording(); return; }
    startPlayback();
    setTransport('playing');
  }, [transport, setTransport, stopAllSources, startPlayback, stopRecording]);

  const handleRecord = useCallback(async () => {
    if (transport === 'recording') { await stopRecording(); return; }
    if (transport === 'playing') return;
    if (!armedTrackId) return;

    const armedTrack = tracks.find((t) => t.id === armedTrackId);
    startPlayback();

    if (armedTrack?.trackType === 'midi') {
      midiRecordingRef.current = true;
      midiNotesRef.current = [];
    } else {
      recordingRef.current = await startRecording();
      recordStartTimeRef.current = getCtx().currentTime;
    }
    setTransport('recording');
  }, [transport, armedTrackId, tracks, setTransport, startPlayback, stopRecording]);

  const handleSeekToStart = useCallback(() => seekTo(0), [seekTo]);

  // ── MIDI keyboard input ──
  const playNote = useCallback((midiNote: number) => {
    const ctx = getCtx();
    const master = getMasterGain();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 440 * Math.pow(2, (midiNote - 69) / 12);
    const gain = ctx.createGain();
    gain.gain.value = 0.3;
    gain.connect(master);
    osc.connect(gain);
    osc.start();
    activeOscillatorsRef.current.set(midiNote, osc);
    setActiveNotes((prev) => new Set(prev).add(midiNote));

    // MIDI recording capture (works for touch + keyboard)
    if (midiRecordingRef.current) {
      const t = getCtx().currentTime - startCtxTimeRef.current;
      midiNoteStartRef.current.set(midiNote, t);
    }
  }, []);

  const stopNote = useCallback((midiNote: number) => {
    const osc = activeOscillatorsRef.current.get(midiNote);
    if (osc) {
      try { osc.stop(); } catch {}
      osc.disconnect();
      activeOscillatorsRef.current.delete(midiNote);
    }
    setActiveNotes((prev) => { const n = new Set(prev); n.delete(midiNote); return n; });

    // MIDI recording capture (works for touch + keyboard)
    if (midiRecordingRef.current) {
      const startTime = midiNoteStartRef.current.get(midiNote);
      if (startTime !== undefined) {
        const endTime = getCtx().currentTime - startCtxTimeRef.current;
        midiNotesRef.current.push({ midiNote, startTime, duration: Math.max(0.05, endTime - startTime) });
        midiNoteStartRef.current.delete(midiNote);
      }
    }
  }, []);

  const endAllMIDINotes = useCallback(() => {
    activeOscillatorsRef.current.forEach((osc) => {
      try { osc.stop(); } catch {}
      osc.disconnect();
    });
    activeOscillatorsRef.current.clear();
    setActiveNotes(new Set());
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      const key = e.key.toLowerCase();
      if (PIANO_KEY_SET.has(key)) {
        if (e.repeat) return;
        const midiNote = PIANO_NOTE_MAP[key];
        if (e.type === 'keydown') {
          playNote(midiNote);
        }
        e.preventDefault();
        return;
      }

      // Transport shortcuts
      switch (e.code) {
        case 'Space': e.preventDefault(); handlePlay(); break;
        case 'KeyR': e.preventDefault(); handleRecord(); break;
        case 'KeyH': case 'Home': e.preventDefault(); handleSeekToStart(); break;
        case 'ArrowUp': e.preventDefault(); useStore.getState().setZoom(Math.min(500, useStore.getState().zoom + 30)); break;
        case 'ArrowDown': e.preventDefault(); useStore.getState().setZoom(Math.max(10, useStore.getState().zoom - 30)); break;
      }
    };

    const keyupHandler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (PIANO_KEY_SET.has(key)) {
        const midiNote = PIANO_NOTE_MAP[key];
        stopNote(midiNote);
      }
    };

    window.addEventListener('keydown', handler);
    window.addEventListener('keyup', keyupHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keyup', keyupHandler);
    };
  }, [handlePlay, handleRecord, handleSeekToStart, playNote, stopNote]);

  // Scroll wheel: horizontal scroll pans, no modifier zooms
  useEffect(() => {
    const tracksEl = document.querySelector('.tracks-container');
    if (!tracksEl) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const z = useStore.getState().zoom;
        useStore.getState().setZoom(Math.max(10, Math.min(500, z - Math.sign(e.deltaY) * 30)));
      }
    };
    tracksEl.addEventListener('wheel', onWheel, { passive: false });
    return () => tracksEl.removeEventListener('wheel', onWheel);
  }, []);

  // MIDI keyboard init
  useEffect(() => {
    initMIDI().then((connected) => setMIDIConnected(connected));
    return () => disposeMIDI();
  }, []);

  // Wire MIDI callbacks — re-wired when playNote/stopNote change
  useEffect(() => {
    setMIDICallbacks(playNote, stopNote, setMIDIConnected);
  }, [playNote, stopNote]);

  const isMIDIArmed = tracks.find((t) => t.id === armedTrackId)?.trackType === 'midi';

  return (
    <div className="daw-app">
      <PatternDefs />
      <TransportBar playheadTime={playheadTime} onPlay={handlePlay} onRecord={handleRecord} onSeekToStart={handleSeekToStart} />
      <PianoKeyboard
        onNoteOn={playNote}
        onNoteOff={stopNote}
        activeNotes={activeNotes}
        visible={isMIDIArmed && transport === 'stopped'}
        midiConnected={midiConnected}
      />
      <div className="tracks-container">
        {tracks.map((track, i) => (
          <TrackRow key={track.id} track={track} idx={i} playheadTime={playheadTime} transport={transport} onSeek={seekTo} zoom={zoom} />
        ))}
        <button className="add-track-btn" onClick={addAudioTrack}>+ Audio Track</button>
        <button className="add-track-btn" onClick={addMidiTrack} style={{ borderStyle: 'dashed' }}>+ MIDI Track</button>
      </div>
      {/* Project controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', borderTop: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        <button className="track-btn" onClick={() => setProjectsOpen(true)}>📂 Projects</button>
        <button className="track-btn" onClick={handleNewProject}>+ New</button>
        <button className="track-btn" onClick={handleSave}>
          {saveStatus === 'saved' ? '✓ Saved' : '💾 Save'}
        </button>
        <span style={{ marginLeft: 8, fontWeight: 700 }}>{projectName}</span>
        <span style={{ color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
          {projectId ? `(${projectId.slice(-6)})` : ''}
        </span>
      </div>
      {/* Projects panel modal */}
      {projectsOpen && (
        <div className="projects-overlay" onClick={(e) => { if (e.target === e.currentTarget) setProjectsOpen(false); }}>
          <div className="projects-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 16 }}>Projects</h3>
              <button className="track-btn" onClick={() => setProjectsOpen(false)}>✕</button>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {listProjects().length === 0 && (
                <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>No saved projects yet.</p>
              )}
              {listProjects().map((p) => (
                <div key={p.id} className="project-item" style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                  border: p.id === projectId ? '2px solid var(--color-text)' : '1px solid var(--color-border)',
                  marginBottom: 4, fontFamily: 'var(--font-mono)', fontSize: 13,
                  background: p.id === projectId ? 'var(--color-surface)' : 'transparent',
                }}>
                  <span style={{ flex: 1, fontWeight: p.id === projectId ? 700 : 400 }}>{p.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                  <button className="track-btn" onClick={() => handleLoadProject(p.id)}>Load</button>
                  <button className="track-btn" onClick={() => { deleteProject(p.id); setProjectsOpen(false); }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="help-bar">
        [SPACE] play/stop &nbsp; [R] record &nbsp; [H] jump start &nbsp; [↑↓] zoom ({zoom}px/s) &nbsp; scroll to pan
        {armedTrackId && transport === 'stopped' && (
          <span style={{ marginLeft: 12, fontWeight: 700 }}>
            ⬤ {tracks.find((t) => t.id === armedTrackId)?.name} armed
            {isMIDIArmed
              ? midiConnected
                ? ' — play external MIDI keyboard, press ● to record'
                : ' — use keyboard keys or tap piano below, press ● to record'
              : ' — press ● to record'}
          </span>
        )}
      </div>
    </div>
  );
}

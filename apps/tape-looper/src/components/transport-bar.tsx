import { useState } from 'react';
import { useStore } from '../lib/store';

/* ── Editable Project Name ── */
export function EditableProjectName() {
  const projectName = useStore((s) => s.projectName);
  const setProjectName = useStore((s) => s.setProjectName);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(projectName);

  const submit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== projectName) setProjectName(trimmed);
    else setDraft(projectName);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        className="track-name-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={submit}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setDraft(projectName); setEditing(false); } }}
        autoFocus
        style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, border: '2px solid var(--color-border)', padding: '2px 8px', background: 'var(--color-bg)', color: 'var(--color-text)', width: 200 }}
      />
    );
  }

  return (
    <span
      style={{ marginLeft: 8, fontWeight: 700, cursor: 'pointer', borderBottom: '2px dashed transparent', paddingBottom: 2 }}
      onClick={() => { setDraft(projectName); setEditing(true); }}
      title="Click to rename project"
    >
      {projectName}
    </span>
  );
}

/* ── Transport Bar ── */
export function TransportBar({
  playheadTime,
  onPlay,
  onRecord,
  onSeekToStart,
  onOpenProjects,
  onNewProject,
  onSave,
  saveStatus,
  midiConnected,
  onConnectMIDI,
  midiError,
  octaveOffset,
  onOctaveDown,
  onOctaveUp,
}: {
  playheadTime: number;
  onPlay: () => void;
  onRecord: () => void;
  onSeekToStart: () => void;
  onOpenProjects: () => void;
  onNewProject: () => void;
  onSave: () => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  midiConnected: boolean;
  onConnectMIDI: () => void;
  midiError: string | null;
  octaveOffset: number;
  onOctaveDown: () => void;
  onOctaveUp: () => void;
}) {
  const transport = useStore((s) => s.transport);
  const bpm = useStore((s) => s.bpm);
  const setBpm = useStore((s) => s.setBpm);
  const armedTrackId = useStore((s) => s.armedTrackId);
  const inputGain = useStore((s) => s.inputGain);
  const setInputGain = useStore((s) => s.setInputGain);
  const zoom = useStore((s) => s.zoom);
  const setZoom = useStore((s) => s.setZoom);
  const followPlayhead = useStore((s) => s.followPlayhead);
  const setFollowPlayhead = useStore((s) => s.setFollowPlayhead);
  const masterVolume = useStore((s) => s.masterVolume);
  const setMasterVolume = useStore((s) => s.setMasterVolume);
  const loop = useStore((s) => s.loop);
  const setLoop = useStore((s) => s.setLoop);

  const masterDb = masterVolume === 0 ? '-∞' : `${(20 * Math.log10(masterVolume)).toFixed(0)} dB`;

  const fmtTime = (t: number) => {
    const m = Math.floor(Math.max(0, t) / 60);
    const s = Math.floor(Math.max(0, t) % 60);
    const ms = Math.floor((Math.max(0, t) % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const isPlaying = transport === 'playing' || transport === 'recording';

  return (
    <div className="transport-bar">
      {/* Row 1: Project controls — aligned right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        <EditableProjectName />
        <button className="track-btn" onClick={onOpenProjects}>📂 Load</button>
        <button className="track-btn" onClick={onNewProject}>+ New</button>
        <button className="track-btn" onClick={onSave}>{saveStatus === 'saved' ? '✓ Saved' : '💾 Save'}</button>
        {!midiConnected && (
          <button className="track-btn" onClick={onConnectMIDI} title={midiError ?? 'Connect MIDI keyboard'}
            style={midiError ? { borderColor: '#e53e3e', color: '#e53e3e' } : undefined}>
            🎹 {midiError ? 'MIDI ⚠' : 'MIDI'}
          </button>
        )}
        {midiConnected && (
          <span style={{ fontSize: 14 }} title="MIDI connected">🎹 ✓</span>
        )}
      </div>
      {/* Row 2: Playback controls — aligned left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <button className="transport-btn" onClick={onSeekToStart} title="Jump to start" disabled={isPlaying}>⏮</button>
        <button className={`transport-btn ${isPlaying ? 'active' : ''}`} onClick={onPlay} title="Play/Stop">{isPlaying ? '■' : '▶'}</button>
        <button className={`transport-btn record ${transport === 'recording' ? 'active armed' : armedTrackId ? 'armed' : ''}`} onClick={onRecord} title="Record">●</button>

        <select className="gain-select" value={inputGain} onChange={(e) => setInputGain(Number(e.target.value))} title="Input gain">
          {[1, 2, 3, 4, 6, 8, 10, 14, 20].map((g) => (<option key={g} value={g}>{g}×</option>))}
        </select>

        <button className="transport-btn" onClick={() => setZoom(Math.max(10, zoom - 30))}>−</button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, minWidth: 32, textAlign: 'center' }}>{zoom}</span>
        <button className="transport-btn" onClick={() => setZoom(Math.min(500, zoom + 30))}>+</button>

        <button
          className={`transport-btn ${followPlayhead ? 'active' : ''}`}
          onClick={() => setFollowPlayhead(!followPlayhead)}
          title="Follow playhead during playback"
          aria-pressed={followPlayhead}
        >🔒</button>

        <button
          className={`transport-btn ${loop.enabled ? 'active' : ''}`}
          onClick={() => setLoop({ enabled: !loop.enabled })}
          title="Loop region — shift-drag the ruler to set range"
          aria-pressed={loop.enabled}
        >↻</button>

        <input
          type="number" min={20} max={300} value={bpm}
          onChange={(e) => setBpm(Math.max(20, Math.min(300, Number(e.target.value) || 120)))}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, width: 48, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', textAlign: 'center', padding: '2px 0' }}
          title="BPM"
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} title="Octave (Z/X)">
          <button className="transport-btn" onClick={onOctaveDown} disabled={octaveOffset <= -4}>Z</button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, minWidth: 36, textAlign: 'center' }}>Oct {octaveOffset >= 0 ? '+' : ''}{octaveOffset}</span>
          <button className="transport-btn" onClick={onOctaveUp} disabled={octaveOffset >= 4}>X</button>
        </div>

        <div className="master-fader" title={`Master mix ${masterDb}`}>
          <span className="master-fader-label">MIX</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={masterVolume}
            onChange={(e) => setMasterVolume(Number(e.target.value))}
            className="master-slider"
            aria-label="Master volume"
          />
          <span className="master-fader-readout">{masterDb}</span>
        </div>

        <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 16 }}>{fmtTime(playheadTime)}</div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useStore } from '../lib/store';
import type { Clip, NoteEvent, Waveform } from '../lib/types';
import { TrackLane } from './track-lane';

/* ── Track Row ── */
export function TrackRow({
  track,
  idx,
  playheadTime,
  transport,
  onSeek,
  zoom,
}: {
  track: { id: string; name: string; armed: boolean; muted: boolean; solo: boolean; trackType: string; waveform: string; clips: Clip[]; notes: NoteEvent[] };
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
  const renameTrack = useStore((s) => s.renameTrack);
  const setWaveform = useStore((s) => s.setWaveform);
  const canArm = transport === 'stopped' || (transport === 'recording' && track.armed);
  const isMIDI = track.trackType === 'midi';
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(track.name);

  const handleNameSubmit = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== track.name) renameTrack(track.id, trimmed);
    else setNameDraft(track.name);
    setEditing(false);
  };

  return (
    <div className={`track-row ${isMIDI ? 'midi-track' : 'audio-track'}`}>
      <div className="track-controls">
        {editing ? (
          <input
            className="track-name-input"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => { if (e.key === 'Enter') handleNameSubmit(); if (e.key === 'Escape') { setNameDraft(track.name); setEditing(false); } }}
            autoFocus
            style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, border: '2px solid var(--color-border)', padding: '2px 4px', background: 'var(--color-bg)', color: 'var(--color-text)', width: '100%', marginBottom: 4 }}
          />
        ) : (
          <div className="track-name" onClick={() => { setNameDraft(track.name); setEditing(true); }} title="Click to rename">
            {track.name}
          </div>
        )}
        <div className="track-type-badge" style={{
          fontSize: 10, fontWeight: 700, marginBottom: 4,
          background: isMIDI ? 'none' : 'var(--color-text)',
          padding: isMIDI ? 0 : '1px 6px', display: 'inline-block',
          color: isMIDI ? 'var(--color-text)' : 'var(--color-bg)',
        }}>
          {isMIDI ? '🎹 MIDI' : '🎤 AUDIO'}
        </div>
        {isMIDI && (
          <select
            className="waveform-select"
            value={track.waveform}
            onChange={(e) => setWaveform(track.id, e.target.value as Waveform)}
            title="Waveform"
          >
            <option value="sine">~ sine</option>
            <option value="sawtooth">/\\ saw</option>
            <option value="square">⎍ square</option>
            <option value="triangle">△ tri</option>
          </select>
        )}
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

import { useState } from 'react';
import { useStore } from '../lib/store';
import type { Clip, NoteEvent, Waveform } from '../lib/types';
import { TrackLane } from './track-lane';
import { Fader } from './fader';
import { PanControl } from './pan-control';

type TrackForRow = {
  id: string;
  name: string;
  armed: boolean;
  muted: boolean;
  solo: boolean;
  trackType: string;
  waveform: string;
  volume: number;
  pan: number;
  clips: Clip[];
  notes: NoteEvent[];
};

/* ── Track Rail ──
 * The fixed-width left column for a track: name, type, controls.
 * Lives in the sticky `.rail-column` so it stays visible on narrow screens.
 */
export function TrackRail({ track, transport }: { track: TrackForRow; transport: string }) {
  const toggleMute = useStore((s) => s.toggleMute);
  const toggleSolo = useStore((s) => s.toggleSolo);
  const toggleArm = useStore((s) => s.toggleArm);
  const removeTrack = useStore((s) => s.removeTrack);
  const renameTrack = useStore((s) => s.renameTrack);
  const setWaveform = useStore((s) => s.setWaveform);
  const setEditingSynthTrackId = useStore((s) => s.setEditingSynthTrackId);
  const setVolume = useStore((s) => s.setVolume);
  const setPan = useStore((s) => s.setPan);
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
    <div className={`track-rail ${isMIDI ? 'midi-track' : 'audio-track'}`}>
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
          <>
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
            <button
              className="track-btn"
              onClick={() => setEditingSynthTrackId(track.id)}
              title="Edit synth patch"
              style={{ marginTop: 4 }}
            >
              🎛 EDIT SYNTH
            </button>
          </>
        )}
        <div className="track-mix">
          <Fader value={track.volume} onChange={(v) => setVolume(track.id, v)} label="Track volume" />
          <PanControl value={track.pan} onChange={(v) => setPan(track.id, v)} />
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
    </div>
  );
}

/* ── Track Lane Row ──
 * The horizontally-scrollable lane half of a track. Renders inside
 * `.timeline-scroll` so it scrolls with the ruler and playhead overlay.
 */
export function TrackLaneRow({
  track,
  idx,
  transport,
  onSeek,
  zoom,
  totalWidth,
}: {
  track: TrackForRow;
  idx: number;
  transport: string;
  onSeek: (time: number) => void;
  zoom: number;
  totalWidth: number;
}) {
  const isMIDI = track.trackType === 'midi';
  return (
    <div className={`track-lane-row ${isMIDI ? 'midi-track' : 'audio-track'}`}>
      <TrackLane
        track={track}
        patternIdx={idx}
        transport={transport}
        onSeek={onSeek}
        zoom={zoom}
        totalWidth={totalWidth}
      />
    </div>
  );
}

/* ── Track Row (legacy combined export — kept for back-compat) ──
 * New app layout uses TrackRail + TrackLaneRow in parallel columns, so this
 * export is no longer rendered by App. Kept here in case any test imports it.
 */
export function TrackRow({
  track,
  idx,
  transport,
  onSeek,
  zoom,
  totalWidth,
}: {
  track: TrackForRow;
  idx: number;
  transport: string;
  onSeek: (time: number) => void;
  zoom: number;
  totalWidth: number;
}) {
  return (
    <div className={`track-row ${track.trackType === 'midi' ? 'midi-track' : 'audio-track'}`}>
      <TrackRail track={track} transport={transport} />
      <TrackLaneRow track={track} idx={idx} transport={transport} onSeek={onSeek} zoom={zoom} totalWidth={totalWidth} />
    </div>
  );
}

/**
 * Synth editor panel — slide-in from right when a MIDI track requests it.
 *
 * Drives a per-track `SynthPatch`:
 *   - Pick a preset from the dropdown, or start from current.
 *   - Tweak waveform, ADSR (via SVG), FM params, filter, volume.
 *   - Save the draft (debounced) to IndexedDB AND apply to the live synth.
 *   - Save As / Duplicate / Delete buttons manage the preset library.
 *
 * Closing: Esc, or the ✕ button, or clicking outside.
 *
 * Strict B&W. No color anywhere in this UI.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store';
import type { SynthPatch, SynthType, Waveform } from '../lib/types';
import { DEFAULT_PATCH } from '../lib/types';
import { listPatches, savePatch, deletePatch, getPatch } from '../lib/patch-store';
import { applyPatchToSynth } from '../lib/synth-manager';
import { ADSREditor } from './adsr-editor';

const SYNTH_TYPES: SynthType[] = ['Synth', 'FMSynth', 'AMSynth'];
const WAVEFORMS: { value: Waveform; label: string }[] = [
  { value: 'sine', label: '~ sine' },
  { value: 'triangle', label: '△ tri' },
  { value: 'square', label: '⎍ square' },
  { value: 'sawtooth', label: '/\\ saw' },
];

function freshDraftId(): string {
  return `patch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function SynthEditor() {
  const editingTrackId = useStore((s) => s.editingSynthTrackId);
  const setEditingTrackId = useStore((s) => s.setEditingSynthTrackId);
  const tracks = useStore((s) => s.tracks);
  const setPatchId = useStore((s) => s.setPatchId);

  const track = tracks.find((t) => t.id === editingTrackId) ?? null;

  // Local draft of the current patch — slider drags update this immediately.
  const [draft, setDraft] = useState<SynthPatch>(DEFAULT_PATCH);
  const [patchList, setPatchList] = useState<SynthPatch[]>([]);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // Reload patch list when panel opens, and seed the draft from the
  // track's current patchId.
  useEffect(() => {
    if (!editingTrackId || !track) return;
    let cancelled = false;
    (async () => {
      const list = await listPatches();
      if (cancelled) return;
      setPatchList(list);
      const initial = (await getPatch(track.patchId ?? '__default__')) ?? DEFAULT_PATCH;
      if (!cancelled) setDraft(initial);
    })();
    return () => { cancelled = true; };
  }, [editingTrackId, track]);

  // Debounced persist + live apply. Slider drags spam updateDraft; we
  // only hit IndexedDB and the synth-manager every ~100ms.
  useEffect(() => {
    if (!editingTrackId) return;
    const handle = setTimeout(() => {
      const current = draftRef.current;
      // Built-in presets are read-only — applying is fine, but writing
      // back would overwrite. Skip save in that case; user can use Save As.
      if (!current.id.startsWith('preset-') && current.id !== '__default__') {
        savePatch(current).catch((err) => console.warn('savePatch failed:', err));
      }
      applyPatchToSynth(editingTrackId, current).catch((err) => console.warn('applyPatchToSynth failed:', err));
    }, 100);
    return () => clearTimeout(handle);
  }, [draft, editingTrackId]);

  // Esc closes the panel.
  useEffect(() => {
    if (!editingTrackId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setEditingTrackId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editingTrackId, setEditingTrackId]);

  const updateDraft = useCallback((patch: Partial<SynthPatch>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const onSelectPatch = useCallback(async (id: string) => {
    if (!track) return;
    const next = (await getPatch(id)) ?? DEFAULT_PATCH;
    setDraft(next);
    setPatchId(track.id, id);
  }, [track, setPatchId]);

  const onSaveAs = useCallback(async () => {
    if (!track) return;
    const baseName = draft.name.startsWith('Copy of ') ? draft.name : `Copy of ${draft.name}`;
    const newPatch: SynthPatch = { ...draft, id: freshDraftId(), name: baseName };
    await savePatch(newPatch);
    setDraft(newPatch);
    setPatchId(track.id, newPatch.id);
    setPatchList(await listPatches());
  }, [draft, track, setPatchId]);

  const onRename = useCallback(async (newName: string) => {
    if (!newName.trim() || newName === draft.name) return;
    const next = { ...draft, name: newName.trim() };
    setDraft(next);
    // savePatch flows through the debounced effect — unless it's a built-in,
    // in which case rename only persists if we Save As. Renaming a built-in
    // just shows the new name in this session's draft.
    if (!draft.id.startsWith('preset-') && draft.id !== '__default__') {
      await savePatch(next);
      setPatchList(await listPatches());
    }
  }, [draft]);

  const onDelete = useCallback(async () => {
    if (!track) return;
    if (draft.id === '__default__' || draft.id.startsWith('preset-')) return; // can't delete built-ins
    await deletePatch(draft.id);
    setPatchId(track.id, null);
    setDraft(DEFAULT_PATCH);
    setPatchList(await listPatches());
  }, [draft, track, setPatchId]);

  if (!editingTrackId || !track) return null;

  const isBuiltin = draft.id === '__default__' || draft.id.startsWith('preset-');

  return (
    <div className="synth-editor-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingTrackId(null); }}>
      <div className="synth-editor" onClick={(e) => e.stopPropagation()}>
        <header className="synth-editor-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>SYNTH · {track.name}</span>
            <input
              className="synth-name-input"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              onBlur={(e) => onRename(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            />
          </div>
          <button className="track-btn" onClick={() => setEditingTrackId(null)} title="Close (Esc)">✕</button>
        </header>

        <section className="synth-section">
          <label className="synth-label">PATCH</label>
          <select
            className="synth-select"
            value={patchList.some((p) => p.id === draft.id) ? draft.id : ''}
            onChange={(e) => { if (e.target.value) onSelectPatch(e.target.value); }}
          >
            <option value="">— current draft —</option>
            <option value="__default__">{DEFAULT_PATCH.name}</option>
            {patchList.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <button className="track-btn" onClick={onSaveAs}>Save As</button>
            <button className="track-btn" onClick={onDelete} disabled={isBuiltin} style={{ opacity: isBuiltin ? 0.4 : 1 }}>Delete</button>
          </div>
        </section>

        <section className="synth-section">
          <label className="synth-label">SYNTH TYPE</label>
          <div className="synth-seg">
            {SYNTH_TYPES.map((t) => (
              <button
                key={t}
                className={`synth-seg-btn ${draft.synthType === t ? 'on' : ''}`}
                onClick={() => updateDraft({ synthType: t })}
              >{t}</button>
            ))}
          </div>
        </section>

        <section className="synth-section">
          <label className="synth-label">WAVEFORM</label>
          <div className="synth-seg">
            {WAVEFORMS.map((w) => (
              <button
                key={w.value}
                className={`synth-seg-btn ${draft.waveform === w.value ? 'on' : ''}`}
                onClick={() => updateDraft({ waveform: w.value })}
              >{w.label}</button>
            ))}
          </div>
        </section>

        <section className="synth-section">
          <label className="synth-label">ENVELOPE (A · D · S · R)</label>
          <ADSREditor
            value={draft.envelope}
            onChange={(envelope) => updateDraft({ envelope })}
          />
          <div className="synth-readout">
            <span>A {draft.envelope.attack.toFixed(3)}s</span>
            <span>D {draft.envelope.decay.toFixed(3)}s</span>
            <span>S {draft.envelope.sustain.toFixed(2)}</span>
            <span>R {draft.envelope.release.toFixed(3)}s</span>
          </div>
        </section>

        {draft.synthType === 'FMSynth' && (
          <section className="synth-section">
            <label className="synth-label">FM</label>
            <SliderRow
              label="Harmonicity"
              min={0.5} max={8} step={0.01}
              value={draft.harmonicity}
              onChange={(v) => updateDraft({ harmonicity: v })}
              fmt={(v) => v.toFixed(2)}
            />
            <SliderRow
              label="Mod Index"
              min={0} max={40} step={0.1}
              value={draft.modulationIndex}
              onChange={(v) => updateDraft({ modulationIndex: v })}
              fmt={(v) => v.toFixed(1)}
            />
          </section>
        )}

        <section className="synth-section">
          <label className="synth-label">FILTER</label>
          <SliderRow
            label="Cutoff"
            min={Math.log(20)} max={Math.log(20000)} step={0.01}
            value={Math.log(draft.filterCutoff)}
            onChange={(v) => updateDraft({ filterCutoff: Math.exp(v) })}
            fmt={(v) => `${Math.round(Math.exp(v))} Hz`}
          />
          <SliderRow
            label="Resonance"
            min={0} max={10} step={0.1}
            value={draft.filterResonance}
            onChange={(v) => updateDraft({ filterResonance: v })}
            fmt={(v) => v.toFixed(1)}
          />
        </section>

        <section className="synth-section">
          <label className="synth-label">VOLUME</label>
          <SliderRow
            label="dB"
            min={-60} max={0} step={0.5}
            value={draft.volume}
            onChange={(v) => updateDraft({ volume: v })}
            fmt={(v) => `${v.toFixed(1)} dB`}
          />
        </section>

        {isBuiltin && (
          <p className="synth-hint">Built-in preset — edits are live, but "Save As" to keep changes.</p>
        )}
      </div>
    </div>
  );
}

interface SliderRowProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  fmt: (v: number) => string;
}

function SliderRow({ label, min, max, step, value, onChange, fmt }: SliderRowProps) {
  return (
    <div className="synth-slider-row">
      <span className="synth-slider-label">{label}</span>
      <input
        className="synth-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="synth-slider-value">{fmt(value)}</span>
    </div>
  );
}

/**
 * Built-in synth presets. Seeded into IndexedDB on first run so the patch
 * dropdown is never empty. Covers a range of useful sound-design starting
 * points: pads, leads, basses, plucks, keys, mallets, FX.
 *
 * Editing rule: keep IDs stable. Adding new presets is safe — the seeder
 * walks the list and inserts only the ones the store is missing, so users
 * who already seeded an earlier version still get the newcomers on next
 * open without losing their own edits to existing presets.
 */
import type { SynthPatch } from './types';

export const PATCH_PRESETS: SynthPatch[] = [
  // ── Sines + soft tones ─────────────────────────────────────────
  {
    id: 'preset-soft-sine',
    name: 'Soft Sine',
    synthType: 'Synth',
    waveform: 'sine',
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.6, release: 0.4 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 20000,
    filterResonance: 0,
    volume: -8,
  },
  {
    id: 'preset-sine-lead',
    name: 'Sine Lead',
    synthType: 'Synth',
    waveform: 'sine',
    envelope: { attack: 0.003, decay: 0.12, sustain: 0.7, release: 0.25 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 12000,
    filterResonance: 0,
    volume: -8,
  },

  // ── Plucks + percussives ───────────────────────────────────────
  {
    id: 'preset-pluck',
    name: 'Triangle Pluck',
    synthType: 'Synth',
    waveform: 'triangle',
    envelope: { attack: 0.003, decay: 0.18, sustain: 0.0, release: 0.18 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 6000,
    filterResonance: 1.2,
    volume: -6,
  },
  {
    id: 'preset-marimba',
    name: 'Marimba',
    synthType: 'FMSynth',
    waveform: 'sine',
    envelope: { attack: 0.001, decay: 0.5, sustain: 0.0, release: 0.3 },
    harmonicity: 4,
    modulationIndex: 4,
    filterCutoff: 6000,
    filterResonance: 0.4,
    volume: -8,
  },
  {
    id: 'preset-glass-stab',
    name: 'Glass Stab',
    synthType: 'FMSynth',
    waveform: 'sine',
    envelope: { attack: 0.001, decay: 0.3, sustain: 0.0, release: 0.45 },
    harmonicity: 7,
    modulationIndex: 6,
    filterCutoff: 9000,
    filterResonance: 0,
    volume: -12,
  },

  // ── Leads ──────────────────────────────────────────────────────
  {
    id: 'preset-saw-lead',
    name: 'Saw Lead',
    synthType: 'Synth',
    waveform: 'sawtooth',
    envelope: { attack: 0.008, decay: 0.12, sustain: 0.7, release: 0.25 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 4500,
    filterResonance: 2.5,
    volume: -10,
  },
  {
    id: 'preset-brass-stab',
    name: 'Brass Stab',
    synthType: 'Synth',
    waveform: 'sawtooth',
    envelope: { attack: 0.04, decay: 0.2, sustain: 0.65, release: 0.3 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 3500,
    filterResonance: 2,
    volume: -10,
  },

  // ── Basses ─────────────────────────────────────────────────────
  {
    id: 'preset-square-bass',
    name: 'Square Bass',
    synthType: 'Synth',
    waveform: 'square',
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.2 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 1200,
    filterResonance: 1.5,
    volume: -8,
  },
  {
    id: 'preset-sub-bass',
    name: 'Sub Bass',
    synthType: 'Synth',
    waveform: 'sine',
    envelope: { attack: 0.005, decay: 0.4, sustain: 0.85, release: 0.3 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 600,
    filterResonance: 0.4,
    volume: -4,
  },
  {
    id: 'preset-acid-bass',
    name: 'Acid Bass',
    synthType: 'Synth',
    waveform: 'sawtooth',
    envelope: { attack: 0.002, decay: 0.25, sustain: 0.2, release: 0.15 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 900,
    filterResonance: 6,
    volume: -8,
  },

  // ── Pads + sustained ──────────────────────────────────────────
  {
    id: 'preset-wide-pad',
    name: 'Wide Pad',
    synthType: 'Synth',
    waveform: 'sawtooth',
    envelope: { attack: 1.5, decay: 0.5, sustain: 0.7, release: 2.0 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 2200,
    filterResonance: 1,
    volume: -14,
  },
  {
    id: 'preset-organ',
    name: 'Pipe Organ',
    synthType: 'Synth',
    waveform: 'triangle',
    envelope: { attack: 0.02, decay: 0.0, sustain: 1.0, release: 0.4 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 4000,
    filterResonance: 0,
    volume: -10,
  },

  // ── FM keys + bell ────────────────────────────────────────────
  {
    id: 'preset-fm-bell',
    name: 'FM Bell',
    synthType: 'FMSynth',
    waveform: 'sine',
    envelope: { attack: 0.002, decay: 1.2, sustain: 0.0, release: 1.5 },
    harmonicity: 3.01,
    modulationIndex: 12,
    filterCutoff: 20000,
    filterResonance: 0,
    volume: -10,
  },
  {
    id: 'preset-fm-keys',
    name: 'FM Keys',
    synthType: 'FMSynth',
    waveform: 'sine',
    envelope: { attack: 0.005, decay: 0.4, sustain: 0.4, release: 0.6 },
    harmonicity: 2,
    modulationIndex: 5,
    filterCutoff: 8000,
    filterResonance: 0.5,
    volume: -8,
  },
  {
    id: 'preset-am-pluck',
    name: 'AM Pluck',
    synthType: 'AMSynth',
    waveform: 'sine',
    envelope: { attack: 0.001, decay: 0.18, sustain: 0.0, release: 0.18 },
    harmonicity: 1.5,
    modulationIndex: 0,
    filterCutoff: 5000,
    filterResonance: 0.6,
    volume: -8,
  },
];

/** Pure helper to get a preset by id, undefined if not built-in. */
export function getPresetById(id: string): SynthPatch | undefined {
  return PATCH_PRESETS.find((p) => p.id === id);
}

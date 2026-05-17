/**
 * Built-in synth presets. Seeded into IndexedDB on first run so the patch
 * dropdown is never empty.
 */
import type { SynthPatch } from './types';

export const PATCH_PRESETS: SynthPatch[] = [
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
    id: 'preset-pluck',
    name: 'Pluck',
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
];

/** Pure helper to get a preset by id, undefined if not built-in. */
export function getPresetById(id: string): SynthPatch | undefined {
  return PATCH_PRESETS.find((p) => p.id === id);
}

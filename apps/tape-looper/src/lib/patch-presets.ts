/**
 * Seed synth patches — written to IndexedDB once on first run.
 * Empty patch store is bad UX; ship a starter set covering common roles.
 */
import type { SynthPatch } from './types';
import { listPatches, savePatch } from './patch-store';

export const SEED_PATCHES: SynthPatch[] = [
  {
    id: 'preset-bass',
    name: 'Bass',
    synthType: 'Synth',
    waveform: 'sawtooth',
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.2 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 800,
    filterResonance: 1,
    volume: -8,
  },
  {
    id: 'preset-lead',
    name: 'Lead',
    synthType: 'Synth',
    waveform: 'square',
    envelope: { attack: 0.005, decay: 0.05, sustain: 0.6, release: 0.15 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 4000,
    filterResonance: 2,
    volume: -10,
  },
  {
    id: 'preset-bell',
    name: 'Bell',
    synthType: 'FMSynth',
    waveform: 'sine',
    envelope: { attack: 0.005, decay: 0.4, sustain: 0, release: 0.6 },
    harmonicity: 3,
    modulationIndex: 8,
    filterCutoff: 20000,
    filterResonance: 0,
    volume: -10,
  },
  {
    id: 'preset-pad',
    name: 'Pad',
    synthType: 'Synth',
    waveform: 'triangle',
    envelope: { attack: 0.8, decay: 0.3, sustain: 0.8, release: 1.5 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 2500,
    filterResonance: 0.5,
    volume: -12,
  },
  {
    id: 'preset-pluck',
    name: 'Pluck',
    synthType: 'Synth',
    waveform: 'triangle',
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
    harmonicity: 1,
    modulationIndex: 0,
    filterCutoff: 5000,
    filterResonance: 1,
    volume: -8,
  },
  {
    id: 'preset-kick',
    name: 'Kick',
    synthType: 'FMSynth',
    waveform: 'sine',
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
    harmonicity: 0.5,
    modulationIndex: 10,
    filterCutoff: 200,
    filterResonance: 2,
    volume: -6,
  },
];

/**
 * Write seed patches to IndexedDB only if the patch store is empty.
 * Idempotent: stable preset IDs mean reloads don't duplicate, and we skip
 * entirely when any patches already exist (so user edits aren't clobbered).
 */
export async function seedPatchesIfEmpty(): Promise<void> {
  try {
    const existing = await listPatches();
    if (existing.length > 0) return;
    for (const patch of SEED_PATCHES) {
      await savePatch(patch);
    }
  } catch (err) {
    console.warn('Failed to seed synth patches:', err);
  }
}

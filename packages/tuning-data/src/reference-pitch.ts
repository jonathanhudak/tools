/**
 * Reference pitch (A4 calibration) math.
 *
 * The tuning catalog stores frequencies computed against the 12-TET standard
 * A4 = 440 Hz. In equal temperament every pitch is a fixed *ratio* of A4
 * (f = A4 · 2^((midi − 69) / 12)), so retuning A4 scales every frequency —
 * including microtonal cents offsets, which are ratio-invariant — by exactly
 * (A4 / 440). No approximation is involved.
 */

import type { Tuning, TuningNote } from './tunings';

/** The 12-TET concert standard the catalog frequencies are computed against. */
export const STANDARD_A4 = 440;

/** Bounds for a sane custom reference pitch (baroque 415 to bright 466). */
export const MIN_REFERENCE_PITCH = 415;
export const MAX_REFERENCE_PITCH = 466;

export interface ReferencePitchPreset {
  hz: number;
  label: string;
  description: string;
}

export const REFERENCE_PITCH_PRESETS: ReferencePitchPreset[] = [
  {
    hz: 440,
    label: '440 Hz',
    description: 'Concert standard (ISO 16)',
  },
  {
    hz: 432,
    label: '432 Hz',
    description: 'Verdi tuning — every frequency scaled by exactly 432/440',
  },
];

/** Clamp an arbitrary value into the supported reference-pitch range. */
export function clampReferencePitch(hz: number): number {
  if (!Number.isFinite(hz)) return STANDARD_A4;
  return Math.min(MAX_REFERENCE_PITCH, Math.max(MIN_REFERENCE_PITCH, hz));
}

/** Exact frequency of a MIDI note for a given A4 reference. */
export function midiToFrequency(midi: number, a4: number = STANDARD_A4): number {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

export interface DetectedNote {
  /** Nearest 12-TET note name for the given reference, e.g. "A4", "F#2". */
  name: string;
  midi: number;
  /** Deviation from that note in cents (−50..+50). */
  cents: number;
}

const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Map a detected frequency to the nearest 12-TET note under the given A4
 * reference, with the residual deviation in cents.
 */
export function frequencyToNote(frequency: number, a4: number = STANDARD_A4): DetectedNote | null {
  if (!(frequency > 0) || !(a4 > 0)) return null;
  const midiFloat = 12 * Math.log2(frequency / a4) + 69;
  const midi = Math.round(midiFloat);
  if (midi < 0 || midi > 127) return null;
  const octave = Math.floor(midi / 12) - 1;
  const name = `${PITCH_CLASSES[midi % 12]}${octave}`;
  return {
    name,
    midi,
    cents: (midiFloat - midi) * 100,
  };
}

function scaleNote(note: TuningNote, ratio: number): TuningNote {
  return { ...note, frequency: note.frequency * ratio };
}

/**
 * Derive a tuning calibrated to the given A4 reference from the canonical
 * 440-based catalog entry. Returns the tuning unchanged when a4 === 440.
 */
export function applyReferencePitch(tuning: Tuning, a4: number): Tuning {
  if (a4 === STANDARD_A4) return tuning;
  const ratio = a4 / STANDARD_A4;
  return {
    ...tuning,
    notes: tuning.notes.map((note) => scaleNote(note, ratio)),
  };
}

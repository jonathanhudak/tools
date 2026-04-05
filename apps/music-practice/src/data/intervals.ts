/**
 * Interval Reference System
 *
 * Complete interval definitions for music theory, covering all simple intervals
 * (P1–P8) and common compound intervals (9ths, 11ths, 13ths).
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type IntervalQuality = 'perfect' | 'major' | 'minor' | 'augmented' | 'diminished';

export interface IntervalDefinition {
  /** Number of semitones from root */
  semitones: number;
  /** Abbreviated name, e.g. "P5", "m3" */
  shortName: string;
  /** Full English name, e.g. "Perfect Fifth" */
  fullName: string;
  /** Interval quality */
  quality: IntervalQuality;
  /** Generic interval number (1–8 for simple, 9+ for compound) */
  number: number;
  /** Whether this is a compound interval (> octave) */
  isCompound: boolean;
  /** For compound intervals, the simple equivalent shortName */
  simpleEquivalent?: string;
  /** The inversion of this interval's shortName */
  inversion: string;
}

// ─── Simple Intervals (P1 – P8) ─────────────────────────────────────────────

export const INTERVALS: IntervalDefinition[] = [
  { semitones: 0,  shortName: 'P1',  fullName: 'Perfect Unison',       quality: 'perfect',    number: 1, isCompound: false, inversion: 'P8' },
  { semitones: 1,  shortName: 'm2',  fullName: 'Minor Second',         quality: 'minor',      number: 2, isCompound: false, inversion: 'M7' },
  { semitones: 2,  shortName: 'M2',  fullName: 'Major Second',         quality: 'major',      number: 2, isCompound: false, inversion: 'm7' },
  { semitones: 3,  shortName: 'm3',  fullName: 'Minor Third',          quality: 'minor',      number: 3, isCompound: false, inversion: 'M6' },
  { semitones: 4,  shortName: 'M3',  fullName: 'Major Third',          quality: 'major',      number: 3, isCompound: false, inversion: 'm6' },
  { semitones: 5,  shortName: 'P4',  fullName: 'Perfect Fourth',       quality: 'perfect',    number: 4, isCompound: false, inversion: 'P5' },
  { semitones: 6,  shortName: 'A4',  fullName: 'Augmented Fourth',     quality: 'augmented',  number: 4, isCompound: false, inversion: 'd5' },
  { semitones: 6,  shortName: 'd5',  fullName: 'Diminished Fifth',     quality: 'diminished', number: 5, isCompound: false, inversion: 'A4' },
  { semitones: 7,  shortName: 'P5',  fullName: 'Perfect Fifth',        quality: 'perfect',    number: 5, isCompound: false, inversion: 'P4' },
  { semitones: 8,  shortName: 'm6',  fullName: 'Minor Sixth',          quality: 'minor',      number: 6, isCompound: false, inversion: 'M3' },
  { semitones: 9,  shortName: 'M6',  fullName: 'Major Sixth',          quality: 'major',      number: 6, isCompound: false, inversion: 'm3' },
  { semitones: 10, shortName: 'm7',  fullName: 'Minor Seventh',        quality: 'minor',      number: 7, isCompound: false, inversion: 'M2' },
  { semitones: 11, shortName: 'M7',  fullName: 'Major Seventh',        quality: 'major',      number: 7, isCompound: false, inversion: 'm2' },
  { semitones: 12, shortName: 'P8',  fullName: 'Perfect Octave',       quality: 'perfect',    number: 8, isCompound: false, inversion: 'P1' },
];

// ─── Compound Intervals ──────────────────────────────────────────────────────

export const COMPOUND_INTERVALS: IntervalDefinition[] = [
  { semitones: 13, shortName: 'm9',  fullName: 'Minor Ninth',          quality: 'minor',      number: 9,  isCompound: true, simpleEquivalent: 'm2', inversion: 'M7' },
  { semitones: 14, shortName: 'M9',  fullName: 'Major Ninth',          quality: 'major',      number: 9,  isCompound: true, simpleEquivalent: 'M2', inversion: 'm7' },
  { semitones: 15, shortName: 'm10', fullName: 'Minor Tenth',          quality: 'minor',      number: 10, isCompound: true, simpleEquivalent: 'm3', inversion: 'M6' },
  { semitones: 16, shortName: 'M10', fullName: 'Major Tenth',          quality: 'major',      number: 10, isCompound: true, simpleEquivalent: 'M3', inversion: 'm6' },
  { semitones: 17, shortName: 'P11', fullName: 'Perfect Eleventh',     quality: 'perfect',    number: 11, isCompound: true, simpleEquivalent: 'P4', inversion: 'P5' },
  { semitones: 18, shortName: 'A11', fullName: 'Augmented Eleventh',   quality: 'augmented',  number: 11, isCompound: true, simpleEquivalent: 'A4', inversion: 'd5' },
  { semitones: 19, shortName: 'P12', fullName: 'Perfect Twelfth',      quality: 'perfect',    number: 12, isCompound: true, simpleEquivalent: 'P5', inversion: 'P4' },
  { semitones: 20, shortName: 'm13', fullName: 'Minor Thirteenth',     quality: 'minor',      number: 13, isCompound: true, simpleEquivalent: 'm6', inversion: 'M3' },
  { semitones: 21, shortName: 'M13', fullName: 'Major Thirteenth',     quality: 'major',      number: 13, isCompound: true, simpleEquivalent: 'M6', inversion: 'm3' },
];

/** All intervals combined */
export const ALL_INTERVALS: IntervalDefinition[] = [...INTERVALS, ...COMPOUND_INTERVALS];

// ─── Chromatic note mapping (for semitonesBetween) ───────────────────────────

const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Get the first interval definition matching the given semitone count.
 * Searches simple intervals first, then compound.
 */
export function getInterval(semitones: number): IntervalDefinition | undefined {
  return ALL_INTERVALS.find((i) => i.semitones === semitones);
}

/**
 * Get the short name of the first interval matching the semitone count.
 */
export function getIntervalName(semitones: number): string | undefined {
  return getInterval(semitones)?.shortName;
}

/**
 * Return the inversion of an interval by its shortName.
 * E.g. invertInterval('P5') → 'P4'
 */
export function invertInterval(shortName: string): string | undefined {
  const interval = ALL_INTERVALS.find((i) => i.shortName === shortName);
  return interval?.inversion;
}

/**
 * Calculate the ascending semitone distance between two note names (pitch-class only).
 * Accepts naturals, sharps (#), and flats (b). E.g. semitonesBetween('C', 'E') → 4
 */
export function semitonesBetween(note1: string, note2: string): number {
  const s1 = NOTE_TO_SEMITONE[note1];
  const s2 = NOTE_TO_SEMITONE[note2];
  if (s1 === undefined || s2 === undefined) {
    throw new Error(`Unknown note name: ${s1 === undefined ? note1 : note2}`);
  }
  return ((s2 - s1) % 12 + 12) % 12;
}

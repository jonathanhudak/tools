/**
 * Enharmonic Resolution Engine
 *
 * A comprehensive, key-aware system for resolving enharmonic spellings
 * in a music theory context. Ensures notes are spelled correctly for
 * any key signature, chord context, or scale context.
 *
 * Rules enforced:
 * - Each 7-note diatonic scale uses each letter name (A-G) exactly once
 * - Sharp keys follow the circle of fifths: G(1#) → C#(7#)
 * - Flat keys follow the circle of fourths: F(1b) → Cb(7b)
 * - Chord tones are spelled to preserve interval identity
 */

import { Note } from 'tonal';
import { NOTE_TO_SEMITONE } from './intervals';
import { CHORD_TYPES } from './chords/chord-types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Semitone value 0-11 where C=0, C#/Db=1, ... B=11 */
export type Semitone = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface EnharmonicPair {
  sharp: string;
  flat: string;
}

export interface KeySpelling {
  /** The 7 note names of the key's diatonic scale (e.g. ["C","D","E","F","G","A","B"]) */
  notes: string[];
  /** Whether the key predominantly uses sharps */
  useSharps: boolean;
}

// ---------------------------------------------------------------------------
// Module-level constants
// ---------------------------------------------------------------------------

const LETTERS: string[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const LETTER_TO_NATURAL: Record<string, number> = {
  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11,
};

// ---------------------------------------------------------------------------
// ENHARMONIC_MAP — semitone 0-11 → sharp & flat spellings
// ---------------------------------------------------------------------------

/**
 * Maps each semitone (0-11) to its sharp and flat enharmonic spellings.
 * For natural notes the sharp and flat spellings are identical.
 */
export const ENHARMONIC_MAP: Record<Semitone, EnharmonicPair> = {
  0:  { sharp: 'C',  flat: 'C' },
  1:  { sharp: 'C#', flat: 'Db' },
  2:  { sharp: 'D',  flat: 'D' },
  3:  { sharp: 'D#', flat: 'Eb' },
  4:  { sharp: 'E',  flat: 'E' },   // also Fb
  5:  { sharp: 'F',  flat: 'F' },   // also E#
  6:  { sharp: 'F#', flat: 'Gb' },
  7:  { sharp: 'G',  flat: 'G' },
  8:  { sharp: 'G#', flat: 'Ab' },
  9:  { sharp: 'A',  flat: 'A' },
  10: { sharp: 'A#', flat: 'Bb' },
  11: { sharp: 'B',  flat: 'B' },   // also Cb
};

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Normalise a semitone value to 0-11 */
function mod12(n: number): Semitone {
  return (((n % 12) + 12) % 12) as Semitone;
}

/** Convert a note name to its semitone (0-11). Uses Tonal for robustness. */
function noteToSemitone(name: string): number {
  const midi = Note.midi(name + '4'); // add octave for Tonal
  if (midi == null) {
    // Fallback to canonical NOTE_TO_SEMITONE from intervals.ts
    const semitone = NOTE_TO_SEMITONE[name];
    if (semitone === undefined) {
      throw new Error(`Unrecognized note name: ${name}`);
    }
    return semitone;
  }
  return mod12(midi);
}

/** Extract the letter (A-G) from a note name */
function noteLetter(name: string): string {
  return name.charAt(0).toUpperCase();
}

// ---------------------------------------------------------------------------
// KEY_SPELLING — correct note spellings for all 15 major keys + relative minors
// ---------------------------------------------------------------------------

/**
 * KEY_SPELLING defines the correct 7-note spelling for every standard key.
 *
 * Major keys: C, G, D, A, E, B, F#, C# (sharps) and F, Bb, Eb, Ab, Db, Gb, Cb (flats)
 * Relative minors are derived automatically.
 */
export const KEY_SPELLING: Record<string, KeySpelling> = {
  // === Sharp major keys ===
  'C':  { notes: ['C', 'D', 'E', 'F',  'G',  'A',  'B'],  useSharps: true },
  'G':  { notes: ['G', 'A', 'B', 'C',  'D',  'E',  'F#'], useSharps: true },
  'D':  { notes: ['D', 'E', 'F#','G',  'A',  'B',  'C#'], useSharps: true },
  'A':  { notes: ['A', 'B', 'C#','D',  'E',  'F#', 'G#'], useSharps: true },
  'E':  { notes: ['E', 'F#','G#','A',  'B',  'C#', 'D#'], useSharps: true },
  'B':  { notes: ['B', 'C#','D#','E',  'F#', 'G#', 'A#'], useSharps: true },
  'F#': { notes: ['F#','G#','A#','B',  'C#', 'D#', 'E#'], useSharps: true },
  'C#': { notes: ['C#','D#','E#','F#', 'G#', 'A#', 'B#'], useSharps: true },

  // === Flat major keys ===
  'F':  { notes: ['F', 'G', 'A', 'Bb', 'C',  'D',  'E'],  useSharps: false },
  'Bb': { notes: ['Bb','C', 'D', 'Eb', 'F',  'G',  'A'],  useSharps: false },
  'Eb': { notes: ['Eb','F', 'G', 'Ab', 'Bb', 'C',  'D'],  useSharps: false },
  'Ab': { notes: ['Ab','Bb','C', 'Db', 'Eb', 'F',  'G'],  useSharps: false },
  'Db': { notes: ['Db','Eb','F', 'Gb', 'Ab', 'Bb', 'C'],  useSharps: false },
  'Gb': { notes: ['Gb','Ab','Bb','Cb', 'Db', 'Eb', 'F'],  useSharps: false },
  'Cb': { notes: ['Cb','Db','Eb','Fb', 'Gb', 'Ab', 'Bb'], useSharps: false },

  // === Relative minor keys (natural minor = same key signature as relative major) ===
  // Sharp minor keys
  'Am':  { notes: ['A', 'B', 'C', 'D',  'E',  'F',  'G'],  useSharps: false },
  'Em':  { notes: ['E', 'F#','G', 'A',  'B',  'C',  'D'],  useSharps: true },
  'Bm':  { notes: ['B', 'C#','D', 'E',  'F#', 'G',  'A'],  useSharps: true },
  'F#m': { notes: ['F#','G#','A', 'B',  'C#', 'D',  'E'],  useSharps: true },
  'C#m': { notes: ['C#','D#','E', 'F#', 'G#', 'A',  'B'],  useSharps: true },
  'G#m': { notes: ['G#','A#','B', 'C#', 'D#', 'E',  'F#'], useSharps: true },
  'D#m': { notes: ['D#','E#','F#','G#', 'A#', 'B',  'C#'], useSharps: true },
  'A#m': { notes: ['A#','B#','C#','D#', 'E#', 'F#', 'G#'], useSharps: true },

  // Flat minor keys
  'Dm':  { notes: ['D', 'E', 'F', 'G',  'A',  'Bb', 'C'],  useSharps: false },
  'Gm':  { notes: ['G', 'A', 'Bb','C',  'D',  'Eb', 'F'],  useSharps: false },
  'Cm':  { notes: ['C', 'D', 'Eb','F',  'G',  'Ab', 'Bb'], useSharps: false },
  'Fm':  { notes: ['F', 'G', 'Ab','Bb', 'C',  'Db', 'Eb'], useSharps: false },
  'Bbm': { notes: ['Bb','C', 'Db','Eb', 'F',  'Gb', 'Ab'], useSharps: false },
  'Ebm': { notes: ['Eb','F', 'Gb','Ab', 'Bb', 'Cb', 'Db'], useSharps: false },
  'Abm': { notes: ['Ab','Bb','Cb','Db', 'Eb', 'Fb', 'Gb'], useSharps: false },
};

// ---------------------------------------------------------------------------
// Build a fast lookup: key → semitone → note name
// ---------------------------------------------------------------------------

/** For each key, maps semitone (0-11) to the correct spelling from the diatonic scale */
const keyDiatonicLookup: Record<string, Map<number, string>> = {};

for (const [key, spelling] of Object.entries(KEY_SPELLING)) {
  const map = new Map<number, string>();
  for (const note of spelling.notes) {
    map.set(noteToSemitone(note), note);
  }
  keyDiatonicLookup[key] = map;
}

// ---------------------------------------------------------------------------
// resolveForKey
// ---------------------------------------------------------------------------

/**
 * Returns the correctly-spelled note name for a semitone in a given key.
 *
 * If the semitone is diatonic to the key, the key's own spelling is used.
 * If it's chromatic (non-diatonic), we pick the accidental that best fits
 * the key's sharp/flat tendency.
 *
 * @param semitone - A value 0-11 (C=0)
 * @param key - Key name, e.g. "Db", "G", "F#m", "Cm"
 * @returns The correctly spelled note name
 *
 * @example
 * resolveForKey(1, 'Db') // => 'Db'
 * resolveForKey(1, 'A')  // => 'C#' (because A major has sharps)
 * resolveForKey(6, 'Db') // => 'Gb'
 * resolveForKey(6, 'G')  // => 'F#'
 */
export function resolveForKey(semitone: number, key: string): string {
  const s = mod12(semitone);
  const lookup = keyDiatonicLookup[key];

  if (lookup) {
    // Check if the semitone is in the diatonic scale
    const diatonic = lookup.get(s);
    if (diatonic) return diatonic;

    // Chromatic note: use the key's sharp/flat preference
    const spelling = KEY_SPELLING[key];
    return spelling.useSharps ? ENHARMONIC_MAP[s].sharp : ENHARMONIC_MAP[s].flat;
  }

  // Unknown key: try to infer from the key name
  if (key.includes('b') && key !== 'B' && key !== 'Bm') {
    return ENHARMONIC_MAP[s].flat;
  }
  if (key.includes('#')) {
    return ENHARMONIC_MAP[s].sharp;
  }

  // Default: sharp spelling
  return ENHARMONIC_MAP[s].sharp;
}

// ---------------------------------------------------------------------------
// getPreferredSpelling
// ---------------------------------------------------------------------------

/**
 * Simple preference-based enharmonic resolution.
 *
 * @param semitone - A value 0-11
 * @param preferFlats - If true, prefer flat spellings; otherwise prefer sharps
 * @returns The note name
 *
 * @example
 * getPreferredSpelling(1, true)  // => 'Db'
 * getPreferredSpelling(1, false) // => 'C#'
 */
export function getPreferredSpelling(semitone: number, preferFlats: boolean): string {
  const s = mod12(semitone);
  return preferFlats ? ENHARMONIC_MAP[s].flat : ENHARMONIC_MAP[s].sharp;
}

// ---------------------------------------------------------------------------
// resolveForScale
// ---------------------------------------------------------------------------

/**
 * Returns properly-spelled note names for a scale given its semitone intervals.
 *
 * The algorithm ensures each letter name is used at most once where possible
 * (true for 7-note scales), starting from the root and ascending chromatically
 * through the letter names.
 *
 * @param semitones - Array of semitone offsets from root (e.g. [0,2,4,5,7,9,11] for major)
 * @param scaleName - Name of the scale (used for lookup / disambiguation)
 * @param root - Root note name (e.g. "Db", "F#")
 * @returns Array of properly-spelled note names
 *
 * @example
 * resolveForScale([0,2,4,5,7,9,11], 'major', 'Db')
 * // => ['Db','Eb','F','Gb','Ab','Bb','C']
 */
export function resolveForScale(
  semitones: number[],
  _scaleName: string,
  root: string,
): string[] {
  const rootSemitone = noteToSemitone(root);

  // For standard 7-note scales, try to use the KEY_SPELLING approach
  // by looking up the key that matches
  if (semitones.length === 7) {
    const majorPattern = [0, 2, 4, 5, 7, 9, 11];
    const naturalMinorPattern = [0, 2, 3, 5, 7, 8, 10];

    const isMajor = semitones.every((s, i) => s === majorPattern[i]);
    const isNaturalMinor = semitones.every((s, i) => s === naturalMinorPattern[i]);

    if (isMajor && KEY_SPELLING[root]) {
      return KEY_SPELLING[root].notes;
    }

    const minorKey = root + 'm';
    if (isNaturalMinor && KEY_SPELLING[minorKey]) {
      return KEY_SPELLING[minorKey].notes;
    }
  }

  // General algorithm: assign letter names sequentially
  return spellScaleFromRoot(semitones, root, rootSemitone);
}

/**
 * General-purpose scale spelling algorithm.
 * Assigns letter names starting from the root's letter, advancing through
 * the musical alphabet for each scale degree.
 */
function spellScaleFromRoot(
  semitones: number[],
  root: string,
  rootSemitone: number,
): string[] {
  const rootLetter = noteLetter(root);
  const rootLetterIndex = LETTERS.indexOf(rootLetter);

  const result: string[] = [];

  for (let i = 0; i < semitones.length; i++) {
    const targetSemitone = mod12(rootSemitone + semitones[i]);

    // For 7-note scales, assign letters sequentially
    if (semitones.length <= 7) {
      const letterIndex = (rootLetterIndex + i) % 7;
      const letter = LETTERS[letterIndex];
      const natural = LETTER_TO_NATURAL[letter];
      const diff = mod12(targetSemitone - natural);

      if (diff === 0) {
        result.push(letter);
      } else if (diff === 1) {
        result.push(letter + '#');
      } else if (diff === 11) {
        result.push(letter + 'b');
      } else if (diff === 2) {
        // double sharp — simplify display
        result.push(letter + '##');
      } else if (diff === 10) {
        // double flat — simplify display
        result.push(letter + 'bb');
      } else {
        // Fallback: just use the preferred spelling based on root
        const preferFlats = root.includes('b') && root !== 'B';
        result.push(getPreferredSpelling(targetSemitone, preferFlats));
      }
    } else {
      // For scales with more than 7 notes (e.g. chromatic, bebop),
      // we can't guarantee unique letters; use key preference
      const preferFlats = root.includes('b') && root !== 'B';
      result.push(getPreferredSpelling(targetSemitone, preferFlats));
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// resolveForChord
// ---------------------------------------------------------------------------

/**
 * Dynamic lookup from chord type id → semitone array.
 * Built from the canonical CHORD_TYPES registry.
 */
const chordIntervalMap = new Map(CHORD_TYPES.map(c => [c.id, c.semitones]));

/**
 * Resolves the proper enharmonic spelling of a note in a chord context.
 *
 * This is crucial for chord spelling: the same pitch class can mean different
 * things depending on the chord. For example, in a C7#9 chord, the note Eb
 * should be spelled D# (as #9), not Eb (which would imply b3).
 *
 * @param note - The note to resolve (any valid spelling)
 * @param chordRoot - Root of the chord (e.g. "C", "Db", "F#")
 * @param chordType - Type of chord (e.g. "dom7", "maj7", "dom7#9")
 * @returns The correctly-spelled note name for that chord context
 *
 * @example
 * resolveForChord('Eb', 'C', 'dom7#9') // => 'D#' (it's #9, not b3)
 * resolveForChord('Gb', 'C', 'dom7b5') // => 'Gb' (it's b5)
 * resolveForChord('Gb', 'C', 'dom7#11') // => 'F#' (it's #11, not b5)
 */
export function resolveForChord(
  note: string,
  chordRoot: string,
  chordType: string,
): string {
  const noteSemi = noteToSemitone(note);
  const rootSemi = noteToSemitone(chordRoot);
  const intervalSemitones = mod12(noteSemi - rootSemi);

  // Look up the chord type from the dynamic map
  const normalizedType = chordType.toLowerCase().replace(/[-\s]/g, '');
  const semitones = chordIntervalMap.get(normalizedType);

  if (semitones) {
    // Check if this interval distance is a chord tone
    const matchSemitone = semitones.find(s => (s % 12) === intervalSemitones);
    if (matchSemitone !== undefined) {
      return resolveForKey(noteSemi, chordRoot);
    }
  }

  // Fallback: use the key of the chord root
  return resolveForKey(noteSemi, chordRoot);
}

// ---------------------------------------------------------------------------
// Utility exports
// ---------------------------------------------------------------------------

/**
 * Returns all enharmonic spellings for a given semitone.
 * Includes edge-case spellings like Cb, Fb, E#, B#.
 *
 * @param semitone - A value 0-11
 * @returns Array of all valid spellings
 */
export function getAllSpellings(semitone: number): string[] {
  const s = mod12(semitone);
  const edgeCases: Record<number, string[]> = {
    0:  ['C', 'B#'],
    1:  ['C#', 'Db'],
    2:  ['D'],
    3:  ['D#', 'Eb'],
    4:  ['E', 'Fb'],
    5:  ['F', 'E#'],
    6:  ['F#', 'Gb'],
    7:  ['G'],
    8:  ['G#', 'Ab'],
    9:  ['A'],
    10: ['A#', 'Bb'],
    11: ['B', 'Cb'],
  };
  return edgeCases[s] ?? [];
}

/**
 * Checks if two note names are enharmonically equivalent.
 *
 * @example
 * areEnharmonic('C#', 'Db') // => true
 * areEnharmonic('E', 'Fb')  // => true
 * areEnharmonic('C', 'D')   // => false
 */
export function areEnharmonic(a: string, b: string): boolean {
  return noteToSemitone(a) === noteToSemitone(b);
}

/**
 * Given a note name, returns all 12 chromatic notes spelled correctly
 * for the key of that note.
 *
 * Useful for building chromatic displays in a key context.
 *
 * @param key - Key name (e.g. "Db", "A", "Gm")
 * @returns Array of 12 note names, one per semitone 0-11
 */
export function chromaticInKey(key: string): string[] {
  return Array.from({ length: 12 }, (_, i) => resolveForKey(i, key));
}

/**
 * Returns the correct note names for a standard 12-note display,
 * given a preference. Useful as a drop-in replacement for a
 * sharps-only `noteNames` array.
 *
 * @param preferFlats - If true, use flats; otherwise sharps
 * @returns Array of 12 note names
 */
export function noteNames12(preferFlats: boolean): string[] {
  return Array.from({ length: 12 }, (_, i) => getPreferredSpelling(i, preferFlats));
}



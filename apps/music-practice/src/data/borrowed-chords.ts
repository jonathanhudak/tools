/**
 * Borrowed chords — modal interchange for a major (Ionian) home key.
 *
 * A borrowed chord is diatonic to a parallel mode of the same tonic but not to
 * the home key, e.g. Fm in C major comes from C Aeolian. Numerals are
 * major-relative and resolve through the existing `resolveRomanInKey`, so v1
 * supports a major home key only (see issue jonathanhudak/tools#102).
 */

import { Chord, Note } from 'tonal';
import { resolveRomanInKey, voiceChord } from '../lib/theory/roman';
import type { HarmonicFunction } from './progressions/progression-registry';

/** One of the seven parallel modes over a given tonic. */
export type ParallelMode =
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian';

/** Home mode of the key we are borrowing into. v1 supports major only. */
export type HomeMode = 'ionian';

/** View selector shared by the chord-scale and circle-of-fifths pages. */
export type BorrowedView = 'diatonic' | 'borrowed';

/** Allowed values for the `view` search param. */
export const BORROWED_VIEWS: readonly BorrowedView[] = ['diatonic', 'borrowed'];

export interface BorrowedChord {
  /** Stable kebab id, e.g. 'major-aeolian-bVI'. */
  id: string;
  homeMode: HomeMode;
  /** Parallel mode the chord is borrowed from. */
  sourceMode: ParallelMode;
  /** Roman numeral as written for the home key, e.g. 'iv', 'bVI', '#iv°'. */
  romanNumeral: string;
  /** Harmonic function in the home key. */
  function: HarmonicFunction;
  /**
   * scale-registry id to improvise with, built on the chord root: the source
   * mode re-centred there (e.g. bVI in C → Ab Lydian = C Aeolian).
   */
  scaleId: string;
  /** One sentence: how the borrowed chord behaves. */
  behaviour: string;
}

/** A borrowed chord resolved to concrete notes in a specific tonic. */
export interface ResolvedBorrowedChord extends BorrowedChord {
  /** Concrete chord symbol, e.g. 'Fm'. */
  symbol: string;
  /** Chord root, e.g. 'F'. */
  root: string;
  /** Pitch classes, e.g. ['F', 'Ab', 'C']. */
  notes: string[];
  /** MIDI notes voiced around middle C. */
  midis: number[];
}

/** Display names for the source modes; Aeolian is the parallel minor. */
export const SOURCE_MODE_NAMES: Record<ParallelMode, string> = {
  ionian: 'Ionian (major)',
  dorian: 'Dorian',
  phrygian: 'Phrygian',
  lydian: 'Lydian',
  mixolydian: 'Mixolydian',
  aeolian: 'Aeolian (parallel minor)',
  locrian: 'Locrian',
};

/** Order the panel groups source modes in: the parallel minor first. */
export const SOURCE_MODE_ORDER: readonly ParallelMode[] = [
  'aeolian',
  'dorian',
  'mixolydian',
  'phrygian',
  'lydian',
  'ionian',
  'locrian',
];

/**
 * The canonical borrowings into a major key. Numerals are major-relative;
 * sourceMode is the parallel mode the chord is idiomatic to.
 */
export const BORROWED_CHORDS: readonly BorrowedChord[] = [
  {
    id: 'major-aeolian-i',
    homeMode: 'ionian',
    sourceMode: 'aeolian',
    romanNumeral: 'i',
    function: 'tonic',
    scaleId: 'aeolian',
    behaviour: 'Darkens the tonic by turning the major I into a minor i.',
  },
  {
    id: 'major-aeolian-iiø7',
    homeMode: 'ionian',
    sourceMode: 'aeolian',
    romanNumeral: 'iiø7',
    function: 'predominant',
    scaleId: 'locrian',
    behaviour: 'Half-diminished supertonic that leads to V or back to i.',
  },
  {
    id: 'major-aeolian-bIII',
    homeMode: 'ionian',
    sourceMode: 'aeolian',
    romanNumeral: 'bIII',
    function: 'mediant',
    scaleId: 'ionian',
    behaviour: 'Chromatic mediant lift, often moving to IV or the tonic.',
  },
  {
    id: 'major-aeolian-iv',
    homeMode: 'ionian',
    sourceMode: 'aeolian',
    romanNumeral: 'iv',
    function: 'subdominant',
    scaleId: 'dorian',
    behaviour: 'The minor subdominant — softens IV on the way to V or I.',
  },
  {
    id: 'major-aeolian-v',
    homeMode: 'ionian',
    sourceMode: 'aeolian',
    romanNumeral: 'v',
    function: 'dominant',
    scaleId: 'phrygian',
    behaviour: 'Minor dominant with no leading tone, so it pulls back to I only weakly.',
  },
  {
    id: 'major-aeolian-bVI',
    homeMode: 'ionian',
    sourceMode: 'aeolian',
    romanNumeral: 'bVI',
    function: 'subdominant',
    scaleId: 'lydian',
    behaviour: 'Dark submediant colour, classic in bVI–bVII–I and bVI–iv–V.',
  },
  {
    id: 'major-aeolian-bVII',
    homeMode: 'ionian',
    sourceMode: 'aeolian',
    romanNumeral: 'bVII',
    function: 'subtonic',
    scaleId: 'mixolydian',
    behaviour: 'Subtonic backdoor dominant: bVII–I rock cadence or iv7–bVII7–I.',
  },
  {
    id: 'major-phrygian-bII',
    homeMode: 'ionian',
    sourceMode: 'phrygian',
    romanNumeral: 'bII',
    function: 'predominant',
    scaleId: 'lydian',
    behaviour: 'Neapolitan predominant that classically moves to V, or slides straight to I.',
  },
  {
    id: 'major-lydian-II',
    homeMode: 'ionian',
    sourceMode: 'lydian',
    romanNumeral: 'II',
    function: 'dominant',
    scaleId: 'mixolydian',
    behaviour: 'Major supertonic borrowed from Lydian; acts as V/V.',
  },
  {
    id: 'major-lydian-#iv°',
    homeMode: 'ionian',
    sourceMode: 'lydian',
    romanNumeral: '#iv°',
    function: 'dominant',
    scaleId: 'locrian',
    behaviour: 'Raised-fourth diminished chord that tonicises V.',
  },
];

/**
 * Respell a double-flat/double-sharp root (Bbb, F##) as its natural/single
 * accidental enharmonic. The chord library already resolves such symbols to
 * the enharmonic voicing, so this keeps the card title and the drawing in step.
 */
function respellDoubleAccidental(symbol: string, root: string): { symbol: string; root: string } {
  if (!/bb|##/.test(root)) return { symbol, root };
  const simple = Note.enharmonic(root);
  return { symbol: `${simple}${symbol.slice(root.length)}`, root: simple };
}

/** All borrowed chords resolved in `tonic`, in table order. */
export function getBorrowedChords(tonic: string): ResolvedBorrowedChord[] {
  const resolved: ResolvedBorrowedChord[] = [];
  for (const chord of BORROWED_CHORDS) {
    const match = resolveRomanInKey(tonic, chord.romanNumeral);
    if (!match) continue;
    const { symbol, root } = respellDoubleAccidental(match.symbol, match.root);
    const notes = symbol === match.symbol ? match.notes : Chord.get(symbol).notes;
    resolved.push({
      ...chord,
      symbol,
      root,
      notes,
      midis: symbol === match.symbol ? match.midis : voiceChord(notes),
    });
  }
  return resolved;
}

/** Look up a borrowed chord by its written numeral. */
export function getBorrowedChord(romanNumeral: string): BorrowedChord | undefined {
  return BORROWED_CHORDS.find((chord) => chord.romanNumeral === romanNumeral);
}

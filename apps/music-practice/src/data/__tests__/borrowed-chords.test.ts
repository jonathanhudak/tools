/**
 * Borrowed chords (modal interchange) in a major home key.
 *
 * The numerals are major-relative and resolve through the existing
 * `resolveRomanInKey`; this spec pins the concrete chords they produce.
 */
import { describe, it, expect } from 'vitest';
import {
  BORROWED_CHORDS,
  getBorrowedChord,
  getBorrowedChords,
} from '../borrowed-chords';
import { getScale } from '../scales/scale-registry';

/** Numeral → concrete chord symbol in C major. */
const C_MAJOR: ReadonlyArray<readonly [string, string]> = [
  ['i', 'Cm'],
  ['iiø7', 'Dm7b5'],
  ['bIII', 'Eb'],
  ['iv', 'Fm'],
  ['v', 'Gm'],
  ['bVI', 'Ab'],
  ['bVII', 'Bb'],
  ['bII', 'Db'],
  ['II', 'D'],
  ['#iv°', 'F#dim'],
];

/** Numerals already available from the diatonic Ionian scale. */
const DIATONIC_IONIAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

describe('BORROWED_CHORDS', () => {
  it('covers exactly the ten canonical borrowings', () => {
    expect(new Set(BORROWED_CHORDS.map(c => c.romanNumeral))).toEqual(
      new Set(C_MAJOR.map(([numeral]) => numeral)),
    );
  });

  it('resolves every numeral to its C major chord', () => {
    const byNumeral = new Map(getBorrowedChords('C').map(c => [c.romanNumeral, c.symbol]));
    for (const [numeral, symbol] of C_MAJOR) {
      expect(byNumeral.get(numeral)).toBe(symbol);
    }
  });

  it('never collides with the diatonic Ionian numerals', () => {
    for (const chord of BORROWED_CHORDS) {
      expect(DIATONIC_IONIAN).not.toContain(chord.romanNumeral);
    }
  });

  it('points every chord at a real scale-registry id', () => {
    for (const chord of BORROWED_CHORDS) {
      expect(getScale(chord.scaleId), chord.id).toBeDefined();
    }
  });

  it('gives every chord a source mode, a function and a behaviour sentence', () => {
    for (const chord of BORROWED_CHORDS) {
      expect(chord.homeMode).toBe('ionian');
      expect(chord.sourceMode).toBeTruthy();
      expect(chord.function).toBeTruthy();
      expect(chord.behaviour.trim()).not.toBe('');
    }
  });
});

describe('getBorrowedChords', () => {
  it('transposes the whole set into another key', () => {
    const g = new Map(getBorrowedChords('G').map(c => [c.romanNumeral, c.symbol]));
    expect(g.get('i')).toBe('Gm');
    expect(g.get('iv')).toBe('Cm');
    expect(g.get('bVII')).toBe('F');
  });
});

describe('getBorrowedChord', () => {
  it('looks one up by its written numeral', () => {
    expect(getBorrowedChord('iv')?.romanNumeral).toBe('iv');
    expect(getBorrowedChord('iv')?.sourceMode).toBe('aeolian');
  });

  it('returns undefined for an unknown numeral', () => {
    expect(getBorrowedChord('nope')).toBeUndefined();
  });
});

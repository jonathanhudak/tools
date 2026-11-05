/**
 * Borrowed chords (modal interchange) in a major home key.
 *
 * The numerals are major-relative and resolve through the existing
 * `resolveRomanInKey`; this spec pins the concrete chords they produce.
 */
import { describe, it, expect } from 'vitest';
import { Note, Scale } from 'tonal';
import {
  BORROWED_CHORDS,
  getBorrowedChord,
  getBorrowedChords,
} from '../borrowed-chords';
import { getScale } from '../scales/scale-registry';
import { CIRCLE_OF_FIFTHS } from '../circle-of-fifths';
import { CHROMATIC_KEYS } from '../../components/ChordScaleMatrix';

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

/** Every key either page can select. */
const ALL_KEYS = [...new Set<string>([...CHROMATIC_KEYS, ...CIRCLE_OF_FIFTHS.map(e => e.majorKey)])];

describe('scale suggestions', () => {
  it.each(ALL_KEYS)('in %s, each scale on the chord root holds the chord and stays in its source mode', (key) => {
    for (const chord of getBorrowedChords(key)) {
      const rootChroma = Note.chroma(chord.root) ?? -1;
      const scale = getScale(chord.scaleId);
      const scaleChromas = (scale?.semitones ?? []).map(s => (rootChroma + s) % 12);
      const modeChromas = Scale.get(`${key} ${chord.sourceMode}`).notes.map(n => Note.chroma(n));

      for (const note of chord.notes) {
        expect(scaleChromas, `${key} ${chord.romanNumeral} ${chord.scaleId} vs ${note}`).toContain(Note.chroma(note));
      }
      for (const chroma of scaleChromas) {
        expect(modeChromas, `${key} ${chord.romanNumeral} ${chord.scaleId} outside ${chord.sourceMode}`).toContain(chroma);
      }
    }
  });

  it('pins the C major suggestions', () => {
    const byNumeral = new Map(BORROWED_CHORDS.map(c => [c.romanNumeral, c.scaleId]));
    expect(Object.fromEntries(byNumeral)).toEqual({
      i: 'aeolian',
      iiø7: 'locrian',
      bIII: 'ionian',
      iv: 'dorian',
      v: 'phrygian',
      bVI: 'lydian',
      bVII: 'mixolydian',
      bII: 'lydian',
      II: 'mixolydian',
      '#iv°': 'locrian',
    });
  });
});

describe('getBorrowedChords', () => {
  it('respells double-accidental roots so the card matches its voicing', () => {
    const db = new Map(getBorrowedChords('Db').map(c => [c.romanNumeral, c]));
    expect(db.get('bVI')?.symbol).toBe('A');
    expect(db.get('bVI')?.notes).toEqual(['A', 'C#', 'E']);
    expect(db.get('bII')?.symbol).toBe('D');
    expect(db.get('bVII')?.symbol).toBe('Cb'); // single flats stay as spelled

    const gb = new Map(getBorrowedChords('Gb').map(c => [c.romanNumeral, c.symbol]));
    expect([gb.get('bIII'), gb.get('bVI'), gb.get('bII')]).toEqual(['A', 'D', 'G']);
    expect(getBorrowedChords('C#').find(c => c.romanNumeral === '#iv°')?.symbol).toBe('Gdim');

    for (const key of ALL_KEYS) {
      for (const chord of getBorrowedChords(key)) {
        expect(chord.root, `${key} ${chord.romanNumeral}`).not.toMatch(/bb|##/);
      }
    }
  });

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

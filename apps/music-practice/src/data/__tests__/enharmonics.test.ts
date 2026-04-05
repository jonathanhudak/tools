import { describe, it, expect } from 'vitest';
import {
  resolveForKey,
  KEY_SPELLING,
  getPreferredSpelling,
  areEnharmonic,
} from '../enharmonics';

describe('Enharmonics', () => {
  // ── 1. Flat key spellings ─────────────────────────────────────────────
  describe('resolveForKey: flat keys', () => {
    it('Db major: semitone 1 → Db (not C#)', () => {
      expect(resolveForKey(1, 'Db')).toBe('Db');
    });

    it('Bb major: semitone 10 → Bb (not A#)', () => {
      expect(resolveForKey(10, 'Bb')).toBe('Bb');
    });

    it('Eb major: semitone 3 → Eb (not D#)', () => {
      expect(resolveForKey(3, 'Eb')).toBe('Eb');
    });

    it('Ab major: semitone 8 → Ab (not G#)', () => {
      expect(resolveForKey(8, 'Ab')).toBe('Ab');
    });

    it('Gb major: semitone 6 → Gb (not F#)', () => {
      expect(resolveForKey(6, 'Gb')).toBe('Gb');
    });
  });

  // ── 2. Sharp key spellings ────────────────────────────────────────────
  describe('resolveForKey: sharp keys', () => {
    it('G major: semitone 6 → F# (not Gb)', () => {
      expect(resolveForKey(6, 'G')).toBe('F#');
    });

    it('D major: semitone 1 → C# (not Db)', () => {
      expect(resolveForKey(1, 'D')).toBe('C#');
    });

    it('A major: semitone 8 → G# (not Ab)', () => {
      expect(resolveForKey(8, 'A')).toBe('G#');
    });
  });

  // ── 3. KEY_SPELLING has entries for all 15 major keys ─────────────────
  describe('KEY_SPELLING completeness', () => {
    const majorKeys = [
      'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#',
      'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb',
    ];

    it('has entries for all 15 major keys', () => {
      for (const key of majorKeys) {
        expect(KEY_SPELLING[key]).toBeDefined();
      }
    });
  });

  // ── 4. Each key spelling uses exactly 7 unique letter names ───────────
  describe('key spellings use 7 unique letter names', () => {
    const majorKeys = [
      'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#',
      'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb',
    ];

    for (const key of majorKeys) {
      it(`${key} major uses 7 unique letter names (A-G)`, () => {
        const spelling = KEY_SPELLING[key];
        expect(spelling).toBeDefined();
        expect(spelling.notes).toHaveLength(7);

        const letters = spelling.notes.map((n) => n.charAt(0));
        const uniqueLetters = new Set(letters);
        expect(uniqueLetters.size).toBe(7);

        // All letters should be from A-G
        for (const letter of uniqueLetters) {
          expect('ABCDEFG').toContain(letter);
        }
      });
    }
  });

  // ── 5. getPreferredSpelling ───────────────────────────────────────────
  describe('getPreferredSpelling', () => {
    it('preferFlats=true: semitone 1 → Db', () => {
      expect(getPreferredSpelling(1, true)).toBe('Db');
    });

    it('preferFlats=false: semitone 1 → C#', () => {
      expect(getPreferredSpelling(1, false)).toBe('C#');
    });

    it('preferFlats=true: semitone 6 → Gb', () => {
      expect(getPreferredSpelling(6, true)).toBe('Gb');
    });

    it('preferFlats=false: semitone 6 → F#', () => {
      expect(getPreferredSpelling(6, false)).toBe('F#');
    });

    it('natural notes are the same regardless of preference', () => {
      expect(getPreferredSpelling(0, true)).toBe('C');
      expect(getPreferredSpelling(0, false)).toBe('C');
      expect(getPreferredSpelling(7, true)).toBe('G');
      expect(getPreferredSpelling(7, false)).toBe('G');
    });
  });

  // ── 6. areEnharmonic ──────────────────────────────────────────────────
  describe('areEnharmonic', () => {
    const enharmonicPairs: [string, string][] = [
      ['C#', 'Db'],
      ['F#', 'Gb'],
      ['G#', 'Ab'],
      ['A#', 'Bb'],
      ['D#', 'Eb'],
      ['E', 'Fb'],
      ['B', 'Cb'],
      ['C', 'B#'],
      ['F', 'E#'],
    ];

    for (const [a, b] of enharmonicPairs) {
      it(`${a} and ${b} are enharmonic`, () => {
        expect(areEnharmonic(a, b)).toBe(true);
      });
    }

    it('C and D are NOT enharmonic', () => {
      expect(areEnharmonic('C', 'D')).toBe(false);
    });

    it('E and F are NOT enharmonic', () => {
      expect(areEnharmonic('E', 'F')).toBe(false);
    });
  });
});

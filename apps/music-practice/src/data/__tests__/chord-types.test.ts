import { describe, it, expect } from 'vitest';
import {
  CHORD_TYPES,
  getChordType,
  getChordsByFamily,
  getChordsByCategory,
  searchChords,
  type ChordFamily,
  type ChordCategory,
} from '../chords/chord-types';

describe('Chord Types', () => {
  // ── 1. Registry size and unique IDs ─────────────────────────────────────
  it('has at least 57 chord types', () => {
    expect(CHORD_TYPES.length).toBeGreaterThanOrEqual(57);
  });

  it('all chord IDs are unique', () => {
    const ids = CHORD_TYPES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // ── 2. All families and categories represented ──────────────────────────
  describe('families and categories', () => {
    const expectedFamilies: ChordFamily[] = [
      'major', 'minor', 'dominant', 'diminished', 'augmented', 'suspended', 'altered', 'quartal', 'power',
    ];
    const expectedCategories: ChordCategory[] = [
      'triad', 'seventh', 'sixth', 'ninth', 'eleventh', 'thirteenth', 'altered', 'add', 'sus', 'power', 'quartal',
    ];

    it('all families are represented', () => {
      const families = new Set(CHORD_TYPES.map((c) => c.family));
      for (const f of expectedFamilies) {
        expect(families.has(f)).toBe(true);
      }
    });

    it('all categories are represented', () => {
      const categories = new Set(CHORD_TYPES.map((c) => c.category));
      for (const c of expectedCategories) {
        expect(categories.has(c)).toBe(true);
      }
    });
  });

  // ── 3. Valid semitones ──────────────────────────────────────────────────
  describe('semitone validation', () => {
    for (const chord of CHORD_TYPES) {
      it(`${chord.name} (${chord.id}): semitones start with 0 and are ascending`, () => {
        expect(chord.semitones[0]).toBe(0);
        for (let i = 1; i < chord.semitones.length; i++) {
          expect(chord.semitones[i]).toBeGreaterThan(chord.semitones[i - 1]);
        }
      });
    }
  });

  // ── 4. Musical accuracy spot-checks ─────────────────────────────────────
  describe('musical accuracy spot-checks', () => {
    const spotChecks: [string, number[]][] = [
      ['major', [0, 4, 7]],
      ['minor', [0, 3, 7]],
      ['dim', [0, 3, 6]],
      ['aug', [0, 4, 8]],
      ['maj7', [0, 4, 7, 11]],
      ['7', [0, 4, 7, 10]],
      ['m7', [0, 3, 7, 10]],
      ['m7b5', [0, 3, 6, 10]],
      ['dim7', [0, 3, 6, 9]],
      ['mMaj7', [0, 3, 7, 11]],
    ];

    for (const [id, expected] of spotChecks) {
      it(`${id} = ${JSON.stringify(expected)}`, () => {
        const chord = getChordType(id);
        expect(chord).toBeDefined();
        expect(chord!.semitones).toEqual(expected);
      });
    }

    it('7alt contains all altered tones: b9(13), #9(15), #11(18), b13(20)', () => {
      const alt = getChordType('7alt');
      expect(alt).toBeDefined();
      expect(alt!.semitones).toEqual([0, 4, 10, 13, 15, 18, 20]);
      // Verify all altered tensions are present
      expect(alt!.semitones).toContain(13); // b9
      expect(alt!.semitones).toContain(15); // #9
      expect(alt!.semitones).toContain(18); // #11
      expect(alt!.semitones).toContain(20); // b13
    });

    it('13 (dominant thirteenth) omits the 11th', () => {
      const dom13 = getChordType('13');
      expect(dom13).toBeDefined();
      expect(dom13!.semitones).toEqual([0, 4, 7, 10, 14, 21]);
      // 11th (17 semitones) should NOT be present
      expect(dom13!.semitones).not.toContain(17);
      // 13th (21 semitones) should be present
      expect(dom13!.semitones).toContain(21);
    });
  });

  // ── 5. Lookup by ID ────────────────────────────────────────────────────
  describe('lookup by ID', () => {
    it('finds maj7 by ID', () => {
      expect(getChordType('maj7')).toBeDefined();
      expect(getChordType('maj7')!.name).toBe('Major Seventh');
    });

    it('returns undefined for non-existent ID', () => {
      expect(getChordType('nonexistent')).toBeUndefined();
    });
  });

  // ── 6. Search works ───────────────────────────────────────────────────
  describe('search', () => {
    it('searching "dominant" returns results', () => {
      const results = searchChords('dominant');
      expect(results.length).toBeGreaterThan(0);
    });

    it('searching "triad" returns basic triads', () => {
      const results = searchChords('triad');
      expect(results.some((c) => c.id === 'major')).toBe(true);
      expect(results.some((c) => c.id === 'minor')).toBe(true);
    });

    it('empty query returns empty array', () => {
      expect(searchChords('')).toEqual([]);
    });
  });

  // ── 7. All symbols are non-empty strings ──────────────────────────────
  describe('symbols validation', () => {
    for (const chord of CHORD_TYPES) {
      it(`${chord.name}: has at least one symbol and primarySymbol is a string`, () => {
        expect(chord.symbols.length).toBeGreaterThanOrEqual(1);
        expect(typeof chord.primarySymbol).toBe('string');
      });
    }
  });

  // ── 8. optionalOmissions are number[] where present ───────────────────
  describe('optionalOmissions', () => {
    const chordsWithOmissions = CHORD_TYPES.filter((c) => c.optionalOmissions != null);

    it('some chords have optionalOmissions', () => {
      expect(chordsWithOmissions.length).toBeGreaterThan(0);
    });

    for (const chord of chordsWithOmissions) {
      it(`${chord.name}: optionalOmissions is a number array`, () => {
        expect(Array.isArray(chord.optionalOmissions)).toBe(true);
        for (const val of chord.optionalOmissions!) {
          expect(typeof val).toBe('number');
        }
      });
    }
  });

  // ── 8. getChordsByFamily & getChordsByCategory ──────────────────────────
  describe('getChordsByFamily', () => {
    it('returns entries for "major" family', () => {
      const results = getChordsByFamily('major');
      expect(results.length).toBeGreaterThan(0);
      for (const chord of results) {
        expect(chord.family).toBe('major');
      }
    });
  });

  describe('getChordsByCategory', () => {
    it('returns entries for "triad" category', () => {
      const results = getChordsByCategory('triad');
      expect(results.length).toBeGreaterThan(0);
      for (const chord of results) {
        expect(chord.category).toBe('triad');
      }
    });
  });
});

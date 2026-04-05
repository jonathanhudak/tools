import { describe, it, expect } from 'vitest';
import {
  SCALE_REGISTRY,
  getScale,
  getScalesByFamily,
  getScaleByAlias,
  searchScales,
  type ScaleFamily,
} from '../scales/scale-registry';

describe('Scale Registry', () => {
  // ── 1. Registry completeness ────────────────────────────────────────────
  describe('registry completeness', () => {
    it('contains exactly 62 scales', () => {
      expect(SCALE_REGISTRY).toHaveLength(62);
    });

    it('has all 9 families represented', () => {
      const families = new Set(SCALE_REGISTRY.map((s) => s.family));
      expect(families).toEqual(
        new Set([
          'diatonic',
          'melodic-minor',
          'harmonic-minor',
          'harmonic-major',
          'symmetric',
          'pentatonic',
          'blues',
          'bebop',
          'world',
        ]),
      );
    });
  });

  // ── 2. Family counts ──────────────────────────────────────────────────
  describe('family counts', () => {
    const expectedCounts: Record<string, number> = {
      diatonic: 7,
      'melodic-minor': 7,
      'harmonic-minor': 7,
      'harmonic-major': 7,
      symmetric: 6,
      pentatonic: 11,
      blues: 2,
      bebop: 5,
      world: 10,
    };

    for (const [family, count] of Object.entries(expectedCounts)) {
      it(`${family} has ${count} scales`, () => {
        expect(getScalesByFamily(family as ScaleFamily)).toHaveLength(count);
      });
    }
  });

  // ── 3. All IDs unique ─────────────────────────────────────────────────
  it('all scale IDs are unique', () => {
    const ids = SCALE_REGISTRY.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // ── 4. Valid semitones ────────────────────────────────────────────────
  describe('semitone validation', () => {
    for (const scale of SCALE_REGISTRY) {
      it(`${scale.name}: semitones are ascending, within 0-11, starts with 0`, () => {
        expect(scale.semitones[0]).toBe(0);
        for (let i = 1; i < scale.semitones.length; i++) {
          expect(scale.semitones[i]).toBeGreaterThan(scale.semitones[i - 1]);
        }
        for (const s of scale.semitones) {
          expect(s).toBeGreaterThanOrEqual(0);
          expect(s).toBeLessThanOrEqual(11);
        }
      });
    }
  });

  // ── 5. Note counts match semitones array length ───────────────────────
  describe('noteCount matches semitones length', () => {
    for (const scale of SCALE_REGISTRY) {
      it(`${scale.name}: noteCount (${scale.noteCount}) === semitones.length (${scale.semitones.length})`, () => {
        expect(scale.noteCount).toBe(scale.semitones.length);
      });
    }
  });

  // ── 6. Musical accuracy spot-checks ──────────────────────────────────
  describe('musical accuracy spot-checks', () => {
    const spotChecks: [string, number[]][] = [
      ['ionian', [0, 2, 4, 5, 7, 9, 11]],
      ['dorian', [0, 2, 3, 5, 7, 9, 10]],
      ['altered', [0, 1, 3, 4, 6, 8, 10]],
      ['whole-tone', [0, 2, 4, 6, 8, 10]],
      ['diminished-wh', [0, 2, 3, 5, 6, 8, 9, 11]],
      ['diminished-hw', [0, 1, 3, 4, 6, 7, 9, 10]],
      ['minor-pentatonic', [0, 3, 5, 7, 10]],
      ['minor-blues', [0, 3, 5, 6, 7, 10]],
      ['bebop-dominant', [0, 2, 4, 5, 7, 9, 10, 11]],
      ['harmonic-major', [0, 2, 4, 5, 7, 8, 11]],
      ['double-harmonic-major', [0, 1, 4, 5, 7, 8, 11]],
      ['phrygian-dominant', [0, 1, 4, 5, 7, 8, 10]],
    ];

    for (const [id, expected] of spotChecks) {
      it(`${id} has correct semitones`, () => {
        const scale = getScale(id);
        expect(scale).toBeDefined();
        expect(scale!.semitones).toEqual(expected);
      });
    }
  });

  // ── 7. Mode relationships ─────────────────────────────────────────────
  describe('mode relationships', () => {
    it('Dorian semitones equal Ionian rotated from degree 2', () => {
      const ionian = getScale('ionian')!;
      const dorian = getScale('dorian')!;

      // Rotate Ionian from degree 2: take intervals starting from index 1,
      // then normalise relative to the new root
      const ionianIntervals = ionian.semitones;
      const rotatedFromDegree2 = ionianIntervals
        .map((s) => ((s - ionianIntervals[1]) % 12 + 12) % 12)
        .sort((a, b) => a - b);

      // Remove duplicates (the 0 generated from index 1 and the wrap)
      const unique = [...new Set(rotatedFromDegree2)];
      expect(unique).toEqual(dorian.semitones);
    });

    it('all 7 diatonic modes share the same pitch-class set (relative to Ionian)', () => {
      const ionian = getScale('ionian')!;
      const pitchClassSet = new Set(ionian.semitones);

      const modeIds = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];
      for (const id of modeIds) {
        const mode = getScale(id)!;
        // Offset each mode's semitones by its degree offset from Ionian and check they produce the same set
        const offset = ionian.semitones[(mode.degree ?? 1) - 1];
        const absolutePitches = new Set(mode.semitones.map((s) => (s + offset) % 12));
        expect(absolutePitches).toEqual(pitchClassSet);
      }
    });
  });

  // ── 8. Alias lookup ───────────────────────────────────────────────────
  describe('alias lookup', () => {
    it('"Super Locrian" finds the altered scale', () => {
      const result = getScaleByAlias('Super Locrian');
      expect(result).toBeDefined();
      expect(result!.id).toBe('altered');
    });

    it('"Freygish" finds phrygian-dominant', () => {
      const result = getScaleByAlias('Freygish');
      expect(result).toBeDefined();
      expect(result!.id).toBe('phrygian-dominant');
    });

    it('"Major Scale" finds ionian', () => {
      const result = getScaleByAlias('Major Scale');
      expect(result).toBeDefined();
      expect(result!.id).toBe('ionian');
    });

    it('"Jazz Minor" finds melodic-minor', () => {
      const result = getScaleByAlias('Jazz Minor');
      expect(result).toBeDefined();
      expect(result!.id).toBe('melodic-minor');
    });
  });

  // ── 9. Search works ───────────────────────────────────────────────────
  describe('search', () => {
    it('searching "jazz" returns results', () => {
      const results = searchScales('jazz');
      expect(results.length).toBeGreaterThan(0);
    });

    it('searching by tag "flamenco" includes phrygian-dominant', () => {
      const results = searchScales('flamenco');
      expect(results.some((s) => s.id === 'phrygian-dominant')).toBe(true);
    });

    it('searching "pentatonic" returns all pentatonic scales', () => {
      const results = searchScales('pentatonic');
      const pentatonicScales = getScalesByFamily('pentatonic');
      for (const ps of pentatonicScales) {
        expect(results.some((r) => r.id === ps.id)).toBe(true);
      }
    });

    it('empty query returns empty array', () => {
      expect(searchScales('')).toEqual([]);
    });
  });

  // ── 10. Symmetric scales transposition counts ─────────────────────────
  describe('symmetric scales transpositions', () => {
    const expectedTranspositions: Record<string, number> = {
      chromatic: 1,
      'whole-tone': 2,
      'diminished-wh': 3,
      'diminished-hw': 3,
      augmented: 4,
      tritone: 6,
    };

    for (const [id, expected] of Object.entries(expectedTranspositions)) {
      it(`${id} has ${expected} transpositions`, () => {
        const scale = getScale(id);
        expect(scale).toBeDefined();
        expect(scale!.transpositions).toBe(expected);
      });
    }
  });
});

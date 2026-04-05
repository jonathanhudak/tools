import { describe, it, expect } from 'vitest';
import {
  INTERVALS,
  COMPOUND_INTERVALS,
  ALL_INTERVALS,
  getIntervalBySemitones,
  getIntervalName,
  invertInterval,
} from '../intervals';

describe('Intervals', () => {
  // ── 1. All 12 semitones covered ───────────────────────────────────────
  it('all 12 semitones (0-11) have at least one interval definition', () => {
    for (let i = 0; i <= 11; i++) {
      const found = INTERVALS.filter((int) => int.semitones === i);
      expect(found.length).toBeGreaterThanOrEqual(1);
    }
  });

  // ── 2. Specific interval-to-semitone checks ──────────────────────────
  describe('specific interval values', () => {
    const checks: [string, number][] = [
      ['P1', 0],
      ['m2', 1],
      ['M2', 2],
      ['m3', 3],
      ['M3', 4],
      ['P4', 5],
      ['P5', 7],
      ['m6', 8],
      ['M6', 9],
      ['m7', 10],
      ['M7', 11],
      ['P8', 12],
    ];

    for (const [name, semitones] of checks) {
      it(`${name} = ${semitones} semitones`, () => {
        const interval = ALL_INTERVALS.find((i) => i.shortName === name);
        expect(interval).toBeDefined();
        expect(interval!.semitones).toBe(semitones);
      });
    }
  });

  // ── 3. Tritone ────────────────────────────────────────────────────────
  it('tritone (A4/d5) = 6 semitones', () => {
    const a4 = ALL_INTERVALS.find((i) => i.shortName === 'A4');
    const d5 = ALL_INTERVALS.find((i) => i.shortName === 'd5');
    expect(a4).toBeDefined();
    expect(d5).toBeDefined();
    expect(a4!.semitones).toBe(6);
    expect(d5!.semitones).toBe(6);
  });

  // ── 4. Inversions ────────────────────────────────────────────────────
  describe('inversions are correct', () => {
    const inversionPairs: [string, string][] = [
      ['m3', 'M6'],
      ['M3', 'm6'],
      ['P4', 'P5'],
      ['P5', 'P4'],
      ['m2', 'M7'],
      ['M2', 'm7'],
      ['P1', 'P8'],
      ['A4', 'd5'],
      ['d5', 'A4'],
    ];

    for (const [from, to] of inversionPairs) {
      it(`inversion of ${from} is ${to}`, () => {
        const result = invertInterval(from);
        expect(result).toBe(to);
      });
    }
  });

  // ── 5. Compound intervals ────────────────────────────────────────────
  describe('compound intervals', () => {
    const compoundChecks: [string, number][] = [
      ['M9', 14],
      ['m9', 13],
      ['P11', 17],
      ['A11', 18],
      ['m13', 20],
      ['M13', 21],
    ];

    for (const [name, semitones] of compoundChecks) {
      it(`${name} = ${semitones} semitones`, () => {
        const interval = COMPOUND_INTERVALS.find((i) => i.shortName === name);
        expect(interval).toBeDefined();
        expect(interval!.semitones).toBe(semitones);
        expect(interval!.isCompound).toBe(true);
      });
    }
  });

  // ── 6. getIntervalBySemitones ─────────────────────────────────────────
  describe('getIntervalBySemitones', () => {
    it('returns P1 for 0 semitones', () => {
      const result = getIntervalBySemitones(0);
      expect(result).toBeDefined();
      expect(result!.shortName).toBe('P1');
    });

    it('returns P5 for 7 semitones', () => {
      const result = getIntervalBySemitones(7);
      expect(result).toBeDefined();
      expect(result!.shortName).toBe('P5');
    });

    it('returns M9 for 14 semitones', () => {
      const result = getIntervalBySemitones(14);
      expect(result).toBeDefined();
      expect(result!.shortName).toBe('M9');
    });
  });

  // ── 7. getIntervalName ────────────────────────────────────────────────
  describe('getIntervalName', () => {
    it('returns "P1" for 0', () => {
      expect(getIntervalName(0)).toBe('P1');
    });

    it('returns "P5" for 7', () => {
      expect(getIntervalName(7)).toBe('P5');
    });

    it('returns "M3" for 4', () => {
      expect(getIntervalName(4)).toBe('M3');
    });

    it('returns "m7" for 10', () => {
      expect(getIntervalName(10)).toBe('m7');
    });
  });
});

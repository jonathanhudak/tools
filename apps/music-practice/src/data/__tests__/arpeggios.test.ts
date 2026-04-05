import { describe, it, expect } from 'vitest';
import {
  ARPEGGIO_REGISTRY,
  getArpeggio,
  getArpeggiosByFamily,
  getArpeggioForChord,
} from '../arpeggios/arpeggio-registry';
import { ARPEGGIO_PATTERNS, getPattern } from '../arpeggios/arpeggio-patterns';

describe('Arpeggio Registry', () => {
  // ── 1. Registry size ──────────────────────────────────────────────────
  it('has exactly 31 arpeggios', () => {
    expect(ARPEGGIO_REGISTRY).toHaveLength(31);
  });

  // ── 2. All 5 families represented ─────────────────────────────────────
  it('has all 5 families represented', () => {
    const families = new Set(ARPEGGIO_REGISTRY.map((a) => a.family));
    expect(families).toEqual(new Set(['triadic', 'seventh', 'extended', 'sixth', 'altered']));
  });

  // ── 3. All IDs unique ─────────────────────────────────────────────────
  it('all arpeggio IDs are unique', () => {
    const ids = ARPEGGIO_REGISTRY.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // ── 4. Major arpeggio ─────────────────────────────────────────────────
  it('Major arpeggio = [0, 4, 7, 12]', () => {
    const major = getArpeggio('major');
    expect(major).toBeDefined();
    expect(major!.semitones).toEqual([0, 4, 7, 12]);
  });

  // ── 5. dom7 arpeggio ──────────────────────────────────────────────────
  it('dom7 arpeggio = [0, 4, 7, 10, 12]', () => {
    const dom7 = getArpeggio('dom7');
    expect(dom7).toBeDefined();
    expect(dom7!.semitones).toEqual([0, 4, 7, 10, 12]);
  });

  // ── 6. dim7 arpeggio ──────────────────────────────────────────────────
  it('dim7 arpeggio = [0, 3, 6, 9, 12]', () => {
    const dim7 = getArpeggio('dim7');
    expect(dim7).toBeDefined();
    expect(dim7!.semitones).toEqual([0, 3, 6, 9, 12]);
  });

  // ── 7. Semitones are ascending ────────────────────────────────────────
  describe('all arpeggios have ascending semitones', () => {
    for (const arp of ARPEGGIO_REGISTRY) {
      it(`${arp.name}: semitones are ascending`, () => {
        for (let i = 1; i < arp.semitones.length; i++) {
          expect(arp.semitones[i]).toBeGreaterThan(arp.semitones[i - 1]);
        }
      });
    }
  });

  // ── Additional spot-checks ────────────────────────────────────────────
  describe('additional spot-checks', () => {
    it('minor arpeggio = [0, 3, 7, 12]', () => {
      const minor = getArpeggio('minor');
      expect(minor).toBeDefined();
      expect(minor!.semitones).toEqual([0, 3, 7, 12]);
    });

    it('augmented arpeggio = [0, 4, 8, 12]', () => {
      const aug = getArpeggio('augmented');
      expect(aug).toBeDefined();
      expect(aug!.semitones).toEqual([0, 4, 8, 12]);
    });

    it('maj7 arpeggio = [0, 4, 7, 11, 12]', () => {
      const maj7 = getArpeggio('maj7');
      expect(maj7).toBeDefined();
      expect(maj7!.semitones).toEqual([0, 4, 7, 11, 12]);
    });

    it('halfDim7 arpeggio = [0, 3, 6, 10, 12]', () => {
      const hd = getArpeggio('halfDim7');
      expect(hd).toBeDefined();
      expect(hd!.semitones).toEqual([0, 3, 6, 10, 12]);
    });
  });

  // ── Lookup functions ──────────────────────────────────────────────────
  describe('lookup functions', () => {
    it('getArpeggio finds by ID', () => {
      expect(getArpeggio('major')).toBeDefined();
      expect(getArpeggio('nonexistent')).toBeUndefined();
    });

    it('getArpeggiosByFamily returns correct arpeggios', () => {
      const triadic = getArpeggiosByFamily('triadic');
      expect(triadic.length).toBe(6);
      expect(triadic.every((a) => a.family === 'triadic')).toBe(true);
    });

    it('getArpeggioForChord finds arpeggio for chord type', () => {
      const result = getArpeggioForChord('major');
      expect(result).toBeDefined();
      expect(result!.id).toBe('major');
    });
  });
});

describe('Arpeggio Patterns', () => {
  // ── 8. Pattern count ──────────────────────────────────────────────────
  it('has exactly 10 patterns', () => {
    expect(ARPEGGIO_PATTERNS).toHaveLength(10);
  });

  // ── Pattern IDs unique ────────────────────────────────────────────────
  it('all pattern IDs are unique', () => {
    const ids = ARPEGGIO_PATTERNS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // ── 9. Lookup functions work ──────────────────────────────────────────
  it('getPattern finds ascending', () => {
    const ascending = getPattern('ascending');
    expect(ascending).toBeDefined();
    expect(ascending!.pattern).toEqual([0, 1, 2, 3]);
  });

  it('getPattern finds descending', () => {
    const descending = getPattern('descending');
    expect(descending).toBeDefined();
    expect(descending!.pattern).toEqual([3, 2, 1, 0]);
  });

  it('getPattern returns undefined for non-existent', () => {
    expect(getPattern('nonexistent')).toBeUndefined();
  });
});

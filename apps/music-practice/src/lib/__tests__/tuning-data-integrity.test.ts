/**
 * Integrity checks for the @hudak/tuning-data catalog consumed by the tuner.
 */
import { describe, it, expect } from 'vitest';
import { INSTRUMENT_CATEGORIES } from '@hudak/tuning-data';

describe('tuning-data integrity', () => {
  // Guitar has intentional aliases (e.g. Nick Drake's "Pink Moon" = DADGAD),
  // so the duplicate check covers only banjo categories, where a duplicate
  // means a data-entry error.
  it('has no duplicate note arrays within banjo categories', () => {
    const banjoCategories = INSTRUMENT_CATEGORIES.filter((c) => c.id.startsWith('banjo'));
    expect(banjoCategories.length).toBeGreaterThan(0);
    for (const cat of banjoCategories) {
      const seen = new Map<string, string>();
      for (const tuning of cat.tunings) {
        const key = tuning.notes.map((n) => n.note).join(',');
        const dup = seen.get(key);
        expect(dup, `${cat.id}: ${tuning.id} duplicates ${dup}`).toBeUndefined();
        seen.set(key, tuning.id);
      }
    }
  });

  it('banjo5 Open D has A4 on the 5th string (aDF#AD)', () => {
    const banjo5 = INSTRUMENT_CATEGORIES.find((c) => c.id === 'banjo-5');
    const openD = banjo5?.tunings.find((t) => t.id === 'banjo5-open-d');
    expect(openD).toBeDefined();
    expect(openD!.notes.map((n) => n.note)).toEqual(['A4', 'D3', 'F#3', 'A3', 'D4']);
  });

  it('banjo5 includes Double D (aDADE)', () => {
    const banjo5 = INSTRUMENT_CATEGORIES.find((c) => c.id === 'banjo-5');
    const doubleD = banjo5?.tunings.find((t) => t.id === 'banjo5-double-d');
    expect(doubleD).toBeDefined();
    expect(doubleD!.notes.map((n) => n.note)).toEqual(['A4', 'D3', 'A3', 'D4', 'E4']);
  });
});

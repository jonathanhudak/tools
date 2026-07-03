import { describe, it, expect } from 'vitest';
import { CHORD_LIBRARY, getChordById } from '../chord-library';
import { CHORD_SCALE_MATRIX } from '../../data/chord-scale-matrix';

/**
 * Referential-integrity invariants for the chord library.
 *
 * These exist because the library once shipped 33 colliding IDs: the slug
 * generator stripped '#' so "C# Major" became 'c-major', shadowing C Major
 * in every getChordById lookup. Sharps must be spelled '-sharp-' in IDs.
 */
describe('chord library integrity', () => {
  it('has globally unique chord IDs', () => {
    const ids = CHORD_LIBRARY.map(c => c.id);
    const seen = new Set<string>();
    const dupes = ids.filter(id => (seen.has(id) ? true : (seen.add(id), false)));
    expect(dupes).toEqual([]);
  });

  it('spells sharp roots as "-sharp-" in IDs so they never collide with naturals', () => {
    const exceptions = new Set(['c-7-tritone-sub']); // intentionally descriptive ID
    const misSlugged = CHORD_LIBRARY.filter(
      c => c.root.includes('#') && !c.id.includes('-sharp-') && !exceptions.has(c.id),
    ).map(c => `${c.id} (${c.name})`);
    expect(misSlugged).toEqual([]);
  });

  it('has no two entries with the same root and name', () => {
    const keys = CHORD_LIBRARY.map(c => `${c.root}|${c.name}`);
    const seen = new Set<string>();
    const dupes = keys.filter(k => (seen.has(k) ? true : (seen.add(k), false)));
    expect(dupes).toEqual([]);
  });

  it('has no semantic duplicates under ordinal naming ("7" vs "7th")', () => {
    // Two generations of data used "C Major 7" and "C Major 7th" for the same
    // chord — normalize ordinal suffixes before checking uniqueness.
    const keys = CHORD_LIBRARY.map(
      c => `${c.root}|${c.name.toLowerCase().replace(/\b(\d+)(st|nd|rd|th)\b/g, '$1')}`,
    );
    const seen = new Set<string>();
    const dupes = keys.filter(k => (seen.has(k) ? true : (seen.add(k), false)));
    expect(dupes).toEqual([]);
  });

  it('resolves every chordId referenced by the chord-scale matrix', () => {
    const dangling = CHORD_SCALE_MATRIX.filter(e => e.chordId && !getChordById(e.chordId)).map(
      e => `${e.scaleType} degree ${e.degree} -> ${e.chordId}`,
    );
    expect(dangling).toEqual([]);
  });

  it('keeps every matrix voicingIndex within the referenced chord voicing range', () => {
    const outOfRange = CHORD_SCALE_MATRIX.filter(e => {
      if (!e.chordId || e.voicingIndex === undefined) return false;
      const chord = getChordById(e.chordId);
      return !chord || e.voicingIndex >= chord.voicings.length;
    }).map(e => `${e.chordId}[${e.voicingIndex}]`);
    expect(outOfRange).toEqual([]);
  });
});

/**
 * Tests for chord-library.ts
 */

import { describe, it, expect } from 'vitest';
import {
  CHORD_LIBRARY,
  getChordsByDifficulty,
  getChordsByType,
  searchChords,
  getChordById,
  getRandomChord,
} from '../chord-library';

describe('Chord Library', () => {
  describe('CHORD_LIBRARY', () => {
    it('should contain at least 25 chords', () => {
      expect(CHORD_LIBRARY.length).toBeGreaterThanOrEqual(25);
    });

    it('should have all required fields for each chord', () => {
      CHORD_LIBRARY.forEach(chord => {
        expect(chord).toHaveProperty('id');
        expect(chord).toHaveProperty('name');
        expect(chord).toHaveProperty('shortName');
        expect(chord).toHaveProperty('root');
        expect(chord).toHaveProperty('type');
        expect(chord).toHaveProperty('difficulty');
        expect(chord).toHaveProperty('fingerings');
        expect(chord).toHaveProperty('description');
        expect(chord).toHaveProperty('tags');
      });
    });

    it('should have guitar fingerings for all chords', () => {
      CHORD_LIBRARY.forEach(chord => {
        expect(chord.fingerings.guitar).toBeDefined();
        expect(chord.fingerings.guitar.length).toBe(6); // 6 strings
      });
    });

    it('should have piano notes for most chords', () => {
      const chordsWithPiano = CHORD_LIBRARY.filter(c => c.fingerings.piano);
      expect(chordsWithPiano.length).toBeGreaterThan(0);
    });

    it('should have valid fret positions', () => {
      CHORD_LIBRARY.forEach(chord => {
        chord.fingerings.guitar.forEach(fingering => {
          expect(fingering.fret).toBeGreaterThanOrEqual(-1);
          expect(fingering.fret).toBeLessThanOrEqual(12);
          expect([1, 2, 3, 4, 5, 6]).toContain(fingering.string);
        });
      });
    });
  });

  describe('getChordsByDifficulty', () => {
    it('should filter chords by difficulty', () => {
      const beginnerChords = getChordsByDifficulty('beginner');
      expect(beginnerChords.length).toBeGreaterThan(0);
      beginnerChords.forEach(chord => {
        expect(chord.difficulty).toBe('beginner');
      });
    });

    it('should return different counts for different difficulties', () => {
      const beginner = getChordsByDifficulty('beginner');
      const intermediate = getChordsByDifficulty('intermediate');
      const advanced = getChordsByDifficulty('advanced');

      expect(beginner.length + intermediate.length + advanced.length).toBe(CHORD_LIBRARY.length);
    });
  });

  describe('getChordsByType', () => {
    it('should filter chords by type', () => {
      const majorChords = getChordsByType('major');
      expect(majorChords.length).toBeGreaterThan(0);
      majorChords.forEach(chord => {
        expect(chord.type).toBe('major');
      });
    });

    it('should return minor chords when filtered', () => {
      const minorChords = getChordsByType('minor');
      expect(minorChords.length).toBeGreaterThan(0);
      minorChords.forEach(chord => {
        expect(chord.type).toBe('minor');
      });
    });
  });

  describe('searchChords', () => {
    it('should find chords by name', () => {
      const results = searchChords('C Major');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(c => c.id === 'c-major')).toBe(true);
    });

    it('should find chords by short name', () => {
      const results = searchChords('Am');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(c => c.id === 'a-minor')).toBe(true);
    });

    it('should find chords by tag', () => {
      const results = searchChords('blues');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const results1 = searchChords('c major');
      const results2 = searchChords('C MAJOR');
      expect(results1.length).toBe(results2.length);
    });

    it('should return empty array for non-matching query', () => {
      const results = searchChords('xyznonexistent');
      expect(results.length).toBe(0);
    });
  });

  describe('getChordById', () => {
    it('should return chord by id', () => {
      const chord = getChordById('c-major');
      expect(chord).toBeDefined();
      expect(chord?.name).toBe('C Major');
    });

    it('should return undefined for non-existent id', () => {
      const chord = getChordById('nonexistent-chord');
      expect(chord).toBeUndefined();
    });
  });

  describe('getRandomChord', () => {
    it('should return a random chord', () => {
      const chord = getRandomChord();
      expect(chord).toBeDefined();
      expect(CHORD_LIBRARY.some(c => c.id === chord.id)).toBe(true);
    });

    it('should return chord of specified difficulty', () => {
      const chord = getRandomChord('beginner');
      expect(chord.difficulty).toBe('beginner');
    });

    it('should return different chords on multiple calls', () => {
      const chords = [
        getRandomChord(),
        getRandomChord(),
        getRandomChord(),
        getRandomChord(),
        getRandomChord(),
      ];

      // With 100+ chords, probability of getting different ones is very high
      const uniqueIds = new Set(chords.map(c => c.id));
      expect(uniqueIds.size).toBeGreaterThan(1);
    });
  });
});

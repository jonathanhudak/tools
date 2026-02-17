/**
 * Tests for ChordVoicingMapper - Guitar to Piano chord conversion
 */

import { describe, it, expect } from 'vitest';
import {
  mapGuitarToPiano,
  getPianoKeyPositions,
  formatPianoVoicing,
  validatePianoVoicing,
  transposePianoVoicing,
} from '../chord-voicing-mapper';
import { CHORD_LIBRARY, getChordById } from '../chord-library';

describe('ChordVoicingMapper', () => {
  describe('mapGuitarToPiano', () => {
    it('should map C major chord to piano notes', () => {
      const cMajor = getChordById('c-major');
      expect(cMajor).toBeDefined();

      const voicing = mapGuitarToPiano(cMajor!);
      expect(voicing.notes).toBeDefined();
      expect(voicing.notes.length).toBeGreaterThan(0);
      expect(voicing.description).toContain('C Major');
    });

    it('should map A minor chord to piano notes', () => {
      const aMinor = getChordById('a-minor');
      expect(aMinor).toBeDefined();

      const voicing = mapGuitarToPiano(aMinor!);
      expect(voicing.notes).toBeDefined();
      expect(voicing.notes.length).toBeGreaterThan(0);
    });

    it('should prefer chord library piano voicing over computed voicing', () => {
      const cMajor = getChordById('c-major');
      expect(cMajor).toBeDefined();
      expect(cMajor!.fingerings.piano).toBeDefined();

      const voicing = mapGuitarToPiano(cMajor!);
      expect(voicing.notes).toContain('C');
      expect(voicing.notes).toContain('E');
      expect(voicing.notes).toContain('G');
    });

    it('should handle all beginner chords', () => {
      const beginnerChords = CHORD_LIBRARY.filter(c => c.difficulty === 'beginner');
      
      beginnerChords.forEach(chord => {
        const voicing = mapGuitarToPiano(chord);
        expect(voicing.notes.length).toBeGreaterThan(0);
        expect(voicing.notes.length).toBeLessThanOrEqual(6);
        expect(validatePianoVoicing(voicing)).toBe(true);
      });
    });
  });

  describe('getPianoKeyPositions', () => {
    it('should return key positions for C major voicing', () => {
      const cMajor = getChordById('c-major');
      const voicing = mapGuitarToPiano(cMajor!);
      const positions = getPianoKeyPositions(voicing);

      expect(positions).toBeDefined();
      expect(positions.length).toBeGreaterThan(0);
      expect(positions.every(p => p >= 0 && p < 88)).toBe(true);
    });

    it('should return sorted key positions', () => {
      const cMajor = getChordById('c-major');
      const voicing = mapGuitarToPiano(cMajor!);
      const positions = getPianoKeyPositions(voicing);

      for (let i = 1; i < positions.length; i++) {
        expect(positions[i]).toBeGreaterThanOrEqual(positions[i - 1]);
      }
    });

    it('should only return valid 88-key positions', () => {
      CHORD_LIBRARY.forEach(chord => {
        const voicing = mapGuitarToPiano(chord);
        const positions = getPianoKeyPositions(voicing);

        positions.forEach(pos => {
          expect(pos).toBeGreaterThanOrEqual(0);
          expect(pos).toBeLessThan(88);
        });
      });
    });
  });

  describe('formatPianoVoicing', () => {
    it('should format voicing as readable string', () => {
      const cMajor = getChordById('c-major');
      const voicing = mapGuitarToPiano(cMajor!);
      const formatted = formatPianoVoicing(voicing);

      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should include octave numbers', () => {
      const cMajor = getChordById('c-major');
      const voicing = mapGuitarToPiano(cMajor!);
      const formatted = formatPianoVoicing(voicing);

      expect(/\d/.test(formatted)).toBe(true);
    });
  });

  describe('validatePianoVoicing', () => {
    it('should validate correct voicings', () => {
      const cMajor = getChordById('c-major');
      const voicing = mapGuitarToPiano(cMajor!);

      expect(validatePianoVoicing(voicing)).toBe(true);
    });

    it('should reject empty voicings', () => {
      const invalidVoicing = {
        notes: [],
        octaves: [],
        description: 'invalid',
      };

      expect(validatePianoVoicing(invalidVoicing)).toBe(false);
    });

    it('should reject mismatched note/octave arrays', () => {
      const invalidVoicing = {
        notes: ['C', 'E', 'G'],
        octaves: [4, 4], // Wrong length
        description: 'invalid',
      };

      expect(validatePianoVoicing(invalidVoicing)).toBe(false);
    });
  });

  describe('transposePianoVoicing', () => {
    it('should transpose voicing by semitones', () => {
      const cMajor = getChordById('c-major');
      const voicing = mapGuitarToPiano(cMajor!);
      const transposed = transposePianoVoicing(voicing, 2); // Transpose up 2 semitones

      expect(transposed.notes.length).toBe(voicing.notes.length);
      expect(transposed.notes).not.toEqual(voicing.notes);
    });

    it('should handle transposition wrapping (octave changes)', () => {
      const voicing = {
        notes: ['B'],
        octaves: [4],
        description: 'B4',
      };

      const transposed = transposePianoVoicing(voicing, 1); // B -> C
      expect(transposed.notes[0]).toBe('C');
    });
  });

  describe('Integration tests', () => {
    it('should handle all chord library chords', () => {
      CHORD_LIBRARY.forEach(chord => {
        const voicing = mapGuitarToPiano(chord);
        expect(voicing).toBeDefined();
        expect(voicing.notes.length).toBeGreaterThan(0);

        const positions = getPianoKeyPositions(voicing);
        // Most chords should have valid positions, but we focus on consistency
        expect(Array.isArray(positions)).toBe(true);
        expect(positions.every(p => p >= 0 && p < 88)).toBe(true);
      });
    });

    it('should maintain consistency across mappings', () => {
      const cMajor = getChordById('c-major');
      const voicing1 = mapGuitarToPiano(cMajor!);
      const voicing2 = mapGuitarToPiano(cMajor!);

      expect(voicing1.notes).toEqual(voicing2.notes);
      expect(voicing1.octaves).toEqual(voicing2.octaves);
    });
  });
});

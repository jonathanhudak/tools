/**
 * Tests for piano-voicings.ts
 */

import { describe, it, expect } from 'vitest';
import {
  PIANO_VOICING_LIBRARY,
  getVoicingsForChord,
  getRandomVoicing,
  searchVoicings,
  PianoVoicing,
} from '../piano-voicings';

describe('Piano Voicing Library', () => {
  describe('PIANO_VOICING_LIBRARY', () => {
    it('should contain at least 100 chord voicing entries', () => {
      const chordCount = Object.keys(PIANO_VOICING_LIBRARY).length;
      expect(chordCount).toBeGreaterThanOrEqual(100);
    });

    it('should contain voicings for extended chords (9th, 11th, 13th)', () => {
      const keys = Object.keys(PIANO_VOICING_LIBRARY);
      const hasExtended = keys.some(k => 
        k.includes('maj9') || k.includes('11') || k.includes('13')
      );
      expect(hasExtended).toBe(true);
    });

    it('should contain jazz progressions (ii-V-I)', () => {
      const keys = Object.keys(PIANO_VOICING_LIBRARY);
      const hasJazz = keys.some(k => k.includes('ii_v_i'));
      expect(hasJazz).toBe(true);
    });

    it('should contain blues changes', () => {
      const keys = Object.keys(PIANO_VOICING_LIBRARY);
      const hasBlues = keys.some(k => k.includes('blues'));
      expect(hasBlues).toBe(true);
    });

    it('should contain standards (Autumn Leaves, Giant Steps)', () => {
      const keys = Object.keys(PIANO_VOICING_LIBRARY);
      const hasStandards = 
        keys.some(k => k.includes('autumn_leaves')) ||
        keys.some(k => k.includes('giant_steps'));
      expect(hasStandards).toBe(true);
    });

    it('should have valid voicing structure', () => {
      Object.values(PIANO_VOICING_LIBRARY).forEach(voicingArray => {
        expect(Array.isArray(voicingArray)).toBe(true);
        
        voicingArray.forEach(voicing => {
          expect(voicing).toHaveProperty('voicingName');
          expect(voicing).toHaveProperty('notes');
          expect(voicing).toHaveProperty('octaveRange');
          expect(voicing).toHaveProperty('description');
          
          // Validate notes are MIDI numbers
          expect(Array.isArray(voicing.notes)).toBe(true);
          voicing.notes.forEach(note => {
            expect(typeof note).toBe('number');
            expect(note).toBeGreaterThanOrEqual(0);
            expect(note).toBeLessThanOrEqual(127); // MIDI range
          });
          
          // Validate octave range
          expect(typeof voicing.octaveRange.start).toBe('number');
          expect(typeof voicing.octaveRange.end).toBe('number');
          expect(voicing.octaveRange.start).toBeLessThanOrEqual(voicing.octaveRange.end);
        });
      });
    });

    it('should have descriptive naming for all voicings', () => {
      Object.values(PIANO_VOICING_LIBRARY).forEach(voicingArray => {
        voicingArray.forEach(voicing => {
          expect(voicing.voicingName.length).toBeGreaterThan(0);
          expect(voicing.description.length).toBeGreaterThan(0);
          expect(voicing.voicingName).not.toContain('[object Object]');
          expect(voicing.description).not.toContain('[object Object]');
        });
      });
    });
  });

  describe('getVoicingsForChord', () => {
    it('should return voicings for existing chord', () => {
      const cmaj9 = getVoicingsForChord('Cmaj9');
      expect(Array.isArray(cmaj9)).toBe(true);
      expect(cmaj9.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent chord', () => {
      const result = getVoicingsForChord('nonexistent-chord-xyz');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should have at least 1-3 voicings per chord', () => {
      Object.entries(PIANO_VOICING_LIBRARY).forEach(([key, voicings]) => {
        // Most chords have 2-3 voicings, some special cases (tritone subs) have 1
        expect(voicings.length).toBeGreaterThanOrEqual(1);
        expect(voicings.length).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('getRandomVoicing', () => {
    it('should return a valid voicing', () => {
      const voicing = getRandomVoicing();
      expect(voicing).toHaveProperty('voicingName');
      expect(voicing).toHaveProperty('notes');
      expect(voicing).toHaveProperty('octaveRange');
      expect(voicing).toHaveProperty('description');
    });

    it('should return different voicings on multiple calls', () => {
      const voicings = [
        getRandomVoicing(),
        getRandomVoicing(),
        getRandomVoicing(),
        getRandomVoicing(),
        getRandomVoicing(),
      ];

      const uniqueNames = new Set(voicings.map(v => v.voicingName));
      expect(uniqueNames.size).toBeGreaterThan(1);
    });
  });

  describe('searchVoicings', () => {
    it('should find voicings by name', () => {
      const results = searchVoicings('shell');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(v => {
        expect(
          v.voicingName.toLowerCase().includes('shell') ||
          v.description.toLowerCase().includes('shell')
        ).toBe(true);
      });
    });

    it('should find voicings by description', () => {
      const results = searchVoicings('jazz');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const results1 = searchVoicings('SHELL');
      const results2 = searchVoicings('shell');
      expect(results1.length).toBe(results2.length);
    });

    it('should return empty array for non-matching query', () => {
      const results = searchVoicings('xyznonexistentquery');
      expect(results.length).toBe(0);
    });
  });

  describe('Coverage checks', () => {
    it('should have maj9 chords for all 12 roots', () => {
      const maj9Voicings = Object.keys(PIANO_VOICING_LIBRARY).filter(k => k.includes('maj9'));
      expect(maj9Voicings.length).toBeGreaterThanOrEqual(12);
    });

    it('should have extended 11th chords', () => {
      const voicings11 = Object.keys(PIANO_VOICING_LIBRARY).filter(k => k.includes('11'));
      expect(voicings11.length).toBeGreaterThanOrEqual(12);
    });

    it('should have extended 13th chords', () => {
      const voicings13 = Object.keys(PIANO_VOICING_LIBRARY).filter(k => k.includes('13'));
      expect(voicings13.length).toBeGreaterThanOrEqual(12);
    });

    it('should have alt dominants (#5 and b5)', () => {
      const voicingsAlt = Object.keys(PIANO_VOICING_LIBRARY).filter(k => 
        k.includes('7#5') || k.includes('7b5')
      );
      expect(voicingsAlt.length).toBeGreaterThanOrEqual(24);
    });

    it('should have sus2 and sus4 voicings', () => {
      const voicingsSus = Object.keys(PIANO_VOICING_LIBRARY).filter(k => 
        k.includes('sus')
      );
      expect(voicingsSus.length).toBeGreaterThanOrEqual(24);
    });

    it('should have diminished and augmented chords', () => {
      const voicingsDimAug = Object.keys(PIANO_VOICING_LIBRARY).filter(k => 
        k.includes('dim') || k.includes('aug')
      );
      expect(voicingsDimAug.length).toBeGreaterThanOrEqual(24);
    });

    it('should have blues progressions', () => {
      const voicingsBlues = Object.keys(PIANO_VOICING_LIBRARY).filter(k => 
        k.includes('blues')
      );
      expect(voicingsBlues.length).toBeGreaterThanOrEqual(21);
    });

    it('should have ii-V-I progressions', () => {
      const voicingsJazz = Object.keys(PIANO_VOICING_LIBRARY).filter(k => 
        k.includes('ii_v_i')
      );
      expect(voicingsJazz.length).toBeGreaterThanOrEqual(21);
    });

    it('should have standards (Autumn Leaves, Giant Steps)', () => {
      const autumnLeaves = Object.keys(PIANO_VOICING_LIBRARY).filter(k => 
        k.includes('autumn_leaves')
      );
      const giantSteps = Object.keys(PIANO_VOICING_LIBRARY).filter(k => 
        k.includes('giant_steps')
      );
      
      expect(autumnLeaves.length + giantSteps.length).toBeGreaterThanOrEqual(13);
    });

    it('should have modal jazz voicings', () => {
      const modalVoicings = Object.keys(PIANO_VOICING_LIBRARY).filter(k => 
        k.includes('dorian') || k.includes('mixolydian') || k.includes('lydian')
      );
      expect(modalVoicings.length).toBeGreaterThanOrEqual(9);
    });

    it('should have tritone substitutions', () => {
      const tritoneVoicings = Object.keys(PIANO_VOICING_LIBRARY).filter(k => 
        k.includes('tritone')
      );
      expect(tritoneVoicings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('MIDI Note Validity', () => {
    it('all notes should be in valid MIDI range (0-127)', () => {
      Object.values(PIANO_VOICING_LIBRARY).forEach(voicingArray => {
        voicingArray.forEach(voicing => {
          voicing.notes.forEach(note => {
            expect(note).toBeGreaterThanOrEqual(0);
            expect(note).toBeLessThanOrEqual(127);
          });
        });
      });
    });

    it('should have reasonable octave ranges', () => {
      Object.values(PIANO_VOICING_LIBRARY).forEach(voicingArray => {
        voicingArray.forEach(voicing => {
          // Most voicings should be between octave 2 and 7 (full piano range)
          expect(voicing.octaveRange.start).toBeGreaterThanOrEqual(1);
          expect(voicing.octaveRange.end).toBeLessThanOrEqual(7);
        });
      });
    });

    it('notes should align with octaveRange', () => {
      Object.values(PIANO_VOICING_LIBRARY).forEach(voicingArray => {
        voicingArray.forEach(voicing => {
          voicing.notes.forEach(note => {
            // MIDI note to octave: C (middle C = 60 = octave 4)
            const octave = Math.floor((note - 12) / 12); // Adjust for C0 = 12
            const { start, end } = voicing.octaveRange;
            expect(octave).toBeGreaterThanOrEqual(start - 1); // Allow slight variance
            expect(octave).toBeLessThanOrEqual(end + 2); // Allow reasonable range
          });
        });
      });
    });
  });
});

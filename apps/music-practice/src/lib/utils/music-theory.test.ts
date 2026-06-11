import { describe, expect, it } from 'vitest';
import { generateRandomNote, generateRandomNoteFromScale, midiToVexflow, validateNote } from './music-theory';

describe('music theory utilities', () => {
  it('renders accidentals in midiToVexflow', () => {
    expect(midiToVexflow(61, 'treble')).toBe('c#/4');
    expect(midiToVexflow(60, 'treble')).toBe('c/4');
  });

  it('generates only scale tones in generateRandomNoteFromScale', () => {
    const lydian = [0, 2, 4, 6, 7, 9, 11]; // F Lydian root = 5
    const allowed = new Set(lydian.map(s => (5 + s) % 12));
    for (let i = 0; i < 50; i++) {
      const note = generateRandomNoteFromScale('c4-c6', 5, lydian);
      expect(note).not.toBeNull();
      expect(allowed.has(note!.midiNote % 12)).toBe(true);
    }
  });

  it('validates octave-equivalent notes when allowed', () => {
    const result = validateNote(72, 60, { allowOctaveError: true });
    expect(result.isCorrect).toBe(true);
  });

  it('generates random note within range', () => {
    const note = generateRandomNote('c4-c5', 'treble');
    expect(note).not.toBeNull();
    if (note) {
      expect(note.midiNote).toBeGreaterThanOrEqual(60);
      expect(note.midiNote).toBeLessThanOrEqual(72);
    }
  });
});

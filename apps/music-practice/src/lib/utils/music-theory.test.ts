import { describe, expect, it } from 'vitest';
import { generateRandomNote, midiToVexflow, validateNote } from './music-theory';

describe('music theory utilities', () => {
  it('returns null for sharp notes in midiToVexflow', () => {
    expect(midiToVexflow(61, 'treble')).toBeNull();
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

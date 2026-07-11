import { describe, expect, it } from 'vitest';
import {
  generateRandomNote,
  generateRandomNoteFromScale,
  getAllTabPositions,
  midiToTabPosition,
  midiToVexflow,
  validateNote,
} from './music-theory';

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

describe('banjo tab positions', () => {
  it('open strings map to fret 0', () => {
    expect(midiToTabPosition(50, 'banjo')).toEqual({ string: 4, fret: 0 }); // D3
    expect(midiToTabPosition(55, 'banjo')).toEqual({ string: 3, fret: 0 }); // G3
    expect(midiToTabPosition(59, 'banjo')).toEqual({ string: 2, fret: 0 }); // B3
    expect(midiToTabPosition(62, 'banjo')).toEqual({ string: 1, fret: 0 }); // D4
  });

  it('open 5th string G4 is fret 0 on string 5', () => {
    expect(midiToTabPosition(67, 'banjo')).toEqual({ string: 5, fret: 0 });
  });

  it('fretted 5th string uses physical fret numbers (>= 6)', () => {
    // A4 (69) = G4 + 2 semitones -> physical fret 7 on the 5th string
    expect(getAllTabPositions(69, 'banjo')).toContainEqual({ string: 5, fret: 7 });
    // The 5th string never shows frets 1-5
    for (const midi of [68, 69, 70, 71, 72]) {
      for (const p of getAllTabPositions(midi, 'banjo')) {
        if (p.string === 5) {
          expect(p.fret === 0 || p.fret >= 6).toBe(true);
        }
      }
    }
  });

  it('prefers full-length strings over the fretted 5th string', () => {
    // A4 (69): fret 7 on both string 1 and string 5 — string 1 must win
    const pos = midiToTabPosition(69, 'banjo')!;
    expect(pos.string).not.toBe(5);
  });

  it('guitar behavior unchanged', () => {
    expect(midiToTabPosition(40, 'guitar')).toEqual({ string: 6, fret: 0 });
    expect(midiToTabPosition(64, 'guitar')).toEqual({ string: 1, fret: 0 });
  });
});

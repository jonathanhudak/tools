/**
 * ChordVoicingMapper - Convert guitar fingerings to piano voicings
 * Maps standard guitar chords to piano keyboard notes
 */

import type { Chord, ChordFingering } from './chord-library';

export interface PianoVoicing {
  notes: string[];
  octaves: number[];
  description: string;
}

/**
 * Standard tuning: E A D G B E (strings 1-6)
 * String 1 is high E, String 6 is low E
 */
const STANDARD_TUNING: Record<number, string> = {
  1: 'E', // High E
  2: 'A',
  3: 'D',
  4: 'G',
  5: 'B',
  6: 'E', // Low E
};

/**
 * Note-to-MIDI mapping for proper octave calculation
 */
const NOTE_TO_MIDI: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

/**
 * Get the note name from guitar string and fret
 */
function getGuitarNote(string: number, fret: number): { note: string; octave: number } | null {
  if (fret < 0) return null; // Muted string

  const openNote = STANDARD_TUNING[string];
  if (!openNote) return null;

  // Get base octave based on string number
  // String 1 (high E) = octave 4, String 6 (low E) = octave 2
  const stringOctaves: Record<number, number> = {
    1: 4, // High E
    2: 3, // A
    3: 3, // D
    4: 3, // G
    5: 3, // B
    6: 2, // Low E
  };

  const baseOctave = stringOctaves[string] || 3;

  const noteIndex = NOTE_TO_MIDI[openNote];
  const newNoteIndex = (noteIndex + fret) % 12;
  const octaveOffset = Math.floor((noteIndex + fret) / 12);

  // Find note name from index
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteName = notes[newNoteIndex];

  return {
    note: noteName,
    octave: baseOctave + octaveOffset,
  };
}

/**
 * Convert guitar chord fingerings to piano voicing (notes with octaves)
 */
export function mapGuitarToPiano(chord: Chord): PianoVoicing {
  const guitarFingerings = chord.fingerings.guitar;
  const notes: string[] = [];
  const octaves: number[] = [];
  const noteSet = new Set<string>();

  // Extract all fretted notes from guitar fingering
  guitarFingerings.forEach((fingering: ChordFingering) => {
    const guitarNote = getGuitarNote(fingering.string, fingering.fret);
    if (guitarNote && !noteSet.has(guitarNote.note)) {
      notes.push(guitarNote.note);
      octaves.push(guitarNote.octave);
      noteSet.has(guitarNote.note) || noteSet.add(guitarNote.note);
    }
  });

  // If we have piano voicing in the chord library, use that instead
  if (chord.fingerings.piano && chord.fingerings.piano.length > 0) {
    const pianoNotes = chord.fingerings.piano;
    return {
      notes: pianoNotes.map(n => n.replace(/\d/g, '')),
      octaves: pianoNotes.map(n => parseInt(n.match(/\d/)?.[0] || '4') || 4),
      description: `Piano voicing for ${chord.name}`,
    };
  }

  return {
    notes: Array.from(noteSet),
    octaves,
    description: `Piano voicing for ${chord.name}`,
  };
}

/**
 * Transpose a piano voicing to a different key
 */
export function transposePianoVoicing(
  voicing: PianoVoicing,
  semitones: number
): PianoVoicing {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const transposedNotes = voicing.notes.map(note => {
    const currentIndex = notes.findIndex(n => n === note);
    if (currentIndex === -1) return note;

    const newIndex = (currentIndex + semitones) % 12;
    return notes[newIndex < 0 ? newIndex + 12 : newIndex];
  });

  return {
    ...voicing,
    notes: transposedNotes,
  };
}

/**
 * Get piano keyboard positions for chord notes
 * Returns array of key indices (0-87 for 88-key piano)
 */
export function getPianoKeyPositions(voicing: PianoVoicing): number[] {
  const keyPositions: number[] = [];

  voicing.notes.forEach((note, idx) => {
    const octave = voicing.octaves[idx];
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteInOctave = notes.indexOf(note);

    if (noteInOctave !== -1) {
      // Calculate key position for 88-key piano (A0 to C8)
      // A0 is key 0, C1 is key 3, etc.
      const keyPosition = (octave - 0) * 12 + noteInOctave - 9; // -9 because A0 is the first key
      if (keyPosition >= 0 && keyPosition < 88) {
        keyPositions.push(keyPosition);
      }
    }
  });

  return keyPositions.sort((a, b) => a - b);
}

/**
 * Format piano voicing as readable string (e.g., "C4 E4 G4")
 */
export function formatPianoVoicing(voicing: PianoVoicing): string {
  return voicing.notes
    .map((note, idx) => `${note}${voicing.octaves[idx]}`)
    .join(' ');
}

/**
 * Validate piano voicing (check for duplicates, proper range)
 */
export function validatePianoVoicing(voicing: PianoVoicing): boolean {
  if (voicing.notes.length === 0) return false;
  if (voicing.notes.length !== voicing.octaves.length) return false;

  // Check if all notes are in valid piano range
  for (let i = 0; i < voicing.notes.length; i++) {
    const keyPosition = getPianoKeyPositions({
      notes: [voicing.notes[i]],
      octaves: [voicing.octaves[i]],
      description: '',
    })[0];

    if (keyPosition === undefined || keyPosition < 0 || keyPosition >= 88) {
      return false;
    }
  }

  return true;
}

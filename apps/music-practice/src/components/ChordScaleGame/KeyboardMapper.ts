/**
 * KeyboardMapper.ts
 * Maps scale degrees to piano keys for visual display
 */

import { type ScaleType } from '../../data/chord-scale-matrix';

// Chromatic scale note names
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Scale degree intervals (semitones from root)
const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],      // Ionian
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],    // Natural minor
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

export interface PianoKeyInfo {
  midiNote: number;
  noteName: string;
  scaleDegree: number | null;
  isScaleTone: boolean;
  isRoot: boolean;
}

/**
 * Get the MIDI note number for a given note name and octave
 */
export function getMidiNote(noteName: string, octave: number): number {
  const noteIndex = NOTE_NAMES.indexOf(noteName);
  if (noteIndex === -1) {
    throw new Error(`Invalid note name: ${noteName}`);
  }
  return (octave + 1) * 12 + noteIndex;
}

/**
 * Get the note name and octave from a MIDI note number
 */
export function getNoteName(midiNote: number): { name: string; octave: number } {
  const noteIndex = midiNote % 12;
  const octave = Math.floor(midiNote / 12) - 1;
  return {
    name: NOTE_NAMES[noteIndex],
    octave
  };
}

/**
 * Check if a MIDI note is a black key (sharp/flat)
 */
export function isBlackKey(midiNote: number): boolean {
  const noteIndex = midiNote % 12;
  return [1, 3, 6, 8, 10].includes(noteIndex);
}

/**
 * Get all piano key info for a given scale type starting from a root note
 */
export function getPianoKeysForScale(
  rootNote: string,
  scaleType: ScaleType,
  startMidiNote: number = 12,  // A0
  endMidiNote: number = 108    // C8 (88-key piano)
): PianoKeyInfo[] {
  const keys: PianoKeyInfo[] = [];
  const rootIndex = NOTE_NAMES.indexOf(rootNote);
  
  if (rootIndex === -1) {
    throw new Error(`Invalid root note: ${rootNote}`);
  }

  const intervals = SCALE_INTERVALS[scaleType];

  for (let midiNote = startMidiNote; midiNote <= endMidiNote; midiNote++) {
    const noteIndex = midiNote % 12;
    const noteName = NOTE_NAMES[noteIndex];
    
    // Calculate distance from root note
    const distance = (noteIndex - rootIndex + 12) % 12;
    
    // Check if this note is in the scale
    const scaleDegreeIndex = intervals.indexOf(distance);
    const isInScale = scaleDegreeIndex !== -1;
    
    keys.push({
      midiNote,
      noteName: `${noteName}${Math.floor(midiNote / 12) - 1}`,
      scaleDegree: isInScale ? scaleDegreeIndex + 1 : null,
      isScaleTone: isInScale,
      isRoot: distance === 0
    });
  }

  return keys;
}

/**
 * Get all notes in a scale for a given root
 */
export function getScaleNotes(rootNote: string, scaleType: ScaleType): string[] {
  const rootIndex = NOTE_NAMES.indexOf(rootNote);
  if (rootIndex === -1) {
    throw new Error(`Invalid root note: ${rootNote}`);
  }

  const intervals = SCALE_INTERVALS[scaleType];
  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return NOTE_NAMES[noteIndex];
  });
}

/**
 * Check if a MIDI note belongs to a scale
 */
export function isNoteInScale(midiNote: number, rootNote: string, scaleType: ScaleType): boolean {
  const { name: noteName } = getNoteName(midiNote);
  const scaleNotes = getScaleNotes(rootNote, scaleType);
  return scaleNotes.includes(noteName);
}

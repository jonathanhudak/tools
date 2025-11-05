/**
 * Music Theory Utilities
 * Provides helper functions for note generation, validation, and music theory operations
 */

import { Note, Scale, Chord } from 'tonal';

// Type definitions
export interface NoteInfo {
    vexflowNote: string;
    midiNote: number;
}

export interface ValidationResult {
    isCorrect: boolean;
    message: string;
    centsOff?: number;
}

export interface ValidationOptions {
    allowOctaveError?: boolean;
    tolerance?: number;
    pitchToleranceCents?: number;
}

export interface KeySignature {
    name: string;
    sharps: number;
    flats: number;
}

export type ClefType = 'treble' | 'bass';

// Note names and their MIDI numbers (C4 = Middle C = 60)
export const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// VexFlow note names (with octaves) - natural notes only for basic mode
export const vexflowNoteNames: Record<ClefType, Record<string, number>> = {
    treble: {
        'c/4': 60, 'd/4': 62, 'e/4': 64, 'f/4': 65, 'g/4': 67, 'a/4': 69, 'b/4': 71,
        'c/5': 72, 'd/5': 74, 'e/5': 76, 'f/5': 77, 'g/5': 79, 'a/5': 81, 'b/5': 83,
        'c/6': 84
    },
    bass: {
        'a/2': 45, 'b/2': 47,
        'c/3': 48, 'd/3': 50, 'e/3': 52, 'f/3': 53, 'g/3': 55, 'a/3': 57, 'b/3': 59,
        'c/4': 60, 'd/4': 62, 'e/4': 64, 'f/4': 65
    }
};

/**
 * Convert MIDI note number to note name with octave using Tonal
 */
export function midiToNoteName(midiNote: number): string {
    return Note.fromMidi(midiNote) || '';
}

/**
 * Convert note name to MIDI number using Tonal
 */
export function noteNameToMidi(noteName: string): number {
    const midi = Note.midi(noteName);
    return midi !== null ? midi : -1;
}

/**
 * Convert MIDI note to VexFlow notation format
 */
export function midiToVexflow(midiNote: number, clef: ClefType = 'treble'): string | null {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    const noteName = noteNames[noteIndex].toLowerCase().replace('#', '#');

    // For natural notes only (no sharps/flats in basic implementation)
    if (noteName.includes('#')) {
        return null; // Skip sharps for now in basic mode
    }

    return `${noteName}/${octave}`;
}

/**
 * Generate a random note within a specified range
 */
export function generateRandomNote(
    range: string = 'c4-c5',
    clef: ClefType = 'treble',
    naturalsOnly: boolean = true
): NoteInfo | null {
    const [start, end] = range.split('-');
    const startMidi = noteNameToMidi(start.toUpperCase());
    const endMidi = noteNameToMidi(end.toUpperCase());

    if (startMidi === -1 || endMidi === -1) {
        console.error('Invalid range');
        return null;
    }

    // Get available notes from VexFlow mapping for the clef
    const availableNotes = Object.entries(vexflowNoteNames[clef])
        .filter(([_, midi]) => midi >= startMidi && midi <= endMidi)
        .map(([note, midi]) => ({ vexflowNote: note, midiNote: midi }));

    if (availableNotes.length === 0) {
        console.error('No notes available in range');
        return null;
    }

    const randomIndex = Math.floor(Math.random() * availableNotes.length);
    return availableNotes[randomIndex];
}

/**
 * Generate a random note from MIDI range
 */
export function generateRandomNoteFromMidiRange(minMidi: number, maxMidi: number, naturalsOnly: boolean = true): number {
    const availableNotes: number[] = [];

    for (let midi = minMidi; midi <= maxMidi; midi++) {
        if (naturalsOnly) {
            const noteIndex = midi % 12;
            // Only include natural notes (no sharps/flats)
            if (![1, 3, 6, 8, 10].includes(noteIndex)) {
                availableNotes.push(midi);
            }
        } else {
            availableNotes.push(midi);
        }
    }

    if (availableNotes.length === 0) {
        return minMidi;
    }

    return availableNotes[Math.floor(Math.random() * availableNotes.length)];
}

/**
 * Validate if a played note matches the target note
 */
export function validateNote(
    playedMidi: number,
    targetMidi: number,
    options: ValidationOptions = {}
): ValidationResult {
    const {
        allowOctaveError = true,
        tolerance = 0,
        pitchToleranceCents = 0
    } = options;

    if (playedMidi === targetMidi) {
        return { isCorrect: true, message: 'Perfect!', centsOff: 0 };
    }

    // Check for octave errors
    if (allowOctaveError) {
        const playedPitch = playedMidi % 12;
        const targetPitch = targetMidi % 12;

        if (playedPitch === targetPitch) {
            return {
                isCorrect: true,
                message: 'Correct note, wrong octave!'
            };
        }
    }

    // Check tolerance (for MIDI semitone tolerance)
    if (tolerance > 0) {
        const diff = Math.abs(playedMidi - targetMidi);
        if (diff <= tolerance) {
            return {
                isCorrect: true,
                message: 'Close enough!'
            };
        }
    }

    return {
        isCorrect: false,
        message: `Try again. You played ${midiToNoteName(playedMidi)}`
    };
}

/**
 * Validate pitch with cents tolerance (for microphone input)
 */
export function validatePitchWithCents(
    playedFrequency: number,
    targetMidi: number,
    toleranceCents: number = 50
): ValidationResult {
    const targetFrequency = midiToFrequency(targetMidi);
    const playedMidi = frequencyToMidi(playedFrequency);
    const centsOff = getCentsDeviation(playedFrequency, targetFrequency);

    if (Math.abs(centsOff) <= toleranceCents) {
        let message = 'Perfect!';
        if (Math.abs(centsOff) > 5) {
            message = `${Math.abs(centsOff).toFixed(0)} cents ${centsOff > 0 ? 'sharp' : 'flat'}`;
        }
        return {
            isCorrect: true,
            message,
            centsOff
        };
    }

    return {
        isCorrect: false,
        message: `Try again. You played ${midiToNoteName(playedMidi)} (${Math.abs(centsOff).toFixed(0)} cents ${centsOff > 0 ? 'sharp' : 'flat'})`,
        centsOff
    };
}

/**
 * Get frequency from MIDI note number using Tonal
 */
export function midiToFrequency(midiNote: number): number {
    const noteName = Note.fromMidi(midiNote);
    return noteName ? Note.freq(noteName) || 440 : 440;
}

/**
 * Convert frequency to MIDI note number
 */
export function frequencyToMidi(frequency: number): number {
    return Math.round(12 * Math.log2(frequency / 440) + 69);
}

/**
 * Get cents deviation between two frequencies
 */
export function getCentsDeviation(frequency: number, targetFrequency: number): number {
    return 1200 * Math.log2(frequency / targetFrequency);
}

/**
 * Get cents deviation from target MIDI note
 */
export function getCentsFromMidi(frequency: number, targetMidi: number): number {
    const targetFrequency = midiToFrequency(targetMidi);
    return getCentsDeviation(frequency, targetFrequency);
}

/**
 * Generate a major scale using Tonal
 */
export function generateMajorScale(root: string): number[] {
    const scale = Scale.get(`${root} major`);
    return scale.notes.map(note => noteNameToMidi(note)).filter(midi => midi !== -1);
}

/**
 * Generate a minor scale (natural minor) using Tonal
 */
export function generateMinorScale(root: string): number[] {
    const scale = Scale.get(`${root} minor`);
    return scale.notes.map(note => noteNameToMidi(note)).filter(midi => midi !== -1);
}

/**
 * Generate a scale by type using Tonal
 */
export function generateScale(root: string, scaleType: string = 'major'): number[] {
    const scale = Scale.get(`${root} ${scaleType}`);
    return scale.notes.map(note => noteNameToMidi(note)).filter(midi => midi !== -1);
}

/**
 * Generate a chord using Tonal
 */
export function generateChord(root: string, type: string = 'major'): number[] {
    const chord = Chord.get(`${root}${type}`);
    return chord.notes.map(note => noteNameToMidi(note)).filter(midi => midi !== -1);
}

/**
 * Get all key signatures
 */
export function getAllKeySignatures(): KeySignature[] {
    return [
        { name: 'C Major / A Minor', sharps: 0, flats: 0 },
        { name: 'G Major / E Minor', sharps: 1, flats: 0 },
        { name: 'D Major / B Minor', sharps: 2, flats: 0 },
        { name: 'A Major / F# Minor', sharps: 3, flats: 0 },
        { name: 'E Major / C# Minor', sharps: 4, flats: 0 },
        { name: 'B Major / G# Minor', sharps: 5, flats: 0 },
        { name: 'F# Major / D# Minor', sharps: 6, flats: 0 },
        { name: 'F Major / D Minor', sharps: 0, flats: 1 },
        { name: 'Bb Major / G Minor', sharps: 0, flats: 2 },
        { name: 'Eb Major / C Minor', sharps: 0, flats: 3 },
        { name: 'Ab Major / F Minor', sharps: 0, flats: 4 },
        { name: 'Db Major / Bb Minor', sharps: 0, flats: 5 },
        { name: 'Gb Major / Eb Minor', sharps: 0, flats: 6 }
    ];
}

/**
 * Get interval between two notes in semitones
 */
export function getInterval(note1: string, note2: string): number {
    const midi1 = noteNameToMidi(note1);
    const midi2 = noteNameToMidi(note2);
    return Math.abs(midi2 - midi1);
}

/**
 * Check if frequency is within valid range for instrument
 */
export function isFrequencyInRange(frequency: number, minFreq: number, maxFreq: number): boolean {
    return frequency >= minFreq && frequency <= maxFreq;
}

// Export as namespace for backward compatibility
export const MusicTheory = {
    noteNames,
    vexflowNoteNames,
    midiToNoteName,
    noteNameToMidi,
    midiToVexflow,
    generateRandomNote,
    generateRandomNoteFromMidiRange,
    validateNote,
    validatePitchWithCents,
    midiToFrequency,
    frequencyToMidi,
    getCentsDeviation,
    getCentsFromMidi,
    generateMajorScale,
    generateMinorScale,
    generateScale,
    generateChord,
    getAllKeySignatures,
    getInterval,
    isFrequencyInRange
};

// Make available globally for legacy code
if (typeof window !== 'undefined') {
    (window as any).MusicTheory = MusicTheory;
}

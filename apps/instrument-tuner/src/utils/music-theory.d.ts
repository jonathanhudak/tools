/**
 * Music Theory Utilities
 * Provides helper functions for note generation, validation, and music theory operations
 */
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
export declare const noteNames: string[];
export declare const vexflowNoteNames: Record<ClefType, Record<string, number>>;
/**
 * Convert MIDI note number to note name with octave using Tonal
 */
export declare function midiToNoteName(midiNote: number): string;
/**
 * Convert note name to MIDI number using Tonal
 */
export declare function noteNameToMidi(noteName: string): number;
/**
 * Convert MIDI note to VexFlow notation format
 */
export declare function midiToVexflow(midiNote: number, clef?: ClefType): string | null;
/**
 * Generate a random note within a specified range
 */
export declare function generateRandomNote(range?: string, clef?: ClefType, naturalsOnly?: boolean): NoteInfo | null;
/**
 * Generate a random note from MIDI range
 */
export declare function generateRandomNoteFromMidiRange(minMidi: number, maxMidi: number, naturalsOnly?: boolean): number;
/**
 * Validate if a played note matches the target note
 */
export declare function validateNote(playedMidi: number, targetMidi: number, options?: ValidationOptions): ValidationResult;
/**
 * Validate pitch with cents tolerance (for microphone input)
 */
export declare function validatePitchWithCents(playedFrequency: number, targetMidi: number, toleranceCents?: number): ValidationResult;
/**
 * Get frequency from MIDI note number using Tonal
 */
export declare function midiToFrequency(midiNote: number): number;
/**
 * Convert frequency to MIDI note number
 */
export declare function frequencyToMidi(frequency: number): number;
/**
 * Get cents deviation between two frequencies
 */
export declare function getCentsDeviation(frequency: number, targetFrequency: number): number;
/**
 * Get cents deviation from target MIDI note
 */
export declare function getCentsFromMidi(frequency: number, targetMidi: number): number;
/**
 * Generate a major scale using Tonal
 */
export declare function generateMajorScale(root: string): number[];
/**
 * Generate a minor scale (natural minor) using Tonal
 */
export declare function generateMinorScale(root: string): number[];
/**
 * Generate a scale by type using Tonal
 */
export declare function generateScale(root: string, scaleType?: string): number[];
/**
 * Generate a chord using Tonal
 */
export declare function generateChord(root: string, type?: string): number[];
/**
 * Get all key signatures
 */
export declare function getAllKeySignatures(): KeySignature[];
/**
 * Get interval between two notes in semitones
 */
export declare function getInterval(note1: string, note2: string): number;
/**
 * Check if frequency is within valid range for instrument
 */
export declare function isFrequencyInRange(frequency: number, minFreq: number, maxFreq: number): boolean;
export declare const MusicTheory: {
    noteNames: string[];
    vexflowNoteNames: Record<ClefType, Record<string, number>>;
    midiToNoteName: typeof midiToNoteName;
    noteNameToMidi: typeof noteNameToMidi;
    midiToVexflow: typeof midiToVexflow;
    generateRandomNote: typeof generateRandomNote;
    generateRandomNoteFromMidiRange: typeof generateRandomNoteFromMidiRange;
    validateNote: typeof validateNote;
    validatePitchWithCents: typeof validatePitchWithCents;
    midiToFrequency: typeof midiToFrequency;
    frequencyToMidi: typeof frequencyToMidi;
    getCentsDeviation: typeof getCentsDeviation;
    getCentsFromMidi: typeof getCentsFromMidi;
    generateMajorScale: typeof generateMajorScale;
    generateMinorScale: typeof generateMinorScale;
    generateScale: typeof generateScale;
    generateChord: typeof generateChord;
    getAllKeySignatures: typeof getAllKeySignatures;
    getInterval: typeof getInterval;
    isFrequencyInRange: typeof isFrequencyInRange;
};
//# sourceMappingURL=music-theory.d.ts.map
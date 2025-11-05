/**
 * Instrument Configuration System
 * Defines profiles for different instruments with input methods, ranges, and settings
 */

// Instrument type constants
export const InstrumentType = {
    PIANO: 'piano',
    VIOLIN: 'violin',
    GUITAR: 'guitar'
} as const;

export type InstrumentTypeValue = typeof InstrumentType[keyof typeof InstrumentType];

// Input method constants
export const InputMethod = {
    MIDI: 'midi',
    MICROPHONE: 'microphone'
} as const;

export type InputMethodValue = typeof InputMethod[keyof typeof InputMethod];

// Clef constants
export const Clef = {
    TREBLE: 'treble',
    BASS: 'bass'
} as const;

export type ClefValue = typeof Clef[keyof typeof Clef];

// Type definitions
export interface NoteRange {
    min: number;
    max: number;
}

export interface RangeConfig {
    min: number;
    max: number;
    default: NoteRange;
}

export interface TuningInfo {
    note: string;
    midi: number;
    frequency: number;
    string?: number;
}

export interface ValidationConfig {
    exactMatch: boolean;
    pitchTolerance: number;
    pitchToleranceAdvanced?: number;
    octaveFlexible: boolean;
    minDuration: number;
    minClarity?: number;
}

export interface PracticeConfig {
    defaultNoteCount: number;
    adaptiveDifficulty: boolean;
    supportedModes: string[];
    calibrationRequired?: boolean;
    tuningCheckRecommended?: boolean;
    fretIndependent?: boolean;
}

export interface UIConfig {
    showVirtualKeyboard: boolean;
    showMidiStatus: boolean;
    showPitchAccuracy: boolean;
    showMicrophoneLevel?: boolean;
    showTuningReference?: boolean;
    showCentsDeviation?: boolean;
    showFretboardReference?: boolean;
}

export interface AudioConfig {
    bufferSize: number;
    noiseGate: number;
    minFrequency: number;
    maxFrequency: number;
}

export interface InstrumentConfig {
    id: InstrumentTypeValue;
    name: string;
    displayName: string;
    emoji: string;
    inputType: InputMethodValue;
    range: RangeConfig;
    clefs: ClefValue[];
    defaultClef: ClefValue;
    polyphonic: boolean;
    requiresSustain: boolean;
    tuning?: TuningInfo[];
    validation: ValidationConfig;
    practice: PracticeConfig;
    ui: UIConfig;
    audio?: AudioConfig;
}

/**
 * Instrument configuration profiles
 * Each profile defines all settings needed for instrument-specific practice
 */
export const INSTRUMENTS: Record<InstrumentTypeValue, InstrumentConfig> = {
    [InstrumentType.PIANO]: {
        id: InstrumentType.PIANO,
        name: 'Piano',
        displayName: 'Piano/Keyboard',
        emoji: '🎹',
        inputType: InputMethod.MIDI,

        // Range settings (MIDI note numbers)
        range: {
            min: 21,  // A0
            max: 108, // C8
            default: {
                min: 48,  // C3
                max: 84   // C6
            }
        },

        // Clef settings
        clefs: [Clef.TREBLE, Clef.BASS],
        defaultClef: Clef.TREBLE,

        // Input capabilities
        polyphonic: true,  // Can detect multiple simultaneous notes
        requiresSustain: false,

        // Validation settings
        validation: {
            exactMatch: true,  // MIDI requires exact note match
            pitchTolerance: 0, // No tolerance for MIDI
            octaveFlexible: false, // Can enable for practice mode
            minDuration: 0 // No minimum duration required
        },

        // Practice settings
        practice: {
            defaultNoteCount: 20,
            adaptiveDifficulty: true,
            supportedModes: ['sight-reading', 'scales', 'chords', 'arpeggios', 'key-signatures']
        },

        // UI settings
        ui: {
            showVirtualKeyboard: true,
            showMidiStatus: true,
            showPitchAccuracy: false
        }
    },

    [InstrumentType.VIOLIN]: {
        id: InstrumentType.VIOLIN,
        name: 'Violin',
        displayName: 'Violin',
        emoji: '🎻',
        inputType: InputMethod.MICROPHONE,

        // Range settings (MIDI note numbers)
        range: {
            min: 55,  // G3
            max: 91,  // G6 (extended range)
            default: {
                min: 60,  // C4 (first position, beginner friendly)
                max: 72   // C5 (one octave, first position only)
            }
        },

        // Clef settings
        clefs: [Clef.TREBLE],
        defaultClef: Clef.TREBLE,

        // Input capabilities
        polyphonic: false,  // Monophonic pitch detection
        requiresSustain: true,

        // String tuning (open strings in scientific pitch notation)
        tuning: [
            { note: 'G3', midi: 55, frequency: 196.00 },
            { note: 'D4', midi: 62, frequency: 293.66 },
            { note: 'A4', midi: 69, frequency: 440.00 },
            { note: 'E5', midi: 76, frequency: 659.26 }
        ],

        // Validation settings
        validation: {
            exactMatch: false,
            pitchTolerance: 50,  // ±50 cents for beginners
            pitchToleranceAdvanced: 20, // ±20 cents for advanced
            octaveFlexible: false,
            minDuration: 500, // 500ms minimum note sustain
            minClarity: 0.80  // 80% pitch clarity threshold
        },

        // Practice settings
        practice: {
            defaultNoteCount: 15,
            adaptiveDifficulty: true,
            supportedModes: ['sight-reading', 'scales', 'arpeggios', 'intonation', 'key-signatures'],
            calibrationRequired: true, // Require A4 calibration
            tuningCheckRecommended: true
        },

        // UI settings
        ui: {
            showVirtualKeyboard: false,
            showMidiStatus: false,
            showPitchAccuracy: true,
            showMicrophoneLevel: true,
            showTuningReference: true,
            showCentsDeviation: true
        },

        // Audio processing settings
        audio: {
            bufferSize: 2048,  // ~46ms at 44.1kHz
            noiseGate: -40,    // dB threshold
            minFrequency: 180, // Hz (below G3)
            maxFrequency: 1600 // Hz (above G6)
        }
    },

    [InstrumentType.GUITAR]: {
        id: InstrumentType.GUITAR,
        name: 'Guitar',
        displayName: 'Guitar',
        emoji: '🎸',
        inputType: InputMethod.MICROPHONE,

        // Range settings (MIDI note numbers)
        range: {
            min: 40,  // E2
            max: 88,  // E6 (24th fret on high E)
            default: {
                min: 40,  // E2
                max: 76   // E5 (12th fret on high E)
            }
        },

        // Clef settings
        clefs: [Clef.TREBLE],
        defaultClef: Clef.TREBLE,

        // Input capabilities
        polyphonic: false,  // Monophonic for POC (polyphonic future)
        requiresSustain: true,

        // Standard tuning (EADGBE in scientific pitch notation)
        tuning: [
            { note: 'E2', midi: 40, frequency: 82.41, string: 6 },
            { note: 'A2', midi: 45, frequency: 110.00, string: 5 },
            { note: 'D3', midi: 50, frequency: 146.83, string: 4 },
            { note: 'G3', midi: 55, frequency: 196.00, string: 3 },
            { note: 'B3', midi: 59, frequency: 246.94, string: 2 },
            { note: 'E4', midi: 64, frequency: 329.63, string: 1 }
        ],

        // Validation settings
        validation: {
            exactMatch: false,
            pitchTolerance: 50,  // ±50 cents (guitar can be slightly out of tune)
            pitchToleranceAdvanced: 30, // ±30 cents for advanced
            octaveFlexible: false,
            minDuration: 400, // 400ms minimum (pluck sustain)
            minClarity: 0.75  // 75% clarity (guitar harmonics can confuse)
        },

        // Practice settings
        practice: {
            defaultNoteCount: 15,
            adaptiveDifficulty: true,
            supportedModes: ['sight-reading', 'scales', 'arpeggios', 'key-signatures'],
            calibrationRequired: false,
            tuningCheckRecommended: true,
            fretIndependent: true // Focus on pitch, not fret position
        },

        // UI settings
        ui: {
            showVirtualKeyboard: false,
            showMidiStatus: false,
            showPitchAccuracy: true,
            showMicrophoneLevel: true,
            showTuningReference: true,
            showCentsDeviation: true,
            showFretboardReference: false // Future feature
        },

        // Audio processing settings
        audio: {
            bufferSize: 2048,  // ~46ms at 44.1kHz
            noiseGate: -35,    // dB threshold (slightly higher due to picking noise)
            minFrequency: 70,  // Hz (below E2)
            maxFrequency: 1400 // Hz (above E6 fundamental)
        }
    }
};

/**
 * Get instrument configuration by ID
 */
export function getInstrument(instrumentId: string): InstrumentConfig {
    const instrument = INSTRUMENTS[instrumentId as InstrumentTypeValue];
    if (!instrument) {
        console.warn(`Unknown instrument: ${instrumentId}, defaulting to piano`);
        return INSTRUMENTS[InstrumentType.PIANO];
    }
    return instrument;
}

/**
 * Get list of all instruments
 */
export function getAllInstruments(): InstrumentConfig[] {
    return Object.values(INSTRUMENTS);
}

/**
 * Get instruments by input method
 */
export function getInstrumentsByInputMethod(inputMethod: InputMethodValue): InstrumentConfig[] {
    return getAllInstruments().filter(inst => inst.inputType === inputMethod);
}

/**
 * Check if instrument requires microphone
 */
export function requiresMicrophone(instrumentId: string): boolean {
    const instrument = getInstrument(instrumentId);
    return instrument.inputType === InputMethod.MICROPHONE;
}

/**
 * Check if instrument requires MIDI
 */
export function requiresMIDI(instrumentId: string): boolean {
    const instrument = getInstrument(instrumentId);
    return instrument.inputType === InputMethod.MIDI;
}

/**
 * Get supported modules for an instrument
 */
export function getSupportedModules(instrumentId: string): string[] {
    const instrument = getInstrument(instrumentId);
    return instrument.practice.supportedModes;
}

/**
 * Get MIDI note range for an instrument
 */
export function getNoteRange(instrumentId: string, useDefault = true): NoteRange {
    const instrument = getInstrument(instrumentId);
    return useDefault ? instrument.range.default : {
        min: instrument.range.min,
        max: instrument.range.max
    };
}

/**
 * Get tuning information for stringed instruments
 */
export function getTuning(instrumentId: string): TuningInfo[] | null {
    const instrument = getInstrument(instrumentId);
    return instrument.tuning || null;
}

/**
 * Validate note is within instrument range
 */
export function isNoteInRange(instrumentId: string, midiNote: number): boolean {
    const instrument = getInstrument(instrumentId);
    return midiNote >= instrument.range.min && midiNote <= instrument.range.max;
}

/**
 * Get pitch tolerance for an instrument
 */
export function getPitchTolerance(instrumentId: string, advanced = false): number {
    const instrument = getInstrument(instrumentId);
    if (advanced && instrument.validation.pitchToleranceAdvanced !== undefined) {
        return instrument.validation.pitchToleranceAdvanced;
    }
    return instrument.validation.pitchTolerance;
}

/**
 * Create a custom instrument profile (for future extensibility)
 */
export function createCustomInstrument(config: Partial<InstrumentConfig>): InstrumentConfig {
    // Merge with piano defaults as base
    const defaults = { ...INSTRUMENTS[InstrumentType.PIANO] };
    return {
        ...defaults,
        ...config,
        range: { ...defaults.range, ...(config.range || {}) },
        validation: { ...defaults.validation, ...(config.validation || {}) },
        practice: { ...defaults.practice, ...(config.practice || {}) },
        ui: { ...defaults.ui, ...(config.ui || {}) }
    } as InstrumentConfig;
}

/**
 * Export default instrument (Piano)
 */
export const DEFAULT_INSTRUMENT: InstrumentTypeValue = InstrumentType.PIANO;

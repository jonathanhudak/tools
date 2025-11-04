/**
 * Music Theory Utilities
 * Provides helper functions for note generation, validation, and music theory operations
 */

const MusicTheory = {
    // Note names and their MIDI numbers (C4 = Middle C = 60)
    noteNames: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],

    // VexFlow note names (with octaves)
    vexflowNoteNames: {
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
    },

    /**
     * Convert MIDI note number to note name with octave
     * @param {number} midiNote - MIDI note number (0-127)
     * @returns {string} Note name with octave (e.g., "C4")
     */
    midiToNoteName(midiNote) {
        const octave = Math.floor(midiNote / 12) - 1;
        const noteIndex = midiNote % 12;
        return this.noteNames[noteIndex] + octave;
    },

    /**
     * Convert note name to MIDI number
     * @param {string} noteName - Note name (e.g., "C4", "C#4")
     * @returns {number} MIDI note number
     */
    noteNameToMidi(noteName) {
        const match = noteName.match(/([A-G]#?)(\d+)/);
        if (!match) return -1;

        const [, note, octave] = match;
        const noteIndex = this.noteNames.indexOf(note);
        if (noteIndex === -1) return -1;

        return (parseInt(octave) + 1) * 12 + noteIndex;
    },

    /**
     * Convert MIDI note to VexFlow notation format
     * @param {number} midiNote - MIDI note number
     * @param {string} clef - 'treble' or 'bass'
     * @returns {string} VexFlow note format (e.g., "c/4")
     */
    midiToVexflow(midiNote, clef = 'treble') {
        const octave = Math.floor(midiNote / 12) - 1;
        const noteIndex = midiNote % 12;
        const noteName = this.noteNames[noteIndex].toLowerCase().replace('#', '#');

        // For natural notes only (no sharps/flats in basic implementation)
        if (noteName.includes('#')) {
            return null; // Skip sharps for now in basic mode
        }

        return `${noteName}/${octave}`;
    },

    /**
     * Generate a random note within a specified range
     * @param {string} range - Range string (e.g., "c4-c5")
     * @param {string} clef - 'treble' or 'bass'
     * @param {boolean} naturalsOnly - If true, only return natural notes (no sharps/flats)
     * @returns {Object} Object with midiNote and vexflowNote
     */
    generateRandomNote(range = 'c4-c5', clef = 'treble', naturalsOnly = true) {
        const [start, end] = range.split('-');
        const startMidi = this.noteNameToMidi(start.toUpperCase());
        const endMidi = this.noteNameToMidi(end.toUpperCase());

        // Get available notes from VexFlow mapping for the clef
        const availableNotes = Object.entries(this.vexflowNoteNames[clef])
            .filter(([note, midi]) => midi >= startMidi && midi <= endMidi)
            .map(([note, midi]) => ({ vexflowNote: note, midiNote: midi }));

        if (availableNotes.length === 0) {
            console.error('No notes available in range');
            return null;
        }

        const randomIndex = Math.floor(Math.random() * availableNotes.length);
        return availableNotes[randomIndex];
    },

    /**
     * Validate if a played note matches the target note
     * @param {number} playedMidi - MIDI number of played note
     * @param {number} targetMidi - MIDI number of target note
     * @param {Object} options - Validation options
     * @returns {Object} Object with isCorrect and message
     */
    validateNote(playedMidi, targetMidi, options = {}) {
        const {
            allowOctaveError = true,
            tolerance = 0
        } = options;

        if (playedMidi === targetMidi) {
            return { isCorrect: true, message: 'Perfect!' };
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

        // Check tolerance (for advanced features)
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
            message: `Try again. You played ${this.midiToNoteName(playedMidi)}`
        };
    },

    /**
     * Get frequency from MIDI note number
     * @param {number} midiNote - MIDI note number
     * @returns {number} Frequency in Hz
     */
    midiToFrequency(midiNote) {
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    },

    /**
     * Generate a major scale
     * @param {string} root - Root note (e.g., "C4")
     * @returns {Array} Array of MIDI note numbers
     */
    generateMajorScale(root) {
        const rootMidi = this.noteNameToMidi(root);
        const intervals = [0, 2, 4, 5, 7, 9, 11, 12]; // Major scale intervals
        return intervals.map(interval => rootMidi + interval);
    },

    /**
     * Generate a minor scale (natural minor)
     * @param {string} root - Root note (e.g., "A4")
     * @returns {Array} Array of MIDI note numbers
     */
    generateMinorScale(root) {
        const rootMidi = this.noteNameToMidi(root);
        const intervals = [0, 2, 3, 5, 7, 8, 10, 12]; // Natural minor intervals
        return intervals.map(interval => rootMidi + interval);
    },

    /**
     * Generate a chord
     * @param {string} root - Root note (e.g., "C4")
     * @param {string} type - Chord type ('major', 'minor', 'major7', etc.)
     * @returns {Array} Array of MIDI note numbers
     */
    generateChord(root, type = 'major') {
        const rootMidi = this.noteNameToMidi(root);
        const chordIntervals = {
            major: [0, 4, 7],
            minor: [0, 3, 7],
            diminished: [0, 3, 6],
            augmented: [0, 4, 8],
            major7: [0, 4, 7, 11],
            minor7: [0, 3, 7, 10],
            dominant7: [0, 4, 7, 10]
        };

        const intervals = chordIntervals[type] || chordIntervals.major;
        return intervals.map(interval => rootMidi + interval);
    },

    /**
     * Get all key signatures
     * @returns {Array} Array of key signature objects
     */
    getAllKeySignatures() {
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
};

// Make available globally
window.MusicTheory = MusicTheory;

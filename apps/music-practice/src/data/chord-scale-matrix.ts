/**
 * Chord-Scale Matrix Data Model
 * Based on Jeff Schneider's "Last Chord Scale Charts" system
 *
 * This module contains the complete 28-entry chord-scale matrix
 * (7 degrees × 4 scale types) that maps chord qualities to their
 * parent scales and modes.
 */

import { Scale, Note } from 'tonal';

export type ScaleType = "major" | "naturalMinor" | "melodicMinor" | "harmonicMinor";
export type Degree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Represents a single entry in the chord-scale matrix
 */
export interface ChordScaleEntry {
  scaleType: ScaleType;
  degree: Degree;
  chordQuality: string;
  modeName: string;
  romanNumeral: string;
  
  // Reference chord from library for voicing display
  // Format: "chord-id" (e.g., "c-major", "d-minor-7")
  chordId?: string;
  // If chord has multiple voicings, which one to use (0-indexed)
  voicingIndex?: number;
}

/**
 * The complete chord-scale matrix (28 entries total)
 *
 * This is the foundation of the Jeff Schneider system:
 * - 4 scale families (Major, Natural Minor, Melodic Minor, Harmonic Minor)
 * - 7 degrees per scale
 * - Each degree has a specific chord quality and mode
 */
export const CHORD_SCALE_MATRIX: ChordScaleEntry[] = [
  // ============ MAJOR SCALE ============
  {
    scaleType: "major",
    degree: 1,
    chordQuality: "Maj7",
    modeName: "Ionian",
    romanNumeral: "IMaj7",
    chordId: "c-major-7",
    voicingIndex: 0
  },
  {
    scaleType: "major",
    degree: 2,
    chordQuality: "m7",
    modeName: "Dorian",
    romanNumeral: "iim7",
    chordId: "d-minor-7",
    voicingIndex: 0
  },
  {
    scaleType: "major",
    degree: 3,
    chordQuality: "m7",
    modeName: "Phrygian",
    romanNumeral: "iiim7",
    chordId: "e-minor-7",
    voicingIndex: 0
  },
  {
    scaleType: "major",
    degree: 4,
    chordQuality: "Maj7",
    modeName: "Lydian",
    romanNumeral: "IVMaj7",
    chordId: "f-major-7",
    voicingIndex: 0
  },
  {
    scaleType: "major",
    degree: 5,
    chordQuality: "7",
    modeName: "Mixolydian",
    romanNumeral: "V7",
    chordId: "g-dominant-7",
    voicingIndex: 0
  },
  {
    scaleType: "major",
    degree: 6,
    chordQuality: "m7",
    modeName: "Aeolian",
    romanNumeral: "vim7",
    chordId: "a-minor-7",
    voicingIndex: 0
  },
  {
    scaleType: "major",
    degree: 7,
    chordQuality: "m7b5",
    modeName: "Locrian",
    romanNumeral: "viim7b5",
    chordId: "b-minor-7b5",
    voicingIndex: 0
  },

  // ============ NATURAL MINOR SCALE ============
  {
    scaleType: "naturalMinor",
    degree: 1,
    chordQuality: "m7",
    modeName: "Aeolian",
    romanNumeral: "im7",
    chordId: "a-minor-7",
    voicingIndex: 0
  },
  {
    scaleType: "naturalMinor",
    degree: 2,
    chordQuality: "m7b5",
    modeName: "Locrian",
    romanNumeral: "iim7b5",
    chordId: "b-minor-7b5",
    voicingIndex: 0
  },
  {
    scaleType: "naturalMinor",
    degree: 3,
    chordQuality: "Maj7",
    modeName: "Ionian",
    romanNumeral: "bIIIMaj7",
    chordId: "c-major-7",
    voicingIndex: 0
  },
  {
    scaleType: "naturalMinor",
    degree: 4,
    chordQuality: "m7",
    modeName: "Dorian",
    romanNumeral: "ivm7",
    chordId: "d-minor-7",
    voicingIndex: 0
  },
  {
    scaleType: "naturalMinor",
    degree: 5,
    chordQuality: "m7",
    modeName: "Phrygian",
    romanNumeral: "vm7",
    chordId: "e-minor-7",
    voicingIndex: 0
  },
  {
    scaleType: "naturalMinor",
    degree: 6,
    chordQuality: "Maj7",
    modeName: "Lydian",
    romanNumeral: "bVIMaj7",
    chordId: "f-major-7",
    voicingIndex: 0
  },
  {
    scaleType: "naturalMinor",
    degree: 7,
    chordQuality: "7",
    modeName: "Mixolydian",
    romanNumeral: "bVII7",
    chordId: "g-dominant-7",
    voicingIndex: 0
  },

  // ============ MELODIC MINOR SCALE ============
  {
    scaleType: "melodicMinor",
    degree: 1,
    chordQuality: "mMaj7",
    modeName: "Melodic Minor",
    romanNumeral: "imMaj7",
    chordId: "a-minor-major-7",
    voicingIndex: 0
  },
  {
    scaleType: "melodicMinor",
    degree: 2,
    chordQuality: "m7",
    modeName: "Dorian b2",
    romanNumeral: "iim7",
    chordId: "b-minor-7",
    voicingIndex: 0
  },
  {
    scaleType: "melodicMinor",
    degree: 3,
    chordQuality: "Maj7#5",
    modeName: "Lydian Augmented",
    romanNumeral: "bIIIMaj7#5",
    chordId: "c-augmented-major-7",
    voicingIndex: 0
  },
  {
    scaleType: "melodicMinor",
    degree: 4,
    chordQuality: "7",
    modeName: "Lydian Dominant",
    romanNumeral: "IV7",
    chordId: "d-dominant-7",
    voicingIndex: 0
  },
  {
    scaleType: "melodicMinor",
    degree: 5,
    chordQuality: "7",
    modeName: "Mixolydian b6",
    romanNumeral: "V7",
    chordId: "e-dominant-7",
    voicingIndex: 0
  },
  {
    scaleType: "melodicMinor",
    degree: 6,
    chordQuality: "m7b5",
    modeName: "Locrian #2",
    romanNumeral: "vim7b5",
    chordId: "f-sharp-minor-7b5",
    voicingIndex: 0
  },
  {
    scaleType: "melodicMinor",
    degree: 7,
    chordQuality: "m7b5",
    modeName: "Super Locrian (Altered)",
    romanNumeral: "viim7b5",
    chordId: "g-sharp-minor-7b5",
    voicingIndex: 0
  },

  // ============ HARMONIC MINOR SCALE ============
  {
    scaleType: "harmonicMinor",
    degree: 1,
    chordQuality: "mMaj7",
    modeName: "Harmonic Minor",
    romanNumeral: "imMaj7",
    chordId: "a-minor-major-7",
    voicingIndex: 0
  },
  {
    scaleType: "harmonicMinor",
    degree: 2,
    chordQuality: "m7b5",
    modeName: "Locrian #6",
    romanNumeral: "iim7b5",
    chordId: "b-minor-7b5",
    voicingIndex: 0
  },
  {
    scaleType: "harmonicMinor",
    degree: 3,
    chordQuality: "Maj7#5",
    modeName: "Ionian #5",
    romanNumeral: "bIIIMaj7#5",
    chordId: "c-augmented-major-7",
    voicingIndex: 0
  },
  {
    scaleType: "harmonicMinor",
    degree: 4,
    chordQuality: "m7",
    modeName: "Dorian #4",
    romanNumeral: "ivm7",
    chordId: "d-minor-7",
    voicingIndex: 0
  },
  {
    scaleType: "harmonicMinor",
    degree: 5,
    chordQuality: "7",
    modeName: "Phrygian Dominant",
    romanNumeral: "V7",
    chordId: "e-dominant-7",
    voicingIndex: 0
  },
  {
    scaleType: "harmonicMinor",
    degree: 6,
    chordQuality: "Maj7",
    modeName: "Lydian #2",
    romanNumeral: "bVIMaj7",
    chordId: "f-major-7",
    voicingIndex: 0
  },
  {
    scaleType: "harmonicMinor",
    degree: 7,
    chordQuality: "dim7",
    modeName: "Super Locrian bb7",
    romanNumeral: "viidim7",
    chordId: "g-sharp-diminished-7",
    voicingIndex: 0
  },
];

/**
 * Get all sources (parent scales) for a given chord quality
 *
 * @param chordQuality - The chord quality to search for (e.g., "m7", "Maj7", "7")
 * @returns Array of ChordScaleEntry objects where this chord quality appears
 *
 * @example
 * // Find all sources for Dm7
 * const sources = getChordSources("m7");
 * // Returns entries for:
 * // - Major scale degrees 2, 3, 6 (Dorian, Phrygian, Aeolian)
 * // - Natural Minor degrees 1, 4, 5
 * // - Melodic Minor degree 2
 * // - Harmonic Minor degree 4
 */
export function getChordSources(chordQuality: string): ChordScaleEntry[] {
  return CHORD_SCALE_MATRIX.filter(entry => entry.chordQuality === chordQuality);
}

/**
 * Build all 7 chords for a specific scale type
 *
 * @param scaleType - The scale family
 * @returns Array of all 7 chord entries in order (degree 1-7)
 *
 * @example
 * const chords = buildScaleChords("major");
 * // Returns: [IMaj7, iim7, iiim7, IVMaj7, V7, vim7, viim7b5]
 */
export function buildScaleChords(scaleType: ScaleType): ChordScaleEntry[] {
  return CHORD_SCALE_MATRIX
    .filter(entry => entry.scaleType === scaleType)
    .sort((a, b) => a.degree - b.degree);
}

/**
 * Get chord information for a specific scale type and degree
 *
 * @param scaleType - The scale family
 * @param degree - The scale degree (1-7)
 * @returns The ChordScaleEntry for that degree, or null if not found
 *
 * @example
 * const info = getDegreeInfo("melodicMinor", 4);
 * // Returns: { chordQuality: "7", modeName: "Lydian Dominant", ... }
 */
export function getDegreeInfo(scaleType: ScaleType, degree: Degree): ChordScaleEntry | undefined {
  return CHORD_SCALE_MATRIX.find(
    entry => entry.scaleType === scaleType && entry.degree === degree
  ) || undefined;
}

/**
 * Get all unique chord qualities in the matrix
 *
 * @returns Array of unique chord quality strings
 *
 * @example
 * const qualities = getAllChordQualities();
 * // Returns: ["Maj7", "m7", "7", "m7b5", "mMaj7", "Maj7#5", "dim7"]
 */
export function getAllChordQualities(): string[] {
  const qualities = new Set(CHORD_SCALE_MATRIX.map(entry => entry.chordQuality));
  return Array.from(qualities);
}

/**
 * Get all scale type display names
 */
export const SCALE_TYPE_NAMES: Record<ScaleType, string> = {
  major: "Major",
  naturalMinor: "Natural Minor",
  melodicMinor: "Melodic Minor",
  harmonicMinor: "Harmonic Minor",
};

/**
 * Helper to get a chord from the library by ID
 * Used for displaying voicings in the matrix trainer
 *
 * @param chordId - The chord ID (e.g., "c-major-7")
 * @returns The Chord object or null if not found
 *
 * @example
 * const chord = getChordFromLibrary("c-major-7");
 * // Can then display chord.voicings[0] in ChordVoicingDisplay
 */
export async function getChordFromLibrary(chordId: string) {
  // Lazy import to avoid circular dependency
  const { CHORD_LIBRARY } = await import('@/lib/chord-library');
  return CHORD_LIBRARY.find(c => c.id === chordId);
}

/**
 * Look up the correct chord for a given scale degree in any key.
 * This is KEY-AWARE: it computes the transposed chord name and looks it up
 * by shortName, falling back to chordId for the default key of C.
 *
 * @param scaleType - The scale family
 * @param degree - Scale degree (1-7)
 * @param rootKey - Key root (e.g., 'D', 'Bb'). Defaults to 'C'.
 * @returns The Chord object or null
 *
 * @example
 * // In D major, degree 3 = F#m7
 * const chord = await getChordForDegree('major', 3, 'D');
 */
export async function getChordForDegree(
  scaleType: ScaleType,
  degree: Degree,
  rootKey = 'C',
) {
  const { getChordByShortName, CHORD_LIBRARY } = await import('@/lib/chord-library');

  // Compute the transposed chord name (e.g., "F#m7" for degree 3 in D major)
  const chordName = getChordName(scaleType, degree, rootKey);
  if (!chordName) return null;

  // First try exact shortName match (key-aware)
  const byName = getChordByShortName(chordName);
  if (byName) return byName;

  // Fallback: try the hardcoded chordId (only correct for key of C)
  const entry = getDegreeInfo(scaleType, degree);
  if (entry?.chordId) {
    return CHORD_LIBRARY.find(c => c.id === entry.chordId) ?? null;
  }

  return null;
}

/**
 * Maps ScaleType to tonal library scale names
 */
const SCALE_TYPE_TO_TONAL: Record<ScaleType, string> = {
  major: 'major',
  naturalMinor: 'minor',
  melodicMinor: 'melodic minor',
  harmonicMinor: 'harmonic minor',
};

/**
 * Get note names (with octave) for a mode built from any root key.
 * Builds the parent scale from `rootNote`, then rotates to the given degree
 * so notes ascend correctly.
 *
 * @param scaleType - The scale family
 * @param degree    - Scale degree to rotate to (1 = root mode, 2 = second mode, etc.)
 * @param rootNote  - Root note of the *parent* scale (e.g. 'G' for G Major). Defaults to 'C'.
 * @param rootOctave - Starting octave for the parent scale root. Defaults to 4.
 *
 * @example
 * getModeNotes('major', 1)        // C Ionian:  ["C4","D4","E4","F4","G4","A4","B4"]
 * getModeNotes('major', 2)        // D Dorian:  ["D4","E4","F4","G4","A4","B4","C5"]
 * getModeNotes('major', 2, 'G')   // A Dorian:  ["A4","B4","C5","D5","E5","F#5","G5"]
 * getModeNotes('major', 5, 'Bb')  // F Mixolydian: ["F4","G4","A4","Bb4","C5","D5","Eb5"]
 */
export function getModeNotes(
  scaleType: ScaleType,
  degree: Degree,
  rootNote = 'C',
  rootOctave = 4,
): string[] {
  const scale = Scale.get(`${rootNote}${rootOctave} ${SCALE_TYPE_TO_TONAL[scaleType]}`);
  if (!scale.notes.length) return [];

  const rotateBy = degree - 1;
  const rotated = [
    ...scale.notes.slice(rotateBy),
    ...scale.notes.slice(0, rotateBy),
  ];

  // Fix octaves so notes ascend monotonically
  const result: string[] = [rotated[0]];
  for (let i = 1; i < rotated.length; i++) {
    const prevMidi = Note.midi(result[i - 1]);
    if (prevMidi === null) continue;

    let note = rotated[i];
    let midi = Note.midi(note);

    while (midi !== null && midi <= prevMidi) {
      const parsed = Note.get(note);
      note = parsed.pc + ((parsed.oct ?? 0) + 1);
      midi = Note.midi(note);
    }
    result.push(note);
  }

  return result;
}

/**
 * Get just the pitch-class names (no octave) for a mode in a given key.
 *
 * @example
 * getModeNoteNames('major', 5, 'G') // D Mixolydian: ["D","E","F#","G","A","B","C"]
 */
export function getModeNoteNames(
  scaleType: ScaleType,
  degree: Degree,
  rootNote = 'C',
): string[] {
  return getModeNotes(scaleType, degree, rootNote).map(n => Note.get(n).pc ?? n);
}

/**
 * Get the chord name (root + quality) for a given degree in a key.
 *
 * @example
 * getChordName('major', 5, 'G') // "D7"
 * getChordName('major', 1, 'Bb') // "BbMaj7"
 */
export function getChordName(
  scaleType: ScaleType,
  degree: Degree,
  rootNote = 'C',
): string {
  const entry = getDegreeInfo(scaleType, degree);
  if (!entry) return '';
  const noteNames = getModeNoteNames(scaleType, degree, rootNote);
  const chordRoot = noteNames[0] ?? '';
  return `${chordRoot}${entry.chordQuality}`;
}

/**
 * Get MIDI note numbers for a mode.
 *
 * @example
 * getModeNotesAsMidi('major', 2) // D Dorian: [62, 64, 65, 67, 69, 71, 72]
 * getModeNotesAsMidi('major', 2, 'G') // A Dorian: [69, 71, 72, 74, 76, 78, 79]
 */
export function getModeNotesAsMidi(
  scaleType: ScaleType,
  degree: Degree,
  rootNote = 'C',
  rootOctave = 4,
): number[] {
  return getModeNotes(scaleType, degree, rootNote, rootOctave)
    .map(n => Note.midi(n))
    .filter((m): m is number => m !== null);
}

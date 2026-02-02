/**
 * Chord-Scale Matrix Data Model
 * Based on Jeff Schneider's "Last Chord Scale Charts" system
 *
 * This module contains the complete 28-entry chord-scale matrix
 * (7 degrees × 4 scale types) that maps chord qualities to their
 * parent scales and modes.
 */

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
    romanNumeral: "IMaj7"
  },
  {
    scaleType: "major",
    degree: 2,
    chordQuality: "m7",
    modeName: "Dorian",
    romanNumeral: "iim7"
  },
  {
    scaleType: "major",
    degree: 3,
    chordQuality: "m7",
    modeName: "Phrygian",
    romanNumeral: "iiim7"
  },
  {
    scaleType: "major",
    degree: 4,
    chordQuality: "Maj7",
    modeName: "Lydian",
    romanNumeral: "IVMaj7"
  },
  {
    scaleType: "major",
    degree: 5,
    chordQuality: "7",
    modeName: "Mixolydian",
    romanNumeral: "V7"
  },
  {
    scaleType: "major",
    degree: 6,
    chordQuality: "m7",
    modeName: "Aeolian",
    romanNumeral: "vim7"
  },
  {
    scaleType: "major",
    degree: 7,
    chordQuality: "m7b5",
    modeName: "Locrian",
    romanNumeral: "viim7b5"
  },

  // ============ NATURAL MINOR SCALE ============
  {
    scaleType: "naturalMinor",
    degree: 1,
    chordQuality: "m7",
    modeName: "Aeolian",
    romanNumeral: "im7"
  },
  {
    scaleType: "naturalMinor",
    degree: 2,
    chordQuality: "m7b5",
    modeName: "Locrian",
    romanNumeral: "iim7b5"
  },
  {
    scaleType: "naturalMinor",
    degree: 3,
    chordQuality: "Maj7",
    modeName: "Ionian",
    romanNumeral: "bIIIMaj7"
  },
  {
    scaleType: "naturalMinor",
    degree: 4,
    chordQuality: "m7",
    modeName: "Dorian",
    romanNumeral: "ivm7"
  },
  {
    scaleType: "naturalMinor",
    degree: 5,
    chordQuality: "m7",
    modeName: "Phrygian",
    romanNumeral: "vm7"
  },
  {
    scaleType: "naturalMinor",
    degree: 6,
    chordQuality: "Maj7",
    modeName: "Lydian",
    romanNumeral: "bVIMaj7"
  },
  {
    scaleType: "naturalMinor",
    degree: 7,
    chordQuality: "7",
    modeName: "Mixolydian",
    romanNumeral: "bVII7"
  },

  // ============ MELODIC MINOR SCALE ============
  {
    scaleType: "melodicMinor",
    degree: 1,
    chordQuality: "mMaj7",
    modeName: "Melodic Minor",
    romanNumeral: "imMaj7"
  },
  {
    scaleType: "melodicMinor",
    degree: 2,
    chordQuality: "m7",
    modeName: "Dorian b2",
    romanNumeral: "iim7"
  },
  {
    scaleType: "melodicMinor",
    degree: 3,
    chordQuality: "Maj7#5",
    modeName: "Lydian Augmented",
    romanNumeral: "bIIIMaj7#5"
  },
  {
    scaleType: "melodicMinor",
    degree: 4,
    chordQuality: "7",
    modeName: "Lydian Dominant",
    romanNumeral: "IV7"
  },
  {
    scaleType: "melodicMinor",
    degree: 5,
    chordQuality: "7",
    modeName: "Mixolydian b6",
    romanNumeral: "V7"
  },
  {
    scaleType: "melodicMinor",
    degree: 6,
    chordQuality: "m7b5",
    modeName: "Locrian #2",
    romanNumeral: "vim7b5"
  },
  {
    scaleType: "melodicMinor",
    degree: 7,
    chordQuality: "m7b5",
    modeName: "Super Locrian (Altered)",
    romanNumeral: "viim7b5"
  },

  // ============ HARMONIC MINOR SCALE ============
  {
    scaleType: "harmonicMinor",
    degree: 1,
    chordQuality: "mMaj7",
    modeName: "Harmonic Minor",
    romanNumeral: "imMaj7"
  },
  {
    scaleType: "harmonicMinor",
    degree: 2,
    chordQuality: "m7b5",
    modeName: "Locrian #6",
    romanNumeral: "iim7b5"
  },
  {
    scaleType: "harmonicMinor",
    degree: 3,
    chordQuality: "Maj7#5",
    modeName: "Ionian #5",
    romanNumeral: "bIIIMaj7#5"
  },
  {
    scaleType: "harmonicMinor",
    degree: 4,
    chordQuality: "m7",
    modeName: "Dorian #4",
    romanNumeral: "ivm7"
  },
  {
    scaleType: "harmonicMinor",
    degree: 5,
    chordQuality: "7",
    modeName: "Phrygian Dominant",
    romanNumeral: "V7"
  },
  {
    scaleType: "harmonicMinor",
    degree: 6,
    chordQuality: "Maj7",
    modeName: "Lydian #2",
    romanNumeral: "bVIMaj7"
  },
  {
    scaleType: "harmonicMinor",
    degree: 7,
    chordQuality: "dim7",
    modeName: "Super Locrian bb7",
    romanNumeral: "viidim7"
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
export function getDegreeInfo(scaleType: ScaleType, degree: Degree): ChordScaleEntry | null {
  return CHORD_SCALE_MATRIX.find(
    entry => entry.scaleType === scaleType && entry.degree === degree
  ) || null;
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

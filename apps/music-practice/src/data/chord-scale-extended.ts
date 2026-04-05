/**
 * Extended Chord-Scale Matrix
 *
 * Extends the base chord-scale-matrix.ts (28 entries for Major, Natural Minor,
 * Melodic Minor, Harmonic Minor) with:
 *
 * 1. Harmonic Major family (7 new entries, degrees 1-7)
 * 2. Extended chord-scale mappings for non-diatonic / altered dominant chords
 *
 * Scale IDs reference the scale-registry.ts identifiers.
 */

import type { ChordScaleEntry, Degree } from './chord-scale-matrix';

// ─── Extended Scale Type ─────────────────────────────────────────────────────

/** Scale type that includes Harmonic Major in addition to the base four */
export type ExtendedScaleType =
  | 'major'
  | 'naturalMinor'
  | 'melodicMinor'
  | 'harmonicMinor'
  | 'harmonicMajor';

// ─── Harmonic Major Matrix ───────────────────────────────────────────────────

/**
 * The Harmonic Major scale family — 7 modes built from the Harmonic Major
 * scale (1 2 3 4 5 b6 7). This is the "mirror" of Harmonic Minor:
 * Major scale with a lowered 6th degree.
 *
 * | Degree | Chord     | Mode                   | Roman Numeral |
 * |--------|-----------|------------------------|---------------|
 * | 1      | Maj7      | Harmonic Major         | IMaj7         |
 * | 2      | m7b5      | Dorian b5              | iim7b5        |
 * | 3      | m7        | Phrygian b4            | iiim7         |
 * | 4      | mMaj7     | Lydian b3              | ivmMaj7       |
 * | 5      | 7         | Mixolydian b2          | V7            |
 * | 6      | Maj7#5    | Lydian Augmented #2    | bVIMaj7#5     |
 * | 7      | dim7      | Locrian bb7            | viidim7       |
 */
export const HARMONIC_MAJOR_MATRIX: ChordScaleEntry[] = [
  {
    scaleType: 'harmonicMajor' as any,
    degree: 1 as Degree,
    chordQuality: 'Maj7',
    modeName: 'Harmonic Major',
    romanNumeral: 'IMaj7',
  },
  {
    scaleType: 'harmonicMajor' as any,
    degree: 2 as Degree,
    chordQuality: 'm7b5',
    modeName: 'Dorian b5',
    romanNumeral: 'iim7b5',
  },
  {
    scaleType: 'harmonicMajor' as any,
    degree: 3 as Degree,
    chordQuality: 'm7',
    modeName: 'Phrygian b4',
    romanNumeral: 'iiim7',
  },
  {
    scaleType: 'harmonicMajor' as any,
    degree: 4 as Degree,
    chordQuality: 'mMaj7',
    modeName: 'Lydian b3',
    romanNumeral: 'ivmMaj7',
  },
  {
    scaleType: 'harmonicMajor' as any,
    degree: 5 as Degree,
    chordQuality: '7',
    modeName: 'Mixolydian b2',
    romanNumeral: 'V7',
  },
  {
    scaleType: 'harmonicMajor' as any,
    degree: 6 as Degree,
    chordQuality: 'Maj7#5',
    modeName: 'Lydian Augmented #2',
    romanNumeral: 'bVIMaj7#5',
  },
  {
    scaleType: 'harmonicMajor' as any,
    degree: 7 as Degree,
    chordQuality: 'dim7',
    modeName: 'Locrian bb7',
    romanNumeral: 'viidim7',
  },
];

// ─── Extended Chord-Scale Mappings ───────────────────────────────────────────

/**
 * Mapping from a non-diatonic (or ambiguous) chord quality to its
 * recommended scale choices. Useful for altered dominants, diminished
 * passing chords, augmented triads, sus chords, and sixth chords.
 */
export interface ExtendedChordScaleMapping {
  /** Chord quality symbol, e.g. '7#11', '7alt', '7b9' */
  chordQuality: string;
  /** Primary (first-choice) scale ID from scale-registry */
  primaryScale: string;
  /** Alternative scale IDs that also fit */
  secondaryScales: string[];
  /** Brief description of the sound / usage */
  description: string;
  /** Searchable tags */
  tags: string[];
}

/**
 * Extended chord-scale mappings for non-diatonic chord qualities.
 *
 * These cover altered dominants, diminished chords, augmented triads,
 * sus chords, and sixth chords — situations where the basic diatonic
 * matrix doesn't provide a direct answer.
 */
export const EXTENDED_CHORD_SCALE_MAPPINGS: ExtendedChordScaleMapping[] = [
  {
    chordQuality: '7#11',
    primaryScale: 'lydian-dominant',
    secondaryScales: [],
    description: 'Dominant 7th with raised 11th — Lydian Dominant is the definitive choice',
    tags: ['dominant', 'lydian', 'non-diatonic', '#11'],
  },
  {
    chordQuality: '7b9',
    primaryScale: 'diminished-hw',
    secondaryScales: ['phrygian-dominant'],
    description: 'Dominant 7th with flat 9 — half-whole diminished or Phrygian Dominant',
    tags: ['dominant', 'altered', 'diminished', 'b9'],
  },
  {
    chordQuality: '7#9',
    primaryScale: 'diminished-hw',
    secondaryScales: ['altered'],
    description: 'Dominant 7th with sharp 9 ("Hendrix chord") — diminished or altered scale',
    tags: ['dominant', 'altered', 'diminished', '#9'],
  },
  {
    chordQuality: '7alt',
    primaryScale: 'altered',
    secondaryScales: [],
    description: 'Fully altered dominant — the altered (super-locrian) scale is the standard choice',
    tags: ['dominant', 'altered', 'jazz'],
  },
  {
    chordQuality: '7#5',
    primaryScale: 'whole-tone',
    secondaryScales: ['altered'],
    description: 'Augmented dominant 7th — whole-tone scale or altered scale',
    tags: ['dominant', 'augmented', 'whole-tone', '#5'],
  },
  {
    chordQuality: '7b5',
    primaryScale: 'whole-tone',
    secondaryScales: ['lydian-dominant'],
    description: 'Dominant 7th with flat 5 — whole-tone or Lydian Dominant (enharmonic #11)',
    tags: ['dominant', 'whole-tone', 'b5', 'tritone-sub'],
  },
  {
    chordQuality: '7b9b13',
    primaryScale: 'phrygian-dominant',
    secondaryScales: [],
    description: 'Dominant 7th with b9 and b13 — Phrygian Dominant (5th mode of Harmonic Minor)',
    tags: ['dominant', 'phrygian', 'harmonic-minor', 'b9', 'b13'],
  },
  {
    chordQuality: 'dim',
    primaryScale: 'diminished-wh',
    secondaryScales: [],
    description: 'Diminished triad — whole-half diminished scale',
    tags: ['diminished', 'triad', 'symmetric'],
  },
  {
    chordQuality: 'aug',
    primaryScale: 'whole-tone',
    secondaryScales: ['lydian-augmented'],
    description: 'Augmented triad — whole-tone or Lydian Augmented',
    tags: ['augmented', 'triad', 'whole-tone', 'symmetric'],
  },
  {
    chordQuality: 'sus4',
    primaryScale: 'mixolydian',
    secondaryScales: ['dorian'],
    description: 'Sus4 chord — Mixolydian (dominant function) or Dorian (minor function)',
    tags: ['sus', 'quartal', 'modal'],
  },
  {
    chordQuality: '6',
    primaryScale: 'ionian',
    secondaryScales: ['lydian'],
    description: 'Major 6th chord — Ionian or Lydian',
    tags: ['major', 'sixth', 'tonic'],
  },
  {
    chordQuality: 'm6',
    primaryScale: 'dorian',
    secondaryScales: ['melodic-minor'],
    description: 'Minor 6th chord — Dorian (natural 6) or Melodic Minor',
    tags: ['minor', 'sixth', 'dorian'],
  },
  {
    chordQuality: '7sus4',
    primaryScale: 'mixolydian',
    secondaryScales: ['dorian'],
    description: 'Dominant 7sus4 — Mixolydian or Dorian',
    tags: ['dominant', 'sus', 'modal'],
  },
  {
    chordQuality: '13#11',
    primaryScale: 'lydian-dominant',
    secondaryScales: [],
    description: 'Dominant 13th with #11 — Lydian Dominant',
    tags: ['dominant', 'lydian', 'extended', '#11'],
  },
];

// ─── Lookup Helpers ──────────────────────────────────────────────────────────

/**
 * Look up extended scale recommendations for a given chord quality.
 *
 * Searches the `EXTENDED_CHORD_SCALE_MAPPINGS` array and returns
 * the primary scale plus any secondary alternatives.
 *
 * @param quality - Chord quality string (e.g. '7alt', '7#11', 'dim')
 * @returns Object with `primaryScale` and `secondaryScales`, or `null` if
 *          the quality has no extended mapping.
 *
 * @example
 * ```ts
 * const result = getExtendedScalesForChord('7alt');
 * // { primaryScale: 'altered', secondaryScales: [] }
 *
 * const result2 = getExtendedScalesForChord('7b9');
 * // { primaryScale: 'diminished-hw', secondaryScales: ['phrygian-dominant'] }
 * ```
 */
export function getExtendedScalesForChord(
  quality: string,
): { primaryScale: string; secondaryScales: string[] } | null {
  const mapping = EXTENDED_CHORD_SCALE_MAPPINGS.find(
    (m) => m.chordQuality === quality,
  );

  if (!mapping) return null;

  return {
    primaryScale: mapping.primaryScale,
    secondaryScales: mapping.secondaryScales,
  };
}

/**
 * Circle of Fifths — Complete Key Relationship Data
 *
 * Provides the full circle of fifths with:
 * - All 12 major keys in clockwise order (ascending fifths)
 * - Relative minor for each major key
 * - Key signature (sharps/flats count and which notes)
 * - Diatonic chord qualities at every degree (triads and 7ths)
 * - Enharmonic key equivalents
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface KeyChords {
  /** Triads built on each scale degree: I ii iii IV V vi vii° */
  triads: readonly [string, string, string, string, string, string, string];
  /** Seventh chords: Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7 */
  sevenths: readonly [string, string, string, string, string, string, string];
}

export interface CircleOfFifthsEntry {
  /** Position on the circle (0 = C, clockwise) */
  position: number;
  /** Major key name */
  majorKey: string;
  /** Relative minor key name */
  relativeMinor: string;
  /** Number of sharps (positive) or flats (negative). 0 = C major */
  accidentals: number;
  /** Which notes are sharp or flat in this key signature */
  accidentalNotes: readonly string[];
  /** Enharmonic equivalent major key, if any */
  enharmonicMajor?: string;
  /** Enharmonic equivalent minor key, if any */
  enharmonicMinor?: string;
  /** Diatonic chords in this major key */
  chords: KeyChords;
}

// ─── Data ───────────────────────────────────────────────────────────────────

/**
 * The Circle of Fifths — 15 entries covering all major/minor keys.
 *
 * Ordered clockwise from C (0 accidentals) through sharp keys,
 * then flat keys back to C. Includes enharmonic pairs:
 * - B/Cb, F#/Gb, C#/Db (major)
 * - G#m/Abm, D#m/Ebm, A#m/Bbm (minor)
 *
 * The order of sharps: F# C# G# D# A# E# B#
 * The order of flats:  Bb Eb Ab Db Gb Cb Fb
 */
export const CIRCLE_OF_FIFTHS: readonly CircleOfFifthsEntry[] = [
  // ─── No accidentals ───
  {
    position: 0,
    majorKey: 'C',
    relativeMinor: 'Am',
    accidentals: 0,
    accidentalNotes: [],
    chords: {
      triads:   ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
      sevenths: ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5'],
    },
  },

  // ─── Sharp keys (clockwise) ───
  {
    position: 1,
    majorKey: 'G',
    relativeMinor: 'Em',
    accidentals: 1,
    accidentalNotes: ['F#'],
    chords: {
      triads:   ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
      sevenths: ['Gmaj7', 'Am7', 'Bm7', 'Cmaj7', 'D7', 'Em7', 'F#m7b5'],
    },
  },
  {
    position: 2,
    majorKey: 'D',
    relativeMinor: 'Bm',
    accidentals: 2,
    accidentalNotes: ['F#', 'C#'],
    chords: {
      triads:   ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
      sevenths: ['Dmaj7', 'Em7', 'F#m7', 'Gmaj7', 'A7', 'Bm7', 'C#m7b5'],
    },
  },
  {
    position: 3,
    majorKey: 'A',
    relativeMinor: 'F#m',
    accidentals: 3,
    accidentalNotes: ['F#', 'C#', 'G#'],
    chords: {
      triads:   ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
      sevenths: ['Amaj7', 'Bm7', 'C#m7', 'Dmaj7', 'E7', 'F#m7', 'G#m7b5'],
    },
  },
  {
    position: 4,
    majorKey: 'E',
    relativeMinor: 'C#m',
    accidentals: 4,
    accidentalNotes: ['F#', 'C#', 'G#', 'D#'],
    chords: {
      triads:   ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
      sevenths: ['Emaj7', 'F#m7', 'G#m7', 'Amaj7', 'B7', 'C#m7', 'D#m7b5'],
    },
  },
  {
    position: 5,
    majorKey: 'B',
    relativeMinor: 'G#m',
    accidentals: 5,
    accidentalNotes: ['F#', 'C#', 'G#', 'D#', 'A#'],
    enharmonicMajor: 'Cb',
    enharmonicMinor: 'Abm',
    chords: {
      triads:   ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
      sevenths: ['Bmaj7', 'C#m7', 'D#m7', 'Emaj7', 'F#7', 'G#m7', 'A#m7b5'],
    },
  },
  {
    position: 6,
    majorKey: 'F#',
    relativeMinor: 'D#m',
    accidentals: 6,
    accidentalNotes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'],
    enharmonicMajor: 'Gb',
    enharmonicMinor: 'Ebm',
    chords: {
      triads:   ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'],
      sevenths: ['F#maj7', 'G#m7', 'A#m7', 'Bmaj7', 'C#7', 'D#m7', 'E#m7b5'],
    },
  },
  {
    position: 7,
    majorKey: 'C#',
    relativeMinor: 'A#m',
    accidentals: 7,
    accidentalNotes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'],
    enharmonicMajor: 'Db',
    enharmonicMinor: 'Bbm',
    chords: {
      triads:   ['C#', 'D#m', 'E#m', 'F#', 'G#', 'A#m', 'B#dim'],
      sevenths: ['C#maj7', 'D#m7', 'E#m7', 'F#maj7', 'G#7', 'A#m7', 'B#m7b5'],
    },
  },

  // ─── Flat keys (counter-clockwise from C) ───
  {
    position: -1,
    majorKey: 'F',
    relativeMinor: 'Dm',
    accidentals: -1,
    accidentalNotes: ['Bb'],
    chords: {
      triads:   ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
      sevenths: ['Fmaj7', 'Gm7', 'Am7', 'Bbmaj7', 'C7', 'Dm7', 'Em7b5'],
    },
  },
  {
    position: -2,
    majorKey: 'Bb',
    relativeMinor: 'Gm',
    accidentals: -2,
    accidentalNotes: ['Bb', 'Eb'],
    chords: {
      triads:   ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'],
      sevenths: ['Bbmaj7', 'Cm7', 'Dm7', 'Ebmaj7', 'F7', 'Gm7', 'Am7b5'],
    },
  },
  {
    position: -3,
    majorKey: 'Eb',
    relativeMinor: 'Cm',
    accidentals: -3,
    accidentalNotes: ['Bb', 'Eb', 'Ab'],
    chords: {
      triads:   ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'],
      sevenths: ['Ebmaj7', 'Fm7', 'Gm7', 'Abmaj7', 'Bb7', 'Cm7', 'Dm7b5'],
    },
  },
  {
    position: -4,
    majorKey: 'Ab',
    relativeMinor: 'Fm',
    accidentals: -4,
    accidentalNotes: ['Bb', 'Eb', 'Ab', 'Db'],
    chords: {
      triads:   ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'],
      sevenths: ['Abmaj7', 'Bbm7', 'Cm7', 'Dbmaj7', 'Eb7', 'Fm7', 'Gm7b5'],
    },
  },
  {
    position: -5,
    majorKey: 'Db',
    relativeMinor: 'Bbm',
    accidentals: -5,
    accidentalNotes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'],
    enharmonicMajor: 'C#',
    enharmonicMinor: 'A#m',
    chords: {
      triads:   ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'],
      sevenths: ['Dbmaj7', 'Ebm7', 'Fm7', 'Gbmaj7', 'Ab7', 'Bbm7', 'Cm7b5'],
    },
  },
  {
    position: -6,
    majorKey: 'Gb',
    relativeMinor: 'Ebm',
    accidentals: -6,
    accidentalNotes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'],
    enharmonicMajor: 'F#',
    enharmonicMinor: 'D#m',
    chords: {
      triads:   ['Gb', 'Abm', 'Bbm', 'Cb', 'Db', 'Ebm', 'Fdim'],
      sevenths: ['Gbmaj7', 'Abm7', 'Bbm7', 'Cbmaj7', 'Db7', 'Ebm7', 'Fm7b5'],
    },
  },
  {
    position: -7,
    majorKey: 'Cb',
    relativeMinor: 'Abm',
    accidentals: -7,
    accidentalNotes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'],
    enharmonicMajor: 'B',
    enharmonicMinor: 'G#m',
    chords: {
      triads:   ['Cb', 'Dbm', 'Ebm', 'Fb', 'Gb', 'Abm', 'Bbdim'],
      sevenths: ['Cbmaj7', 'Dbm7', 'Ebm7', 'Fbmaj7', 'Gb7', 'Abm7', 'Bbm7b5'],
    },
  },
] as const;

// ─── Lookup Maps ────────────────────────────────────────────────────────────

const byMajorKey = new Map<string, CircleOfFifthsEntry>(
  CIRCLE_OF_FIFTHS.map(e => [e.majorKey, e])
);

const byMinorKey = new Map<string, CircleOfFifthsEntry>(
  CIRCLE_OF_FIFTHS.map(e => [e.relativeMinor, e])
);

// ─── Query Functions ────────────────────────────────────────────────────────

/**
 * Get circle of fifths entry by major key name.
 * Also checks enharmonic equivalents (e.g., 'Db' finds the C# entry's enharmonic).
 */
export function getKeyInfo(majorKey: string): CircleOfFifthsEntry | undefined {
  const direct = byMajorKey.get(majorKey);
  if (direct) return direct;
  // Check enharmonic equivalents
  return CIRCLE_OF_FIFTHS.find(e => e.enharmonicMajor === majorKey);
}

/**
 * Get circle of fifths entry by relative minor key name.
 */
export function getKeyInfoByMinor(minorKey: string): CircleOfFifthsEntry | undefined {
  const direct = byMinorKey.get(minorKey);
  if (direct) return direct;
  return CIRCLE_OF_FIFTHS.find(e => e.enharmonicMinor === minorKey);
}

/**
 * Get the diatonic chords for a major key.
 * @returns Triads and seventh chords, or undefined if key not found.
 */
export function getChordsInKey(majorKey: string): KeyChords | undefined {
  return getKeyInfo(majorKey)?.chords;
}

/**
 * Get the relative minor of a major key.
 */
export function getRelativeMinor(majorKey: string): string | undefined {
  return getKeyInfo(majorKey)?.relativeMinor;
}

/**
 * Get the relative major of a minor key.
 */
export function getRelativeMajor(minorKey: string): string | undefined {
  return getKeyInfoByMinor(minorKey)?.majorKey;
}

/**
 * Get all keys ordered clockwise around the circle (ascending fifths).
 * Returns 12 unique keys: C, G, D, A, E, B, F#/Gb, Db, Ab, Eb, Bb, F
 */
export function getClockwiseOrder(): readonly string[] {
  return ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
}

/**
 * Get the key a perfect fifth above the given key.
 */
export function getFifthAbove(majorKey: string): string | undefined {
  const order = getClockwiseOrder();
  const idx = order.indexOf(majorKey);
  if (idx === -1) return undefined;
  return order[(idx + 1) % 12];
}

/**
 * Get the key a perfect fifth below (= perfect fourth above) the given key.
 */
export function getFifthBelow(majorKey: string): string | undefined {
  const order = getClockwiseOrder();
  const idx = order.indexOf(majorKey);
  if (idx === -1) return undefined;
  return order[(idx + 11) % 12];
}

/**
 * Order of sharps as they appear in key signatures.
 */
export const ORDER_OF_SHARPS: readonly string[] = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'];

/**
 * Order of flats as they appear in key signatures.
 */
export const ORDER_OF_FLATS: readonly string[] = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'];

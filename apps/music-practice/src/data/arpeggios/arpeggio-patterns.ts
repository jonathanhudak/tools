/**
 * Arpeggio Practice Patterns
 *
 * Defines reusable practice patterns that can be applied to any arpeggio.
 * Patterns describe the order in which arpeggio tones are played,
 * using 0-based indices into the arpeggio's note array.
 */

/** Difficulty levels for arpeggio patterns */
export type PatternDifficulty = 'beginner' | 'intermediate' | 'advanced';

/** Arpeggio families a pattern can be applied to */
export type PatternApplicability = 'triadic' | 'seventh' | 'extended';

/** Definition of a single arpeggio practice pattern */
export interface ArpeggioPattern {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Human-readable description of the pattern */
  description: string;
  /** Sequence of 0-based indices into the arpeggio's tone array */
  pattern: number[];
  /** Shorthand name using scale degree numbers (e.g. '1-3-5-7') */
  patternName: string;
  /** Which arpeggio families this pattern works with */
  applicableTo: PatternApplicability[];
  /** Difficulty classification */
  difficulty: PatternDifficulty;
}

// ---------------------------------------------------------------------------
// Pattern Definitions (10)
// ---------------------------------------------------------------------------

const ARPEGGIO_PATTERNS: readonly ArpeggioPattern[] = [
  {
    id: 'ascending',
    name: 'Ascending',
    description: 'Play all arpeggio tones straight up from root to top.',
    pattern: [0, 1, 2, 3],
    patternName: '1-3-5-8',
    applicableTo: ['triadic', 'seventh', 'extended'],
    difficulty: 'beginner',
  },
  {
    id: 'descending',
    name: 'Descending',
    description: 'Play all arpeggio tones straight down from top to root.',
    pattern: [3, 2, 1, 0],
    patternName: '8-5-3-1',
    applicableTo: ['triadic', 'seventh', 'extended'],
    difficulty: 'beginner',
  },
  {
    id: 'ascending-descending',
    name: 'Ascending–Descending',
    description: 'Play up through the arpeggio then back down to the root.',
    pattern: [0, 1, 2, 3, 2, 1, 0],
    patternName: '1-3-5-8-5-3-1',
    applicableTo: ['triadic', 'seventh', 'extended'],
    difficulty: 'beginner',
  },
  {
    id: 'broken-thirds',
    name: 'Broken Thirds',
    description:
      'Skip-pattern that alternates between adjacent and next-adjacent tones, creating a thirds-based weaving motion.',
    pattern: [0, 2, 1, 3, 2, 4, 3, 5],
    patternName: '1-5-3-8-5-9-8-11',
    applicableTo: ['seventh', 'extended'],
    difficulty: 'intermediate',
  },
  {
    id: '1-3-5',
    name: '1-3-5 Triadic',
    description: 'Play the root, third, and fifth — the core triad tones.',
    pattern: [0, 1, 2],
    patternName: '1-3-5',
    applicableTo: ['triadic', 'seventh', 'extended'],
    difficulty: 'beginner',
  },
  {
    id: '1-3-5-7',
    name: '1-3-5-7 Seventh',
    description:
      'Play root, third, fifth, and seventh — the full seventh chord arpeggio.',
    pattern: [0, 1, 2, 3],
    patternName: '1-3-5-7',
    applicableTo: ['seventh', 'extended'],
    difficulty: 'intermediate',
  },
  {
    id: '1-2-3-5',
    name: '1-2-3-5 Digital Pattern',
    description:
      'A "digital" pattern (fingers 1-2-3-5) commonly used in jazz improvisation. Skips the fourth tone.',
    pattern: [0, 1, 2, 4],
    patternName: '1-2-3-5',
    applicableTo: ['seventh', 'extended'],
    difficulty: 'intermediate',
  },
  {
    id: '3-5-7-9',
    name: '3-5-7-9 Upper Structure',
    description:
      'Start from the third and play upper chord tones. Creates an upper-structure triad effect useful for advanced voicings.',
    pattern: [1, 2, 3, 4],
    patternName: '3-5-7-9',
    applicableTo: ['extended'],
    difficulty: 'advanced',
  },
  {
    id: 'enclosure',
    name: 'Enclosure',
    description:
      'Approach each chord tone from a half-step above, then a half-step below, before resolving. Indices represent: target, upper neighbor, lower neighbor, target resolution.',
    pattern: [1, 0, 2, 1, 3, 2, 0, 3],
    patternName: 'enc',
    applicableTo: ['triadic', 'seventh', 'extended'],
    difficulty: 'advanced',
  },
  {
    id: 'diatonic-sequence-up',
    name: 'Diatonic Sequence Up',
    description:
      'Play ascending groups sequentially through the key — each group starts one scale degree higher. Applied across multiple octaves for full effect.',
    pattern: [0, 1, 2, 3, 1, 2, 3, 4, 2, 3, 4, 5],
    patternName: 'seq-up',
    applicableTo: ['triadic', 'seventh', 'extended'],
    difficulty: 'advanced',
  },
];

// ---------------------------------------------------------------------------
// Lookup map
// ---------------------------------------------------------------------------

const patternById = new Map<string, ArpeggioPattern>(
  ARPEGGIO_PATTERNS.map((p) => [p.id, p]),
);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up a practice pattern by its unique ID.
 * @param id - Pattern identifier (e.g. 'ascending', 'broken-thirds')
 * @returns The matching pattern, or undefined if not found
 */
export function getPattern(id: string): ArpeggioPattern | undefined {
  return patternById.get(id);
}

/**
 * Get all patterns matching a given difficulty level.
 * @param difficulty - The difficulty to filter by
 * @returns Array of matching patterns
 */
export function getPatternsByDifficulty(difficulty: PatternDifficulty): ArpeggioPattern[] {
  return ARPEGGIO_PATTERNS.filter((p) => p.difficulty === difficulty);
}

export { ARPEGGIO_PATTERNS };

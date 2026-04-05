/**
 * Avoid Notes Database
 *
 * In jazz theory, "avoid notes" are scale tones that create a minor 9th (b9)
 * interval against a chord tone, producing a harsh dissonance when sustained.
 * They are fine as passing tones but should not be emphasized or held.
 *
 * This module catalogues the standard avoid notes for each chord-scale pairing
 * in the diatonic and melodic minor systems. Scale IDs reference the
 * scale-registry.ts identifiers.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

/** A single avoid note within a chord-scale pairing */
export interface AvoidNoteDetail {
  /** Scale degree of the avoid note (1-7) */
  scaleDegree: number;
  /** Interval from the chord root, e.g. 'P4', 'm2', 'm6' */
  intervalFromRoot: string;
  /** Why this note is avoided (typically "b9 from <chord tone>") */
  reason: string;
}

/**
 * An avoid-note entry linking a scale/mode and chord quality
 * to its avoid notes.
 */
export interface AvoidNoteEntry {
  /** Scale ID from scale-registry (e.g. 'ionian', 'phrygian') */
  scaleId: string;
  /** Chord quality built on this degree (e.g. 'Maj7', 'm7') */
  chordQuality: string;
  /** Degree within the parent scale (1-7) */
  degree: number;
  /** The notes to avoid when improvising over this chord-scale */
  avoidNotes: AvoidNoteDetail[];
}

// ─── Avoid Notes Data ────────────────────────────────────────────────────────

/**
 * Standard avoid notes for common chord-scale pairings.
 *
 * The general rule: a scale tone is an "avoid note" when it sits a
 * minor 2nd (half step) above a chord tone, creating a b9 clash.
 *
 * | Mode             | Chord  | Degree | Avoid    | Interval | Reason               |
 * |------------------|--------|--------|----------|----------|----------------------|
 * | Ionian (I)       | Maj7   | 1      | 4th      | P4       | b9 from major 3rd    |
 * | Phrygian (iii)   | m7     | 3      | b2 (1st) | m2       | b9 from root         |
 * | Phrygian (iii)   | m7     | 3      | b6 (6th) | m6       | b9 from P5           |
 * | Mixolydian (V)   | 7      | 5      | 4th      | P4       | b9 from major 3rd    |
 * | Aeolian (vi)     | m7     | 6      | b6 (6th) | m6       | b9 from P5           |
 * | Locrian (vii)    | m7b5   | 7      | b2 (1st) | m2       | b9 from root         |
 * | Dorian b2 (ii mm)| m7     | 2      | b2 (1st) | m2       | b9 from root         |
 *
 * Note: Dorian (ii) and Lydian (IV) have **no** avoid notes.
 */
export const AVOID_NOTES: AvoidNoteEntry[] = [
  // ── Major Scale Modes ────────────────────────────────────────────────────
  {
    scaleId: 'ionian',
    chordQuality: 'Maj7',
    degree: 1,
    avoidNotes: [
      {
        scaleDegree: 4,
        intervalFromRoot: 'P4',
        reason: 'b9 from major 3rd',
      },
    ],
  },
  {
    scaleId: 'phrygian',
    chordQuality: 'm7',
    degree: 3,
    avoidNotes: [
      {
        scaleDegree: 2,
        intervalFromRoot: 'm2',
        reason: 'b9 from root',
      },
      {
        scaleDegree: 6,
        intervalFromRoot: 'm6',
        reason: 'b9 from P5',
      },
    ],
  },
  {
    scaleId: 'mixolydian',
    chordQuality: '7',
    degree: 5,
    avoidNotes: [
      {
        scaleDegree: 4,
        intervalFromRoot: 'P4',
        reason: 'b9 from major 3rd',
      },
    ],
  },
  {
    scaleId: 'aeolian',
    chordQuality: 'm7',
    degree: 6,
    avoidNotes: [
      {
        scaleDegree: 6,
        intervalFromRoot: 'm6',
        reason: 'b9 from P5',
      },
    ],
  },
  {
    scaleId: 'locrian',
    chordQuality: 'm7b5',
    degree: 7,
    avoidNotes: [
      {
        scaleDegree: 2,
        intervalFromRoot: 'm2',
        reason: 'b9 from root',
      },
    ],
  },

  // ── Melodic Minor Modes ──────────────────────────────────────────────────
  {
    scaleId: 'dorian-b2',
    chordQuality: 'm7',
    degree: 2,
    avoidNotes: [
      {
        scaleDegree: 2,
        intervalFromRoot: 'm2',
        reason: 'b9 from root',
      },
    ],
  },
];

// ─── Lookup Helpers ──────────────────────────────────────────────────────────

/**
 * Look up avoid notes for a given scale/mode and chord quality.
 *
 * @param scaleId - Scale ID from scale-registry (e.g. 'ionian', 'phrygian')
 * @param chordQuality - Chord quality string (e.g. 'Maj7', 'm7', '7')
 * @returns The matching `AvoidNoteEntry`, or `null` if no avoid notes are
 *          defined for this pairing (which may mean the mode has none).
 *
 * @example
 * ```ts
 * const entry = getAvoidNotes('ionian', 'Maj7');
 * // {
 * //   scaleId: 'ionian',
 * //   chordQuality: 'Maj7',
 * //   degree: 1,
 * //   avoidNotes: [{ scaleDegree: 4, intervalFromRoot: 'P4', reason: 'b9 from major 3rd' }]
 * // }
 *
 * const none = getAvoidNotes('dorian', 'm7');
 * // null — Dorian has no avoid notes
 * ```
 */
export function getAvoidNotes(
  scaleId: string,
  chordQuality: string,
): AvoidNoteEntry | undefined {
  return (
    AVOID_NOTES.find(
      (entry) =>
        entry.scaleId === scaleId && entry.chordQuality === chordQuality,
    ) ?? undefined
  );
}

/**
 * Banjo chord voicings — 5-string banjo, Open G (gDGBD)
 *
 * Explicit first-position voicings for common chords, plus movable-shape
 * generation (barre / F shape / Am shape / Fm shape / 7th barre) for any
 * other plain major, minor, or dominant chord.
 *
 * frets[i] = fret on string i+1 (string 1 = D4, 2 = B3, 3 = G3, 4 = D3).
 * The short 5th string (g drone) is never fretted in these voicings.
 */

import { Note } from 'tonal';
import type { Chord } from './chord-library';
import { getTuning } from './utils/instrument-config';
import { noteNames } from './utils/music-theory';

export interface BanjoVoicing {
  /** Frets for strings 1–4 (D4, B3, G3, D3) */
  frets: [number, number, number, number];
  description: string;
  /** True if produced by the movable-shape generator */
  generated: boolean;
}

// Open-string MIDI values for strings 1–4, from the canonical banjo profile
const BANJO_TUNING = getTuning('banjo') ?? [];
const OPEN_MIDI = [1, 2, 3, 4].map(
  (stringNumber) => BANJO_TUNING.find((t) => t.string === stringNumber)!.midi
);

/** Sounded pitch classes for a voicing (strings 1–4; the g drone is excluded) */
export function banjoVoicingPitchClasses(voicing: BanjoVoicing): string[] {
  const pcs = voicing.frets.map((fret, i) => noteNames[(OPEN_MIDI[i] + fret) % 12]);
  return [...new Set(pcs)];
}

type Quality = 'major' | 'minor' | 'dominant';

function key(root: string, quality: Quality): string {
  return `${Note.chroma(root)}:${quality}`;
}

// ── Explicit first-position voicings ─────────────────────────
// Only shapes the movable-shape generator can't produce (open/first-position
// forms). Barre and movable-shape chords (A, Bb, Bm, F#m, Gm, Cm, A7…) come
// from the generator, which yields the identical frets.
const EXPLICIT: Record<string, BanjoVoicing> = {
  // Majors
  [key('G', 'major')]: { frets: [0, 0, 0, 0], description: 'Open G — all strings open', generated: false },
  [key('C', 'major')]: { frets: [2, 1, 0, 2], description: 'First-position C', generated: false },
  [key('D', 'major')]: { frets: [4, 3, 2, 0], description: 'First-position D', generated: false },
  [key('E', 'major')]: { frets: [2, 0, 1, 2], description: 'First-position E', generated: false },
  // Minors
  [key('E', 'minor')]: { frets: [2, 0, 0, 2], description: 'First-position Em', generated: false },
  [key('A', 'minor')]: { frets: [2, 1, 2, 2], description: 'First-position Am', generated: false },
  [key('D', 'minor')]: { frets: [3, 3, 2, 0], description: 'First-position Dm', generated: false },
  // Dominant 7ths
  [key('G', 'dominant')]: { frets: [3, 0, 0, 0], description: 'First-position G7', generated: false },
  [key('C', 'dominant')]: { frets: [2, 1, 3, 2], description: 'First-position C7', generated: false },
  [key('D', 'dominant')]: { frets: [0, 1, 2, 0], description: 'First-position D7', generated: false },
  [key('E', 'dominant')]: { frets: [2, 0, 1, 0], description: 'First-position E7', generated: false },
  [key('B', 'dominant')]: { frets: [1, 0, 2, 1], description: 'First-position B7', generated: false },
};

// ── Movable shapes ───────────────────────────────────────────
// offsets are relative frets for strings 1–4; rootPc is the chord the shape
// produces at offset 0.

interface MovableShape {
  name: string;
  offsets: [number, number, number, number];
  rootPc: string;
}

const MOVABLE_SHAPES: Record<Quality, MovableShape[]> = {
  major: [
    { name: 'barre shape', offsets: [0, 0, 0, 0], rootPc: 'G' },
    { name: 'F shape', offsets: [3, 1, 2, 3], rootPc: 'F' },
  ],
  minor: [
    { name: 'Am shape', offsets: [2, 1, 2, 2], rootPc: 'A' },
    { name: 'Fm shape', offsets: [3, 1, 1, 3], rootPc: 'F' },
  ],
  dominant: [
    { name: '7th barre shape', offsets: [3, 0, 0, 0], rootPc: 'G' },
  ],
};

const MAX_FRET = 15;

function generateVoicing(root: string, quality: Quality): BanjoVoicing | null {
  const rootChroma = Note.chroma(root);
  if (rootChroma === null || rootChroma === undefined) return null;

  const candidates = MOVABLE_SHAPES[quality]
    .map((shape) => {
      const shift = (rootChroma - (Note.chroma(shape.rootPc) as number) + 12) % 12;
      const frets = shape.offsets.map((o) => o + shift) as [number, number, number, number];
      return { shape, frets, maxFret: Math.max(...frets) };
    })
    .filter((c) => c.maxFret <= MAX_FRET)
    .sort((a, b) => a.maxFret - b.maxFret);

  const best = candidates[0];
  if (!best) return null;

  const baseFret = Math.min(...best.frets);
  return {
    frets: best.frets,
    description: `${best.shape.name}${baseFret > 0 ? ` at fret ${baseFret}` : ''}`,
    generated: true,
  };
}

// ── Public API ───────────────────────────────────────────────

/**
 * Map a library chord to a quality this module supports.
 * - 'major' in the library means plain major triads.
 * - 'minor' covers the minor family (m, m7, …) — a minor-triad voicing's
 *   tones are a subset of every minor-family chord, so the shape stays valid.
 * - 'dominant' is restricted to plain 7/9/13 chords (the 7th shape's tones
 *   are a subset of those); altered dominants (7b5, 7#9, alt…) get null.
 */
function chordQuality(chord: Chord): Quality | null {
  if (chord.type === 'major' || chord.type === 'minor') return chord.type;
  if (chord.type === 'dominant' && /^[A-G][#b]?(7|9|13)$/.test(chord.shortName)) return 'dominant';
  return null;
}

export function getBanjoVoicing(chord: Chord): BanjoVoicing | null {
  const quality = chordQuality(chord);
  if (!quality) return null;
  return EXPLICIT[key(chord.root, quality)] ?? generateVoicing(chord.root, quality);
}

// Chord-tone chromas relative to the root, per supported quality
const QUALITY_CHROMAS: Record<Quality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dominant: [0, 4, 7, 10],
};

const DRONE_CHROMA = Note.chroma(
  BANJO_TUNING.find((t) => (t.startFret ?? 0) > 0)?.note ?? 'G'
) as number;

/**
 * Whether the open 5th-string drone (g) is a chord tone — when it isn't,
 * diagrams should mark the drone muted rather than inviting an open strum.
 */
export function banjoDroneIsChordTone(chord: Chord): boolean {
  const quality = chordQuality(chord);
  if (!quality) return false;
  const rootChroma = Note.chroma(chord.root);
  if (rootChroma === null || rootChroma === undefined) return false;
  return QUALITY_CHROMAS[quality].some(
    (interval) => (rootChroma + interval) % 12 === DRONE_CHROMA
  );
}

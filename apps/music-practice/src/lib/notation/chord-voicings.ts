/**
 * Algorithmic chord-voicing generators.
 *
 * The curated chord library only covers common chords spelled with standard
 * roots. Progressions resolve to arbitrary qualities (m6, 7b9, modal chords)
 * and theoretical enharmonic roots (Bbb, Fb). The MIDI/pitch-class content is
 * always correct, so we generate diagrams from pitch classes instead of
 * relying on a name match — giving every chord a guitar shape and a piano
 * diagram.
 */

import { Note } from 'tonal';
import type { ChordVoicing } from '../chord-library';

/** Standard tuning, low E → high e, as MIDI. */
const OPEN_STRINGS = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4
const STRING_COUNT = OPEN_STRINGS.length;
const MAX_SPAN = 4; // max distance between lowest and highest fretted note

function chromaSet(notes: string[]): Set<number> {
  const s = new Set<number>();
  for (const n of notes) {
    const c = Note.chroma(n);
    if (c !== null && c !== undefined) s.add(c);
  }
  return s;
}

interface Candidate {
  frets: number[]; // per string, -1 muted / 0 open / n fretted
  score: number;
}

/**
 * Generate a playable guitar voicing for a set of pitch classes.
 * Searches fret positions, picking the lowest chord tone per string within a
 * 4-fret window (open strings always allowed), then scores for tone coverage,
 * root in the bass, and few muted/interior-muted strings.
 *
 * Returns null when no acceptable shape exists (caller can fall back to piano).
 */
export function generateGuitarVoicing(
  notes: string[],
  root: string,
): NonNullable<ChordVoicing['guitar']> | null {
  const pcs = chromaSet(notes);
  if (pcs.size === 0) return null;
  const rootPc = Note.chroma(root);

  let best: Candidate | null = null;

  for (let pos = 0; pos <= 11; pos++) {
    const frets: number[] = [];
    for (let i = 0; i < STRING_COUNT; i++) {
      const open = OPEN_STRINGS[i];
      const options: number[] = [];
      if (pcs.has(open % 12)) options.push(0); // open string
      for (let f = pos; f <= pos + MAX_SPAN - 1; f++) {
        if (f > 0 && pcs.has((open + f) % 12)) options.push(f);
      }
      frets.push(options.length ? Math.min(...options) : -1);
    }

    const fretted = frets.filter(f => f > 0);
    if (fretted.length > 0 && Math.max(...fretted) - Math.min(...fretted) > MAX_SPAN) continue;

    const played = frets.map((f, i) => (f >= 0 ? (OPEN_STRINGS[i] + f) % 12 : -1));
    const playedPcs = new Set(played.filter(p => p >= 0));
    const nonMuted = frets.filter(f => f >= 0).length;
    if (nonMuted < 3) continue;
    if (rootPc !== null && rootPc !== undefined && !playedPcs.has(rootPc)) continue;

    const coverage = [...pcs].filter(p => playedPcs.has(p)).length;
    if (coverage < Math.min(pcs.size, 3)) continue;

    const firstPlayed = frets.findIndex(f => f >= 0);
    const lastPlayed = frets.length - 1 - [...frets].reverse().findIndex(f => f >= 0);
    let interiorMutes = 0;
    for (let i = firstPlayed; i <= lastPlayed; i++) if (frets[i] < 0) interiorMutes++;

    const bassPc = played[firstPlayed];
    const rootInBass = bassPc === rootPc;
    const allCovered = coverage === pcs.size;

    const score =
      coverage * 10 +
      (allCovered ? 6 : 0) +
      (rootInBass ? 8 : 0) +
      nonMuted -
      interiorMutes * 4 -
      pos * 0.5;

    if (!best || score > best.score) best = { frets: frets.slice(), score };
  }

  if (!best) return null;

  const { frets } = best;
  const frettedVals = frets.filter(f => f > 0);
  const minFret = frettedVals.length ? Math.min(...frettedVals) : 0;

  // Finger numbers relative to the lowest fret in the shape (1–4).
  const fingers = frets.map(f => {
    if (f < 0) return 'muted';
    if (f === 0) return 'open';
    return String(Math.min(4, Math.max(1, f - minFret + 1)));
  });
  const muted = frets.reduce<number[]>((acc, f, i) => {
    if (f < 0) acc.push(i + 1);
    return acc;
  }, []);
  // Barre when 2+ strings share the lowest fretted fret.
  const barred = minFret > 0 && frettedVals.filter(f => f === minFret).length > 1;

  return { frets, fingers, muted, barred, description: 'Generated voicing' };
}

/**
 * Build a piano voicing from MIDI notes. Spelling comes from MIDI (sharps),
 * so it is always parseable by the piano diagram regardless of the chord's
 * theoretical enharmonic spelling.
 */
export function generatePianoVoicing(
  midis: number[],
): NonNullable<ChordVoicing['piano']> | null {
  const notes = midis
    .map(m => Note.fromMidi(m))
    .filter((n): n is string => Boolean(n));
  if (notes.length === 0) return null;
  const octaves = notes
    .map(n => Note.octave(n))
    .filter((o): o is number => o !== undefined);
  const octaveRange: [number, number] = [
    Math.min(...octaves),
    Math.max(...octaves),
  ];
  return { notes, octaveRange, description: 'Generated voicing' };
}

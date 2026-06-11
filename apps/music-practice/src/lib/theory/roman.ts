/**
 * Roman numeral resolution — turns progression-registry roman numerals
 * ("ii7", "V7b9", "bII7", "iiø7", "i(maj7)") into concrete chords in a key.
 *
 * We do not use tonal's Progression.fromRomanNumerals because it ignores
 * numeral case for suffixed numerals ("ii7" resolves to D7, not Dm7).
 */

import { Chord, Note } from 'tonal';

export interface ResolvedChord {
  /** Roman numeral as written (e.g. "ii7") */
  numeral: string;
  /** Concrete chord symbol (e.g. "Dm7") */
  symbol: string;
  /** Chord root (e.g. "D") */
  root: string;
  /** Pitch classes of the chord (e.g. ["D","F","A","C"]) */
  notes: string[];
  /** MIDI notes voiced around middle C */
  midis: number[];
}

/** Interval from key tonic for each major-scale degree (1-indexed). */
const DEGREE_INTERVALS = ['1P', '2M', '3M', '4P', '5P', '6M', '7M'];

const NUMERAL_VALUES: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7,
};

interface ParsedNumeral {
  accidental: '' | 'b' | '#';
  degree: number; // 1-7
  minorCase: boolean;
  suffix: string;
}

export function parseRomanNumeral(numeral: string): ParsedNumeral | null {
  const m = numeral.match(/^(b|#)?(vii|VII|vi|VI|iv|IV|v|V|iii|III|ii|II|i|I)(.*)$/);
  if (!m) return null;
  const [, acc, n, suffix] = m;
  const degree = NUMERAL_VALUES[n.toLowerCase()];
  if (!degree) return null;
  return {
    accidental: (acc as '' | 'b' | '#') ?? '',
    degree,
    minorCase: n === n.toLowerCase(),
    suffix: suffix ?? '',
  };
}

/**
 * Build the chord-symbol suffix from numeral case + written suffix.
 * Lowercase numerals are minor unless the suffix already encodes a quality
 * (dim/ø). Uppercase numerals pass the suffix through (7 → dominant 7).
 */
function qualitySuffix(minorCase: boolean, rawSuffix: string): string {
  const suffix = rawSuffix.replace(/[()]/g, ''); // i(maj7) → imaj7
  if (!minorCase) return suffix;
  if (suffix.startsWith('ø') || suffix.includes('m7b5')) return 'm7b5';
  if (suffix.startsWith('°') || suffix.startsWith('dim')) {
    return suffix.replace('°', 'dim');
  }
  if (suffix.startsWith('maj7')) return 'mMaj7'; // i(maj7) → CmMaj7
  if (suffix.startsWith('m') ) return suffix; // "iim7" already spells the minor quality
  return `m${suffix}`;
}

/** Resolve one roman numeral in a major key. Returns null if unparseable. */
export function resolveRomanInKey(key: string, numeral: string): ResolvedChord | null {
  // Secondary dominants and other applied chords: "V7/bVI" = V7 of bVI.
  const slash = numeral.split('/');
  if (slash.length === 2) {
    const target = resolveRomanInKey(key, slash[1]);
    if (!target) return null;
    const applied = resolveRomanInKey(target.root, slash[0]);
    if (!applied) return null;
    return { ...applied, numeral };
  }

  const parsed = parseRomanNumeral(numeral);
  if (!parsed) return null;

  let interval = DEGREE_INTERVALS[parsed.degree - 1];
  if (parsed.accidental === 'b') {
    // Lower the degree: major intervals become minor, perfect become diminished
    interval = interval.endsWith('M')
      ? interval.replace('M', 'm')
      : interval.replace('P', 'd');
  } else if (parsed.accidental === '#') {
    interval = interval.endsWith('M')
      ? interval.replace('M', 'A')
      : interval.replace('P', 'A');
  }

  const root = Note.transpose(key, interval);
  if (!root) return null;

  const symbol = `${root}${qualitySuffix(parsed.minorCase, parsed.suffix)}`;
  const chord = Chord.get(symbol);
  if (chord.empty || chord.notes.length === 0) return null;

  return {
    numeral,
    symbol,
    root,
    notes: chord.notes,
    midis: voiceChord(chord.notes),
  };
}

/** Resolve a whole progression; unparseable steps are skipped. */
export function resolveProgression(key: string, numerals: string[]): ResolvedChord[] {
  return numerals
    .map(n => resolveRomanInKey(key, n))
    .filter((c): c is ResolvedChord => c !== null);
}

/**
 * Voice pitch classes as a stacked chord around middle C:
 * root in octave 3, remaining tones ascending from octave 4.
 */
export function voiceChord(notes: string[]): number[] {
  if (notes.length === 0) return [];
  const midis: number[] = [];
  const rootMidi = Note.midi(`${notes[0]}3`);
  if (rootMidi !== null) midis.push(rootMidi);
  let prev = Note.midi(`${notes[0]}4`) ?? 60;
  midis.push(prev);
  for (const n of notes.slice(1)) {
    let m = Note.midi(`${n}4`) ?? 60;
    while (m <= prev) m += 12;
    midis.push(m);
    prev = m;
  }
  return midis;
}

export interface GuideTones {
  third?: string;
  seventh?: string;
}

/**
 * Guide tones (3rd and 7th) of a chord symbol — the voice-leading skeleton
 * of jazz harmony. Returns pitch classes.
 */
export function guideTones(symbol: string): GuideTones {
  const chord = Chord.get(symbol);
  if (chord.empty) return {};
  const out: GuideTones = {};
  chord.intervals.forEach((ivl, i) => {
    const num = ivl.replace(/[^0-9]/g, '');
    if (num === '3') out.third = chord.notes[i];
    if (num === '7') out.seventh = chord.notes[i];
    // sus chords: treat the 4th as the "third" voice
    if (num === '4' && !out.third && symbol.includes('sus')) out.third = chord.notes[i];
  });
  return out;
}

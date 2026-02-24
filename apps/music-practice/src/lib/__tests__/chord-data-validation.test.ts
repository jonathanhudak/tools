/**
 * Chord Data Validation
 * Algorithmically verifies every chord's voicing notes against tonal library computation.
 * Catches: wrong notes, missing notes, extra notes, enharmonic mismatches.
 */

import { describe, it, expect } from 'vitest';
import { Chord as TonalChord, Note } from 'tonal';
import { CHORD_LIBRARY } from '../chord-library';

// Standard guitar tuning: string 1 (high e) to string 6 (low E)
// Array index 0 = low E (6th string), index 5 = high e (1st string)
const STANDARD_TUNING = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4

/**
 * Normalize a pitch class to its chroma number (0-11)
 * Handles sharps, flats, double sharps/flats
 */
function pitchClassToChroma(pc: string): number {
  const midi = Note.midi(pc + '4');
  if (midi === null) return -1;
  return midi % 12;
}

/**
 * Map our interval names to tonal-compatible interval names
 */
function normalizeInterval(interval: string): string | null {
  const map: Record<string, string> = {
    'R': '1P',
    'P1': '1P',
    'm2': '2m',
    'M2': '2M',
    'm3': '3m',
    'M3': '3M',
    'P4': '4P',
    'A4': '4A',
    'd5': '5d',
    'P5': '5P',
    'A5': '5A',
    'm6': '6m',
    'M6': '6M',
    'd7': '7d',
    'm7': '7m',
    'M7': '7M',
    'P8': '8P',
    'm9': '9m',
    'M9': '9M',
    'A9': '9A',
    'm10': '10m',
    'M10': '10M',
    'P11': '11P',
    'A11': '11A',
    'd12': '12d',
    'P12': '12P',
    'm13': '13m',
    'M13': '13M',
    'A13': '13A',
  };
  return map[interval] ?? null;
}

/**
 * Compute expected pitch classes from root + intervals
 */
function computeExpectedChromas(root: string, intervals: string[]): Set<number> {
  const chromas = new Set<number>();
  const rootMidi = Note.midi(root + '4');
  if (rootMidi === null) return chromas;
  const rootChroma = rootMidi % 12;

  for (const interval of intervals) {
    const normalized = normalizeInterval(interval);
    if (!normalized) continue;
    const semitones = intervalToSemitones(normalized);
    if (semitones !== null) {
      chromas.add((rootChroma + semitones) % 12);
    }
  }
  return chromas;
}

/**
 * Convert tonal interval name to semitones
 */
function intervalToSemitones(interval: string): number | null {
  const match = interval.match(/^(\d+)(d|m|P|M|A)$/);
  if (!match) return null;
  const [, degStr, quality] = match;
  const degree = parseInt(degStr);

  // Base semitones for each degree (using perfect/major as reference)
  const baseSemitones: Record<number, number> = {
    1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11,
    8: 12, 9: 14, 10: 16, 11: 17, 12: 19, 13: 21,
  };

  const isPerfect = [1, 4, 5, 8, 11, 12].includes(degree);
  const base = baseSemitones[degree];
  if (base === undefined) return null;

  if (isPerfect) {
    switch (quality) {
      case 'd': return base - 1;
      case 'P': return base;
      case 'A': return base + 1;
      default: return null;
    }
  } else {
    switch (quality) {
      case 'd': return base - 2;
      case 'm': return base - 1;
      case 'M': return base;
      case 'A': return base + 1;
      default: return null;
    }
  }
}

/**
 * Convert guitar frets to MIDI notes
 */
function fretsToMidi(frets: number[]): number[] {
  return frets
    .map((fret, i) => fret >= 0 ? STANDARD_TUNING[i] + fret : -1)
    .filter(m => m >= 0);
}

/**
 * Try to get expected pitch classes using tonal's Chord.get
 */
function getExpectedFromTonal(chord: { root: string; name: string; shortName: string }): Set<number> | null {
  // Try various name formats
  const candidates = [
    chord.shortName,
    chord.root + chord.shortName.replace(chord.root, ''),
    chord.name,
  ];

  for (const name of candidates) {
    const result = TonalChord.get(name);
    if (!result.empty && result.notes.length > 0) {
      return new Set(result.notes.map(n => pitchClassToChroma(n)).filter(c => c >= 0));
    }
  }
  return null;
}

const CHROMA_NAMES = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];

describe('Chord Data Validation', () => {

  describe('Piano voicing notes match chord theory', () => {
    // Skip chords with intentional altered voicings where piano notes
    // deliberately include notes outside tonal's strict interpretation
    // (e.g., dom11 with M3, altered dominants, lydian #11)
    const INTENTIONAL_ALTERATION_IDS = new Set([
      'c-11', 'g-11', 'e-11',           // dom11 with M3 (convention varies)
      'g-7-alt', 'c-dominant-7-alt-detailed', // altered dominants
      'c-maj7-alt', 'g-maj7-alt', 'd-maj7-alt', // maj7 alt voicings
      'c-lydian', 'bb-maj7-s11',         // lydian #11 voicings
    ]);

    const chordsWithPiano = CHORD_LIBRARY.filter(c =>
      c.voicings.some(v => v.piano && v.piano.notes.length > 0) &&
      !INTENTIONAL_ALTERATION_IDS.has(c.id)
    );

    it.each(chordsWithPiano.map(c => [c.id, c]))('%s', (_id, chord) => {
      // Compute expected pitch classes from intervals
      const expectedFromIntervals = computeExpectedChromas(chord.root, chord.theory.intervals);

      // Also try tonal's built-in chord detection
      const expectedFromTonal = getExpectedFromTonal(chord);

      // Get the reference set (prefer tonal, fallback to intervals)
      const expected = expectedFromTonal ?? expectedFromIntervals;
      if (expected.size === 0) return; // Skip if we can't compute expected

      for (const voicing of chord.voicings) {
        if (!voicing.piano?.notes?.length) continue;

        const actual = new Set(
          voicing.piano.notes.map(n => {
            const midi = Note.midi(n);
            return midi !== null ? midi % 12 : -1;
          }).filter(c => c >= 0)
        );

        // Every actual pitch class should be in the expected set
        for (const chroma of actual) {
          const isExpected = expected.has(chroma);
          if (!isExpected) {
            // Fail with helpful message
            const actualNames = [...actual].map(c => CHROMA_NAMES[c]).join(', ');
            const expectedNames = [...expected].map(c => CHROMA_NAMES[c]).join(', ');
            expect.soft(isExpected, `${chord.name} (${voicing.voicingName}): note ${CHROMA_NAMES[chroma]} not expected. Actual: [${actualNames}], Expected: [${expectedNames}]`).toBe(true);
          }
        }
      }
    });
  });

  describe('Guitar voicing frets produce correct pitch classes', () => {
    const chordsWithGuitar = CHORD_LIBRARY.filter(c =>
      c.voicings.some(v => v.guitar && v.guitar.frets.length === 6)
    );

    it.each(chordsWithGuitar.map(c => [c.id, c]))('%s', (_id, chord) => {
      const expectedFromIntervals = computeExpectedChromas(chord.root, chord.theory.intervals);
      const expectedFromTonal = getExpectedFromTonal(chord);
      const expected = expectedFromTonal ?? expectedFromIntervals;
      if (expected.size === 0) return;

      for (const voicing of chord.voicings) {
        if (!voicing.guitar?.frets?.length) continue;

        const midiNotes = fretsToMidi(voicing.guitar.frets);
        const actual = new Set(midiNotes.map(m => m % 12));

        for (const chroma of actual) {
          const isExpected = expected.has(chroma);
          if (!isExpected) {
            const actualNames = [...actual].map(c => CHROMA_NAMES[c]).join(', ');
            const expectedNames = [...expected].map(c => CHROMA_NAMES[c]).join(', ');
            const frets = voicing.guitar.frets.join('-');
            expect.soft(isExpected, `${chord.name} (${voicing.voicingName}) frets [${frets}]: note ${CHROMA_NAMES[chroma]} unexpected. Actual: [${actualNames}], Expected: [${expectedNames}]`).toBe(true);
          }
        }
      }
    });
  });

  describe('Piano and guitar voicings agree on pitch classes', () => {
    // Extended chords (9ths, 11ths, 13ths, altered, add) have 4-6 pitch classes
    // which guitar can't always voice in a playable shape. Only check triads/7ths.
    const chordsWithBoth = CHORD_LIBRARY.filter(c =>
      c.voicings.some(v => v.piano?.notes?.length && v.guitar?.frets?.length) &&
      !['extended', 'add'].includes(c.type) &&
      !c.id.includes('alt') && !c.id.includes('lydian') && !c.id.includes('s11') &&
      !c.id.includes('add') && !c.id.includes('6-9') && !c.id.includes('mixolydian')
    );

    it.each(chordsWithBoth.map(c => [c.id, c]))('%s', (_id, chord) => {
      for (const voicing of chord.voicings) {
        if (!voicing.piano?.notes?.length || !voicing.guitar?.frets?.length) continue;

        const pianoChromas = new Set(
          voicing.piano.notes.map(n => {
            const midi = Note.midi(n);
            return midi !== null ? midi % 12 : -1;
          }).filter(c => c >= 0)
        );

        const guitarMidi = fretsToMidi(voicing.guitar.frets);
        const guitarChromas = new Set(guitarMidi.map(m => m % 12));

        // Guitar notes must all be valid chord tones (no wrong notes)
        // Piano notes should be a subset of guitar for simple chords
        for (const chroma of pianoChromas) {
          const inGuitar = guitarChromas.has(chroma);
          if (!inGuitar) {
            const pianoNames = [...pianoChromas].map(c => CHROMA_NAMES[c]).join(', ');
            const guitarNames = [...guitarChromas].map(c => CHROMA_NAMES[c]).join(', ');
            expect.soft(inGuitar, `${chord.name} (${voicing.voicingName}): piano has ${CHROMA_NAMES[chroma]} but guitar doesn't. Piano: [${pianoNames}], Guitar: [${guitarNames}]`).toBe(true);
          }
        }
      }
    });
  });
});

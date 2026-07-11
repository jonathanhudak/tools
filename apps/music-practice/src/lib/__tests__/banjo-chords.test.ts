/**
 * Banjo chord voicings — validity is defined by chord tones:
 * every sounded pitch class must belong to the chord, the root must sound,
 * and at least 3 distinct pitch classes must be present.
 */
import { describe, it, expect } from 'vitest';
import { Chord as TonalChord, Note } from 'tonal';
import { banjoDroneIsChordTone, getBanjoVoicing, banjoVoicingPitchClasses } from '../banjo-chords';
import { CHORD_LIBRARY } from '../chord-library';
import type { Chord } from '../chord-library';

function fakeChord(root: string, type: Chord['type'], shortName: string): Chord {
  return {
    id: shortName,
    name: shortName,
    shortName,
    root,
    type,
    difficulty: 'beginner',
    voicings: [],
    theory: { intervals: [], construction: '', commonProgressions: [] },
    description: '',
    tags: [],
  };
}

function chromas(pitchClasses: string[]): Set<number> {
  return new Set(pitchClasses.map((pc) => Note.chroma(pc) as number));
}

/** Sounded pitch classes ⊆ chord tones, root present, >= 3 distinct pcs. */
function assertValidVoicing(root: string, tonalName: string, type: Chord['type'], shortName: string): void {
  const voicing = getBanjoVoicing(fakeChord(root, type, shortName));
  expect(voicing, `${shortName} should have a voicing`).not.toBeNull();
  const toneChromas = chromas(TonalChord.get(tonalName).notes);
  const sounded = banjoVoicingPitchClasses(voicing!);
  for (const pc of sounded) {
    expect(
      toneChromas.has(Note.chroma(pc) as number),
      `${shortName}: sounded ${pc} not a chord tone of ${tonalName}`
    ).toBe(true);
  }
  expect(chromas(sounded).has(Note.chroma(root) as number), `${shortName}: root missing`).toBe(true);
  expect(chromas(sounded).size).toBeGreaterThanOrEqual(3);
}

describe('explicit beginner voicings', () => {
  it('G major is all open and not generated', () => {
    const v = getBanjoVoicing(fakeChord('G', 'major', 'G'))!;
    expect(v.frets).toEqual([0, 0, 0, 0]);
    expect(v.generated).toBe(false);
  });

  const majors = ['G', 'C', 'D', 'F', 'A', 'E', 'Bb'];
  for (const root of majors) {
    it(`${root} major`, () => assertValidVoicing(root, `${root} major`, 'major', root));
  }

  const minors = ['E', 'A', 'D', 'B', 'F#', 'G', 'C'];
  for (const root of minors) {
    it(`${root}m`, () => assertValidVoicing(root, `${root} minor`, 'minor', `${root}m`));
  }

  const sevenths = ['G', 'C', 'D', 'A', 'E', 'B'];
  for (const root of sevenths) {
    it(`${root}7`, () => assertValidVoicing(root, `${root}7`, 'dominant', `${root}7`));
  }
});

describe('movable-shape generator', () => {
  const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  for (const root of ROOTS) {
    // "!gen" suffix keeps these shortNames out of the explicit map so the
    // generator path is exercised for every root.
    it(`generates ${root} major within 15 frets`, () => {
      const v = getBanjoVoicing(fakeChord(root, 'major', `${root}!gen`));
      expect(v).not.toBeNull();
      expect(v!.generated || v!.frets.every((f) => f >= 0)).toBe(true);
      expect(Math.max(...v!.frets)).toBeLessThanOrEqual(15);
      const toneChromas = chromas(TonalChord.get(`${root} major`).notes);
      for (const pc of banjoVoicingPitchClasses(v!)) {
        expect(toneChromas.has(Note.chroma(pc) as number)).toBe(true);
      }
    });
    it(`generates ${root} minor`, () => {
      const v = getBanjoVoicing(fakeChord(root, 'minor', `${root}m!gen`));
      expect(v).not.toBeNull();
      const toneChromas = chromas(TonalChord.get(`${root} minor`).notes);
      for (const pc of banjoVoicingPitchClasses(v!)) {
        expect(toneChromas.has(Note.chroma(pc) as number)).toBe(true);
      }
    });
    it(`generates ${root}7`, () => {
      const v = getBanjoVoicing(fakeChord(root, 'dominant', `${root}7`));
      expect(v).not.toBeNull();
      const toneChromas = chromas(TonalChord.get(`${root}7`).notes);
      for (const pc of banjoVoicingPitchClasses(v!)) {
        expect(toneChromas.has(Note.chroma(pc) as number)).toBe(true);
      }
    });
  }

  it('returns null for unsupported qualities', () => {
    expect(getBanjoVoicing(fakeChord('C', 'diminished', 'Cdim'))).toBeNull();
    expect(getBanjoVoicing(fakeChord('C', 'extended', 'Cmaj9'))).toBeNull();
    expect(getBanjoVoicing(fakeChord('C', 'sus', 'Csus4'))).toBeNull();
    // Altered dominants must not get the plain 7th shape
    expect(getBanjoVoicing(fakeChord('G', 'dominant', 'G7#5'))).toBeNull();
  });
});

describe('drone chord-tone check', () => {
  it('g drone is a chord tone of G, C, Em, G7', () => {
    expect(banjoDroneIsChordTone(fakeChord('G', 'major', 'G'))).toBe(true);
    expect(banjoDroneIsChordTone(fakeChord('C', 'major', 'C'))).toBe(true);
    expect(banjoDroneIsChordTone(fakeChord('E', 'minor', 'Em'))).toBe(true);
    expect(banjoDroneIsChordTone(fakeChord('G', 'dominant', 'G7'))).toBe(true);
  });

  it('g drone clashes with D, E, F#m, B7', () => {
    expect(banjoDroneIsChordTone(fakeChord('D', 'major', 'D'))).toBe(false);
    expect(banjoDroneIsChordTone(fakeChord('E', 'major', 'E'))).toBe(false);
    expect(banjoDroneIsChordTone(fakeChord('F#', 'minor', 'F#m'))).toBe(false);
    expect(banjoDroneIsChordTone(fakeChord('B', 'dominant', 'B7'))).toBe(false);
  });
});

describe('library coverage', () => {
  it('every major/minor library chord resolves to a banjo voicing', () => {
    for (const chord of CHORD_LIBRARY) {
      if (chord.type === 'major' || chord.type === 'minor') {
        expect(getBanjoVoicing(chord), `${chord.id} should resolve`).not.toBeNull();
      }
    }
  });

  it('plain dominant 7th library chords resolve', () => {
    for (const chord of CHORD_LIBRARY) {
      if (chord.type === 'dominant' && /^[A-G][#b]?(7|9|13)$/.test(chord.shortName)) {
        expect(getBanjoVoicing(chord), `${chord.id} should resolve`).not.toBeNull();
      }
    }
  });
});

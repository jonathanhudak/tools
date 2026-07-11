# Banjo Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5-string banjo (Open G) as a first-class instrument across the music-practice app: sight-reading, tab, chord library, fretboard/scale views, plus tuner data fixes.

**Architecture:** Add a `banjo` profile to the existing instrument-config system. The one new concept is the short 5th string, encoded as optional `startFret` on a tuning string and honored by tab math, the tab renderer, the fretboard component, and chord diagrams. Chord voicings come from a new `banjo-chords.ts` module: ~20 explicit beginner chords + a movable-shape generator for the rest.

**Tech Stack:** React 18 + TypeScript, Vite, VexFlow 4 (tab), Tonal.js (theory), Vitest (unit tests), pnpm + Turborepo monorepo.

**Spec:** `docs/specs/2026-07-10-banjo-mode-design.md`

## Global Constraints

- Practice-feature tuning is Open G only: strings 1–4 = D4(62), B3(59), G3(55), D3(50); 5th string G4(67) with `startFret: 5`. Tuner keeps all tunings.
- Banjo range: min D3 (midi 50), max C6 (84). Sight-reading ranges: beginner `d3-a4`, intermediate `d3-d5`, advanced `d3-g5`.
- Banjo tab convention: 5th string open = fret `0`; fretted 5th string at physical fret n sounds `G4 + (n − 5)` and is written as fret `n`. Frets 1–4 do not exist on the 5th string.
- Existing guitar behavior must not change (all existing tests keep passing).
- TypeScript strict; no `any`; ESM; run commands from repo root with `pnpm --filter music-practice <script>` or from `apps/music-practice/`.
- Test command: `pnpm --filter music-practice test:unit -- <file>` (vitest). Typecheck: `pnpm --filter music-practice typecheck`.
- Commit after every task (conventional commits).

---

### Task 1: Tuner data fixes (`@hudak/tuning-data`)

**Files:**
- Modify: `packages/tuning-data/src/tunings.ts:224-232` (BANJO_5_TUNINGS)
- Test: `apps/music-practice/src/lib/__tests__/tuning-data-integrity.test.ts` (create)

**Interfaces:**
- Consumes: `Tuning`, `INSTRUMENT_CATEGORIES` exported from `@hudak/tuning-data` (already imported by the app's tuner route).
- Produces: corrected `banjo5-open-d` (5th string A4), new `banjo5-double-d` tuning.

- [ ] **Step 1: Write the failing test**

```ts
// apps/music-practice/src/lib/__tests__/tuning-data-integrity.test.ts
import { describe, it, expect } from 'vitest';
import { INSTRUMENT_CATEGORIES } from '@hudak/tuning-data';

describe('tuning-data integrity', () => {
  const categories = INSTRUMENT_CATEGORIES;

  it('has no duplicate note arrays within a category', () => {
    for (const cat of categories) {
      const seen = new Map<string, string>();
      for (const tuning of cat.tunings) {
        const key = tuning.notes.map((n) => n.note).join(',');
        const dup = seen.get(key);
        expect(dup, `${cat.id}: ${tuning.id} duplicates ${dup}`).toBeUndefined();
        seen.set(key, tuning.id);
      }
    }
  });

  it('banjo5 Open D has A4 on the 5th string (aDF#AD)', () => {
    const banjo5 = categories.find((c) => c.id === 'banjo-5');
    const openD = banjo5?.tunings.find((t) => t.id === 'banjo5-open-d');
    expect(openD).toBeDefined();
    expect(openD!.notes.map((n) => n.note)).toEqual(['A4', 'D3', 'F#3', 'A3', 'D4']);
  });

  it('banjo5 includes Double D (aDADE)', () => {
    const banjo5 = categories.find((c) => c.id === 'banjo-5');
    const doubleD = banjo5?.tunings.find((t) => t.id === 'banjo5-double-d');
    expect(doubleD).toBeDefined();
    expect(doubleD!.notes.map((n) => n.note)).toEqual(['A4', 'D3', 'A3', 'D4', 'E4']);
  });
});
```

Note: if `INSTRUMENT_CATEGORIES` is not the exported name, check `packages/tuning-data/src/index.ts` for the actual export (the categories array defined at `tunings.ts:400+`) and adjust the import.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter music-practice test:unit -- tuning-data-integrity`
Expected: FAIL — Open D notes are `['F#4','D3','F#3','A3','D4']` and `banjo5-double-d` missing. The duplicate test also fails (`banjo5-open-d` duplicates `banjo5-old-time-d`).

- [ ] **Step 3: Fix the data**

In `packages/tuning-data/src/tunings.ts`, replace the `banjo5-open-d` line and add Double D:

```ts
export const BANJO_5_TUNINGS: Tuning[] = [
  createTuning('banjo5-open-g', 'Open G', ['G4', 'D3', 'G3', 'B3', 'D4'], 'gDGBD - Standard 5-string'),
  createTuning('banjo5-open-d', 'Open D', ['A4', 'D3', 'F#3', 'A3', 'D4'], 'aDF#AD - Bluegrass'),
  createTuning('banjo5-double-c', 'Double C', ['G4', 'C3', 'G3', 'C4', 'D4'], 'gCGCD - Old-time'),
  createTuning('banjo5-saw-mill', 'Saw Mill', ['G4', 'D3', 'G3', 'C4', 'D4'], 'gDGCD - Old-time'),
  createTuning('banjo5-standard-c', 'Standard C', ['G4', 'C3', 'G3', 'B3', 'D4'], 'gCGBD - C tuning'),
  createTuning('banjo5-old-time-d', 'Old-Time D', ['F#4', 'D3', 'F#3', 'A3', 'D4'], 'f#DF#AD'),
  createTuning('banjo5-open-a', 'Open A', ['A4', 'E3', 'A3', 'C#4', 'E4'], 'aEAC#E'),
  createTuning('banjo5-double-d', 'Double D', ['A4', 'D3', 'A3', 'D4', 'E4'], 'aDADE - Old-time'),
];
```

- [ ] **Step 4: Rebuild the package and run test to verify it passes**

Run: `pnpm --filter @hudak/tuning-data build && pnpm --filter music-practice test:unit -- tuning-data-integrity`
Expected: PASS (rebuild required — the app consumes `dist/`).

- [ ] **Step 5: Commit**

```bash
git add packages/tuning-data apps/music-practice/src/lib/__tests__/tuning-data-integrity.test.ts
git commit -m "fix(tuner): correct banjo Open D 5th string, add Double D tuning"
```

---

### Task 2: Banjo instrument profile (`instrument-config.ts`)

**Files:**
- Modify: `apps/music-practice/src/lib/utils/instrument-config.ts`
- Test: `apps/music-practice/src/lib/__tests__/instrument-config-banjo.test.ts` (create)

**Interfaces:**
- Produces: `InstrumentType.BANJO = 'banjo'`; `TuningInfo` gains `startFret?: number`; `INSTRUMENTS.banjo` config. Later tasks call `getInstrument('banjo')`, `getTuning('banjo')`.

- [ ] **Step 1: Write the failing test**

```ts
// apps/music-practice/src/lib/__tests__/instrument-config-banjo.test.ts
import { describe, it, expect } from 'vitest';
import { getInstrument, getTuning, InstrumentType, InputMethod } from '../utils/instrument-config';

describe('banjo instrument config', () => {
  it('exists with mic input and treble clef', () => {
    const banjo = getInstrument(InstrumentType.BANJO);
    expect(banjo.id).toBe('banjo');
    expect(banjo.inputType).toBe(InputMethod.MICROPHONE);
    expect(banjo.polyphonic).toBe(false);
    expect(banjo.defaultClef).toBe('treble');
  });

  it('has Open G tuning with short 5th string', () => {
    const tuning = getTuning('banjo')!;
    expect(tuning).toHaveLength(5);
    const byString = Object.fromEntries(tuning.map((t) => [t.string, t]));
    expect(byString[1].midi).toBe(62); // D4
    expect(byString[2].midi).toBe(59); // B3
    expect(byString[3].midi).toBe(55); // G3
    expect(byString[4].midi).toBe(50); // D3
    expect(byString[5].midi).toBe(67); // G4 drone
    expect(byString[5].startFret).toBe(5);
    expect(byString[1].startFret).toBeUndefined();
  });

  it('has range D3–C6', () => {
    const banjo = getInstrument('banjo');
    expect(banjo.range.min).toBe(50);
    expect(banjo.range.max).toBe(84);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter music-practice test:unit -- instrument-config-banjo`
Expected: FAIL — `InstrumentType.BANJO` undefined.

- [ ] **Step 3: Implement**

In `instrument-config.ts`:

1. Add to `InstrumentType` (line 7-12):

```ts
export const InstrumentType = {
    PIANO: 'piano',
    PIANO_VIRTUAL: 'piano-virtual',
    VIOLIN: 'violin',
    GUITAR: 'guitar',
    BANJO: 'banjo'
} as const;
```

2. Add `startFret` to `TuningInfo` (line 45-50):

```ts
export interface TuningInfo {
    note: string;
    midi: number;
    frequency: number;
    string?: number;
    /** Fret where this string begins (banjo short 5th string = 5). Omit for full-length strings. */
    startFret?: number;
}
```

3. Add banjo entry to `INSTRUMENTS` (after the GUITAR entry, before the closing `}` at line 351):

```ts
    [InstrumentType.BANJO]: {
        id: InstrumentType.BANJO,
        name: 'Banjo',
        displayName: 'Banjo (5-string)',
        emoji: '🪕',
        inputType: InputMethod.MICROPHONE,

        // Range settings (MIDI note numbers)
        range: {
            min: 50,  // D3 (open 4th string)
            max: 84,  // C6 (upper frets on 1st string)
            default: {
                min: 50,  // D3
                max: 69   // A4 (first position)
            }
        },

        clefs: [Clef.TREBLE],
        defaultClef: Clef.TREBLE,

        polyphonic: false,
        requiresSustain: true,

        // Open G tuning (gDGBD). String 5 is the short drone string: its nut
        // sits at the 5th fret, so tab frets on it are 0 (open) or >= 6.
        tuning: [
            { note: 'D3', midi: 50, frequency: 146.83, string: 4 },
            { note: 'G3', midi: 55, frequency: 196.00, string: 3 },
            { note: 'B3', midi: 59, frequency: 246.94, string: 2 },
            { note: 'D4', midi: 62, frequency: 293.66, string: 1 },
            { note: 'G4', midi: 67, frequency: 392.00, string: 5, startFret: 5 }
        ],

        validation: {
            exactMatch: false,
            pitchTolerance: 50,
            pitchToleranceAdvanced: 30,
            octaveFlexible: false,
            minDuration: 400,
            minClarity: 0.75
        },

        practice: {
            defaultNoteCount: 15,
            adaptiveDifficulty: true,
            supportedModes: ['sight-reading', 'scales', 'arpeggios', 'key-signatures'],
            calibrationRequired: false,
            tuningCheckRecommended: true,
            fretIndependent: true
        },

        ui: {
            showVirtualKeyboard: false,
            showMidiStatus: false,
            showPitchAccuracy: true,
            showMicrophoneLevel: true,
            showTuningReference: true,
            showCentsDeviation: true,
            showFretboardReference: false
        },

        audio: {
            bufferSize: 2048,
            noiseGate: -35,
            minFrequency: 140,  // Hz (below D3 = 146.83)
            maxFrequency: 1400
        }
    }
```

- [ ] **Step 4: Run tests to verify pass and no regressions**

Run: `pnpm --filter music-practice test:unit -- instrument-config-banjo && pnpm --filter music-practice typecheck`
Expected: PASS. Typecheck must pass — `INSTRUMENTS` is `Record<InstrumentTypeValue, InstrumentConfig>`, so adding the key satisfies the record.

- [ ] **Step 5: Commit**

```bash
git add apps/music-practice/src/lib/utils/instrument-config.ts apps/music-practice/src/lib/__tests__/instrument-config-banjo.test.ts
git commit -m "feat(music-practice): add banjo instrument profile with short 5th string"
```

---

### Task 3: Sight-reading note ranges

**Files:**
- Modify: `apps/music-practice/src/lib/game/note-range.ts`
- Test: `apps/music-practice/src/lib/game/note-range.test.ts` (extend)

**Interfaces:**
- Produces: `getNoteRange('banjo', difficulty)` returns banjo ranges. Consumed by `play.tsx` (already calls `getNoteRange(instrument, difficulty)`).

- [ ] **Step 1: Add failing test** — append to `note-range.test.ts` (match existing test style in the file):

```ts
it('returns banjo ranges', () => {
  expect(getNoteRange('banjo', 'beginner')).toBe('d3-a4');
  expect(getNoteRange('banjo', 'intermediate')).toBe('d3-d5');
  expect(getNoteRange('banjo', 'advanced')).toBe('d3-g5');
});
```

- [ ] **Step 2: Run to verify fail**

Run: `pnpm --filter music-practice test:unit -- note-range`
Expected: FAIL (falls back to piano range).

- [ ] **Step 3: Implement** — add to `NOTE_RANGES`:

```ts
  banjo: { beginner: 'd3-a4', intermediate: 'd3-d5', advanced: 'd3-g5' },
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm --filter music-practice test:unit -- note-range`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/music-practice/src/lib/game/note-range.ts apps/music-practice/src/lib/game/note-range.test.ts
git commit -m "feat(music-practice): banjo sight-reading note ranges"
```

---

### Task 4: Tab position math (short 5th string)

**Files:**
- Modify: `apps/music-practice/src/lib/utils/music-theory.ts:376-451` (`midiToTabPosition`, `getAllTabPositions`)
- Test: `apps/music-practice/src/lib/utils/music-theory.test.ts` (extend)

**Interfaces:**
- Consumes: `getTuning('banjo')` from Task 2 (strings with optional `startFret`).
- Produces: `midiToTabPosition(midi, 'banjo')` and `getAllTabPositions(midi, 'banjo')` return banjo-convention frets. `TabPosition` unchanged: `{ string: number; fret: number }`.

- [ ] **Step 1: Write failing tests** — append to `music-theory.test.ts`:

```ts
describe('banjo tab positions', () => {
  it('open strings map to fret 0', () => {
    expect(midiToTabPosition(50, 'banjo')).toEqual({ string: 4, fret: 0 }); // D3
    expect(midiToTabPosition(55, 'banjo')).toEqual({ string: 3, fret: 0 }); // G3
    expect(midiToTabPosition(59, 'banjo')).toEqual({ string: 2, fret: 0 }); // B3
    expect(midiToTabPosition(62, 'banjo')).toEqual({ string: 1, fret: 0 }); // D4
  });

  it('open 5th string G4 is fret 0 on string 5', () => {
    expect(midiToTabPosition(67, 'banjo')).toEqual({ string: 5, fret: 0 });
  });

  it('fretted 5th string uses physical fret numbers (>= 6)', () => {
    // A4 (69) = G4 + 2 semitones → physical fret 7 on the 5th string
    const positions = getAllTabPositions(69, 'banjo');
    expect(positions).toContainEqual({ string: 5, fret: 7 });
    // 5th string never shows frets 1–5
    for (const p of getAllTabPositions(68, 'banjo')) {
      if (p.string === 5) expect(p.fret).toBeGreaterThanOrEqual(6);
    }
  });

  it('prefers full-length strings over fretted 5th string', () => {
    // A4 (69): string 1 fret 7, string 2 fret 10, string 5 fret 7 → picks string 1 or 2? Lowest fret wins: fret 7 on strings 1 and 5; middle-string preference doesn't apply, but string 5 must not win over string 1.
    const pos = midiToTabPosition(69, 'banjo')!;
    expect(pos.string).not.toBe(5);
  });

  it('guitar behavior unchanged', () => {
    expect(midiToTabPosition(40, 'guitar')).toEqual({ string: 6, fret: 0 });
    expect(midiToTabPosition(64, 'guitar')).toEqual({ string: 4, fret: 14 } /* placeholder — see step note */);
  });
});
```

Note on the last assertion: before writing it, run the existing behavior (`midiToTabPosition(64, 'guitar')` currently returns the lowest-fret position, `{ string: 1, fret: 0 }` for open high E). Write the assertion to match **current** guitar output — the test's job is regression-guarding, not changing guitar behavior. Verify by adding a temporary `console.log` or checking the sort logic: fret 0 on string 1 wins. Use `expect(midiToTabPosition(64, 'guitar')).toEqual({ string: 1, fret: 0 })`.

- [ ] **Step 2: Run to verify fail**

Run: `pnpm --filter music-practice test:unit -- music-theory`
Expected: FAIL — 5th-string positions come out as raw semitone frets (G#4=68 would give string 5 fret 1) and G4 ties break wrong.

- [ ] **Step 3: Implement** — replace the position-collection loop in BOTH `midiToTabPosition` and `getAllTabPositions` with:

```ts
    tuning.forEach((stringInfo) => {
        const openStringMidi = stringInfo.midi;
        const stringNumber = stringInfo.string || 0;
        const startFret = stringInfo.startFret ?? 0;

        const semitones = midiNote - openStringMidi;
        if (semitones < 0) return;

        // Short strings (banjo 5th): open note is written as fret 0, fretted
        // notes use physical fret numbers above the string's nut.
        const fret = semitones === 0 ? 0 : semitones + startFret;
        if (fret > 24) return;

        possiblePositions.push({ string: stringNumber, fret });
    });
```

In `midiToTabPosition`, also add a short-string penalty to the sort so fretted positions on the 5th string never beat equal alternatives (keep the existing sort, extend the tie-break):

```ts
    const shortStrings = new Set(
        tuning.filter(s => (s.startFret ?? 0) > 0).map(s => s.string || 0)
    );

    possiblePositions.sort((a, b) => {
        if (a.fret !== b.fret) {
            return a.fret - b.fret;
        }
        // Prefer full-length strings over short (drone) strings
        const aShort = shortStrings.has(a.string) ? 1 : 0;
        const bShort = shortStrings.has(b.string) ? 1 : 0;
        if (aShort !== bShort) return aShort - bShort;
        // If same fret, prefer middle strings (2-4)
        const aMiddleBonus = (a.string >= 2 && a.string <= 4) ? -1 : 0;
        const bMiddleBonus = (b.string >= 2 && b.string <= 4) ? -1 : 0;
        return aMiddleBonus - bMiddleBonus;
    });
```

Note: with this sort, open G4 (67) resolves to string 3 fret 12? No — fret 0 on string 5 vs fret 5 on string 1 (62+5=67) vs fret 8 on string 2 vs fret 12 on string 3. Fret 0 still wins → string 5, fret 0. Correct: the open drone IS the idiomatic G4. The short-string penalty only demotes string 5 on fret ties (which, for fretted notes ≥6, can tie with strings 1–2 positions).

- [ ] **Step 4: Run to verify pass + full suite**

Run: `pnpm --filter music-practice test:unit`
Expected: all PASS (existing guitar/tab tests unchanged).

- [ ] **Step 5: Commit**

```bash
git add apps/music-practice/src/lib/utils/music-theory.ts apps/music-practice/src/lib/utils/music-theory.test.ts
git commit -m "feat(music-practice): banjo short-5th-string tab position math"
```

---

### Task 5: Tab renderer — 5-line banjo tab

**Files:**
- Modify: `apps/music-practice/src/lib/notation/tab-renderer.ts`

**Interfaces:**
- Consumes: `getTuning(instrumentId)` from instrument-config; `midiToTabPosition` from Task 4.
- Produces: `TabRenderer` renders N tab lines where N = tuning length (5 for banjo, 6 for guitar). `getOrientedString` generalized. No API change for callers (`TabDisplay.tsx` already passes `instrumentId`).

No unit test — VexFlow rendering isn't covered by jsdom tests in this codebase (no existing tab-renderer tests). Verified by typecheck + manual QA in Task 10.

- [ ] **Step 1: Add string count derived from tuning**

At the top of `tab-renderer.ts`, import `getTuning`:

```ts
import { midiToTabPosition } from '../utils/music-theory';
import { getTuning } from '../utils/instrument-config';
```

Add a private field and set it in the constructor:

```ts
    private stringCount: number = 6;

    constructor(containerId: string, instrumentId: string = 'guitar', tabOrientation: 'standard' | 'leftHanded' = 'standard') {
        this.instrumentId = instrumentId;
        this.tabOrientation = tabOrientation;
        this.stringCount = getTuning(instrumentId)?.length ?? 6;
        // ... rest unchanged
```

- [ ] **Step 2: Generalize orientation math**

Replace `getOrientedString` body (line 57-63):

```ts
    private getOrientedString(stringNumber: number): number {
        if (this.tabOrientation === 'leftHanded') {
            return this.stringCount + 1 - stringNumber;
        }
        return stringNumber;
    }
```

- [ ] **Step 3: Pass line count to every TabStave**

There are four `new VF.TabStave(...)` calls (lines ~221, ~310, ~389, ~474). Add the options argument to each:

```ts
const tabStave = new VF.TabStave(10, 20, 400, { num_lines: this.stringCount });
```

(keep each call's existing x/y/width values — only append `{ num_lines: this.stringCount }`).

- [ ] **Step 4: Typecheck + existing tests**

Run: `pnpm --filter music-practice typecheck && pnpm --filter music-practice test:unit`
Expected: PASS. If the `VexFlowAPI` typings reject the 4th argument, check `src/vexflow.d.ts` and extend the `TabStave` constructor signature there with `options?: { num_lines?: number }`.

- [ ] **Step 5: Commit**

```bash
git add apps/music-practice/src/lib/notation/tab-renderer.ts apps/music-practice/src/vexflow.d.ts
git commit -m "feat(music-practice): tab renderer supports 5-string banjo tab"
```

---

### Task 6: Banjo chord voicings (data + movable-shape generator)

**Files:**
- Create: `apps/music-practice/src/lib/banjo-chords.ts`
- Test: `apps/music-practice/src/lib/__tests__/banjo-chords.test.ts` (create)

**Interfaces:**
- Consumes: `Chord` type from `./chord-library` (fields `root: string`, `type: string`, `shortName: string`).
- Produces:
  - `interface BanjoVoicing { frets: [number, number, number, number]; description: string; generated: boolean }` — `frets[i]` = fret on string `i+1` (string 1 = D4 … string 4 = D3). 5th string is always the open g drone and is not part of `frets`.
  - `getBanjoVoicing(chord: Chord): BanjoVoicing | null` — explicit lookup, else movable-shape generation for plain major/minor triads and plain 7th chords, else `null`.
  - `banjoVoicingPitchClasses(v: BanjoVoicing): string[]` — sounded pitch classes (test helper, exported).

- [ ] **Step 1: Write the failing test**

```ts
// apps/music-practice/src/lib/__tests__/banjo-chords.test.ts
import { describe, it, expect } from 'vitest';
import { Chord as TonalChord } from 'tonal';
import { getBanjoVoicing, banjoVoicingPitchClasses } from '../banjo-chords';
import { CHORD_LIBRARY } from '../chord-library';
import type { Chord } from '../chord-library';

function fakeChord(root: string, type: Chord['type'], shortName: string): Chord {
  return { id: shortName, name: shortName, shortName, root, type,
    difficulty: 'beginner', voicings: [], theory: { intervals: [], construction: '', commonProgressions: [] },
    description: '', tags: [] };
}

/** Sounded pitch classes must be a subset of the chord's tones and include the root (except known rootless voicings). */
function assertValidVoicing(root: string, tonalName: string, shortName: string, type: Chord['type']) {
  const voicing = getBanjoVoicing(fakeChord(root, type, shortName));
  expect(voicing, `${shortName} should have a voicing`).not.toBeNull();
  const chordTones = new Set(TonalChord.get(tonalName).notes.map((n) => TonalChord.get(tonalName).notes && n));
  const tones = TonalChord.get(tonalName).notes; // pitch classes
  const sounded = banjoVoicingPitchClasses(voicing!);
  for (const pc of sounded) {
    expect(tones, `${shortName}: ${pc} not in ${tones.join(',')}`).toContain(pc);
  }
  expect(sounded.length).toBeGreaterThanOrEqual(3);
}

describe('explicit beginner voicings', () => {
  it('G major is all open', () => {
    const v = getBanjoVoicing(fakeChord('G', 'major', 'G'))!;
    expect(v.frets).toEqual([0, 0, 0, 0]);
    expect(v.generated).toBe(false);
  });

  const majors: Array<[string, string]> = [['G','G'],['C','C'],['D','D'],['F','F'],['A','A'],['E','E'],['Bb','Bb']];
  for (const [root, name] of majors) {
    it(`${name} major`, () => assertValidVoicing(root, `${root} major`, name, 'major'));
  }

  const minors = ['E','A','D','B','F#','G','C'];
  for (const root of minors) {
    it(`${root}m`, () => assertValidVoicing(root, `${root} minor`, `${root}m`, 'minor'));
  }

  const sevenths = ['G','C','D','A','E','B'];
  for (const root of sevenths) {
    it(`${root}7`, () => assertValidVoicing(root, `${root} dominant seventh`, `${root}7`, 'dominant'));
  }
});

describe('movable-shape generator', () => {
  const ROOTS = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
  for (const root of ROOTS) {
    it(`generates ${root} major within 15 frets`, () => {
      const v = getBanjoVoicing(fakeChord(root, 'major', `${root}!gen`))!; // shortName not in explicit map
      expect(v).not.toBeNull();
      expect(Math.max(...v.frets)).toBeLessThanOrEqual(15);
      const tones = TonalChord.get(`${root} major`).notes;
      for (const pc of banjoVoicingPitchClasses(v)) expect(tones).toContain(pc);
    });
    it(`generates ${root} minor`, () => {
      const v = getBanjoVoicing(fakeChord(root, 'minor', `${root}m!gen`))!;
      const tones = TonalChord.get(`${root} minor`).notes;
      for (const pc of banjoVoicingPitchClasses(v)) expect(tones).toContain(pc);
    });
  }

  it('returns null for unsupported qualities', () => {
    expect(getBanjoVoicing(fakeChord('C', 'diminished', 'Cdim!gen'))).toBeNull();
    expect(getBanjoVoicing(fakeChord('C', 'extended', 'Cmaj9!gen'))).toBeNull();
  });
});

describe('library coverage', () => {
  it('every beginner chord in the library has a banjo voicing or is an unsupported quality', () => {
    for (const chord of CHORD_LIBRARY.filter((c) => c.difficulty === 'beginner')) {
      const v = getBanjoVoicing(chord);
      if (['major', 'minor', 'dominant'].includes(chord.type)) {
        expect(v, `${chord.shortName} should resolve`).not.toBeNull();
      }
    }
  });
});
```

Note: Tonal's chord-name spellings — verify `TonalChord.get('C dominant seventh').notes` returns `['C','E','G','Bb']` (it does in tonal 6.x; the alias `'C7'` also works: `TonalChord.get('C7')`). Enharmonic comparison: normalize both sides through `Note.chroma` if literal pitch-class strings mismatch (e.g. `D#` vs `Eb`) — implement `banjoVoicingPitchClasses` to return chroma-canonical sharp names and compare via chroma sets rather than strings if the string comparison proves brittle. Prefer comparing chromas:

```ts
const toneChromas = new Set(tones.map((t) => Note.chroma(t)));
for (const pc of sounded) expect(toneChromas.has(Note.chroma(pc))).toBe(true);
```

Use the chroma form in the final test — it is enharmonic-safe.

- [ ] **Step 2: Run to verify fail**

Run: `pnpm --filter music-practice test:unit -- banjo-chords`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement `banjo-chords.ts`**

```ts
/**
 * Banjo chord voicings — 5-string banjo, Open G (gDGBD)
 *
 * Explicit first-position voicings for common chords, plus movable-shape
 * generation (barre / F-shape / Fm-shape / Am-shape / 7th-barre) for any
 * other plain major, minor, or dominant-7th chord.
 *
 * frets[i] = fret on string i+1 (string 1 = D4, 2 = B3, 3 = G3, 4 = D3).
 * The short 5th string (g drone) is never fretted in these voicings.
 */

import { Note } from 'tonal';
import type { Chord } from './chord-library';

export interface BanjoVoicing {
  /** Frets for strings 1–4 (D4, B3, G3, D3) */
  frets: [number, number, number, number];
  description: string;
  /** True if produced by the movable-shape generator */
  generated: boolean;
}

// Open-string MIDI values for strings 1–4
const OPEN_MIDI = [62, 59, 55, 50]; // D4, B3, G3, D3

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Sounded pitch classes for a voicing (strings 1–4 only; drone excluded) */
export function banjoVoicingPitchClasses(voicing: BanjoVoicing): string[] {
  const pcs = voicing.frets.map((fret, i) => SHARP_NAMES[(OPEN_MIDI[i] + fret) % 12]);
  return [...new Set(pcs)];
}

// ── Explicit first-position voicings ────────────────────────
// Keyed by `${rootChroma}:${quality}`.

type Quality = 'major' | 'minor' | 'dominant';

function key(root: string, quality: Quality): string {
  return `${Note.chroma(root)}:${quality}`;
}

const EXPLICIT: Record<string, BanjoVoicing> = {
  // Majors
  [key('G', 'major')]: { frets: [0, 0, 0, 0], description: 'Open G — all strings open', generated: false },
  [key('C', 'major')]: { frets: [2, 1, 0, 2], description: 'First-position C', generated: false },
  [key('D', 'major')]: { frets: [4, 3, 2, 0], description: 'First-position D', generated: false },
  [key('F', 'major')]: { frets: [3, 1, 2, 3], description: 'F shape', generated: false },
  [key('A', 'major')]: { frets: [2, 2, 2, 2], description: 'Barre at 2nd fret', generated: false },
  [key('E', 'major')]: { frets: [2, 0, 1, 2], description: 'First-position E', generated: false },
  [key('Bb', 'major')]: { frets: [3, 3, 3, 3], description: 'Barre at 3rd fret', generated: false },
  // Minors
  [key('E', 'minor')]: { frets: [2, 0, 0, 2], description: 'First-position Em', generated: false },
  [key('A', 'minor')]: { frets: [2, 1, 2, 2], description: 'First-position Am', generated: false },
  [key('D', 'minor')]: { frets: [3, 3, 2, 0], description: 'First-position Dm', generated: false },
  [key('B', 'minor')]: { frets: [4, 3, 4, 4], description: 'Bm — Am shape at 4th fret', generated: false },
  [key('F#', 'minor')]: { frets: [4, 2, 2, 4], description: 'F#m — Fm shape at 4th fret', generated: false },
  [key('G', 'minor')]: { frets: [5, 3, 3, 5], description: 'Gm — Fm shape at 5th fret', generated: false },
  [key('C', 'minor')]: { frets: [5, 4, 5, 5], description: 'Cm — Am shape at 5th fret', generated: false },
  // Dominant 7ths
  [key('G', 'dominant')]: { frets: [3, 0, 0, 0], description: 'First-position G7', generated: false },
  [key('C', 'dominant')]: { frets: [2, 1, 3, 2], description: 'First-position C7', generated: false },
  [key('D', 'dominant')]: { frets: [0, 1, 2, 0], description: 'First-position D7', generated: false },
  [key('A', 'dominant')]: { frets: [5, 2, 2, 2], description: 'A7 — 7th barre shape at 2nd fret', generated: false },
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

/** Map a library chord to a quality the banjo module supports, or null. */
function chordQuality(chord: Chord): Quality | null {
  if (chord.type === 'major' || chord.type === 'minor') return chord.type;
  // Only plain dominant 7ths (e.g. "G7"), not 9ths/13ths
  if (chord.type === 'dominant' && /^[A-G][#b]?7$/.test(chord.shortName)) return 'dominant';
  return null;
}

export function getBanjoVoicing(chord: Chord): BanjoVoicing | null {
  const quality = chordQuality(chord);
  if (!quality) return null;
  return EXPLICIT[key(chord.root, quality)] ?? generateVoicing(chord.root, quality);
}
```

Implementation caution: `chordQuality` for major/minor must exclude extended variants — check how the library labels e.g. `Cmaj7` (`type: 'major'`? or `'extended'`?). Inspect `CHORD_LIBRARY` entries: if maj7/m7 chords carry `type: 'major' | 'minor'`, tighten the check the same way as dominant: `/^[A-G][#b]?m?$/.test(chord.shortName)`. Adjust the regex against real library data and make the coverage test in Step 1 reflect it.

- [ ] **Step 4: Run to verify pass**

Run: `pnpm --filter music-practice test:unit -- banjo-chords`
Expected: PASS. If a specific explicit voicing fails the chord-tone subset check, re-derive its frets from the open-string pitches (D4/B3/G3/D3 + fret) — the test is authoritative, the data must satisfy it.

- [ ] **Step 5: Commit**

```bash
git add apps/music-practice/src/lib/banjo-chords.ts apps/music-practice/src/lib/__tests__/banjo-chords.test.ts
git commit -m "feat(music-practice): banjo chord voicings with movable-shape generator"
```

---

### Task 7: Banjo chord diagrams (`ChordDiagram`)

**Files:**
- Modify: `apps/music-practice/src/components/ChordReference/ChordDiagram.tsx`
- Test: `apps/music-practice/src/components/ChordReference/__tests__/ChordDiagramBanjo.test.tsx` (create)

**Interfaces:**
- Consumes: `getBanjoVoicing` from Task 6.
- Produces: `ChordDiagram` accepts `instrument?: 'guitar' | 'banjo'` (default `'guitar'`). Banjo mode renders 5 columns: leftmost = 5th-string drone (always open marker `o`), then strings 4→1. Guitar rendering byte-identical to before when prop omitted.

- [ ] **Step 1: Write failing test** (Testing Library, jsdom — same setup as existing component tests):

```tsx
// ChordDiagramBanjo.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChordDiagram } from '../ChordDiagram';
import { getChordById, CHORD_LIBRARY } from '@/lib/chord-library';

const gMajor = CHORD_LIBRARY.find((c) => c.shortName === 'G' && c.type === 'major')!;

describe('ChordDiagram banjo mode', () => {
  it('renders 5 string labels for banjo', () => {
    render(<ChordDiagram chord={gMajor} instrument="banjo" />);
    // Banjo string labels: g D G B D
    expect(screen.getByText('g')).toBeInTheDocument();
  });

  it('defaults to guitar (6 strings, E labels)', () => {
    render(<ChordDiagram chord={gMajor} />);
    expect(screen.getAllByText('E').length).toBeGreaterThanOrEqual(1);
  });
});
```

(Adjust the `gMajor` lookup to however the library ids G major — check `CHORD_LIBRARY` first; `getChordById('g-major')` may be the form.)

- [ ] **Step 2: Run to verify fail**

Run: `pnpm --filter music-practice test:unit -- ChordDiagramBanjo`
Expected: FAIL — no `instrument` prop, no `g` label.

- [ ] **Step 3: Implement**

In `ChordDiagram.tsx`:

1. Add import and prop:

```tsx
import { getBanjoVoicing } from '@/lib/banjo-chords';

interface ChordDiagramProps {
  chord: Chord;
  voicing?: ChordVoicing;
  size?: 'small' | 'medium' | 'large';
  hideChordInfo?: boolean;
  /** Which instrument's diagram to draw (default guitar) */
  instrument?: 'guitar' | 'banjo';
}
```

2. Replace the hardcoded `STRING_LABELS` usage with per-instrument labels, and build fingerings per instrument. Where the component currently computes `guitarFingerings` from `guitarData.frets` (6 entries, string 1–6), add a banjo branch. Diagram columns run left→right from lowest-string label to highest; banjo columns: `['g', 'D', 'G', 'B', 'd']` = [5th drone, str4, str3, str2, str1]:

```tsx
const GUITAR_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];
const BANJO_LABELS = ['g', 'D', 'G', 'B', 'd'];

// inside the component:
const banjoVoicing = instrument === 'banjo' ? getBanjoVoicing(chord) : null;
const stringLabels = instrument === 'banjo' ? BANJO_LABELS : GUITAR_LABELS;
const stringCount = stringLabels.length;

// Column-indexed fingerings (column 0 = leftmost string).
// Guitar: columns 0..5 = strings 6..1. Banjo: column 0 = drone (always open),
// columns 1..4 = strings 4..1.
const fingerings: Array<{ column: number; fret: number }> = instrument === 'banjo'
  ? banjoVoicing
    ? [
        { column: 0, fret: 0 }, // 5th-string drone, always open
        { column: 1, fret: banjoVoicing.frets[3] }, // string 4
        { column: 2, fret: banjoVoicing.frets[2] }, // string 3
        { column: 3, fret: banjoVoicing.frets[1] }, // string 2
        { column: 4, fret: banjoVoicing.frets[0] }, // string 1
      ]
    : []
  : guitarFingerings.map((f) => ({ column: 6 - f.string, fret: f.fret }));
```

3. Update the SVG layout constants that assume 6 strings: `fretboardWidth = stringSpacing * 5` becomes `stringSpacing * (stringCount - 1)`; every loop over strings/labels iterates `stringCount`; muted markers only apply to guitar (`guitarData.muted`). The existing dot/fret-number rendering keys off the fingerings array — switch it to the column-indexed form above for both instruments (guitar mapping `column = 6 - string` preserves current output).

4. When `instrument === 'banjo'` and `banjoVoicing === null`, render the existing "no voicing" fallback (the component's callers already handle missing guitar data — mirror that: return the fallback text block `No banjo voicing for this chord`).

5. If the voicing is `generated`, show `banjoVoicing.description` under the diagram where the guitar `description` currently renders.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter music-practice test:unit -- ChordDiagram`
Expected: new banjo test PASS, existing `ChordDiagramLeak.test.tsx` PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/music-practice/src/components/ChordReference/ChordDiagram.tsx apps/music-practice/src/components/ChordReference/__tests__/ChordDiagramBanjo.test.tsx
git commit -m "feat(music-practice): banjo chord diagrams"
```

---

### Task 8: Chord reference banjo toggle

**Files:**
- Modify: `apps/music-practice/src/components/Piano/InstrumentToggle.tsx`
- Modify: `apps/music-practice/src/components/ChordReference/ChordReference.tsx:110-311`

**Interfaces:**
- Consumes: `ChordDiagram` `instrument` prop (Task 7), `getBanjoVoicing` (Task 6).
- Produces: `InstrumentToggle` accepts `instrument: 'guitar' | 'banjo' | 'piano'` and renders three buttons.

- [ ] **Step 1: Extend InstrumentToggle**

```tsx
import React from 'react'
import { Guitar, Piano } from 'lucide-react'

export type ToggleInstrument = 'guitar' | 'banjo' | 'piano'

interface InstrumentToggleProps {
  instrument: ToggleInstrument
  onChange: (instrument: ToggleInstrument) => void
}

const OPTIONS: Array<{ id: ToggleInstrument; label: string; icon: React.ReactNode }> = [
  { id: 'guitar', label: 'Guitar', icon: <Guitar className="w-4 h-4 inline mr-1" /> },
  { id: 'banjo', label: 'Banjo', icon: <span className="inline mr-1" aria-hidden>🪕</span> },
  { id: 'piano', label: 'Piano', icon: <Piano className="w-4 h-4 inline mr-1" /> },
]

export const InstrumentToggle: React.FC<InstrumentToggleProps> = ({ instrument, onChange }) => {
  return (
    <div className="flex gap-2 mb-4">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-4 py-2 rounded ${
            instrument === opt.id
              ? 'bg-[var(--accent-color)] text-white'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  )
}
```

Check other usages first: `grep -rn "InstrumentToggle" apps/music-practice/src` — any other consumer's `'guitar' | 'piano'` state type must be widened or it won't compile.

- [ ] **Step 2: Wire ChordReference**

In `ChordReference.tsx`:

```tsx
type Instrument = 'guitar' | 'banjo' | 'piano';
```

In the diagram area (around line 293), add the banjo branch:

```tsx
{selectedInstrument === 'guitar' && currentVoicing?.guitar ? (
  /* existing guitar block unchanged */
) : selectedInstrument === 'banjo' ? (
  getBanjoVoicing(selectedChord) ? (
    <ChordDiagram chord={selectedChord} instrument="banjo" />
  ) : (
    <div className="text-muted-foreground">No banjo voicing for this chord</div>
  )
) : selectedInstrument === 'piano' && currentVoicing?.piano ? (
  /* existing piano block unchanged */
) : ( /* existing fallback */ )}
```

Match the actual JSX structure and variable names in the file (`selectedChord` may be named differently — read the surrounding code and adapt; the fallback block at line ~311 already prints `No {selectedInstrument} voicing for this chord`, so the simplest correct wiring may be to let the banjo case fall through to it when `getBanjoVoicing` is null). Import `getBanjoVoicing` from `@/lib/banjo-chords`.

- [ ] **Step 3: Typecheck + tests + eyeball**

Run: `pnpm --filter music-practice typecheck && pnpm --filter music-practice test:unit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/music-practice/src/components/Piano/InstrumentToggle.tsx apps/music-practice/src/components/ChordReference/ChordReference.tsx
git commit -m "feat(music-practice): banjo option in chord reference"
```

---

### Task 9: Fretboard short-string support + scale views

**Files:**
- Modify: `apps/music-practice/src/components/GuitarFretboard/GuitarFretboard.tsx`
- Modify: `apps/music-practice/src/components/shared/ScaleDetailPanel.tsx`
- Test: `apps/music-practice/src/components/GuitarFretboard/__tests__/GuitarFretboard.test.tsx` (create; check for an existing test file first and extend it if present)

**Interfaces:**
- Produces: `GuitarFretboardProps` gains `startFrets?: number[]` (aligned to `tuning` array; default all 0). Exported constant `BANJO_OPEN_G: { tuning: string[]; startFrets: number[] }` for reuse.
- Consumes: nothing new.

- [ ] **Step 1: Write failing test**

```tsx
// GuitarFretboard.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GuitarFretboard, BANJO_OPEN_G } from '../GuitarFretboard';

describe('GuitarFretboard banjo mode', () => {
  it('renders 5 strings for banjo tuning', () => {
    const { container } = render(
      <GuitarFretboard notes={['G', 'A', 'B', 'C', 'D', 'E', 'F#']} root="G" {...BANJO_OPEN_G} />
    );
    const strings = container.querySelectorAll('line[data-string]');
    expect(strings.length).toBe(5);
  });

  it('places no dots below the short string start fret', () => {
    const { container } = render(
      <GuitarFretboard notes={['G', 'A', 'B', 'C', 'D', 'E', 'F#']} root="G" {...BANJO_OPEN_G} />
    );
    // The short string (displayed last, bottom) must have no dots at frets 1–4.
    const shortDots = container.querySelectorAll('[data-string-idx="4"][data-fret]');
    for (const dot of shortDots) {
      const fret = Number(dot.getAttribute('data-fret'));
      expect(fret === 0 || fret >= 5).toBe(true);
    }
  });
});
```

To make this testable, add `data-string` to the string `<line>` elements and `data-string-idx` / `data-fret` to note-dot elements while implementing (cheap, invisible in output).

- [ ] **Step 2: Run to verify fail**

Run: `pnpm --filter music-practice test:unit -- GuitarFretboard`
Expected: FAIL — `BANJO_OPEN_G` not exported.

- [ ] **Step 3: Implement**

In `GuitarFretboard.tsx`:

1. Export the banjo preset. Tuning array order matches the existing prop contract (component reverses it for display, top = last element). To display banjo strings top→bottom as D4, B3, G3, D3, g(short 5th at bottom):

```tsx
/** 5-string banjo Open G preset: fretted strings + short 5th (drone) string.
 *  Array order is display-bottom→top after the component's reverse: the short
 *  g string renders at the bottom, matching banjo tab/diagram convention. */
export const BANJO_OPEN_G = {
  tuning: ['G4', 'D3', 'G3', 'B3', 'D4'],
  startFrets: [5, 0, 0, 0, 0],
};
```

2. Add `startFrets?: number[]` to `GuitarFretboardProps` (default `undefined` → all zeros).

3. In `computeNotes`, thread startFrets (reversed alongside tuning) and change the inner loop:

```tsx
function computeNotes(
  notes: string[],
  root: string,
  tuning: string[],
  fretCount: number,
  startFrets: number[]
): FretboardNote[] {
  const normalizedNotes = new Set(notes.map(normalizeNote));
  const normalizedRoot = normalizeNote(root);
  const result: FretboardNote[] = [];

  const reversedTuning = [...tuning].reverse();
  const reversedStartFrets = [...startFrets].reverse();

  for (let stringIdx = 0; stringIdx < reversedTuning.length; stringIdx++) {
    const startFret = reversedStartFrets[stringIdx] ?? 0;
    for (let fret = startFret; fret <= fretCount; fret++) {
      // Short strings: pitch offset is measured from the string's own nut
      const note = noteAtFret(reversedTuning[stringIdx], fret - startFret);
      const normalized = normalizeNote(note);
      if (normalizedNotes.has(normalized)) {
        const degree = notes.findIndex(n => normalizeNote(n) === normalized) + 1;
        result.push({
          string: stringIdx,
          fret,
          note: notes.find(n => normalizeNote(n) === normalized) || note,
          isRoot: normalized === normalizedRoot,
          degree: degree > 0 ? degree : undefined,
        });
      }
    }
  }
  return result;
}
```

Update the `useMemo` call to pass `startFrets ?? tuning.map(() => 0)`.

4. In the SVG string-rendering loop, start short strings at their nut x-position:

```tsx
{Array.from({ length: stringCount }).map((_, i) => {
  const startFret = reversedStartFretsForRender[i] ?? 0; // compute once above render
  const x1 = startFret === 0 ? leftPad : fretboardStartX + startFret * fretWidth;
  const y = topPad + i * stringSpacing;
  const thickness = 1 + (i * 0.3);
  return (
    <line
      key={`string-${i}`}
      data-string={i}
      x1={x1}
      y1={y}
      x2={fretboardStartX + fretboardWidth}
      y2={y}
      stroke="var(--ink-tertiary, #9c9590)"
      strokeWidth={thickness}
    />
  );
})}
```

Where `reversedStartFretsForRender = [...(startFrets ?? tuning.map(() => 0))].reverse()` computed alongside `stringLabels`. Also render the short string's open-note dot at its nut: the `n.fret === 0` open-dot positioning branch must, for short strings, place the "open" dot at `fretboardStartX + startFret * fretWidth - fretWidth / 2`... simpler and correct: in `computeNotes`, the open note of a short string is emitted with `fret = startFret` (fret loop starts at `startFret`, `fret - startFret = 0` → open pitch at column `startFret`), so no special dot positioning is needed — open drone dot lands in the fret-5 column automatically. Verify visually in Task 11.

String label for the short string: `stringLabels` already derives from tuning (`g` shows as `G`); lowercase the short-string label when `startFret > 0` for banjo convention:

```tsx
const stringLabels = [...tuning].reverse().map((t, i) => {
  const pc = Note.pitchClass(t);
  return (reversedStartFretsForRender[i] ?? 0) > 0 ? pc.toLowerCase() : pc;
});
```

Add `data-string-idx={n.string}` and `data-fret={n.fret}` to the note-dot group/circle elements.

- [ ] **Step 4: Wire into ScaleDetailPanel**

In `ScaleDetailPanel.tsx` (line ~66), replace the single fretboard with a local toggle:

```tsx
import { useState } from 'react';
import { GuitarFretboard, BANJO_OPEN_G } from '../GuitarFretboard';

// inside the component:
const [fretboardInstrument, setFretboardInstrument] = useState<'guitar' | 'banjo'>('guitar');

// replacing the existing <GuitarFretboard .../> line:
<div className="space-y-2">
  <div className="flex gap-1">
    {(['guitar', 'banjo'] as const).map((inst) => (
      <button
        key={inst}
        onClick={() => setFretboardInstrument(inst)}
        className={`px-2 py-1 text-xs rounded ${
          fretboardInstrument === inst ? 'bg-[var(--accent-color)] text-white' : 'bg-muted text-muted-foreground'
        }`}
      >
        {inst === 'guitar' ? '🎸 Guitar' : '🪕 Banjo'}
      </button>
    ))}
  </div>
  {fretboardInstrument === 'guitar' ? (
    <GuitarFretboard notes={notes} root={root} compact label={`${root} ${scale.name}`} />
  ) : (
    <GuitarFretboard notes={notes} root={root} compact label={`${root} ${scale.name} — banjo (Open G)`} {...BANJO_OPEN_G} />
  )}
</div>
```

(Adapt variable names `notes`, `root`, `scale` to what line 66 actually uses — they're already in scope there.)

- [ ] **Step 5: Run tests + typecheck**

Run: `pnpm --filter music-practice test:unit -- GuitarFretboard && pnpm --filter music-practice typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/music-practice/src/components/GuitarFretboard apps/music-practice/src/components/shared/ScaleDetailPanel.tsx
git commit -m "feat(music-practice): banjo fretboard with short 5th string in scale views"
```

---

### Task 10: Sight-reading game — banjo in `/play`

**Files:**
- Modify: `apps/music-practice/src/routes/play.tsx`

**Interfaces:**
- Consumes: banjo config (Task 2), banjo ranges (Task 3), tab math (Task 4), 5-line tab renderer (Task 5).

- [ ] **Step 1: Add banjo to the instrument list** (line ~72):

```tsx
const INSTRUMENTS = [
  { id: 'piano', label: 'Piano (MIDI)', icon: Piano, description: 'Connect a MIDI keyboard' },
  { id: 'piano-virtual', label: 'Piano (Virtual)', icon: Piano, description: 'On-screen keyboard' },
  { id: 'violin', label: 'Violin (Mic)', icon: Mic, description: 'Microphone pitch detection' },
  { id: 'guitar', label: 'Guitar (Mic)', icon: Guitar, description: 'Microphone pitch detection' },
  { id: 'banjo', label: 'Banjo (Mic)', icon: Guitar, description: 'Microphone pitch detection' },
] as const;
```

(Lucide has no banjo icon; `Guitar` is the closest. If the setup card renders the instrument config emoji anywhere, 🪕 comes from `getInstrument('banjo').emoji`.)

- [ ] **Step 2: Generalize mic detection** (line ~115) — derive from config instead of hardcoding:

```tsx
import { getInstrument, requiresMicrophone, requiresMIDI, type InstrumentTypeValue } from '../lib/utils/instrument-config';

const isMicInstrument = requiresMicrophone(instrument);
```

`requiresMicrophone` already exists in instrument-config (line 382). Remove the hardcoded `instrument === 'violin' || instrument === 'guitar'`.

- [ ] **Step 3: Enable tab display for banjo** (line ~254):

```tsx
{(instrument === 'guitar' || instrument === 'banjo') && (
  /* existing Tab Display select unchanged */
)}
```

Then search the rest of `play.tsx` for other `=== 'guitar'` guards (`grep -n "'guitar'" src/routes/play.tsx`) — every guard that gates tab rendering or mic behavior must include banjo (or switch to a config-driven check). In particular the game screen's tab-display condition and the `instrumentRef` cast at line ~520:

```tsx
const instrumentConfig = getInstrument(instrumentRef.current);
```

(drop the `as 'piano' | 'violin' | 'guitar'` cast — `getInstrument` takes `string`).

- [ ] **Step 4: Typecheck + full test suite**

Run: `pnpm --filter music-practice typecheck && pnpm --filter music-practice test:unit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/music-practice/src/routes/play.tsx
git commit -m "feat(music-practice): banjo in sight-reading game"
```

---

### Task 11: Verification pass

**Files:** none (verification only; fix regressions found).

- [ ] **Step 1: Full gates**

Run: `pnpm --filter music-practice lint && pnpm --filter music-practice typecheck && pnpm --filter music-practice test:unit`
Expected: all PASS.

- [ ] **Step 2: Build**

Run: `pnpm --filter @hudak/tuning-data build && pnpm --filter music-practice build`
Expected: build succeeds, outputs to `docs/music-practice/`.

- [ ] **Step 3: Manual QA (dev server)**

Run: `pnpm --filter music-practice dev` and check:
1. `/play` — banjo appears in setup; select it → mic settings + tab-display select show; start a round → 5-line tab renders; note range within D3–A4 (beginner).
2. Chord reference — banjo toggle; G shows all-open diagram with 5 columns and `g` drone; a jazz chord (e.g. Cmaj9) shows "No banjo voicing".
3. Scale view with ScaleDetailPanel (Scale Explorer / Improv prompt) — banjo toggle shows 5-string fretboard, bottom string starts at fret 5.
4. `/tuner` — banjo 5-string category shows Open D as aDF#AD (A4 first) and Double D present.
5. Theme toggle — tab SVG legible in dark mode (existing theme logic should handle it).

Use the `verify` skill for this step if driving the browser.

- [ ] **Step 4: Commit any QA fixes, then final commit**

```bash
git add -A && git commit -m "feat(music-practice): banjo mode QA fixes"
```

---

## Self-Review Notes

- **Spec coverage**: tuner fixes (T1), profile+startFret (T2), ranges (T3), tab math (T4), tab renderer (T5), chord data+generator (T6), chord diagrams (T7), chord reference toggle (T8), fretboard+scale views (T9), play route (T10), tests+QA (T11). Sessions/stats need no changes (spec "free wins").
- **Chord data**: explicit voicings are chart-derived; the chord-tone subset test in T6 is authoritative — if a voicing fails, fix the data, not the test.
- **Guitar regression guards**: T4 pins current guitar tab output; T7/T9 keep guitar rendering paths untouched by default props.

# Music Practice App — Architecture, Design & Reference Library Audit

**Date:** June 10, 2026
**Scope:** Architecture, UI/UX & responsiveness, music reference data accuracy, expansion opportunities
**Method:** Full codebase review, typecheck + test run on a fresh install, data-layer import tracing, musical spot-checks

---

## 1. Executive Summary

The app is in good shape where it counts: the modern `src/` codebase (~33K LOC) is well organized, 1,550 unit tests pass across 26 files, the theory data layer is broad and mostly accurate, and the reference-first restructure largely landed.

Four findings dominate everything else:

1. **`pnpm typecheck` fails today** — 3 unused-symbol errors in the app plus ~16 module-resolution errors leaking in from `@hudak/ui`. The quality gate is off.
2. **33 duplicate chord IDs in `chord-library.ts`** — the ID slugifier strips `#`, so *C♯ Major* gets id `c-major` (colliding with C Major) and *F♯m7♭5* gets `f-half-diminished-7th` (colliding with Fm7♭5). Any lookup by ID can silently return the wrong chord; React logs duplicate-key warnings in `ChordSearch`.
3. **The April 2026 theory-library expansion is dark data.** `scale-registry.ts` (62 scales), `chord-types.ts` (63 types), `intervals.ts`, `enharmonics.ts`, `avoid-notes.ts`, `arpeggios/` (33), `progressions/` (35 + 8 sequences), and `chord-scale-extended.ts` (Harmonic Major) are all built and tested — and **none of them is imported by any route or component**. The live UI still consumes only the old 28-entry `chord-scale-matrix.ts` and `circle-of-fifths.ts`. The biggest "expansion" available is surfacing content that already exists.
4. **~8% of the repo is dead code** — the pre-Vite `js/` tree, `tsup.config.ts`, the `Music Learning Game App/` Figma prototype, shadow copies in `src/utils|input|midi`, and empty stubs.

---

## 2. Architecture Findings

### 2.1 Health check (verified on fresh install)

| Check | Result |
|---|---|
| `pnpm install` | ✅ clean |
| `pnpm test:unit` | ✅ 1,550 tests / 26 files pass |
| `pnpm typecheck` | ❌ **fails** (see below) |
| React warnings during tests | ⚠️ duplicate keys (`e-half-diminished-7th`, `b-…`, …) from chord-library duplicates |

Typecheck failures:
- App: unused declarations in `src/lib/utils/music-theory.ts:89,150` and `src/routes/index.tsx:8`.
- `@hudak/ui`: ~16 `TS2307 Cannot find module '@/components/…'` errors — the shared package's internal `@/` alias doesn't resolve when the app's `tsc` walks into `../../packages/ui/src`. The package needs its own paths config (or the app should consume built output / set `skipLibCheck`-safe boundaries). Until this is fixed, no type regression in the app will be caught.

### 2.2 Dead code & duplication (~3K+ LOC)

| Artifact | Status | Action |
|---|---|---|
| `js/` (11 files, ~3K LOC) | Pre-Vite legacy, zero imports, excluded from tsconfig | Delete, plus `tsup.config.ts` |
| `Music Learning Game App/` | Abandoned Figma/prototype export, own package.json, never integrated | Delete or archive |
| `src/utils/`, `src/input/`, `src/midi/` | Shadow copies of `src/lib/{utils,input}`; nothing imports them | Delete |
| `src/components/PianoKeyboard.tsx`, `InstrumentSelector.tsx` | Empty stubs | Delete |
| `src/components/Piano/PianoKeyboard.tsx` | Never imported (canonical impl is `virtual-keyboard.tsx`) | Delete |
| `src/data/hello.ts` | Scaffold test artifact | Delete |
| ~~`@hudak/audio-components` dependency~~ | **Correction:** it IS used — `PitchGauge` in `src/components/play/notation-card.tsx` | Keep |
| `test-sight-reading.js` | Ad-hoc Puppeteer script wired as `pnpm test` | Move under `scripts/`, integrate or document |

### 2.3 What's good

- **Routing/state**: TanStack Router file-based routes with auto code-splitting; consistent localStorage persistence via a single `Storage` namespace; game logic encapsulated in `use-game-round`. No state-management sprawl.
- **Monorepo integration**: `@tools/typescript-config`, `@tools/eslint-config`, `@hudak/ui` all genuinely used.
- **Stack choices** (VexFlow, Tonal, Tone.js, Pitchy) remain right-sized.

Minor inconsistencies: `notation/` and `play/` component dirs are kebab-case while features use PascalCase; tests mix `__tests__/` dirs and co-located `.test.ts`.

---

## 3. Reference Library — Accuracy Audit

### 3.1 Inventory

| Module | Contents | Consumed by UI? |
|---|---|---|
| `data/chord-scale-matrix.ts` | 28 entries (4 families × 7 degrees) | ✅ ScaleReference, ChordScaleMatrix, ChordScaleGame |
| `data/circle-of-fifths.ts` | 15 key pairs + diatonic triads/7ths | ✅ CircleOfFifths |
| `lib/chord-library.ts` | 309 chords, guitar + piano voicings | ✅ ChordReference, quizzes |
| `lib/piano-voicings.ts` | 180+ jazz/intermediate voicings | ✅ via chord displays |
| `data/scales/scale-registry.ts` | **62 scales, 9 families** (incl. pentatonic, blues, bebop, symmetric, world, harmonic major) | ❌ dark |
| `data/chords/chord-types.ts` | **63 chord type definitions** | ❌ dark |
| `data/intervals.ts` | 28 intervals + inversions/compounds | ❌ dark |
| `data/enharmonics.ts` | Key-aware spelling engine, 30 keys | ❌ dark |
| `data/avoid-notes.ts` | 7 chord-scale avoid-note entries | ❌ dark |
| `data/arpeggios/` | 33 arpeggios + practice patterns | ❌ dark |
| `data/progressions/` | 35 progressions (jazz/blues/pop/classical/modal) + 8 harmonic sequences | ❌ dark |
| `data/chord-scale-extended.ts` | Harmonic Major family + extended mappings | ❌ dark |

### 3.2 Accuracy issues found

**🔴 Critical — duplicate chord IDs (33 collisions).** The slug generator (see `scripts/generate-missing-chords.mjs`) drops `#` from roots:

- `c-major` is defined twice: C Major (line 123) and **C♯ Major** (line 2513)
- `f-half-diminished-7th` twice: Fm7♭5 (5285) and **F♯m7♭5** (5384)
- …31 more (`a-minor`, `g-dominant-7th`, `b-major`, `c-dominant-7th`, all `*-diminished`/`*-half-diminished-7th` sharps, etc.)

Impact: `find`-by-id returns the first match, so a request for C♯ Major data can resolve to C Major; React key collisions in lists. Fix: re-slug with accidentals (`c-sharp-major`), add a uniqueness invariant test (this would have caught it), and audit `chordId` references in `chord-scale-matrix.ts` (note the *different* convention already used there: `g-sharp-minor-7b5`).

**🟡 Sharps-only spelling still live.** `lib/utils/music-theory.ts:36` keeps `noteNames = ['C','C#',…]` while the purpose-built `enharmonics.ts` engine sits unused. Flat keys are misspelled wherever this array feeds display (tab note names, MIDI→name conversions). `getModeNotes()` is fine (uses Tonal), but the app should route *all* display spelling through the enharmonic engine.

**🟡 Melodic minor degree 7 still labeled `m7b5`** (`chord-scale-matrix.ts:227-233`, "Super Locrian (Altered)"). Strict tertian stacking does give m7♭5, but the Altered scale's practical pairing is **7alt** — the April proposal's own decision (add a `jazzChordQuality` field or annotation) was never applied.

**🟡 Avoid-notes coverage is token.** 7 entries vs. the proposal's "every chord-scale pairing." Dorian/Lydian "no avoid notes" is correct; coverage for melodic/harmonic minor modes is mostly missing.

**🟢 What checked out.** Interval semitones, scale formulas (all 62 spot-checked patterns are standard), chord-type semitones (incl. 7alt tensions, 13th omitting the 11th), circle-of-fifths accidental counts and diatonic qualities, key-spelling tables. The data tests are real: they validate semitone math, inversion pairs, modal degrees, and chord-voicing pitch classes against Tonal.js — not just shapes.

### 3.3 How to keep it accurate (process)

1. **Uniqueness + referential integrity tests**: every ID unique; every `chordId`/`chordTypeId`/`scaleId` cross-reference must resolve. (One `expect(new Set(ids).size).toBe(ids.length)` would have caught the 33 dupes.)
2. **Derive, don't hand-write**: `chord-library.ts` is ~6,800 hand-maintained lines. Root-position piano voicings and chord spellings should be *generated* from `chord-types.ts` semitones + the enharmonic engine, keeping only genuinely artisanal data (guitar fingerings, curated voicings) hand-authored. The generator script already half-exists.
3. **Single source of truth for spelling**: delete the sharps-only `noteNames` path; everything goes through `enharmonics.ts`.
4. **Fix the typecheck gate** and run typecheck + unit tests in CI for this app.
5. **Cite sources in data**: add a `source` field (Levine *Jazz Theory*, Kostka/Payne) on contested entries (altered-scale pairing, avoid notes) so future edits don't relitigate.

---

## 4. UI/UX & Responsiveness

### 4.1 Current state

**Good:** mobile hamburger + desktop nav (`app-header.tsx`); ChordScaleMatrix has a real mobile pattern (snap-scroll carousel `w-[75vw]`, 7-col grid on `lg:`); self-contained token system in `src/index.css` with WCAG-AAA accent contrast in both themes; no hover-only interactions; piano SVGs scale via `width="100%"` + `preserveAspectRatio`.

**Gaps:**

| Issue | Where | Detail |
|---|---|---|
| Touch targets below 44px | ChordReference root/quality selectors, ChordScaleMatrix degree buttons, ScaleReference degree grid | ~24–32px tall on phones |
| Fixed-pixel diagram sizing | `ChordDiagram.tsx` sizeConfig, `PianoScaleDiagram.tsx` | No viewport-relative scaling; 20px white keys on `size="small"` are hard to read on phones |
| Fretboard width unbounded | `GuitarFretboard.tsx` | 15+ frets × 64px relies on `overflow-x-auto`; no max-width or compact auto-switch |
| Viewport-breaking layout | `CircleOfFifths.tsx:404` `lg:w-[100vw]` translate hack | Fragile; can cause horizontal overflow |
| Focus indicators / aria-live | Reference pages | Keyboard nav works but focus rings aren't styled; chord/scale selection changes aren't announced |
| Unused sidebar | `app-sidebar.tsx` | Only referenced by legacy `App.tsx` |

### 4.2 Recommendations

**Phone (the guitarist-with-a-phone case):**
- Enforce `min-h-11` (44px) on all selector buttons; this is a one-pass sweep.
- Make diagram size respond to container: drop the `small|medium|large` props in favor of measured-container sizing (a `useResizeObserver` wrapper shared by all diagram components).
- Add a **bottom tab bar** on mobile for the 4 reference sections + Practice — reference apps live or die on one-thumb navigation.
- Sticky mini-header on reference pages showing current root/quality so context survives scrolling.

**Desktop / large screens:**
- Reference pages currently cap at `max-w-6xl` with much idle space at ≥1440px. Use it: pin the selector rail left, show chord + related voicings + staff + avoid notes side-by-side; CircleOfFifths can show the wheel and the full diatonic chord table simultaneously without the `100vw` hack.
- Add a **print/cheat-sheet stylesheet** (chords of a key, scale one-pagers) — a music reference that prints cleanly is disproportionately useful.

**Both:** style `:focus-visible` rings globally; add an `aria-live="polite"` region to reference pages announcing the selected chord/scale.

---

## 5. New Features — Creative Practice, Improvisation, Deliberate Practice

Ordered by leverage (most reuse of existing dark data first).

### 5.1 Surface the dark data (highest ROI — content already written & tested)

1. **Scale Explorer v2** — back ScaleReference with `scale-registry.ts`: 9 families (pentatonic, blues, bebop, whole-tone/diminished, world, harmonic major) instead of 4, with aliases, characteristic notes, step patterns, and family filters. This single change quadruples reference coverage.
2. **Progression Library page** — render `progression-registry.ts` (35 progressions incl. tritone subs, backdoor ii-V, Andalusian) with Roman numerals, key transposition, and **Tone.js playback** (the ChordPlayer synth already exists; sequencing it over `steps[].bars` is a small step). This turns a data file into a play-along tool.
3. **Arpeggio practice module** — `arpeggio-registry.ts` + `arpeggio-patterns.ts` plugged into the existing fretboard/piano diagrams and the sight-reading engine ("read & play the Cmaj7 arpeggio, pattern 1-3-5-7").
4. **Avoid-note overlay** — toggle on scale/matrix diagrams coloring avoid notes red with the `reason` string ("♭9 from major 3rd"). Expand `avoid-notes.ts` coverage as part of this.
5. **Interval reference + quiz** — `intervals.ts` is a complete dataset; an interval page plus "name the interval" (visual now, ear-training later) is nearly free.
6. **Harmonic Major in the matrix** — merge `chord-scale-extended.ts` into the ChordScaleMatrix UI (5th column/family toggle).

### 5.2 Improvisation prompting (creative practice)

7. **Improv prompt generator** — a "practice card" dealer composing constraints from existing data: *key* (circle of fifths) × *scale/mode* (registry) × *progression* (registry) × *constraint* ("only chord tones", "start every phrase on the ♭7", "rhythm: dotted quarters"). One tap → new prompt; lock any axis. This is cheap to build and is the feature that turns a reference into a creativity tool.
8. **Drone + loop practice mode** — sustain a tonic drone (Tone.js) or loop a progression in any key/tempo while the matching scale diagram stays on screen. Modal practice over a drone is *the* canonical way to internalize mode colors.
9. **"In all 12 keys"** — any chord/scale/progression gets a button that walks it around the circle of fifths (or chromatically/in whole steps), advancing automatically every N bars.
10. **Guide-tone paths** — for a chosen progression, highlight 3rds/7ths voice-leading between chords on the piano/fretboard diagrams. Uses chord-types + enharmonics; teaches the most important improv skill there is.

### 5.3 Deliberate practice (structure & feedback)

11. **Practice journal + streaks** — `storage.ts` already records sessions; add a stats page (accuracy over time, per-module, per-key heatmap: "you're 95% in C, 60% in E♭"). Cross-session visibility is the #1 gap named in the product analysis.
12. **Spaced repetition** — the PRD already designed it; apply it first to the smallest atom (chord-name ↔ diagram, key signatures, intervals) with per-item ease stored locally.
13. **Session builder** — "20 minutes: 5 sight-reading / 5 arpeggios / 5 new scale / 5 improv prompt" generated from weak areas in the journal; a timer walks you through. This is what converts four disconnected tools into a practice system.
14. **Ear training** — the synth already plays chords/notes; "play it, you name it" (interval, chord quality, mode) is the inverse of existing quizzes and reuses their UI. With MIDI input, "hear it, play it back" is genuine dictation practice.
15. **Sight-reading ↔ theory linkage** — "practice sight-reading in the key/scale you just studied": seed the `/play` note generator from the currently viewed scale; quiz chord progressions by *playing* them on MIDI rather than multiple choice.

### 5.4 Suggested sequencing

| Phase | Items | Rationale |
|---|---|---|
| 0. Hygiene | Fix dup IDs + typecheck, delete dead code, touch-target sweep | Days; unblocks trust in data & CI |
| 1. Surface dark data | 1, 2, 6, then 3–5 | Weeks; content exists, UI patterns exist |
| 2. Creative layer | 7, 8, 9 | Differentiating; small audio work on top of phase 1 |
| 3. Practice system | 11, 13, 12 | Makes it a daily-use app |
| 4. Depth | 10, 14, 15 | Power features |

---

## 6. Cleanup Checklist (Phase 0, concrete)

- [ ] Fix chord-ID slugs (`#` → `-sharp-`), add ID-uniqueness + cross-reference tests
- [ ] Fix 3 app typecheck errors; fix `@hudak/ui` internal alias resolution; gate CI on typecheck
- [ ] Delete: `js/`, `tsup.config.ts`, `Music Learning Game App/`, `src/utils/`, `src/input/`, `src/midi/`, empty stubs, `src/data/hello.ts`
- [ ] Remove legacy `App.tsx`/`App.css`/`app-sidebar.tsx` (orphaned; router layout replaced them). Note: `@hudak/audio-components` is actually used (`PitchGauge`) — keep it.
- [ ] Replace `noteNames` usages with `enharmonics.ts`
- [ ] Annotate melodic-minor degree 7 with jazz pairing (7alt)
- [ ] 44px touch-target sweep on reference selectors; global `:focus-visible` styles

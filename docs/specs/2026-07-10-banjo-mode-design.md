# Banjo Mode — Design Spec

**Date**: 2026-07-10
**App**: `apps/music-practice` (+ `packages/tuning-data`)
**Status**: Approved scope via user Q&A (full scope; Open G practice tuning; beginner chord set + movable-shape generator)

## Goal

Add 5-string banjo as a first-class instrument across the music-practice app. The tuner already supports banjo via `packages/tuning-data`; every other instrument-aware surface (sight-reading, chord library, fretboard/scale views, stats) currently knows only piano/violin/guitar.

## Core Concept: Short 5th String

The single new abstraction is the banjo's short 5th string: it starts at the 5th fret. Encoded as optional `startFret` metadata on a tuning string. Semantics:

- Open 5th string = G4, displayed as tab fret `0`.
- Fretting the 5th string at physical fret `n` (n ≥ 6) sounds `G4 + (n − 5)` semitones and is written as fret `n` in tab (standard banjo tab convention).
- Fretboard rendering draws the 5th string beginning at fret 5.

This flows through: tab position math → tab renderer → fretboard component → chord diagrams.

## Components

### 1. `packages/tuning-data` (tuner fixes)

- **Bug fix**: `banjo5-open-d` is `['F#4','D3','F#3','A3','D4']` with description `aDF#AD` — the 5th string should be `A4`. As-is it exactly duplicates `banjo5-old-time-d`.
- **Add**: Double D (`aDADE`: `['A4','D3','A3','D4','E4']`) — common old-time tuning.
- Resulting 5-string coverage: Open G, Open D (aDF#AD), Old-Time D (f#DF#AD), Double C, Sawmill, Standard C, Open A, Double D.
- Integrity test: no two tunings in a category share identical note arrays; description letter-names match note letters.

### 2. `instrument-config.ts` — new `BANJO` profile

- `id: 'banjo'`, emoji 🪕, mic input, monophonic, `requiresSustain: true`.
- Tuning (Open G, string numbers 1 = highest on tab):
  - D4 (midi 62, string 1)
  - B3 (59, string 2)
  - G3 (55, string 3)
  - D3 (50, string 4)
  - G4 (67, string 5, `startFret: 5`)
- Range: min D3 (50), max C6 (84). Beginner default: D3 (50) – A4 (69) (first position).
- Validation: like guitar — ±50 cents beginner / ±30 advanced, minDuration 400ms, minClarity 0.75.
- Audio: noiseGate −35 dB, minFrequency 140 Hz, maxFrequency 1400 Hz.
- Clef: treble, written at pitch.
- `TuningInfo` interface gains optional `startFret?: number`.

### 3. Tab logic

- `midiToTabPosition` (music-theory.ts): honor `startFret` — for the 5th string, `fret = midi − openMidi + startFret`, valid only for `fret === 0` (open) or `fret > startFret`. Prefer strings 1–4; use 5th string only when the note isn't reachable elsewhere at equal-or-lower fret, or is exactly the open G4 drone with all alternatives higher up the neck.
- `tab-renderer.ts`: render 5 tab lines for banjo (VexFlow `num_lines`), driven by tuning length from instrument config rather than hardcoded 6.

### 4. Fretboard component

- Generalize `GuitarFretboard` into a tuning-driven fretboard: props take tuning (notes + optional `startFret` per string) from instrument config instead of hardcoded EADGBE.
- Banjo render: 5 strings, 5th string drawn starting at fret 5 with its own nut.
- Guitar rendering output unchanged (regression guard: existing usage passes guitar tuning by default).
- Surfaces that offer a guitar view (ScaleDisplay, ScaleExplorer, ChordScaleMatrix, ScaleDetailPanel, InstrumentToggle) gain a banjo option.

### 5. Chord library

- `ChordVoicing` gains optional `banjo` field parallel to `guitar`: `{ string, fret }[]` over 4 fretted strings + optional 5th-string drone flag.
- **Explicit beginner set** (~20 chords, Open G first position): G, C, D, D7, G7, C7, A7, E7, Em, Am, Dm, F, A, E, Bm, B7, F#m, Cmaj7, Gmaj7, Dsus4 (final list at implementation; validated against standard banjo chord charts).
- **Movable-shape generator**: F-shape, D-shape, and barre shape (major) plus movable minor and 7th shapes. Any chord without an explicit banjo voicing gets one generated at lookup time from the nearest movable shape — no giant data file.
- Chord diagram component renders banjo shapes on the generalized 5-string diagram (5th string shown but typically open/unfretted, marked as drone).

### 6. Sight-reading game (`play.tsx`)

- Banjo joins the instrument picker (mic instrument, same device-selection flow as guitar).
- `isMicInstrument` check generalized (derive from instrument config `inputType` instead of `instrument === 'violin' || instrument === 'guitar'`).
- Tab display mode enabled for banjo (as for guitar).
- Note generation uses banjo range from config.

### 7. Free wins

Sessions, stats, storage, and URL search params key off the instrument id string — `'banjo'` flows through with no changes.

## Error Handling

- Chord with no explicit or generatable banjo voicing → same "no voicing" UI state guitar uses today.
- Notes below D3 → out of range, filtered by existing range logic.
- Mic permission/device errors → existing guitar/violin flows.

## Testing

- Unit: 5th-string tab math (open G4 → fret 0; A4 on 5th string → fret 7; preference for strings 1–4), movable-chord generator spot-checked against known shapes (e.g., A major = F-shape at 7th... verified against chord charts during implementation), banjo range validation, tuning-data integrity (no duplicate note arrays, description matches notes).
- Existing guitar tests must pass unchanged (fretboard generalization regression guard).
- Manual: dev server QA of play (banjo mic), chord reference, scale explorer, tuner deep link.

## Out of Scope

- Tunings other than Open G in practice features (tuner keeps all).
- Clawhammer/bluegrass roll patterns, right-hand technique training.
- Polyphonic detection.
- 4-string / 6-string banjo practice profiles.

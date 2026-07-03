# Library Growth & UX Streamlining — Spec

Date: 2026-07-02. Follow-up to the feature-completeness assessment (3-agent audit: app map, data audit, UX audit).

## Shipped in this pass (context)

- **Practice tab full reference UX**: dealt scale renders staff notation + piano + fretboard (`ScaleDetailPanel`); dealt progression renders the full player with tap-a-chord voicing diagrams (`ProgressionPlayer`). Both shared components now also back Scale Explorer and Progression Library.
- **Data accuracy**: `resolveForScale` letter-assignment fixed for non-heptatonic scales (F# Hirajoshi was `G# A B## C##`); staff renderer no longer flats every B natural, handles `##`/`bb`. Regression tests added.
- **Piano scale diagram**: never rendered (pitch classes have no MIDI value) — fixed via octave-assigned notes.
- **Journal integrity**: `sightReading`→`sight-reading` module id normalized (legacy data migrated on read); ear-training, intervals, chord-quiz, scales-quiz, and chord-scale quizzes now write sessions (`useSessionRecorder`) — streaks and SessionBuilder weakness-weighting are live for the first time.
- **Library growth**: +17 progressions (50 total; modal family was empty in UI, now 8 entries); harmonic sequences (16) wired into `/progressions`; altered-dominant chord→scale mappings wired into `/chord-scale` ("Beyond the matrix") with deep links.
- **Deep links**: `/scale-explorer?scale=&root=` (selection persists in URL).
- **Keyboard**: 1-4 answering in ear-training/intervals, 1-4 grading + space-reveal in `/review`.
- Dead code removed: `/about`, `ScaleLearningHub`, dead `onBack` plumbing.
- **Data-audit round** (audit verified all 63 chord formulas, 62 scale formulas, 35 matrix harmonizations correct): removed 12 semantic duplicate chords (`-7` vs `-7th` twins, library 295→283; matrix chordIds retargeted; ordinal-normalization invariant test added); `getChordByShortName` now prefers lowest-difficulty match so `Dm7` resolves to the basic chord, not the "Dm7 (ii)" jazz shell; `algerian` scale de-duplicated from double-harmonic-minor (now the traditional 8-note form); `add11` formula corrected to compound 11th; extended chord-scale map grown 14→18 (m7b5, mMaj7, maj7#5, dim7); stale header comments fixed.

## Spec: next milestones

### 1. Global practice-settings store (M)
One Zustand-or-context store persisted to localStorage: instrument (guitar/piano), preferred key spelling, default tempo, master volume. Replaces per-component `InstrumentToggle` state (CircleOfFifths, ChordScaleMatrix, ChordReference) and per-page tempo defaults (Progressions 90 vs Arpeggios 140). Surface in the app header as a compact settings popover.

### 2. Scales hub unification (L)
`/scales-quiz` (matrix-based `ScaleReference` + quiz) and `/scale-explorer` (62-scale registry) are two "Scales" destinations with different mental models; bottom tab and header link to different ones. Merge into one `/scales` hub: Explorer (registry) as the reference surface, matrix-degree view as a tab, quiz as a tab. Tab state in URL. Retire one route with redirects.

### 3. Per-page state persistence sweep (S)
Pattern established by scale-explorer (URL params) and play (saved settings). Apply to: progressions (family/key/bpm), arpeggios (family/key/pattern), chord-quiz reference (root/quality/instrument), circle-of-fifths (key), practice tabs, intervals tab. URL params for shareable state, localStorage for preferences.

### 4. Chord library derivation (L — pre-existing audit item)
`chord-library.ts` hand-maintains 5.5K lines / 153 chords. Derive root-position piano voicings from `chord-types.ts` (63 formulas) × enharmonics engine; keep hand-authored guitar shapes. Unlocks: every progression chord symbol resolving to a voicing card (today ~40% of "Beyond the matrix" qualities have no library entry — e.g. `C7#11` falls back to "no voicing diagrams yet").

### 5. Library growth backlog (data-audit follow-up)
- **Progressions**: bossa/samba set (Blue Bossa changes), gospel turnarounds (I-I7/IV-#ivdim), Coltrane 3-tonic full cycle, more song-form studies (16-bar tunes).
- **Arpeggios**: registry has 31 vs 33 advertised — reconcile; add 7th-chord inversion patterns, approach-note patterns.
- **Matrix**: melodic-minor and harmonic-major avoid-note entries are sparse (11 avoid-note entries total).
- **Scales**: registry solid at 62; consider raga/maqam set as a 10th family (needs microtonal caveat copy).
- **Ear training**: difficulty tiers (option count 4→2/4/6), interval-in-context mode, progression-quality recognition (hear ii-V-I vs I-vi-ii-V).

### 6. Play-route polish (M)
Quick-start with last settings (skip setup gate), persist `pitchSmoothing`/`tabDisplayMode`, "practice again" on exit instead of navigate-home, replace magic setTimeout renderer waits with ready callbacks, blocked-mic empty state.

### 7. Page chrome normalization (S)
CircleOfFifths, ChordLearningHub, ChordScaleGame render their own `min-h-screen` heroes inside the route shell (double headings, drifting max-widths). Extract one `PageShell` and a shared `KeySelector` (6 hand-rolled key-picker copies with 4 different spellings today; `ProgressionPlayer` normalized one of them).

## Non-goals
- Backend/accounts (privacy-first, localStorage only).
- Exotic-scale enharmonic simplification: 7-note world scales keep theoretically-correct double accidentals (Locrian bb7 is *named* for its bb7).

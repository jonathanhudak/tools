# Task Tracking

## Current Tasks — 2026-07-02 goal: assess features, grow libraries, refine UX
- [x] Assess latest features for completeness/accuracy (app map + UX audit complete; data audit agent pending — findings folded into spec backlog)
- [x] Grow progressions library: 33 → 50 (modal family was EMPTY in UI — added 8; jazz +3, blues +1, pop +3, classical +2); wired 16 harmonic sequences into /progressions; wired altered-dominant chord→scale mappings into /chord-scale
- [x] Fix accuracy errors: resolveForScale double-accidental bug (F# Hirajoshi = G# A B## C##), staff renderer flatting every B natural, piano scale diagram never rendering (pitch classes have no MIDI), module-id mismatch hollowing the journal
- [x] User request: practice tab renders dealt scale + progression with full reference UX (ScaleDetailPanel + ProgressionPlayer shared components, staff/piano/fretboard/voicing diagrams)
- [x] UX quick wins: sessions recorded from all quizzes (journal/streaks/weakness-weighting live), keyboard answering/grading, scale-explorer deep links, ear-training score no longer wiped on mode switch, ⠿ glyph → Layers icon, landing stagger capped, dead code removed (/about, ScaleLearningHub, onBack plumbing)
- [x] Spec bigger work → apps/music-practice/docs/plans/2026-07-02-library-growth-and-ux-spec.md
- [x] Verify: typecheck 0 errors, 1606 unit tests green, lint clean, browser-verified (practice, progressions, scale-explorer, chord-scale)
- [x] Data-audit round: 12 semantic duplicate chords removed (-7/-7th twins; matrix retargeted; invariant test added), getChordByShortName difficulty-ranked, algerian scale de-duplicated (traditional 8-note form), add11 formula fixed to compound 11th, extended chord-scale map 14→18, stale comments fixed. Audit verified all chord/scale/matrix formulas theory-correct. Removed my dominant-turnaround addition (duplicated existing montgomery-ward) → registry at 49.
- [x] Verify round 2: typecheck 0, 1574 tests green, lint clean, build green, browser: Dm7 chord tap now resolves to basic "D Minor 7th" not jazz shell

## Completed Tasks
### Follow-ups (completed 2026-06-11)
- [x] Mobile bottom tab bar (Home/Scales/Chords/Practice/Play) with safe-area padding
- [x] Print stylesheet — reference pages print as cheat sheets, light palette forced from dark mode
- [x] ESLint zeroed (45 errors + 27 warnings → 0): legacy window globals removed, typed casts, VexFlow boundary down to one documented alias, console noise removed; fixed a real stale-closure bug in scale-seeded sight reading; lint added to the release CI gate

### Phases 1–4 — Full audit roadmap (completed 2026-06-11)
- [x] Phase 1: /scale-explorer (62 scales, 9 families, drone, audio), /progressions (35 with playback), Harmonic Major as 5th matrix family, /arpeggios (33 × 10 patterns), avoid-note overlays (11 entries), /intervals (reference + visual/ear quizzes)
- [x] Phase 2: improv prompt generator with lockable axes, tonic drone, all-12-keys circle-of-fifths cycling in the progression player
- [x] Phase 3: /stats practice journal (streak, 30-day chart, per-module accuracy), session builder seeded by weakest modules, /review SRS (SM-2 lite, 3 decks, 7 unit tests)
- [x] Phase 4: guide-tone (3rd/7th) voice-leading display, /ear-training (chord qualities + scale flavors), scale-seeded sight reading with accidental rendering (Scale Explorer → /play)
- Infra: lib/theory/roman.ts numeral resolver (19 tests, resolves every registry numeral incl. secondary dominants), lib/audio/player.ts (melody/sequence/drone)

### Phase 0 — Music Practice Hygiene (completed 2026-06-10)
- [x] Dead-code removal (~15.6K lines): js/, css/, tsup.config.ts, Music Learning Game App/, src/{utils,input,midi}/ shadow copies, legacy App.tsx/app-sidebar, stubs, hello.ts
- [x] Chord library integrity: 33 sharp-root ID collisions re-slugged, 13 duplicate entries removed, g-sharp-dim7 added, 8 dangling matrix chordIds retargeted, generator slug fixed, integrity test suite added
- [x] Typecheck green: @hudak/ui internal imports made relative + pagination fix; 16 app errors fixed (incl. deleting dead KeyboardMapper.ts with broken ScaleType lookups); scoped typecheck gate added to release.yml
- [x] noteNames delegated to enharmonics engine; jazzChordQuality='7alt' annotation on melodic minor degree 7, surfaced in matrix UI
- [x] 44px touch targets on reference selectors; global :focus-visible ring

## Review Notes
- Phase 0 verified at every step: typecheck CLEAN, 1524 unit tests green (27 files), production build green.
- ScaleReference accepts an `onBack` prop from 3 call sites but renders no back affordance — product decision deferred (global header provides navigation).
- Chord library still hand-maintains ~5.5K lines; Phase 1+ should derive root-position voicings from chord-types + enharmonics (audit §3.3).

### Tuner integration + 432 Hz reference pitch (completed 2026-07-05)
Proposal: docs/plans/tuner-ux-integration-proposal.md
- [x] `packages/tuning-data` (@hudak/tuning-data): 150-tuning catalog + microtonal helpers + navigation/search moved out of instrument-tuner; new reference-pitch math (applyReferencePitch, frequencyToNote, midiToFrequency — exact ×ref/440 scaling) + curated featured list
- [x] `@hudak/audio-components`: useReferenceTonePlayer moved in (shared with music-practice); PitchGauge gains optional `size: 'sm'|'md'`
- [x] instrument-tuner: A4 reference preference (440/432 presets + custom 415–466, localStorage `instrument-tuner:reference-pitch`), applied to detection, string cards, library preview tones/Hz labels; "A4 = 432 Hz" badge; landing redesigned — featured-tunings scroll list with sticky gauge (mobile pinned top bar, desktop sticky right rail); pre-existing typecheck errors fixed (unused params, navigator.share narrowing, TuningsSearch export)
- [x] music-practice: new /tuner route (mic tuner via app AudioManager, featured chips + instrument/tuning selects over the full shared catalog, hold-to-play string tones, same 440/432 preference persisted as settings.referencePitch, cross-link to full tuner app carrying ?tuning=); nav (desktop bar + drawer) + home Tuner card

## Review Notes (2026-07-05)
- Verified: both apps typecheck clean, vite builds green, music-practice 1585 unit tests pass (incl. 11 new reference-pitch math tests), lint clean (instrument-tuner has no eslint config — pre-existing; lint script fails there on main too).
- Browser smoke (gstack browse): 432 toggle scales A string 110→108 Hz exactly, violin A shows 432 Hz on library page, preference persists across routes, mobile sticky gauge follows featured-list scroll, Drop D + 432 selection persists in music_practice_settings.
- Deferred: applying referencePitch to music-practice playback (Tone.js) and sight-reading mic validation; recents/favorites; flat tuning-level library search.

### Tuner follow-ups 1-3 via subagent fan-out (completed 2026-07-05)
- [x] String-target gauge: when a string is locked, cents + note label measure against that string's calibrated target (microtonal/just-intonation tunings can now read "in tune"); both apps
- [x] Share URLs carry ?a4=<hz> when reference pitch != 440; opening such a link applies it (URL wins over stored preference); share dialog states "Link includes A4 = ..."
- [x] "A4 = <hz> Hz" badge on all three tuning-library pages (extracted ReferencePitchBadge component)
- Verified: typecheck/build/tests green (1585), browser smoke: ?a4=432 roundtrip + persistence, featured-select rewrites URL with a4, share hint renders, library badge renders
- Remaining backlog (unchanged): last-tuning persistence in dedicated app, recents/favorites, flat tuning search, 432 in music-practice playback, sticky-gauge height polish, tuner eslint config, code splitting, TuningSelector/CustomTuningBuilder dead-code check

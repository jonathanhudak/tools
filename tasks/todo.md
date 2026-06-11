# Task Tracking

## Current Tasks
(roadmap + follow-ups complete — remaining candidate: derive chord-library piano voicings from chord-types + enharmonics, a larger data migration best done as its own effort)

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

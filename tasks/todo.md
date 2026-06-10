# Task Tracking

## Current Tasks
### Next: Phase 1 — Surface the dark data (per apps/music-practice/docs/research/architecture-audit-2026-06.md §5.4)
- [ ] Scale Explorer v2 backed by scale-registry.ts (62 scales, 9 families)
- [ ] Progression Library page with Tone.js playback (progression-registry.ts)
- [ ] Harmonic Major in chord-scale matrix (chord-scale-extended.ts)
- [ ] Arpeggio practice module; avoid-note overlays; interval reference/quiz

## Completed Tasks
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

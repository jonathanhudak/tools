# Task Tracking

## Current Tasks
### Phase 0 — Music Practice Hygiene (from apps/music-practice/docs/research/architecture-audit-2026-06.md)
- [ ] 1. Delete dead code: `js/`, `tsup.config.ts`, `Music Learning Game App/`, `src/utils/`, `src/input/`, `src/midi/`, empty stubs, `src/data/hello.ts`, legacy `App.tsx`/`app-sidebar` if unused; drop `@hudak/audio-components` dep
- [ ] 2. Fix 33 duplicate chord IDs (`#` roots → `-sharp-` slugs), fix generator script, add ID-uniqueness + chordId cross-reference tests
- [ ] 3. Fix typecheck: 3 app errors + `@hudak/ui` internal `@/` alias imports (→ relative), pagination `size` duplication
- [ ] 4. Annotate melodic-minor degree 7 with jazz pairing (7alt); route note spelling through enharmonics where key context exists
- [ ] 5. 44px touch-target sweep on reference selectors; global `:focus-visible` styles
- [ ] 6. Verify: unit tests, typecheck, production build all green; push

## Completed Tasks
<!-- Move completed items here with date -->

## Review Notes
<!-- Document results and observations -->

---
date: 2026-02-11
workflow: bug-fix
task: Fix RecurringPaymentSummary type mismatch and add missing chord-scale nav link
tags: [typescript, type-safety, monorepo, turbo, navigation, local-finance, music-practice]
---

## What Happened

Two issues blocked the monorepo deploy pipeline:

1. **CRITICAL** — `engine.ts` constructed `RecurringPaymentSummary` objects using fields (`yearlyTotal`, `status`) that don't exist on the interface. The interface requires `totalSpent`, `occurrences`, and `confidence`. This caused TS2339/TS2322 errors that broke the entire turbo build, blocking ALL apps from deploying to GitHub Pages.

2. **LOW** — PR #32 added a `/chord-scale` route to music-practice but forgot the nav link in `app-header.tsx`.

## What Went Well

- **Root cause identification was precise.** The triage agent correctly identified the exact lines (88-95) and the field-by-field mismatch between the mapping and the interface.
- **Fix was surgical.** Only 4 files touched in the source code: `engine.ts` (field mapping + insights generator reference), `generator.ts` (report template), and `app-header.tsx` (nav link). Clean, minimal diff.
- **Type test added.** A `engine.typetest.ts` file was created to catch future type drift — good defensive practice.

## Patterns & Lessons

### Anti-pattern: Interface Drift in Mapping Code
When a TypeScript interface changes (or is defined separately from the code that constructs its instances), mappings can silently use stale field names. The compiler catches it — but only if the build actually runs. In a monorepo with turbo, one app's type error blocks everything.

**Prevention:** When modifying an interface, grep the repo for all constructors/mappings of that type. Consider adding compile-time type tests (like `engine.typetest.ts`) for critical data structures.

### Anti-pattern: Route Without Navigation
Adding a route without a corresponding nav link is a common oversight in PRs. The feature works if you know the URL, but users can't discover it.

**Prevention:** PR checklist item: "If adding a new route, did you add navigation to it?"

### Reusable: Turbo Monorepo Build Failures
When turbo build fails, the error might originate in a completely different app than the one you're trying to deploy. Always check the full turbo output — the failing app may not be the one you expect.

## Key Takeaway

Type mismatches between interfaces and their constructors are the #1 "silent until build" bug in TypeScript monorepos. Type test files (`.typetest.ts`) that explicitly assert assignability are cheap insurance.

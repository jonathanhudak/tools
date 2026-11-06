# Lessons Learned

## Patterns to Remember
<!-- After corrections, document the pattern here -->
- **Verify subagent claims before acting on them.** An exploration agent reported `@hudak/audio-components` as unused and "no duplicate chord IDs"; direct greps showed both claims false. Re-verify any claim that drives a deletion or a data fix.
- **tsc reveals errors incrementally when a build has many failures.** Fixing the first batch surfaces more; loop `tsc --noEmit` until clean rather than assuming the first error list is complete.
- **Generated data needs invariant tests at generation time.** The chord-ID slug bug ('#' stripped) shipped 33 colliding IDs; a one-line uniqueness test would have caught it.

## Rules to Follow
<!-- Write rules that prevent repeated mistakes -->
- **A toggle must change what is on screen where the toggle is.** Review fix S1 on #103 moved the borrowed panel "below" the degree cards per the spec; below seven tall cards it rendered off-screen, so the Borrowed switch looked dead. Spec-conformance alone is not done: before recommending or shipping a view switch, check its effect is visible above the fold at 390px and 1440px, and prefer integrating new content into the existing row over appending a section. (2026-11-05)

## Project-Specific Notes
<!-- Notes relevant to this specific project -->
- **Screenshot-verify rendering paths with hostile inputs, not just C major.** Three long-lived render bugs (piano diagram never rendered, B natural flatted on staff, pentatonic double-accidental spellings) were invisible in default C-major views; driving Bb Phrygian and F# Hirajoshi in a browser exposed all three in minutes. (2026-07-02)

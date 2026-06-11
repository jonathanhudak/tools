# Lessons Learned

## Patterns to Remember
<!-- After corrections, document the pattern here -->
- **Verify subagent claims before acting on them.** An exploration agent reported `@hudak/audio-components` as unused and "no duplicate chord IDs"; direct greps showed both claims false. Re-verify any claim that drives a deletion or a data fix.
- **tsc reveals errors incrementally when a build has many failures.** Fixing the first batch surfaces more; loop `tsc --noEmit` until clean rather than assuming the first error list is complete.
- **Generated data needs invariant tests at generation time.** The chord-ID slug bug ('#' stripped) shipped 33 colliding IDs; a one-line uniqueness test would have caught it.

## Rules to Follow
<!-- Write rules that prevent repeated mistakes -->

## Project-Specific Notes
<!-- Notes relevant to this specific project -->

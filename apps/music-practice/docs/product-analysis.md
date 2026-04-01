# Music Practice App — Product Analysis

**Date:** March 31, 2026
**Version:** 1.37.0
**Status:** Live (GitHub Pages at /tools/music-practice/)

---

## What This Is

A web-based music theory and notation practice tool. You open it in a browser, plug in a MIDI keyboard or use your mic, and practice reading sheet music, learning chords, understanding scales, and drilling chord-scale relationships. No accounts, no backend, no tracking. Everything runs locally in the browser.

It's a practice companion, not a course. There's no curriculum, no progression system, no "lesson 3 of 12." You pick what you want to work on and go.

---

## Who It's For

Three user profiles from the PRD (these feel right based on what's built):

1. **Adult pianist** — Has a MIDI keyboard, wants to improve sight-reading and understand jazz harmony. This person gets the most complete experience today.
2. **Young violinist** — Uses microphone pitch detection. Can practice sight-reading with real-time feedback on intonation.
3. **Teen guitarist** — Mic input with tab notation. Chord diagrams, scale diagrams, fretboard visualization.

The real sweet spot: **someone who plays an instrument and wants to get better at reading notation and understanding theory, but doesn't want to pay for a subscription app or sit through video lessons.** Self-directed practicers.

---

## What You Can Actually Do (Feature Map)

### 1. Sight Reading Game (`/play`) — ⭐ Core Feature

The main event. A note appears on a staff, you play it on your instrument, the app tells you if you got it right.

**Setup options:**
- Pick instrument: Piano (MIDI), Piano (virtual on-screen keyboard), Violin (mic), Guitar (mic)
- Pick clef: Treble or Bass
- Pick difficulty: Beginner (C4–C5), Intermediate (C4–G5), Advanced (A3–C6)
- Pick mode: Practice (untimed, no pressure) or Timed Challenge
- Guitar-specific: Staff + Tab, Tab Only, Staff Only, left-handed mode
- Mic settings: Device selector, pitch sensitivity (cents tolerance), dial smoothing

**In the game:**
- VexFlow renders real sheet music notation (not simplified)
- Guitar players see tablature alongside or instead of staff
- Falling notes display (Guitar Hero-style) available
- Score tracking: accuracy × speed bonus × streak multiplier
- Ranks: S/A/B/C/D. Levels: Beginner → Master
- Lives system in timed mode
- Score summary at the end of each round
- Reference note audio playback via Tone.js

**Input methods:**
- MIDI keyboard: <50ms latency target, exact pitch match, polyphonic
- Microphone: Pitchy library (McLeod autocorrelation), ±50 cents tolerance, 500ms sustain requirement, monophonic only
- Virtual keyboard: Click/touch, full range

**What works well:** The MIDI path is solid. Plug in a keyboard, pick a difficulty, and you're reading notes in seconds. The guitar tab rendering alongside staff notation is a nice touch.

**What's weaker:** Microphone pitch detection is inherently noisier. Monophonic only (can't detect chords). The virtual keyboard exists but isn't a serious practice tool — it's a fallback.

---

### 2. Chord Reference & Quiz (`/chord-quiz`)

Two-part system: a chord encyclopedia and a quiz game.

**Chord Reference (study mode):**
- 50+ chords with full metadata
- Guitar fretboard diagrams (SVG) with finger positions, barres, muted strings
- Piano keyboard diagrams (SVG) with note highlights
- Audio playback (Web Audio synth, not samples)
- Tier filtering: Beginner → Intermediate → Advanced → Jazz
- Search by name
- Chord Progression Builder: 10+ preset progressions (ii-V-I, I-IV-V, 12-bar blues, etc.) with key transposition

**Chord Quiz (test mode):**
- Multiple choice: see a chord diagram, pick the name
- 3 modes: Speed (timed, bonus for fast answers), Accuracy (fixed points), Progression (difficulty multiplier)
- 3 difficulty levels
- Timer (30s per question in speed mode)
- Leaderboard saved to localStorage

**What's interesting:** The chord library is deep. 50+ chords with multiple voicings each, both guitar and piano. The progression builder with transposition is genuinely useful for songwriters. Phase 2-4 piano voicings add 180+ more voicings including shell voicings, drop 2, upper structure triads, rootless jazz voicings. This isn't beginner stuff.

---

### 3. Scale Reference & Learning (`/scales-quiz`)

Scale encyclopedia and quiz, same pattern as chords.

**Scale Reference:**
- 4 scale families: Major, Natural Minor, Melodic Minor, Harmonic Minor
- All 28 modes across those families (Ionian through Super Locrian)
- Per-degree info: chord name, Roman numeral, mode name, note names
- Guitar and piano visualization toggle
- Expandable chord voicing display per degree
- Scale diagrams (piano and fretboard)

**Quiz:**
- Scale and mode identification
- Guitar fretboard or piano keyboard views

**The depth here is real.** Covering all 28 modes with correct chord qualities for every degree of every scale family is a lot of theory data. Most apps stop at major and natural minor.

---

### 4. Chord-Scale Matrix (`/chord-scale`)

The most theory-heavy feature. Based on Jeff Schneider's chord-scale system.

**Matrix tab:**
- Interactive 7-column reference grid
- Pick any of 12 keys + any of 4 scale types
- See all 7 degrees with: chord names, Roman numerals, modes, notes
- Modal character descriptions ("Lydian = Bright, lifted, dreamy")
- Expandable detail panel with chord voicings
- Desktop: 7-column grid with side panel. Mobile: horizontal scroll carousel

**Practice tab — 3 quiz modes:**
1. **Degree Quiz:** "What chord quality is on degree 4 of Melodic Minor?" → multiple choice
2. **Chord Sources Quiz:** "Which parent scale contains m7?" → shows all valid scale/degree sources
3. **Scales & Modes Quiz:** Select scale families to quiz on, answer mode/chord questions

**This is the power user feature.** The chord-scale matrix is the kind of thing you'd find in a jazz theory textbook. Being able to quiz yourself on which scales contain which chords, and see the answer with voicings, is something I haven't seen in other apps.

---

## Tech Stack (What Matters)

| Layer | Choice | Why It Matters |
|---|---|---|
| Notation | VexFlow 4.2+ | Real engraving-quality sheet music, not simplified graphics |
| Theory | Tonal.js | Handles the heavy lifting for note/scale/chord math |
| Audio Input | Web MIDI API + Pitchy | MIDI is near-instant; Pitchy is the best browser-based pitch detector |
| Audio Output | Tone.js | Synth playback for reference notes and chord audio |
| Framework | React 18 + TanStack Router | File-based routing, code-split per page |
| Styling | Tailwind v4 | Self-contained warm palette theme (cream/teal) |
| Storage | LocalStorage only | Zero backend. Privacy by architecture. |
| Deploy | GitHub Pages | Static site, SPA fallback via 404.html |
| Monorepo | Part of tools-monorepo (pnpm + Turborepo) | Shares UI components (`@hudak/ui`) |

**No backend. No accounts. No tracking. No subscriptions.** This is a meaningful product decision, not a corner cut. Everything stays on the user's device.

---

## What's "Coming Soon" / Not Built Yet

From the PRD and codebase:
- **Spaced Repetition System (SRS)** — Designed in the PRD (custom queues, ease ratings, exponential intervals) but not yet implemented
- **Key Signatures Quiz** — Listed as a core module in the PRD, not yet a standalone route
- **Arpeggios Practice** — In the PRD, not built
- **Progress Analytics** — The PRD mentions Chart.js for visualization, localStorage/IndexedDB for history. Currently only per-session scores, no cross-session tracking
- **About page** — Stub that redirects to home

---

## Design & UX State

A UX audit was done (Feb 2026, `docs/ux-research.md`) and a 5-phase overhaul plan exists (`docs/plans/ux-overhaul.md`). Most of it has been executed:

**Done:**
- Self-contained warm palette theme (cream/teal/amber)
- Custom fonts (Lora/DM Sans/DM Mono)
- React wrapper components for all notation renderers
- SPA routing fix (404.html fallback)
- Dev route for testing renderers

**UX Observations:**
- The landing page is clean: 4 cards in a 2-column grid with animated entrance
- Dark mode toggle exists but may not be fully wired
- Mobile support exists but hasn't been tested at 320px
- The sight-reading game setup screen has a lot of options — could feel overwhelming to a new user

---

## Strengths (What's Actually Good)

1. **Theory depth is exceptional.** 28 modes, 230+ chord voicings, Jeff Schneider's chord-scale system. This goes well beyond what most music apps cover. A serious jazz student would find this useful.

2. **Multi-instrument from day one.** MIDI keyboard, violin (mic), guitar (mic + tab), virtual keyboard. Most practice apps are piano-only.

3. **Real notation.** VexFlow renders actual sheet music. Users learn to read what they'll see in real music, not a gamified simplification.

4. **Privacy by design.** No accounts, no backend, no tracking. Runs entirely in the browser. This matters to people who are tired of subscription apps.

5. **The chord-scale matrix is a standout feature.** I haven't seen another free web app that lets you interactively explore chord-scale relationships across all 4 scale families with voicings for both guitar and piano.

6. **Well-structured codebase.** Clean separation of concerns. Music theory logic is in lib/utils, notation rendering has its own components, input handling is abstracted. Adding new features or instruments is straightforward.

---

## Weaknesses (What's Missing or Rough)

1. **No progression system.** You pick an activity and practice. There's no "you mastered C major, here's G major." No SRS. No long-term tracking. Every session starts from zero. The PRD designed an SRS but it hasn't been built.

2. **No cross-session progress.** localStorage saves settings and leaderboards, but there's no "you've practiced 47 hours and improved your sight-reading accuracy from 62% to 89%." No practice streaks. No charts.

3. **The features feel disconnected.** Sight reading, chords, scales, and chord-scale matrix are four separate activities with no relationship between them. You can't, for example, "practice sight-reading the chords in the key you just studied."

4. **Microphone input is inherently limited.** Monophonic only. Latency is higher than MIDI. Noisy environments are a problem. This is a browser limitation, not a code problem, but it means the guitar and violin experience will always be second-class to MIDI piano.

5. **No audio examples of scales or modes.** The chord reference plays audio, but the scale reference doesn't. You can see Dorian mode but can't hear it.

6. **The "quiz" format is the same everywhere.** Multiple choice for chords, multiple choice for scales, multiple choice for chord-scale relationships. Gets repetitive. No ear training, no "play the chord you hear," no dictation.

7. **Mobile is an afterthought.** A musician with a phone and a guitar could be the primary use case, but the app was designed desktop-first. The chord-scale matrix adapts (carousel), but the sight-reading game with all its setup options hasn't been optimized for mobile.

---

## Competitive Landscape (Quick Scan)

| App | Differentiator | Music Practice App Advantage |
|---|---|---|
| Yousician | Gamified lessons, subscription | Free, no account, deeper theory |
| Teoria.net | Free theory exercises | Better UI, real instrument input, interactive |
| musictheory.net | Lessons + exercises | More interactive, multi-instrument |
| Tenuto | Mobile theory drills | Web-based, no install, chord-scale matrix |
| Fretboard Fly | Guitar-specific | Multi-instrument, deeper theory |
| Piano Marvel | Sight-reading with MIDI | Free, includes guitar/violin, chord-scale system |

**The gap this fills:** A free, privacy-respecting, multi-instrument theory and sight-reading tool with the depth of a jazz textbook. Most competitors are either: (a) subscription-based with gamified lessons, or (b) free but shallow (trivia-style quizzes without real instrument input).

---

## Product Identity Summary

**What it is:** A free, open-source, browser-based music practice tool for sight-reading and music theory, supporting piano (MIDI), violin, and guitar (microphone).

**What makes it different:** Exceptional theory depth (28 modes, 230+ voicings, chord-scale matrix), real instrument input, real notation rendering, zero tracking, zero cost.

**What it's not (yet):** A complete practice system. No progression, no SRS, no cross-session tracking, no ear training. It's a collection of excellent practice tools that don't yet form a cohesive practice journey.

**The big question for office hours:** Is this a practice tool (pick what you want, drill it) or a learning system (guided progression, spaced repetition, measurable improvement over time)? The answer shapes everything — the features to build next, the UX, whether it stays a side project or becomes something bigger.

---

## Prep for Office Hours

Things to think about before the session:

1. **Who is this really for?** The PRD says three personas. But which one do you actually care about serving? Where's the passion?

2. **What's the goal?** Side project you maintain? Something you want other musicians to actually use? A portfolio piece? A tool you personally practice with?

3. **What's the coolest version of this?** If you had unlimited time, what would make a musician say "whoa"?

4. **What existing thing is closest?** And what does yours do that theirs doesn't?

5. **What would make YOU use this every day?** Not hypothetical users. You, the musician.

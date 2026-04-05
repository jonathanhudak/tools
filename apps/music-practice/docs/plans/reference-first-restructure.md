# Reference-First App Restructure

## Problem Statement
The app is currently quiz-oriented. It should be a **music theory reference** first, with quizzes as a secondary feature. Key issues:

1. **Landing page** pushes quizzes — all 4 modules have quiz-style CTAs
2. **Navigation** labels routes as quizzes (Scales Quiz, Chord Quiz)
3. **Chord rendering is inconsistent** — sometimes shows chord diagram + tab, sometimes just one or the other
4. **Piano rendering** never shows staff notation (StaffDisplay exists but is orphaned)
5. **Chord matrix / Circle of Fifths** have layout issues — chord groups not visible at once
6. **Mobile UX** needs horizontal card format for chord sequences

## Plan

### Phase 1: Restructure Navigation & Landing (Reference-First)

**Landing page** → Reference hub with sections:
- **Chords** → `/chords` (was chord-quiz) — reference browser with quiz as secondary tab
- **Scales** → `/scales` (was scales-quiz) — reference browser with quiz as secondary tab  
- **Chord-Scale Matrix** → `/chord-scale` — reference matrix with quiz tab
- **Circle of Fifths** → `/circle-of-fifths` — interactive reference
- **Sight Reading** → `/play` — practice tool (secondary section)

**Navigation restructure:**
- Rename "Scales Quiz" → "Scales"
- Rename "Chord Quiz" → "Chords"
- Keep "Chord-Scale Matrix" and "Circle of Fifths"
- Add "Sight Reading" to nav

### Phase 2: Fix Rendering Consistency

**Rule: For chords:**
- **Guitar** → ALWAYS show chord diagram (fretboard SVG) + tablature (TabDisplay)
- **Piano** → ALWAYS show piano keyboard diagram (PianoChordDiagram) + staff notation (StaffDisplay)

**Rule: For scales:**
- **Guitar** → show tablature (TabDisplay) — no chord diagram (scales aren't chords)
- **Piano** → show piano keyboard diagram + staff notation

**Implementation:**
- Create a `<ChordDisplay instrument={instrument} chord={chord} />` wrapper that enforces consistent rendering
- Create a `<ScaleDisplay instrument={instrument} scale={scale} />` wrapper that enforces consistent rendering
- Use these wrappers everywhere — ChordReference, ChordVoicingDisplay, ScaleReference, ChordScaleMatrix, CircleOfFifths

### Phase 3: Fix Layout Issues

**Chord Matrix & Circle of Fifths:**
- All chords in a group visible at once (no hidden overflow)
- Proper grid layout that doesn't create weird columns
- Responsive: desktop = grid, mobile = horizontal scrolling card row

**Mobile horizontal card format:**
- Chord sequences display as horizontal scrollable card strip
- Each card shows the chord diagram compactly
- Swipeable on touch devices

### Phase 4: UX Polish (Jobs/Ive Filter)
- Apply visual hierarchy audit
- Simplify — remove anything that doesn't serve the reference purpose
- Ensure consistency across all views
- Dark mode verification

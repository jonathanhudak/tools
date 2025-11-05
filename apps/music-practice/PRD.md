# Instrument Practice Web App: PRD (Updated)

## Document Information
- **Product Name**: InstrumentPractice Pro (generalized; supports keyboard via MIDI, stringed/bowed via microphone pitch detection)
- **Version**: 1.5
- **Date**: November 4, 2025
- **Author**: Grok (synthesized based on user requirements and research)
- **Status**: Updated Draft for POC Development
- **Update Summary**: Added guitar support as a new instrument profile (mic-based, monophonic pitch detection for single notes/scales; polyphonic/chords out-of-scope for MVP). Research via web searches: JS libraries like pitchy (McLeod autocorrelation, real-time monophonic for tuners, suitable for guitar E2-E6 range) and pitch.js recommended for Web Audio integration. Guitar-specific: Standard tuning (EADGBE) prompt; fret-independent validation (focus on pitch, not position). Modules adapted (e.g., chords as arpeggios for guitar). SRS queues remain profile-specific.

## 1. Introduction

### 1.1 Overview
This document outlines the requirements for a web-based application designed to enhance proficiency on various instruments through targeted practice modules. The app supports keyboard instruments (e.g., piano) via MIDI input and fretted/bowed/stringed instruments (e.g., violin, guitar) via microphone-based pitch detection, providing interactive exercises for sight reading, scales, key signatures, chords (keyboard/polyphonic-adapted), and arpeggios. Core mechanics emphasize speed, accuracy, and progressive difficulty to build muscle memory and recognition skills, augmented with spaced repetition (SRS) for long-term retention.

The app will feature a clean, responsive interface suitable for desktop and tablet use, focusing on minimal distractions to maximize practice efficiency. Sessions will generate real-time feedback, track performance metrics, adapt difficulty based on user progress, and schedule SRS reviews to reinforce weak areas. Users select an instrument profile (e.g., "Piano," "Violin," "Guitar") to tailor modules and input methods.

### 1.2 Purpose
The primary goal is to create a personalized training tool addressing sight reading speed via note identification and playback, and quizzing on foundational theory (scales, keys, chords) in an engaging, gamified format—generalized for family use (e.g., adult piano, child violin, teen guitar). Custom SRS integration ensures retention without overload. By building custom, the app incorporates tailored progressions and multi-input handling not fully covered in existing tools. Secondary benefits include data-driven insights into practice habits.

### 1.3 Assumptions and Dependencies
- Users have MIDI-compatible keyboards or microphones (browser permission for mic access); modern browser (Chrome/Edge for best Web Audio/MIDI support).
- No backend required for POC; all data (including SRS schedules) stored locally via IndexedDB or localStorage.
- Research indicates viable open-source components (detailed in Section 8) for acceleration, but custom build allows full personalization via generative content and instrument profiles.

## 2. Objectives
- **Business/User Goals**:
  - Enable 20-30 minute daily sessions yielding measurable improvements in sight reading speed (target: 50% reduction in response time over 4 weeks).
  - Reinforce theory knowledge through 80%+ accuracy in quizzes, with SRS boosting retention to 90%+ over time.
  - Foster consistent practice via engaging, adaptive challenges and automated review scheduling, accessible across instruments.
- **Success Metrics** (for POC evaluation):
  - Input latency < 100ms (MIDI) or < 200ms (pitch detection).
  - User completion rate > 70% for sessions.
  - Post-POC feedback: Usability score > 8/10.
  - SRS efficacy: 75%+ of scheduled reviews completed; retention improvement (e.g., accuracy on revisited items > previous sessions).
  - Pitch accuracy: >85% correct note detection in controlled tests (e.g., single notes on guitar/violin).

## 3. Scope
### In-Scope (MVP/POC)
- Dual input: MIDI for polyphonic (piano), microphone pitch detection for monophonic (violin, guitar).
- Core modules: Sight Reading (single notes), Scales Quiz, Key Signatures Quiz, Chords Quiz (keyboard-only or arpeggiated for strings), Arpeggios (configurable).
- Basic progress tracking with SRS scheduling, per instrument/profile.
- Treble/bass clef rendering; instrument-specific adaptations (e.g., guitar tuning prompts, range E2-E6).
- SRS integration: Flashcard-style theory reviews and skill scheduling.

### Out-of-Scope (Future Iterations)
- Polyphonic pitch detection (e.g., full guitar chords/strums).
- Fretboard visualization or bow technique analysis.
- Multi-instrument sessions or ensemble modes.
- User accounts/multi-device sync.
- Mobile app export; full iOS MIDI/mic quirks.

## 4. User Personas
| Persona | Description | Needs | Pain Points |
|---------|-------------|-------|-------------|
| **Intermediate Adult Pianist (Primary: You)** | Software engineer, 20-40s, practices 30-60 min/day, seeks targeted drills. | Quick setup, data insights, customizable difficulty, automated retention scheduling. | Generic apps lack personalization; slow feedback disrupts flow; skills fade without reviews. |
| **Young Violin Learner (Secondary: Your Son)** | Child, beginner-intermediate, needs fun, simple validation. | Visual aids, gentle SRS nudges, microphone ease (no cables). | Forgetting basics quickly; intimidating interfaces; no bow-specific feedback. |
| **Teen Guitar Enthusiast (New: Family Extension)** | 13-18s, hobbyist, focuses on riffs/scales. | Easy tuning, monophonic validation for leads; fun interleaving. | Chord complexity without guidance; tuning drift; repetitive practice boredom. |

## 5. Functional Requirements

### 5.1 Input Connection
- **FR-001**: Instrument profile selection on load (e.g., "Piano" for MIDI, "Violin" or "Guitar" for mic); allow switching.
- **FR-002**: For MIDI (keyboard): Detect/connect devices via Web MIDI API; display selection/disconnection; fallback to virtual keyboard.
- **FR-003**: For Microphone (strings): Request mic access via getUserMedia; real-time pitch detection using Web Audio API (AnalyserNode for time-domain data) + pitchy library (McLeod autocorrelation for ~±1 semitone accuracy on sustained notes).
- **FR-004**: Unified validation: Match input to target (MIDI: note number; Mic: detected frequency to MIDI note, tolerance ±50 cents for intonation/vibrato); measure response time.
- **FR-005**: Instrument-specific setup: Violin/Guitar—initial tuning quiz (A=440Hz reference; guitar: EADGBE open strings); Piano—velocity for dynamics.
- **FR-006**: Graceful fallbacks: Virtual keyboard for piano; pre-recorded audio upload for offline testing.
- **FR-036** (New): Guitar-specific: Detect open-string fundamentals; prompt retuning if >10 cents off; range config (E2-E6 for standard).

### 5.2 Sight Reading Module
- **FR-007**: Generate random single notes in treble/bass clef (range configurable per instrument, e.g., G3-D6 for violin, E2-E6 for guitar).
- **FR-008**: Display note on simple staff (SVG-based; VexFlow).
- **FR-009**: User plays via input; validate pitch (MIDI exact or mic within tolerance) and response time.
- **FR-010**: Immediate feedback: Correct/incorrect cue, score update.
- **FR-011**: Modes: Timed/Endless; optional falling notes toggle.
- **FR-012**: Adaptive difficulty: Increase speed/range on streaks.
- **FR-026** (SRS): Rate ease (1-5); schedule reviews for low-rated notes (e.g., high frets on guitar).

### 5.3 Scales Quiz
- **FR-013**: Display random major/minor scale or staff (generative).
- **FR-014**: User plays ascending/descending; check sequence (timing tolerance; monophonic for mic instruments).
- **FR-015**: Options: Hands/bow/fingers separate/together; octave configurable (e.g., 1-2 for violin, 2 for guitar pentatonics).
- **FR-016**: Quiz: 10 questions; hints (root playback).
- **FR-027** (SRS): Treat as cards; log mastery, queue interleaved reviews (e.g., guitar blues scales).

### 5.4 Key Signatures Quiz
- **FR-017**: Show staff/key sig; identify via selection or play tonic.
- **FR-018**: Circle of fifths toggle.
- **FR-028** (SRS): Flashcard mode; schedule based on accuracy.

### 5.5 Chords Quiz (Keyboard-Only or Adapted)
- **FR-019**: Display name/staff; play root position (triads/sevenths).
- **FR-020**: Progression mode (e.g., I-V-vi-IV).
- **FR-029** (SRS): Rate recall; queue in daily reviews.
- **FR-034**: For violin/guitar—repurpose as intervals/arpeggiated chords (play notes sequentially; monophonic validation).
- **FR-037** (New): Guitar adaptation: Optional strum detection via brief polyphonic burst (future; POC: single-note voicing).

### 5.6 Arpeggios Practice
- **FR-021**: Integrated option to arpeggiate.
- **FR-022**: Dedicated: Display chord/scale, play broken up/down (ideal for guitar fingerpicking).
- **FR-030** (SRS): Link to reviews; decay-based prompts.
- **FR-038** (New): Guitar-specific: Include common arpeggio shapes (e.g., major triad on low E).

### 5.7 Progress Tracking & SRS Integration
- **FR-023**: Log metrics: Accuracy, response time, attempts (per instrument).
- **FR-024**: Dashboard: Charts of speed/weak areas; SRS calendar.
- **FR-025**: CSV export.
- **FR-031**: SRS algorithm: Ease rating → interval calc (e.g., 1 day base, 1.5x multiplier on success; cap 30 days); queue per profile.
- **FR-032**: Interleaved mode: Mix queued items (e.g., 30% scales, 20% sight reading).
- **FR-033**: Theory flashcards: Generative decks (tonal.js); auto-schedule.
- **FR-035**: Profile-specific queues: Separate SRS for piano/violin/guitar to avoid overload.

## 6. Non-Functional Requirements
| Category | Requirement |
|----------|-------------|
| **Performance** | Page load < 2s; MIDI latency < 50ms; pitch detection < 200ms; notation < 200ms; SRS compute < 100ms. |
| **Usability** | Responsive (min 1024x768); dark/light mode; shortcuts (e.g., Space next). |
| **Accessibility** | ARIA for staff/quizzes; color-blind friendly; mic permission prompts. |
| **Security** | Local storage; secure mic access (HTTPS). |
| **Reliability** | Offline-capable; handle mic noise/disconnects; SRS decay on inactivity. |
| **Scalability** | POC single-user/multi-profile; future cloud sync. |
| **Visual Quality** | SVG notation; instrument icons (e.g., guitar fretboard toggle for reference). |

## 7. Technical Considerations
- **Frontend**: HTML5/JS (Vanilla/React); Web MIDI + Web Audio APIs.
- **Libraries**:
  - **Notation**: VexFlow (generative SVG for staff/notes).
  - **Input**:
    - MIDI: WebMIDI.js (polyfill).
    - Pitch Detection: pitchy (JS, real-time monophonic via McLeod method; integrate with AnalyserNode.getFloatTimeDomainData() → findPitch(buffer, sampleRate) for violin/guitar; ~±1 semitone accuracy on clean plucks/bows; no deps). Alternative: pitch.js for voice-like inputs.
  - **SRS**: Custom JS (exponential intervals); tonal.js for theory generation.
  - **Charts**: Chart.js.
- **Insights from Research Applied**:
  - **Pitch Detection for Guitar**: Monophonic focus (pitchy excels for single-string notes; handles guitar harmonics with clarity score >0.8 threshold). Polyphonic challenging in browser JS (no mature libs; C++/Python alternatives like Basic Pitch unsuitable for real-time Web Audio). Custom: Buffer size 1024-2048 samples (~23-46ms at 44.1kHz); vibrato tolerance ±20 cents.
  - **Generalization**: Instrument config object (e.g., {input: 'mic', range: [82, 1319] for guitar E2-E6, tuning: ['E2','A2','D3','G3','B3','E4'], polyphonic: false}); modules toggle (e.g., arpeggios emphasized for guitar).
  - **SRS**: As detailed previously; profile-based to separate queues.
- **Development Approach**:
  - POC: Instrument selection + MIDI/mic setup; sight reading for piano/violin/guitar (1-2 weeks); add SRS to scales.
  - Testing: Unit for pitch validation (mock audio with guitar samples); manual sessions; accuracy benchmarks (e.g., 90% on open strings).
  - Deployment: GitHub Pages/Vercel.
- **Risks**: Mic accuracy in noisy environments (mitigate with calibration/gating); browser variances (polyfill); polyphonic expansion complexity.

## 8. Research: Open-Source Alternatives
Updated for guitar: Focus on multi-instrument tools with mic/pitch.

| Project | Description | Relevance | GitHub/Source | Limitations |
|---------|-------------|-----------|---------------|-------------|
| **Sightread** | Webapp with falling notes/sheet; MIDI play-along. | High for sight reading; extend to mic/guitar. | [GitHub: sightread/sightread](https://github.com/sightread/sightread) | MIDI-only; piano-focused. |
| **Piano Trainer** | Scale/chord quizzes with MIDI. | Theory quizzes; adapt to mic. | [GitHub: ZaneH/piano-trainer](https://github.com/ZaneH/piano-trainer) | Keyboard-only. |
| **Tonal** | JS music theory lib (scales/chords). | Generative content/SRS cards. | [GitHub: tonaljs/tonal](https://github.com/tonaljs/tonal) | No input/UI. |
| **Pitchy** (Updated) | JS real-time pitch detection for tuners. | Core for violin/guitar mic (monophonic, Web Audio). | [npm: pitchy](https://www.npmjs.com/package/pitchy) | Monophonic only; no polyphonic. |
| **Pitch.js** (New) | JS pitch detection based on performous. | Alternative for guitar voice-like inputs. | [GitHub: audiocogs/pitch.js](https://github.com/audiocogs/pitch.js) | Aimed at voice; tunable for guitar. |
| **Basic Pitch** | Spotify's audio-to-MIDI (ML-based). | Polyphonic inspiration for future guitar chords. | [GitHub: spotify/basic-pitch](https://github.com/spotify/basic-pitch) | Python, offline; not real-time JS. |
| **Audio Tuner** | Browser tuner with Web Audio. | Pitch basics for strings/guitar. | Various (e.g., [GitHub: cwilso/PitchDetector](https://github.com/cwilso/PitchDetector)) | No practice modules. |
| **Anki Music Decks** | SRS for theory. | Flashcard inspiration. | [AnkiWeb](https://ankiweb.net) | No audio input. |

**Recommendation**: Leverage pitchy for mic instruments (violin/guitar); VexFlow + tonal.js for cross-instrument notation/theory. Custom build for SRS + dual input. For guitar polyphony, prototype with WASM ports later.

## Next Steps for POC
1. Set up repo with instrument profiles + Web Audio/MIDI boilerplate (add guitar config).
2. Implement input: MIDI + mic pitch detection (pitchy demo for guitar open strings).
3. Build sight reading: Generative staff + validation for piano/violin/guitar.
4. Add scales quiz with SRS rating/queue (include guitar pentatonics).
5. Profile tracking; test cross-instrument (e.g., guitar tuning accuracy).
6. Iterate: Calibrate pitch for guitar plucks; add arpeggio emphasis.

This PRD provides a blueprint—feel free to refine or request code snippets (e.g., pitchy integration stub)!
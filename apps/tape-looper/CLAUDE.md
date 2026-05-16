# tape-looper

Touch-first DAW. Record audio/MIDI loops. B&W/texture only — no color ever.

## Stack
- React + Zustand + Vite + TypeScript
- Web Audio API (recording, playback, synthesis)
- Web MIDI API (external keyboard input)
- IndexedDB (projects + patches via `storage.ts`, `patch-store.ts`)
- Tone.js installed but not yet wired (synth-manager.ts — future)

## Files
```
src/
  app.tsx           — all UI: TransportBar, TrackRow, TrackLane, App
  lib/
    store.ts        — Zustand: tracks, transport, bpm, zoom, projectId
    types.ts        — Clip, NoteEvent, Track, SynthPatch, DEFAULT_PATCH
    audio-engine.ts — AudioContext, mic recording, gain boost
    midi-engine.ts  — offline note→AudioBuffer synthesis, piano roll overwrite
    midi-input.ts   — Web MIDI API: initMIDI(), setMIDICallbacks()
    tape-engine.ts  — tape-style clip overwrite logic
    storage.ts      — IndexedDB CRUD: projects + audio clips (WAV)
    patch-store.ts  — IndexedDB CRUD: SynthPatch presets
    synth-manager.ts— Tone.js PolySynth per track (not yet used in UI)
  components/
    piano-keyboard.tsx — removed/unused
```

## Design rules
- B&W + texture SVG patterns only (`PatternDefs` in app.tsx)
- Fonts: JetBrains Mono (UI numbers/labels) + DM Sans (body)
- CSS vars: `--color-bg`, `--color-text`, `--color-border`, `--color-surface`
- No color fills. Distinction via texture, weight, dashed/solid borders
- Playhead = red line (only color allowed)

## Touch-first rules
- All buttons: `touch-action: manipulation`, min 40×40px tap targets
- Track lanes: pointer events for seek/drag
- No hover-only affordances — everything must work on touch
- Primary device: Daylight Computer (Android Chrome, Snapdragon)

## Key behaviors
- Transport: stopped → playing → recording (one armed track at a time)
- Audio tracks: mic → WAV clip → tape overwrite (new clip erases overlap)
- MIDI tracks: keyboard/MIDI → NoteEvent[] → piano roll → synth on playback
- Octave shift: Z (down) / X (up), range -4 to +4, shown in transport bar
- Auto-save: 2s debounce after any change. Manual save also available.
- Projects persist to IndexedDB. Load via 📂 modal.

## MIDI status
- `initMIDI()` returns `{ok, connected}` or `{ok:false, reason}`
- Button shows ⚠ + red border on failure, tooltip shows reason
- Android Chrome: permission prompt requires user gesture (button click)
- Known issue: Daylight MIDI detection in progress

## Next: synth editor UI
- `SynthPatch` type fully defined in types.ts (ADSR, filter, FM, volume)
- `patch-store.ts` ready (IndexedDB CRUD)
- `synth-manager.ts` ready (Tone.js PolySynth)
- Need: patch editor panel per MIDI track, wire live playNote() to Tone.js

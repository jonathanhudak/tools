# Tape Looper — Sprint 2: Make it Compositional

**Goal:** ship a DAW capable of building simple multi-track compositions (drums + bass + chords + melody) on Daylight Computer (touch) and desktop. After this sprint, "record 4 bars, overdub melody, mix levels, export" should feel natural.

**Non-goals:** clip drag/move, clip trim/split, undo/redo, effects rack, automation, MIDI editing in piano roll, export/render. Defer to Sprint 3.

---

## Status of Sprint 1 plan

| Area | Status |
|------|--------|
| Scaffold (Vite, React, TS, Zustand) | ✅ Done (no TanStack Router — single `app.tsx` shell, fine for now) |
| Audio engine (MediaRecorder) | ✅ Done |
| TapeEngine overwrite | ✅ Done |
| Zustand store | ✅ Done, richer than plan (MIDI tracks, projects, gain, zoom, octave) |
| Transport bar | ✅ Done |
| Canvas track lanes + waveforms | ✅ Done (canvas, not wavesurfer.js — cheaper, B&W native) |
| Drag-to-seek | ✅ Done |
| Keyboard shortcuts | ✅ Done |
| Project save/load (IndexedDB) | ✅ Done (richer than plan) |
| MIDI input (Web MIDI + QWERTY) | ✅ Done — bonus from Sprint 1 |
| MIDI overwrite logic | ✅ Done |
| Timeline ruler (bars/beats) | ❌ Missing |
| Per-track volume/pan | ❌ Missing |
| Auto-scroll playhead | ❌ Missing |
| Loop region | ❌ Missing |
| Clip drag/trim | ❌ Deferred |
| Synth patch editor UI | ❌ Missing (data layer ready) |
| Patch wired into live + recorded playback | ❌ Partial — raw oscillator on live, simple synth on playback |
| Touch validation on Daylight | ⚠ Untested |

---

## Sprint priorities

1. **Mix:** per-track volume + pan + master fader
2. **Timeline UX:** ruler with bars/beats, auto-scroll, touch-friendly overflow
3. **Synth engine:** patch editor panel + Tone.js patch playback for live and recorded
4. **Loop region:** record/playback in a user-set loop with overdub
5. **Touch QA on Daylight**

Each phase is independently shippable.

---

## Phase A — Mix Engine (per-track faders)

**Why first:** can't make compositions without balancing levels. Currently every track plays at gain 0.8. Mute/solo exists but is binary.

### Changes

**`types.ts`** — add to `Track`:
```ts
volume: number;  // 0–1 linear (slider), default 0.8
pan: number;     // -1 to 1, default 0
```

**`store.ts`** — add actions:
```ts
setVolume: (id: string, vol: number) => void;
setPan: (id: string, pan: number) => void;
setMasterVolume: (vol: number) => void;
masterVolume: number;  // default 0.8
```

**`audio-engine.ts`** — replace fixed `masterGain.gain.value = 0.8` with state-driven. Add helper:
```ts
export function setMasterGain(value: number): void
```

**`app.tsx` `startPlayback`** — already creates per-track `GainNode`s. Wire `gain.gain.value = effectiveMute ? 0 : track.volume * (anySolo && !track.solo ? 0 : 1)`. Add `StereoPannerNode` between gain and master when `pan !== 0`.

**Live MIDI `playNote`** — same routing through track gain (need a persistent per-track gain node, not per-note).

### UI — `TrackRow.track-controls`

Replace current button row layout with:
- Row 1: name (existing)
- Row 2: badge + waveform select (existing)
- Row 3: **vertical fader** (range input rotated -90°, 40px wide × 80px tall) + numeric label (dB)
- Row 4: **pan knob** (small SVG knob, drag-rotate) + L/C/R label
- Row 5: M / S / arm / ✕ buttons (existing)

Touch targets ≥ 40px. Fader uses `<input type="range">` styled to B&W (track = solid line, thumb = filled square).

### Acceptance
- Drag fader → audible level change immediately (during playback and live MIDI)
- Pan hard-left silences right channel
- Master fader scales whole mix
- Levels persist across save/load (extend `serializeTracks`)

---

## Phase B — Timeline UX

### B1. Timeline Ruler

New component `TimelineRuler` rendered above tracks, scrolls in sync with track lanes.

- Canvas, height 24px, full timeline width (`Math.max(viewport, longestTrackDuration * zoom)`)
- Tick every beat (`60 / bpm` sec), labeled tick every bar (4 beats)
- Major label format: `1`, `2`, `3` (bar numbers); minor ticks shorter
- Playhead red line continues from ruler down through tracks (separate fixed overlay div, not redrawn per-track canvas)
- Tap on ruler = seek (same handler as track lane)

### B2. Playhead overlay (decouple from per-track canvas)

Currently each track canvas draws its own playhead. Replace with single absolutely-positioned `<div>` overlay:
```tsx
<div className="playhead-line" style={{ left: playheadTime * zoom + 'px' }} />
```
Spans full track stack height. One DOM update per frame instead of N canvas redraws. Frees track canvases to render once on data change only.

### B3. Auto-scroll during playback

In playhead `tick()`:
```ts
const container = tracksContainerRef.current;
const px = playheadTime * zoom;
const left = container.scrollLeft;
const right = left + container.clientWidth;
const margin = container.clientWidth * 0.2;
if (px > right - margin) container.scrollLeft = px - container.clientWidth + margin;
if (px < left) container.scrollLeft = px; // jump back on rewind
```
Add toggle button in transport: "🔒 follow" (default on). Disable auto-scroll if user manually scrolls during playback (detect via `scroll` event; re-enable on stop or button press).

### B4. Touch overflow

Current `tracks-container` has `overflow-x: auto` but `track-controls` is in the same horizontal flow → controls scroll out of view on narrow screens. Fix:

- Split layout: fixed left rail (`.track-rail`, 160px, sticky) + scrollable right area (`.track-timeline`, flex, overflow-x: auto)
- Each `TrackRow` renders rail child into left rail, lane into timeline. Use CSS grid with `grid-template-columns: 160px 1fr` on the track-row, and make the right column the scroll viewport (one shared scroll container for ruler + all lanes).

Implementation: lift scroll container up — one `.timeline-scroll` div wraps ruler + all `track-lane`s. Track controls live in a parallel `.rail` column. Both share vertical scroll.

Add `touch-action: pan-x pan-y` on `.timeline-scroll`. Test on Daylight: two-finger horizontal scroll should work, one-finger drag on lane should seek (existing handler).

### Acceptance
- Ruler shows bar numbers at all zoom levels
- Playhead stays in viewport during long recordings
- Track controls visible on phone-width screens (320px) — only timeline scrolls
- Two-finger pan works on Daylight touch

---

## Phase C — Synth Engine (custom audio design)

### Goal
Wire the existing `synth-manager.ts` (Tone.js PolySynth) and `patch-store.ts` (IndexedDB patches) into both live MIDI playback and recorded MIDI track playback. Build patch editor UI.

### C1. Live MIDI playback via Tone.js patch

Replace `playNote`/`stopNote` in `app.tsx`:

```ts
// OLD: raw OscillatorNode
const osc = ctx.createOscillator(); osc.type = waveform; ...

// NEW: per-track Tone.PolySynth via synth-manager
import { getTrackSynth } from './lib/synth-manager';
import { Frequency } from 'tone';

const playNote = async (midiNote: number) => {
  const armed = useStore.getState().tracks.find(t => t.armed);
  if (!armed) return;
  const synth = await getTrackSynth(armed.id, armed.patchId);
  synth.triggerAttack(Frequency(midiNote, 'midi').toFrequency());
  // ...record-capture logic stays
};
```

Caveats:
- `synth-manager.createSynth` connects to `Tone.getDestination()` — needs to connect to our per-track gain instead. Refactor `getTrackSynth(trackId, patchId, output?: AudioNode)` to accept output node.
- Tone.js shares an AudioContext via `Tone.setContext(getCtx())` — wire on init.
- Velocity: pass through (currently fixed 0.3 gain — let patch volume + master handle it).

### C2. Recorded MIDI playback via patch

Replace `synthTrack` (offline buffer rendering) with Tone.js scheduling, OR keep offline rendering but apply patch parameters.

**Option 1 (preferred, simpler):** Use Tone.js Transport + Part.
- On play, schedule notes via `synth.triggerAttackRelease(freq, dur, time)` inside a `Tone.Part`.
- Tone Transport drives time; sync our playhead to `Tone.getTransport().seconds`.
- Pros: full patch fidelity (FM, filter, ADSR), automation possible later
- Cons: more refactor — `playheadRef` currently driven by `audioContext.currentTime`. Need to switch to Transport-based.

**Option 2 (smaller change):** Extend `synthTrack` to honor patch.
- Add ADSR shaping, FM (additive secondary oscillator with mod index), filter (simple one-pole LP).
- Pure DSP in JS, fits current offline-buffer model.
- Pros: no playback refactor; works without Tone start-gesture issues
- Cons: re-implements what Tone.js already does; FM/filter quality lower

**Recommendation:** Option 1. Tone.js Transport is the right abstraction; sprint also unlocks loop region (Phase D) trivially. Pay the refactor cost once.

### C3. Patch editor panel

New component `SynthEditor` — slide-in panel on right side when MIDI track is selected/expanded.

Layout (B&W, no color):
```
┌──────────────────────────────┐
│ Patch: [Default Sine     ▼]  │  ← dropdown + save/dup/delete
│ Type:  ( Synth )( FM )( AM ) │  ← segmented control
│ Osc:   ~ /\ ⎍ △              │  ← waveform picker
│                              │
│ ADSR    ┌──────────────────┐ │
│         │ SVG envelope     │ │  ← drag 4 handles
│         │ A___D__S____R    │ │
│         └──────────────────┘ │
│                              │
│ FM     Harm:    [1.0 ──○──]  │  ← only when type=FM
│        Mod idx: [0.0 ○────]  │
│                              │
│ Filter Cut:  [20k ────────○] │
│        Q:    [0.0 ○────────] │
│                              │
│ Volume       [-6dB ────○──]  │
└──────────────────────────────┘
```

Implementation:
- Slider = native `<input type="range">` styled B&W (track + thumb)
- ADSR editor = SVG with 4 draggable circles. Path: `M 0,H L A,0 L A+D,sustainY L A+D+S,sustainY L A+D+S+R,H`. Drag updates Zustand → debounced save to IndexedDB → `synth-manager` rebuilds synth.
- Patch dropdown lists `listPatches()` + "Default Sine". "Save As" prompts for name, generates UUID, calls `savePatch`.
- Each track's `patchId` updated via `setPatchId(track.id, patchId)` (already in store).
- Live preview: any change to patch params disposes the cached synth in `synth-manager` so next note uses new params. Optimization later: in-place param set.

Show editor when: user taps a "EDIT SYNTH" button on a MIDI track row (new button next to waveform select). Panel covers right ~360px of viewport, modal-like but non-blocking — playback continues.

### Acceptance
- Pick "Bell" patch → play note → bell-like timbre (FM with harmonicity 3, high mod index, short decay)
- Drag attack on ADSR → sound pad-like (long attack)
- Filter cutoff slider sweeps → audible LP filter
- Save patch → reload project → patch reapplied to track
- Recorded MIDI notes play back with same patch as live

---

## Phase D — Loop Region

**Why:** tape-machine workflow = "record a 4-bar loop, overdub another part, overdub another." Without loop, every part requires manual rewind.

### State

```ts
// store.ts
loopEnabled: boolean;
loopStart: number;  // seconds
loopEnd: number;
setLoop: (enabled: boolean) => void;
setLoopRange: (start: number, end: number) => void;
```

### UI

- Toggle button in transport: `↻ LOOP`
- When enabled, drag on timeline ruler to set loop range (start = mousedown, end = mouseup). Show shaded region (diagonal hatch SVG pattern, B&W).
- Visual: dashed vertical lines at loopStart/loopEnd, region between has `pattern: pat-diag` overlay.

### Playback

If Phase C went with Tone Transport (Option 1):
```ts
Tone.getTransport().loop = true;
Tone.getTransport().loopStart = loopStart;
Tone.getTransport().loopEnd = loopEnd;
```

If still on raw AudioContext: in playhead `tick()`, when `playheadTime >= loopEnd`, reset `startCtxTimeRef.current` to set playhead back to `loopStart`, stop+restart sources.

### Recording inside loop

Each pass through the loop with recording armed: when playhead wraps, stop MediaRecorder, apply tape overwrite to armed track, restart MediaRecorder at loopStart. Effectively continuous overdub. Skip if too complex — first version: loop affects playback only; recording works one-shot then stops at loopEnd.

### Acceptance
- Drag-set loop region on ruler → shaded
- Play → playhead jumps back to loopStart at loopEnd
- Audible loop with all tracks playing through

---

## Phase E — Touch QA on Daylight

Manual checklist on device:
- [ ] Transport buttons tappable (40×40 min)
- [ ] Two-finger horizontal scroll on timeline
- [ ] Fader drag works with finger
- [ ] Pan knob drag works with finger
- [ ] ADSR handle drag works with finger
- [ ] Long-press doesn't trigger system menus on canvas/lanes (`-webkit-touch-callout: none`, `touch-action: manipulation`)
- [ ] No accidental zoom (viewport meta already correct)
- [ ] MIDI keyboard connect button works after permission grant
- [ ] Saved project survives refresh

If issues found: fix and re-test before close. Daylight is e-ink Snapdragon — verify FPS during playback (target ≥ 24 fps for playhead, drop redraws if needed).

---

## Sequencing

```
Phase A (Mix)       ─┐
                     ├─► Phase D (Loop) ──► Phase E (Touch QA)
Phase B (Timeline) ──┤
                     │
Phase C (Synth)    ──┘
```

A, B, C are independent. Land A and B first (smallest, highest mix-quality impact). C is largest — break into C1 (live), C2 (recorded), C3 (editor) as separate PRs. D depends on C only if Phase C went with Tone.Transport.

Suggested order:
1. **A** — mix faders (1 day)
2. **B1+B2** — ruler + playhead overlay (½ day)
3. **B3+B4** — auto-scroll + touch overflow (½ day)
4. **C1** — live patch playback (½ day, includes Tone context wiring)
5. **C2** — recorded patch playback via Tone Transport (1 day, refactor heavy)
6. **C3** — patch editor UI (1–2 days, ADSR SVG editor is the meat)
7. **D** — loop region (½ day on top of Tone Transport)
8. **E** — touch QA (½ day)

Total: ~5–6 working days.

---

## Open questions

1. **Tone.Transport vs raw context for playback timing.** Recommend switching (Phase C2). User pref?
2. **Loop recording behavior** — overdub on every pass, or one-shot inside loop? Recommend one-shot first, overdub-loop later.
3. **Pan as knob vs slider** — knob is more DAW-conventional but harder on touch. Recommend horizontal slider (-1…+1) for simplicity.
4. **Patch presets shipped by default** — should we seed IndexedDB with 4–6 starter patches (Bass, Lead, Bell, Pad, Pluck, Kick)? Recommend yes — empty state is bad UX.

---

## Risks

- **Tone.js refactor** (C2) — touches `startPlayback` which is also used by audio tracks. Make sure audio playback path stays independent (audio tracks don't need Tone Transport — only MIDI tracks). Hybrid: Tone Transport drives time, MIDI synths sync to it, audio `BufferSource`s scheduled against it too via `Tone.context.currentTime`.
- **Bundle size** — Tone.js ~200KB. Already a dep, so no new cost.
- **Daylight e-ink redraws** — auto-scroll causes whole timeline to repaint each frame. Mitigate: only redraw visible viewport region, or use CSS transform on a single wide canvas (cheaper than scrolling a container).
- **Synth click on retrigger** — Tone.js PolySynth handles voice stealing; double-check no clicks on rapid notes with short attack.

---

## File manifest (new)

```
src/
  components/
    timeline-ruler.tsx     [B1]
    fader.tsx              [A]
    pan-control.tsx        [A]
    synth-editor.tsx       [C3]
    adsr-editor.tsx        [C3]
    loop-region.tsx        [D]
  hooks/
    use-auto-scroll.ts     [B3]
  lib/
    patch-presets.ts       [C — seed data: Bass, Lead, Bell, Pad, Pluck]
    tone-bridge.ts         [C — connect Tone.context to our AudioContext, single init point]
```

Files modified:
- `types.ts` — add volume/pan to Track; add loop state
- `store.ts` — add mix + loop actions
- `audio-engine.ts` — expose setMasterGain
- `synth-manager.ts` — accept output node param
- `midi-engine.ts` — may be removed if Phase C2 fully on Tone (or kept as fallback)
- `app.tsx` — split into smaller files? At ~990 lines it's getting unwieldy. Consider extracting `TrackRow`, `TrackLane`, `TransportBar` into `components/`. Out of scope but tempting.
- `index.css` — fader/knob/ruler styles
- `storage.ts` — serialize volume/pan/loop

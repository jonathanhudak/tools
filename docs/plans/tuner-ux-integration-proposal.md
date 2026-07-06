# Instrument Tuner — UX Analysis & Music-Practice Integration Proposal

Date: 2026-07-05
Apps: `apps/instrument-tuner`, `apps/music-practice`
Status: Proposal + implementation notes (implemented in same change set)

---

## 1. Product snapshot (as-built)

The tuner is mechanically excellent and content-rich:

- **Detection engine**: pitchy-based pitch detection with clarity gating, string
  auto-detect with hysteresis (3% acquire / 5% release), UI throttling, stale-pitch
  fade, configurable sensitivity (±3–20¢) and dial smoothing.
- **Library**: ~150 tunings across 27 instrument categories (guitar 6/7/8, bass 4/5/6,
  ukulele, violin family, mandolin family, banjos, world instruments) **plus microtonal
  and just-intonation tunings** with per-string cents offsets. This depth is a real
  differentiator vs. GuitarTuna/Fender Tune.
- **Sharing**: tunings serialize to URLs (`?tuning=guitar-drop-d`, `?notes=E2-A2-…`).
- **Reference tones**: press-and-hold string cards, full-tuning preview sequences.

## 2. UX problems found

| # | Problem | Evidence |
|---|---------|----------|
| 1 | **Library is invisible from the landing page.** The home page is a single-tuning workspace; the only paths to 150 tunings are a small breadcrumb link and a footer caption. | `routes/index.tsx` — breadcrumb + footer text only |
| 2 | **Discovery requires 3 levels of navigation** (instrument → section → tuning) with sections sorted alphabetically, so "Alternate" outranks "Standard". Scanning the catalog is slow; there is no flat, browsable list. | `routes/tunings/*`, `utils/tuning-navigation.ts` |
| 3 | **The gauge dies the moment you browse.** Navigating to the library unmounts the tuner; you cannot keep tuning (or keep the mic context) while exploring alternatives. | separate routes, no shared mic state |
| 4 | **No featured / recent tunings.** Every session starts at Guitar Standard; a violinist pays the full navigation cost every visit. | `DEFAULT_TUNING` hardcoded |
| 5 | **A4 = 440 Hz is hardcoded and unstated.** `Note.freq`/`Note.fromFreq` (440-based) are baked into the tuning data at module load, the pitch→note mapping, and the Hz labels. Users who need 432 Hz, orchestral 442, or baroque 415 have no recourse — and nothing tells them what reference the Hz labels assume. | `data/tunings.ts` (`createNote`), `routes/index.tsx:151-161`, `utils/music-theory.ts:222-229`, `utils/audio-manager.ts:488` |
| 6 | **The tuner and the practice app don't know about each other**, despite sharing pitchy, tonal, `PitchGauge`, and the same user (a practicing musician tunes *before* practicing). | separate apps, no links |

## 3. Proposal

### 3.1 Landing page → featured-tunings scroll with a gauge that follows you

Restructure the tuner home page:

1. **Sticky tuner head** (gauge + note + mic toggle + current tuning strings).
   - Mobile: compact gauge bar pinned to the top (`sticky top-0`, backdrop blur)
     while the list scrolls underneath — the gauge follows you as a guide.
   - Desktop (`lg:`): two columns — scrollable tuning list left, sticky gauge rail
     right (`lg:sticky lg:top-8`).
2. **Featured tunings list** below the fold: a curated, scannable, single-column
   list of ~14 tunings spanning instruments (Guitar Standard, Drop D, Half-Step
   Down, DADGAD, Open G, Bass Standard, Uke gCEA, Violin GDAE, Mandolin GDAE,
   Banjo Open G, Cello CGDA, plus one microtonal showcase). Tapping a row selects
   it instantly — no navigation, gauge stays live.
3. **"Browse all ~150 tunings"** row linking to the full library.

Future (not in this change): "Recent tunings" section fed by localStorage; flat
tuning-level search results on `/tunings`.

### 3.2 Reference pitch: true 432 Hz support (must-have)

A user preference **A4 reference frequency** with presets **440 Hz (concert
standard)** and **432 Hz ("Verdi" tuning)** plus a custom field (415–466 Hz).

**Mathematical correctness, stated plainly in the UI:** in 12-TET every note is
defined as a ratio of A4 (`f = A4 · 2^((midi−69)/12)`). Changing A4 from 440 to
432 therefore scales *every* frequency by exactly `432/440` — including
microtonal cents offsets, which are ratio-invariant. Implementation keeps the
canonical 440-based data and derives the active tuning:

```
scaled(note) = note.frequency × (A4ref / 440)        // exact, no rounding
noteFromFreq(f) = nearest midi of 69 + 12·log2(f / A4ref), cents from same
```

Applied everywhere frequency appears: string-card Hz labels, pitch→note naming,
cents on the gauge, reference-tone playback, tuning previews in the library.
When A4 ≠ 440 a visible **"A4 = 432 Hz" badge** sits next to the gauge so it is
always clear which reference is active. Persisted per app (localStorage).

### 3.3 Integration into music-practice

Chosen shape: **embedded tuner route + shared data package + cross-link for the
deep library.** Embedding the *entire* library UX (3-level navigation, share
URLs, custom tuning builder) would duplicate an app inside an app — instead the
practice app gets the 90% use case natively and one click reaches the rest.

- **`packages/tuning-data` (`@hudak/tuning-data`)** — new workspace package:
  tuning types, the full 150-tuning catalog, microtonal helpers, section/find/search
  helpers, featured list, and reference-pitch math. Both apps consume it; the
  dedicated tuner app keeps working unchanged in behavior.
- **`@hudak/audio-components`** grows `useReferenceTonePlayer` (moved from the
  tuner app) and a `size` prop on `PitchGauge` so the compact sticky variant is
  shared, not forked.
- **music-practice `/tuner` route**: mic tuner using the practice app's own
  `AudioManager`, `PitchGauge`, featured tunings + instrument/tuning picker over
  the shared catalog, string cards with reference tones, and the same A4
  440/432 preference stored in `music_practice_settings.referencePitch`.
- **Cross-links**: practice `/tuner` → dedicated app (`/tools/instrument-tuner/`,
  carrying `?tuning=` so the selection survives); home page gets a Tuner card;
  nav gets a Tuner entry.
- The dedicated tuner app **stays deployed as-is** — it is the shareable,
  bookmarkable, deep-library product; the embedded tuner is the practice-flow
  convenience.

### 3.4 Out of scope (noted for later)

- Applying `referencePitch` to music-practice **playback** (Tone.js sampler,
  drones, progressions) and mic validation in sight-reading. The setting is
  stored globally, so wiring it into `lib/utils/music-theory.ts` (`frequencyToMidi`,
  `midiToFrequency` gain an optional `a4` param) is a small follow-up.
- Recents/favorites, flat library search, custom-tuning builder in practice app.

## 4. Implementation map

| Change | Where |
|--------|-------|
| New package: catalog + reference-pitch math | `packages/tuning-data` |
| Move `useReferenceTonePlayer`, add `PitchGauge` `size` prop | `packages/audio-components` |
| Reference-pitch hook + settings UI + badge; all frequency sites scaled | `apps/instrument-tuner` (`hooks/use-reference-pitch.tsx`, `routes/index.tsx`, `routes/tunings/$instrumentId.$sectionId.tsx`) |
| Landing redesign: sticky gauge + featured list | `apps/instrument-tuner/src/routes/index.tsx` |
| `/tuner` route, settings field, nav + home card | `apps/music-practice` |

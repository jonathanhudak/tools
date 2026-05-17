/**
 * Synth Manager — manages Tone.js PolySynth instances per MIDI track.
 *
 * One PolySynth per track. Same synth used for live keyboard input AND
 * recorded MIDI playback (scheduled via Tone.Part).
 *
 * Key design:
 *   - getTrackSynth(trackId, patchId, output): create or reuse a synth.
 *     The output node lets the caller route through a per-track
 *     gain/panner so the mixer can wire volume/pan later.
 *   - applyPatchToSynth(trackId, patch): in-place param tweak. Used by
 *     the patch editor so slider drags don't dispose/rebuild the whole
 *     voice (which would click and break held notes). Switching synthType
 *     does require a rebuild — handled transparently.
 */
import * as Tone from 'tone';
import type { SynthPatch, SynthType } from './types';
import { DEFAULT_PATCH } from './types';
import { getPatch } from './patch-store';

// PolySynth voice union — Tone's typings require a Monophonic<any>-shaped
// constructor; we widen via `unknown` so the discriminated factory below
// satisfies the type checker without lying about runtime behaviour.
type PolySynthAny = Tone.PolySynth;

interface TrackSynth {
  synth: PolySynthAny;
  filter: Tone.Filter;
  output: AudioNode; // raw Web Audio output node we connect filter to
  patchId: string;
  synthType: SynthType;
}

const synths = new Map<string, TrackSynth>();

/** Build a PolySynth wrapping the right voice class for the given patch. */
function makePolySynth(patch: SynthPatch): PolySynthAny {
  const opts = buildVoiceOptions(patch);
  switch (patch.synthType) {
    case 'FMSynth':
      return new Tone.PolySynth(Tone.FMSynth, opts) as unknown as PolySynthAny;
    case 'AMSynth':
      return new Tone.PolySynth(Tone.AMSynth, opts) as unknown as PolySynthAny;
    default:
      return new Tone.PolySynth(Tone.Synth, opts);
  }
}

/**
 * Build options object for PolySynth voice. Different voice classes
 * accept slightly different shapes — Synth has {oscillator,envelope},
 * FMSynth/AMSynth add harmonicity/modulationIndex on top.
 */
function buildVoiceOptions(patch: SynthPatch): Record<string, unknown> {
  const opts: Record<string, unknown> = {
    oscillator: { type: patch.waveform },
    envelope: {
      attack: patch.envelope.attack,
      decay: patch.envelope.decay,
      sustain: patch.envelope.sustain,
      release: patch.envelope.release,
    },
  };
  if (patch.synthType === 'FMSynth' || patch.synthType === 'AMSynth') {
    opts.harmonicity = patch.harmonicity;
    if (patch.synthType === 'FMSynth') {
      opts.modulationIndex = patch.modulationIndex;
    }
  }
  return opts;
}

function buildSynth(patch: SynthPatch, output: AudioNode): { synth: PolySynthAny; filter: Tone.Filter } {
  const synth = makePolySynth(patch);
  synth.volume.value = patch.volume;

  const filter = new Tone.Filter(patch.filterCutoff, 'lowpass', -12);
  filter.Q.value = patch.filterResonance;

  // synth → filter → (raw) output
  synth.connect(filter);
  // Bridge from Tone node to a raw Web Audio AudioNode (the track's GainNode).
  // Tone nodes have a .connect() that accepts AudioNode too.
  filter.connect(output);

  return { synth, filter };
}

/**
 * Get or create the synth for a track. `output` is the raw Web Audio
 * node the filter chain feeds into (typically the track's GainNode).
 * If the synthType in the patch differs from cached, rebuilds.
 */
export async function getTrackSynth(
  trackId: string,
  patchId: string | null,
  output: AudioNode,
): Promise<Tone.PolySynth> {
  const existing = synths.get(trackId);
  const resolvedId = patchId || '__default__';

  // Fast path: already have the same patch wired up — reuse.
  if (existing && existing.patchId === resolvedId && existing.output === output) {
    return existing.synth;
  }

  const patch = (await getPatch(resolvedId)) ?? DEFAULT_PATCH;

  // If we have an existing synth and only patch params changed (not type
  // and not output), update in place rather than rebuilding.
  if (existing && existing.synthType === patch.synthType && existing.output === output) {
    applyPatchInternal(existing, patch);
    existing.patchId = resolvedId;
    return existing.synth;
  }

  // Otherwise dispose + rebuild.
  if (existing) {
    try { existing.synth.releaseAll(); } catch { /* ignore */ }
    existing.synth.dispose();
    existing.filter.dispose();
  }

  const { synth, filter } = buildSynth(patch, output);
  synths.set(trackId, { synth, filter, output, patchId: resolvedId, synthType: patch.synthType });
  return synth;
}

/**
 * Update an existing track's synth params from a patch without rebuilding.
 * If synthType changed, rebuild (preserves connected output node).
 * Designed for live patch-editor slider drags (debounce-friendly).
 */
export async function applyPatchToSynth(trackId: string, patch: SynthPatch): Promise<void> {
  const existing = synths.get(trackId);
  if (!existing) return; // Nothing to apply to — first triggerAttack will build it.

  if (existing.synthType !== patch.synthType) {
    // Voice class changed — must rebuild, but keep same output node.
    try { existing.synth.releaseAll(); } catch { /* ignore */ }
    existing.synth.dispose();
    existing.filter.dispose();
    const { synth, filter } = buildSynth(patch, existing.output);
    synths.set(trackId, {
      synth,
      filter,
      output: existing.output,
      patchId: patch.id,
      synthType: patch.synthType,
    });
    return;
  }

  applyPatchInternal(existing, patch);
  existing.patchId = patch.id;
}

function applyPatchInternal(entry: TrackSynth, patch: SynthPatch): void {
  const { synth, filter } = entry;

  // Apply voice params via .set — PolySynth fans this out to all voices.
  const setOpts: Record<string, unknown> = {
    oscillator: { type: patch.waveform },
    envelope: {
      attack: patch.envelope.attack,
      decay: patch.envelope.decay,
      sustain: patch.envelope.sustain,
      release: patch.envelope.release,
    },
  };
  if (patch.synthType === 'FMSynth' || patch.synthType === 'AMSynth') {
    setOpts.harmonicity = patch.harmonicity;
    if (patch.synthType === 'FMSynth') {
      setOpts.modulationIndex = patch.modulationIndex;
    }
  }
  synth.set(setOpts);
  synth.volume.value = patch.volume;

  // Filter is a separate node — set its params directly.
  filter.frequency.value = patch.filterCutoff;
  filter.Q.value = patch.filterResonance;
}

/** Synchronous accessor — null if not yet built. */
export function peekTrackSynth(trackId: string): Tone.PolySynth | null {
  return synths.get(trackId)?.synth ?? null;
}

export function disposeTrackSynth(trackId: string): void {
  const existing = synths.get(trackId);
  if (existing) {
    try { existing.synth.releaseAll(); } catch { /* ignore */ }
    existing.synth.dispose();
    existing.filter.dispose();
    synths.delete(trackId);
  }
}

export function disposeAllSynths(): void {
  synths.forEach((s) => {
    try { s.synth.releaseAll(); } catch { /* ignore */ }
    s.synth.dispose();
    s.filter.dispose();
  });
  synths.clear();
}

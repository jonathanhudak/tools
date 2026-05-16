/**
 * Synth Manager — manages Tone.js PolySynth instances per MIDI track.
 * Loads SynthPatch settings and applies them to live playing.
 * Playback of recorded notes still uses raw AudioBuffer synthesis (midi-engine.ts)
 * for synchronous offline rendering, but with the same patch envelope.
 */
import * as Tone from 'tone';
import type { SynthPatch } from './types';
import { DEFAULT_PATCH } from './types';
import { getPatch } from './patch-store';

interface TrackSynth {
  synth: Tone.PolySynth;
  patchId: string;
}

const synths = new Map<string, TrackSynth>();

function createSynth(patch: SynthPatch): Tone.PolySynth {
  const baseOptions: any = {
    oscillator: { type: patch.waveform },
    envelope: {
      attack: patch.envelope.attack,
      decay: patch.envelope.decay,
      sustain: patch.envelope.sustain,
      release: patch.envelope.release,
    },
  };

  if (patch.synthType === 'FMSynth') {
    baseOptions.harmonicity = patch.harmonicity;
    baseOptions.modulationIndex = patch.modulationIndex;
  }

  const synth = new Tone.PolySynth(Tone.Synth, baseOptions);
  synth.set({
    volume: patch.volume,
    detune: 0,
  });

  // Low-pass filter
  if (patch.filterCutoff < 20000) {
    const filter = new Tone.Filter(patch.filterCutoff, 'lowpass', -12);
    filter.Q.value = patch.filterResonance;
    synth.chain(filter, Tone.getDestination());
  } else {
    synth.connect(Tone.getDestination());
  }

  return synth;
}

export async function getTrackSynth(trackId: string, patchId: string | null): Promise<Tone.PolySynth> {
  const existing = synths.get(trackId);
  const resolvedId = patchId || '__default__';

  // Return cached if patch hasn't changed
  if (existing && existing.patchId === resolvedId) {
    return existing.synth;
  }

  // Dispose old synth if any
  if (existing) {
    existing.synth.dispose();
  }

  const patch = (await getPatch(resolvedId)) ?? DEFAULT_PATCH;
  const synth = createSynth(patch);
  synths.set(trackId, { synth, patchId: resolvedId });
  return synth;
}

export function disposeTrackSynth(trackId: string): void {
  const existing = synths.get(trackId);
  if (existing) {
    existing.synth.dispose();
    synths.delete(trackId);
  }
}

export function disposeAllSynths(): void {
  synths.forEach((s) => s.synth.dispose());
  synths.clear();
}

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
  filter: Tone.Filter | null;
  patchId: string;
}

type SynthOutput = Tone.ToneAudioNode | AudioNode;

const synths = new Map<string, TrackSynth>();

// Voice options for PolySynth<Synth>; this matches Tone's PartialVoiceOptions<Synth>
// without depending on its non-exported RecursivePartial helper.
type SynthVoiceOptions = Partial<{
  oscillator: { type: 'sine' | 'sawtooth' | 'square' | 'triangle' };
  envelope: Partial<{
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  }>;
  harmonicity: number;
  modulationIndex: number;
}>;

function createSynth(patch: SynthPatch, output?: SynthOutput): { synth: Tone.PolySynth; filter: Tone.Filter | null } {
  const baseOptions: SynthVoiceOptions = {
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

  // PolySynth has overloaded constructors; the two-arg form `(VoiceCtor, options)`
  // is the one we want, but TS's ConstructorParameters resolves to the last overload
  // (single arg). Use a typed factory cast to call the two-arg overload safely.
  type PolyCtor = new (
    voice: typeof Tone.Synth,
    options: SynthVoiceOptions,
  ) => Tone.PolySynth;
  const PolySynthCtor = Tone.PolySynth as unknown as PolyCtor;
  const synth = new PolySynthCtor(Tone.Synth, baseOptions);
  synth.set({
    volume: patch.volume,
    detune: 0,
  });

  // Resolve destination: explicit output, or Tone's master destination.
  const destination: SynthOutput = output ?? Tone.getDestination();

  // Low-pass filter
  let filter: Tone.Filter | null = null;
  if (patch.filterCutoff < 20000) {
    filter = new Tone.Filter(patch.filterCutoff, 'lowpass', -12);
    filter.Q.value = patch.filterResonance;
    synth.connect(filter);
    filter.connect(destination);
  } else {
    synth.connect(destination);
  }

  return { synth, filter };
}

export async function getTrackSynth(
  trackId: string,
  patchId: string | null,
  output?: SynthOutput,
): Promise<Tone.PolySynth> {
  const existing = synths.get(trackId);
  const resolvedId = patchId || '__default__';

  // Return cached if patch hasn't changed
  if (existing && existing.patchId === resolvedId) {
    return existing.synth;
  }

  // Dispose old synth if any
  if (existing) {
    existing.synth.dispose();
    if (existing.filter) existing.filter.dispose();
  }

  const patch = (await getPatch(resolvedId)) ?? DEFAULT_PATCH;
  const { synth, filter } = createSynth(patch, output);
  synths.set(trackId, { synth, filter, patchId: resolvedId });
  return synth;
}

export function disposeTrackSynth(trackId: string): void {
  const existing = synths.get(trackId);
  if (existing) {
    existing.synth.dispose();
    if (existing.filter) existing.filter.dispose();
    synths.delete(trackId);
  }
}

export function disposeAllSynths(): void {
  synths.forEach((s) => {
    s.synth.dispose();
    if (s.filter) s.filter.dispose();
  });
  synths.clear();
}

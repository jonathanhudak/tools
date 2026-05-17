/**
 * Tone-bridge — make Tone.js share the same AudioContext as the app's
 * raw Web Audio engine. Without this, Tone.js spins up its own AudioContext
 * and recorded audio (raw buffers) and synth output drift / can't be summed
 * to a single Destination.
 *
 * Call initToneBridge() once at app start, before any Tone usage.
 * Subsequent calls are no-ops.
 */
import * as Tone from 'tone';
import { getCtx, getMasterGain } from './audio-engine';

let initialized = false;
let masterBus: GainNode | null = null;

/**
 * Bind Tone.js to our AudioContext + a shared master GainNode so all
 * synth output (Tone) and clip output (raw Web Audio) mix to the same
 * destination.
 */
export async function initToneBridge(): Promise<void> {
  if (initialized) return;
  const ctx = getCtx();

  // Tone supports being handed any AudioContext.
  Tone.setContext(ctx);

  // Ensure the context is running (user-gesture autoplay policy).
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      /* ignore — will resume on first user gesture */
    }
  }

  // Shared master bus: Tone synths route here, raw clips also route here.
  // We connect this to the app's masterGain so the rest of the pipeline
  // (volume, future limiter, etc.) lives in one place.
  masterBus = ctx.createGain();
  masterBus.gain.value = 1;
  masterBus.connect(getMasterGain());

  initialized = true;
}

/** The shared master bus (Tone synth output + raw clip output sum here). */
export function getToneMaster(): GainNode {
  if (!masterBus) {
    // Lazy init: callers should have called initToneBridge first, but
    // we don't want to crash if they didn't.
    const ctx = getCtx();
    masterBus = ctx.createGain();
    masterBus.gain.value = 1;
    masterBus.connect(getMasterGain());
  }
  return masterBus;
}

export function isToneBridgeReady(): boolean {
  return initialized;
}

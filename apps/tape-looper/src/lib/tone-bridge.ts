/**
 * Tone Bridge — wire Tone.js to share our existing AudioContext.
 *
 * Tone.js by default creates its own AudioContext. We force it to use the
 * same context as `audio-engine.ts` so MIDI synths, audio clips, and any
 * Tone-based effects share a single graph and timeline.
 *
 * Call `initToneBridge()` once on first user gesture (button press) before
 * triggering any Tone-based playback. Idempotent.
 */
import * as Tone from 'tone';
import { getCtx } from './audio-engine';

let initialized = false;

export async function initToneBridge(): Promise<void> {
  if (initialized) return;
  const ctx = getCtx();
  Tone.setContext(ctx);
  if (ctx.state === 'suspended') await ctx.resume();
  await Tone.start();
  initialized = true;
}

export function getTransport(): ReturnType<typeof Tone.getTransport> {
  return Tone.getTransport();
}

export function isToneBridgeInitialized(): boolean {
  return initialized;
}

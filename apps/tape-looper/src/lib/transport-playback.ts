/**
 * Transport-playback — orchestrates audio + MIDI playback against
 * Tone.Transport. Single source of truth for "what's playing right now".
 *
 * Tone.Transport is the master clock. Audio clips and MIDI Parts both
 * schedule against it, so when transport.seconds advances, everything
 * stays in lockstep — including loop, jump-to-position, and tempo.
 *
 * Public surface:
 *   - startPlayback({ from, skipArmedTrackId, loop })
 *   - stopAllSources()
 *   - playLiveNote(trackId, midiNote)
 *   - stopLiveNote(trackId, midiNote)
 *   - getTransportSeconds()
 *   - getOrCreateTrackRouting(trackId)
 */
import * as Tone from 'tone';
import type { Track } from './types';
import { getCtx } from './audio-engine';
import { getToneMaster, initToneBridge } from './tone-bridge';
import { getTrackSynth, peekTrackSynth } from './synth-manager';
import { midiToFreq } from './midi-engine';

/** Per-track audio routing nodes — stable across playNote calls so the
 *  mixer (Agent A) can grab them by trackId and tweak gain/pan. */
export interface TrackRouting {
  gain: GainNode;
  panner: StereoPannerNode;
}

const routing = new Map<string, TrackRouting>();

/** Active raw audio sources currently playing (for stop()). */
const activeAudioSources: AudioBufferSourceNode[] = [];
/** Active scheduled Tone.Parts (for stop()). */
const activeParts: Tone.Part[] = [];
/** Per-track Part — kept so we can rebuild on patch change without
 *  rescheduling the others. (Currently we just rebuild everything on
 *  restart.) */
// const trackParts = new Map<string, Tone.Part>();

export interface PlaybackOptions {
  /** Where to start (seconds). */
  from: number;
  /** Don't schedule playback for this track id (the armed track during recording). */
  skipArmedTrackId?: string | null;
  /** Loop region — if enabled, Transport loops between start and end. */
  loop?: { enabled: boolean; start: number; end: number };
}

/** Lazily create per-track routing (gain → panner → master). */
export function getOrCreateTrackRouting(trackId: string): TrackRouting {
  const existing = routing.get(trackId);
  if (existing) return existing;
  const ctx = getCtx();
  const gain = ctx.createGain();
  gain.gain.value = 1; // Mixer will own this later.
  const panner = ctx.createStereoPanner();
  panner.pan.value = 0;
  gain.connect(panner);
  panner.connect(getToneMaster());
  const entry: TrackRouting = { gain, panner };
  routing.set(trackId, entry);
  return entry;
}

export function getTrackRouting(trackId: string): TrackRouting | undefined {
  return routing.get(trackId);
}

export function disposeTrackRouting(trackId: string): void {
  const entry = routing.get(trackId);
  if (!entry) return;
  try { entry.gain.disconnect(); } catch { /* ignore */ }
  try { entry.panner.disconnect(); } catch { /* ignore */ }
  routing.delete(trackId);
}

/** Current Transport time in seconds — used for the playhead raf. */
export function getTransportSeconds(): number {
  return Tone.getTransport().seconds;
}

/** Stop all scheduled audio + MIDI and clear Transport. */
export function stopAllSources(): void {
  for (const src of activeAudioSources) {
    try { src.stop(); } catch { /* already stopped */ }
    try { src.disconnect(); } catch { /* ignore */ }
  }
  activeAudioSources.length = 0;

  for (const part of activeParts) {
    try { part.stop(0); } catch { /* ignore */ }
    try { part.dispose(); } catch { /* ignore */ }
  }
  activeParts.length = 0;

  const transport = Tone.getTransport();
  try { transport.stop(); } catch { /* ignore */ }
  try { transport.cancel(0); } catch { /* ignore */ }
  transport.loop = false;
}

/**
 * Start playback of audio + MIDI tracks anchored to Tone.Transport.
 * Returns once everything is scheduled; transport is running.
 */
export async function startPlayback(opts: PlaybackOptions, tracks: Track[]): Promise<void> {
  await initToneBridge();
  stopAllSources();

  const { from, skipArmedTrackId = null, loop } = opts;
  const transport = Tone.getTransport();
  const anySolo = tracks.some((t) => t.solo);

  // Position the transport before scheduling so 'when' values resolve correctly.
  transport.seconds = from;

  // Loop region — if enabled, Transport handles wrap-around for us.
  if (loop && loop.enabled && loop.end > loop.start) {
    transport.loop = true;
    transport.loopStart = loop.start;
    transport.loopEnd = loop.end;
  } else {
    transport.loop = false;
  }

  // Schedule each track.
  for (const track of tracks) {
    if (skipArmedTrackId && track.id === skipArmedTrackId) continue;
    const effectiveMute = anySolo ? !track.solo : track.muted;
    if (effectiveMute) continue;

    if (track.trackType === 'midi') {
      await scheduleMidiTrack(track);
    } else {
      scheduleAudioTrack(track);
    }
  }

  // Resume context if user-gesture-suspended, then start the transport.
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    try { await ctx.resume(); } catch { /* ignore */ }
  }
  transport.start();
}

/**
 * Schedule a MIDI track via Tone.Part. The Part runs on Transport time
 * (so loops, pause, and re-seek all just work).
 */
async function scheduleMidiTrack(track: Track): Promise<void> {
  if (track.notes.length === 0) return;

  const routingNode = getOrCreateTrackRouting(track.id);
  const synth = await getTrackSynth(track.id, track.patchId, routingNode.gain);

  // Tone.Part accepts event objects with a `time` field; Tone passes the
  // whole object back into the callback. We carry the NoteEvent fields
  // alongside so the synth can trigger correct pitch + duration.
  interface PartEvent {
    time: number;
    midiNote: number;
    duration: number;
  }
  const events: PartEvent[] = track.notes.map((n) => ({
    time: n.startTime,
    midiNote: n.midiNote,
    duration: n.duration,
  }));

  const part = new Tone.Part<PartEvent>((time, note) => {
    // 'time' is the absolute Transport-time when this event fires.
    synth.triggerAttackRelease(midiToFreq(note.midiNote), note.duration, time);
  }, events);
  part.start(0);
  activeParts.push(part);
}

/**
 * Schedule audio clips. Uses raw AudioBufferSourceNode but anchors timing
 * to Tone.Transport by computing the absolute Tone.context time when each
 * clip should fire (Transport.start will be 'now' inside startPlayback,
 * so we use Tone.now() as the reference).
 *
 * Trade-off: this means audio is NOT re-scheduled on transport.seek
 * mid-playback. That's fine — we always stop+restart playback on seek.
 */
function scheduleAudioTrack(track: Track): void {
  const routingNode = getOrCreateTrackRouting(track.id);
  const ctx = getCtx();
  const transport = Tone.getTransport();
  const transportNow = transport.seconds;
  // Tone.now() returns the AudioContext time at this moment. That's the
  // moment the transport will tick forward from.
  const ctxNowAtTransport = Tone.now();

  for (const clip of track.clips) {
    const clipEnd = clip.startTime + clip.duration;
    if (clipEnd <= transportNow) continue;

    // How far into the clip are we already? (If transport is past startTime.)
    const intoClip = Math.max(0, transportNow - clip.startTime);
    // Delay until clip starts (negative → already started, so 0 + offset).
    const delay = Math.max(0, clip.startTime - transportNow);
    const remaining = clip.duration - intoClip;
    if (remaining <= 0) continue;

    const src = ctx.createBufferSource();
    src.buffer = clip.buffer;
    src.connect(routingNode.gain);
    src.start(ctxNowAtTransport + delay, intoClip, remaining);
    activeAudioSources.push(src);
  }
}

/**
 * Trigger a live MIDI note (keyboard / touch / hardware MIDI).
 * Lazy-initializes synth + routing if needed.
 */
export async function playLiveNote(trackId: string, patchId: string | null, midiNote: number): Promise<void> {
  await initToneBridge();
  const routingNode = getOrCreateTrackRouting(trackId);
  const synth = await getTrackSynth(trackId, patchId, routingNode.gain);
  synth.triggerAttack(midiToFreq(midiNote), Tone.now());
}

/** Release a live MIDI note. Safe to call before synth exists (no-op). */
export function stopLiveNote(trackId: string, midiNote: number): void {
  const synth = peekTrackSynth(trackId);
  if (!synth) return;
  try {
    synth.triggerRelease(midiToFreq(midiNote), Tone.now());
  } catch {
    /* ignore — voice may already be released */
  }
}

/** Release every voice across every track — used when recording stops. */
export function releaseAllLiveNotes(): void {
  for (const trackId of routing.keys()) {
    const synth = peekTrackSynth(trackId);
    if (synth) {
      try { synth.releaseAll(Tone.now()); } catch { /* ignore */ }
    }
  }
}

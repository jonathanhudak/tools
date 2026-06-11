/**
 * Shared audio helpers built on the AudioPlayback piano-ish synth:
 * melody/arpeggio playback, chord sequencing, and a sustained drone.
 */

import { AudioPlayback } from '../utils/audio-playback';

let shared: AudioPlayback | null = null;

export function getPlayer(): AudioPlayback {
  if (!shared) shared = new AudioPlayback();
  return shared;
}

export interface PlaybackHandle {
  stop: () => void;
}

/**
 * Play a sequence of MIDI notes at the given tempo.
 * `onStep(i)` fires as each note starts; `onDone` after the last note rings out.
 */
export function playMelody(
  midis: number[],
  bpm = 120,
  onStep?: (index: number) => void,
  onDone?: () => void,
): PlaybackHandle {
  const player = getPlayer();
  const beatMs = 60000 / bpm;
  const timers: ReturnType<typeof setTimeout>[] = [];
  midis.forEach((midi, i) => {
    timers.push(
      setTimeout(() => {
        onStep?.(i);
        player.playNote(midi, (beatMs / 1000) * 0.95);
      }, i * beatMs),
    );
  });
  if (onDone) timers.push(setTimeout(onDone, midis.length * beatMs + 300));
  return { stop: () => timers.forEach(clearTimeout) };
}

/** Play several MIDI notes simultaneously. */
export function playChordMidis(midis: number[], durationSec = 1.6): void {
  const player = getPlayer();
  midis.forEach(m => player.playNote(m, durationSec));
}

export interface ChordStep {
  midis: number[];
  /** Duration in beats */
  beats: number;
}

/**
 * Play a chord sequence (e.g. a progression). Loops when `loop` is true.
 * `onStep(i)` fires at each chord; `onCycle` after each full pass.
 */
export function playChordSequence(
  steps: ChordStep[],
  bpm = 90,
  opts: { loop?: boolean; onStep?: (i: number) => void; onCycle?: () => void } = {},
): PlaybackHandle {
  const player = getPlayer();
  const beatMs = 60000 / bpm;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const playFrom = (i: number) => {
    if (stopped || steps.length === 0) return;
    const step = steps[i];
    opts.onStep?.(i);
    const durSec = (step.beats * beatMs) / 1000;
    step.midis.forEach(m => player.playNote(m, durSec * 0.95));
    timer = setTimeout(() => {
      const next = i + 1;
      if (next < steps.length) {
        playFrom(next);
      } else {
        opts.onCycle?.();
        if (opts.loop && !stopped) playFrom(0);
      }
    }, step.beats * beatMs);
  };

  playFrom(0);
  return {
    stop: () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    },
  };
}

/**
 * Sustained tonic drone (root + fifth) for modal practice.
 * Uses its own oscillators so it can sustain indefinitely.
 */
export class Drone {
  private ctx: AudioContext | null = null;
  private nodes: { osc: OscillatorNode; gain: GainNode }[] = [];

  start(rootMidi: number, volume = 0.06): void {
    this.stop();
    try {
      this.ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return;
    }
    const freqs = [rootMidi, rootMidi + 7, rootMidi + 12].map(
      m => 440 * Math.pow(2, (m - 69) / 12),
    );
    freqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === 0 ? 'sawtooth' : 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(volume / (i + 1), this.ctx.currentTime + 0.8);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start();
      this.nodes.push({ osc, gain });
    });
  }

  get playing(): boolean {
    return this.nodes.length > 0;
  }

  stop(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.nodes.forEach(({ osc, gain }) => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      osc.stop(ctx.currentTime + 0.5);
    });
    this.nodes = [];
    const old = ctx;
    this.ctx = null;
    setTimeout(() => void old.close().catch(() => undefined), 700);
  }
}

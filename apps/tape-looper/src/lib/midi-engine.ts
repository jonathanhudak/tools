/**
 * MIDI engine — note overwrite logic and sine wave synthesis.
 * Same tape-machine model as audio: new notes overwrite overlapping ones.
 */
import type { NoteEvent, Waveform } from './types';

/** Apply tape-style overwrite to MIDI notes */
export function applyNoteOverwrite(
  existing: NoteEvent[],
  newNotes: NoteEvent[],
  recordStart: number,
): NoteEvent[] {
  const recordEnd = recordStart + Math.max(...newNotes.map((n) => n.startTime + n.duration), 1);
  const kept = existing.filter((n) => {
    const nEnd = n.startTime + n.duration;
    return nEnd <= recordStart || n.startTime >= recordEnd;
  });
  return [...kept, ...newNotes.map((n) => ({ ...n, startTime: n.startTime + recordStart }))]
    .sort((a, b) => a.startTime - b.startTime);
}

/** MIDI note number to frequency */
export function midiToFreq(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/** Synthesize an AudioBuffer for a single note with given waveform */
export function synthNote(midiNote: number, duration: number, ctx: AudioContext, waveform: Waveform = 'sine'): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.ceil(duration * sampleRate);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  const freq = midiToFreq(midiNote);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const attack = Math.min(1, t / 0.005);
    const release = Math.min(1, (duration - t) / 0.02);
    const envelope = Math.min(attack, release);
    data[i] = oscSample(waveform, freq, t) * envelope * 0.3;
  }
  return buffer;
}

/** Generate a single oscillator sample for the given waveform */
function oscSample(waveform: Waveform, freq: number, t: number): number {
  const phase = 2 * Math.PI * freq * t;
  switch (waveform) {
    case 'sine': return Math.sin(phase);
    case 'sawtooth': return 2 * ((freq * t) % 1) - 1;
    case 'square': return Math.sin(phase) >= 0 ? 1 : -1;
    case 'triangle': return 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1;
    default: return Math.sin(phase);
  }
}

/** Synthesize all notes on a track into a single AudioBuffer for playback */
export function synthTrack(notes: NoteEvent[], ctx: AudioContext, waveform: Waveform = 'sine'): AudioBuffer | null {
  if (notes.length === 0) return null;
  const totalDuration = Math.max(...notes.map((n) => n.startTime + n.duration));
  const sampleRate = ctx.sampleRate;
  const length = Math.ceil(totalDuration * sampleRate);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (const note of notes) {
    const freq = midiToFreq(note.midiNote);
    const startSample = Math.floor(note.startTime * sampleRate);
    const noteLength = Math.ceil(note.duration * sampleRate);

    for (let i = 0; i < noteLength; i++) {
      const idx = startSample + i;
      if (idx >= length) break;
      const t = i / sampleRate;
      const attack = Math.min(1, t / 0.005);
      const release = Math.min(1, (note.duration - t) / 0.02);
      const envelope = Math.min(attack, release);
      data[idx] += oscSample(waveform, freq, t) * envelope * 0.3;
    }
  }
  return buffer;
}

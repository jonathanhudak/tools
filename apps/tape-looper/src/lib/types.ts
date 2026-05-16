/** Clip: a recorded audio segment */
export interface Clip {
  id: string;
  trackId: string;
  startTime: number;
  duration: number;
  buffer: AudioBuffer;
  name: string;
}

/** NoteEvent: a MIDI note recorded in the piano roll */
export interface NoteEvent {
  midiNote: number;
  startTime: number;
  duration: number;
}

export type TrackType = 'audio' | 'midi';
export type Waveform = 'sine' | 'sawtooth' | 'square' | 'triangle';
export type SynthType = 'Synth' | 'FMSynth' | 'AMSynth';

/** ADSR envelope */
export interface ADSR {
  attack: number;   // seconds
  decay: number;
  sustain: number;  // 0–1
  release: number;
}

/** A saved synthesizer patch (instrument preset) */
export interface SynthPatch {
  id: string;
  name: string;
  synthType: SynthType;
  waveform: Waveform;
  envelope: ADSR;
  // FM params (only for FMSynth)
  harmonicity: number;
  modulationIndex: number;
  // Filter
  filterCutoff: number;   // Hz
  filterResonance: number; // 0–10
  // Volume
  volume: number; // -60 to 0 dB
}

/** Track: a horizontal lane */
export interface Track {
  id: string;
  name: string;
  armed: boolean;
  muted: boolean;
  solo: boolean;
  trackType: TrackType;
  waveform: Waveform;
  patchId: string | null; // IndexedDB key of the SynthPatch
  clips: Clip[];
  notes: NoteEvent[];
}

export type TransportState = 'stopped' | 'playing' | 'recording';

/** Default patch — a basic sine synth */
export const DEFAULT_PATCH: SynthPatch = {
  id: '__default__',
  name: 'Default Sine',
  synthType: 'Synth',
  waveform: 'sine',
  envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.3 },
  harmonicity: 1,
  modulationIndex: 0,
  filterCutoff: 20000,
  filterResonance: 0,
  volume: -6,
};

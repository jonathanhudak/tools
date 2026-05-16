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

/** Track: a horizontal lane */
export interface Track {
  id: string;
  name: string;
  armed: boolean;
  muted: boolean;
  solo: boolean;
  trackType: TrackType;
  clips: Clip[];
  notes: NoteEvent[];
}

export type TransportState = 'stopped' | 'playing' | 'recording';

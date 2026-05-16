/** Clip: a recorded audio segment */
export interface Clip {
  id: string;
  trackId: string;
  startTime: number;   // seconds from project start
  duration: number;    // seconds
  buffer: AudioBuffer;
  name: string;
}

/** Track: a horizontal lane */
export interface Track {
  id: string;
  name: string;
  armed: boolean;
  muted: boolean;
  solo: boolean;
  clips: Clip[];
}

export type TransportState = 'stopped' | 'playing' | 'recording';

export interface DAWState {
  tracks: Track[];
  transport: TransportState;
  bpm: number;
}

import { create } from 'zustand';
import type { Track, TransportState, Clip, NoteEvent, TrackType } from './types';
import { applyOverwrite } from './tape-engine';
import { applyNoteOverwrite } from './midi-engine';

interface DAWStore {
  tracks: Track[];
  transport: TransportState;
  bpm: number;
  armedTrackId: string | null;
  inputGain: number;
  zoom: number;

  addTrack: () => void;
  removeTrack: (id: string) => void;
  toggleMute: (id: string) => void;
  toggleSolo: (id: string) => void;
  toggleArm: (id: string) => void;
  clearArmed: () => void;
  toggleTrackType: (id: string) => void;

  overwriteClip: (trackId: string, buffer: AudioBuffer, startTime: number) => void;
  overwriteNotes: (trackId: string, notes: NoteEvent[], startTime: number) => void;

  setTransport: (s: TransportState) => void;
  setInputGain: (gain: number) => void;
  setZoom: (zoom: number) => void;
}

let trackNum = 1;
function freshTrack(): Track {
  return {
    id: `t${trackNum++}`,
    name: `Track ${trackNum - 1}`,
    armed: false,
    muted: false,
    solo: false,
    trackType: 'audio',
    clips: [],
    notes: [],
  };
}

export const useStore = create<DAWStore>((set) => ({
  tracks: [freshTrack()],
  transport: 'stopped',
  bpm: 120,
  armedTrackId: null,
  inputGain: 4,
  zoom: 80,

  addTrack: () => set((s) => ({ tracks: [...s.tracks, freshTrack()] })),

  removeTrack: (id) =>
    set((s) => ({
      tracks: s.tracks.filter((t) => t.id !== id),
      armedTrackId: s.armedTrackId === id ? null : s.armedTrackId,
    })),

  toggleMute: (id) =>
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === id ? { ...t, muted: !t.muted } : t)),
    })),

  toggleSolo: (id) =>
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === id ? { ...t, solo: !t.solo } : t)),
    })),

  toggleArm: (id) =>
    set((s) => ({
      armedTrackId: s.armedTrackId === id ? null : id,
      tracks: s.tracks.map((t) => ({
        ...t,
        armed: t.id === id ? !t.armed : false,
      })),
    })),

  clearArmed: () =>
    set((s) => ({
      armedTrackId: null,
      tracks: s.tracks.map((t) => ({ ...t, armed: false })),
    })),

  toggleTrackType: (id) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === id
          ? { ...t, trackType: t.trackType === 'audio' ? 'midi' : ('audio' as TrackType) }
          : t,
      ),
    })),

  overwriteClip: (trackId, buffer, startTime) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId
          ? { ...t, clips: applyOverwrite(t.clips, buffer, startTime, trackId) }
          : t,
      ),
    })),

  overwriteNotes: (trackId, notes, startTime) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId
          ? { ...t, notes: applyNoteOverwrite(t.notes, notes, startTime) }
          : t,
      ),
    })),

  setTransport: (transport) => set({ transport }),
  setInputGain: (inputGain) => set({ inputGain }),
  setZoom: (zoom) => set({ zoom }),
}));

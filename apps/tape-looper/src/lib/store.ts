import { create } from 'zustand';
import type { Track, TransportState, Clip } from './types';
import { applyOverwrite } from './tape-engine';

interface DAWStore {
  tracks: Track[];
  transport: TransportState;
  bpm: number;
  armedTrackId: string | null;

  // Track actions
  addTrack: () => void;
  removeTrack: (id: string) => void;
  toggleMute: (id: string) => void;
  toggleSolo: (id: string) => void;
  toggleArm: (id: string) => void;

  // Clip actions
  addClipToTrack: (trackId: string, clip: Clip) => void;
  overwriteClip: (trackId: string, buffer: AudioBuffer, startTime: number) => void;

  // Transport
  setTransport: (s: TransportState) => void;
  setBpm: (bpm: number) => void;
}

let trackNum = 1;
function freshTrack(): Track {
  return {
    id: `t${trackNum++}`,
    name: `Track ${trackNum - 1}`,
    armed: false,
    muted: false,
    solo: false,
    clips: [],
  };
}

export const useStore = create<DAWStore>((set) => ({
  tracks: [freshTrack(), freshTrack(), freshTrack()],
  transport: 'stopped',
  bpm: 120,
  armedTrackId: null,

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

  addClipToTrack: (trackId, clip) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId
          ? { ...t, clips: [...t.clips, clip].sort((a, b) => a.startTime - b.startTime) }
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

  setTransport: (transport) => set({ transport }),
  setBpm: (bpm) => set({ bpm }),
}));

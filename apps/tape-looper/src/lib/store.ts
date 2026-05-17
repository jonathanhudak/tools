import { create } from 'zustand';
import type { Track, TransportState, NoteEvent, TrackType, Waveform, LoopRegion } from './types';
import { applyOverwrite } from './tape-engine';
import { applyNoteOverwrite } from './midi-engine';

interface DAWStore {
  tracks: Track[];
  transport: TransportState;
  bpm: number;
  armedTrackId: string | null;
  inputGain: number;
  zoom: number;
  projectId: string | null;
  projectName: string;
  masterVolume: number;
  loop: LoopRegion;
  followPlayhead: boolean;
  editingSynthTrackId: string | null;

  addAudioTrack: () => void;
  addMidiTrack: () => void;
  removeTrack: (id: string) => void;
  toggleMute: (id: string) => void;
  toggleSolo: (id: string) => void;
  toggleArm: (id: string) => void;
  clearArmed: () => void;
  setTracks: (tracks: Track[]) => void;
  setProjectId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  renameTrack: (id: string, name: string) => void;
  setWaveform: (id: string, wf: Waveform) => void;
  setPatchId: (id: string, patchId: string | null) => void;
  setVolume: (trackId: string, volume: number) => void;
  setPan: (trackId: string, pan: number) => void;

  overwriteClip: (trackId: string, buffer: AudioBuffer, startTime: number) => void;
  overwriteNotes: (trackId: string, notes: NoteEvent[], startTime: number) => void;

  setTransport: (s: TransportState) => void;
  setInputGain: (gain: number) => void;
  setZoom: (zoom: number) => void;
  setBpm: (bpm: number) => void;
  setMasterVolume: (volume: number) => void;
  setLoop: (loop: Partial<LoopRegion>) => void;
  setFollowPlayhead: (v: boolean) => void;
  setEditingSynthTrackId: (id: string | null) => void;
}

let trackNum = 1;
function freshTrack(type: TrackType): Track {
  const n = trackNum++;
  return {
    id: `t${n}`,
    name: `${type === 'midi' ? 'MIDI' : 'Audio'} ${n}`,
    armed: false,
    muted: false,
    solo: false,
    trackType: type,
    waveform: 'sine',
    patchId: null,
    clips: [],
    notes: [],
    volume: 0.8,
    pan: 0,
  };
}

export const useStore = create<DAWStore>((set) => ({
  tracks: [freshTrack('audio')],
  transport: 'stopped',
  bpm: 120,
  armedTrackId: null,
  inputGain: 4,
  zoom: 80,
  projectId: null,
  projectName: 'Untitled',
  masterVolume: 0.8,
  loop: { enabled: false, start: 0, end: 4 },
  followPlayhead: true,
  editingSynthTrackId: null,

  addAudioTrack: () => set((s) => ({ tracks: [...s.tracks, freshTrack('audio')] })),
  addMidiTrack: () => set((s) => ({ tracks: [...s.tracks, freshTrack('midi')] })),

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
      tracks: s.tracks.map((t) => ({ ...t, armed: t.id === id ? !t.armed : false })),
    })),

  clearArmed: () =>
    set((s) => ({
      armedTrackId: null,
      tracks: s.tracks.map((t) => ({ ...t, armed: false })),
    })),

  setTracks: (tracks) => set({ tracks }),
  setProjectId: (projectId) => set({ projectId }),
  setProjectName: (projectName) => set({ projectName }),
  renameTrack: (id, name) =>
    set((s) => ({ tracks: s.tracks.map((t) => (t.id === id ? { ...t, name } : t)) })),
  setWaveform: (id, waveform) =>
    set((s) => ({ tracks: s.tracks.map((t) => (t.id === id ? { ...t, waveform } : t)) })),
  setPatchId: (id, patchId) =>
    set((s) => ({ tracks: s.tracks.map((t) => (t.id === id ? { ...t, patchId } : t)) })),
  setVolume: (trackId, volume) =>
    set((s) => ({ tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, volume } : t)) })),
  setPan: (trackId, pan) =>
    set((s) => ({ tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, pan } : t)) })),

  overwriteClip: (trackId, buffer, startTime) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId ? { ...t, clips: applyOverwrite(t.clips, buffer, startTime, trackId) } : t,
      ),
    })),

  overwriteNotes: (trackId, notes, startTime) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId ? { ...t, notes: applyNoteOverwrite(t.notes, notes, startTime) } : t,
      ),
    })),

  setTransport: (transport) => set({ transport }),
  setInputGain: (inputGain) => set({ inputGain }),
  setZoom: (zoom) => set({ zoom }),
  setBpm: (bpm) => set({ bpm }),
  setMasterVolume: (masterVolume) => set({ masterVolume }),
  setLoop: (loop) => set((s) => ({ loop: { ...s.loop, ...loop } })),
  setFollowPlayhead: (followPlayhead) => set({ followPlayhead }),
  setEditingSynthTrackId: (editingSynthTrackId) => set({ editingSynthTrackId }),
}));

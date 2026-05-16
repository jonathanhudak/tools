/**
 * localStorage project CRUD.
 * Each project stores track metadata + base64-encoded WAV audio.
 */
import { audioBufferToBase64, base64ToAudioBuffer } from './wav-encoder';
import { getCtx } from './audio-engine';
import type { Track, Clip, NoteEvent } from './types';

export interface SavedProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  tracks: SavedTrack[];
}

interface SavedTrack {
  id: string;
  name: string;
  trackType: 'audio' | 'midi';
  clips: SavedClip[];
  notes: NoteEvent[];
}

interface SavedClip {
  id: string;
  trackId: string;
  startTime: number;
  duration: number;
  bufferBase64: string;
  name: string;
}

const PROJECTS_KEY = 'tape-looper-projects';
const CURRENT_KEY = 'tape-looper-current-project';

function loadProjects(): Record<string, SavedProject> {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProjects(projects: Record<string, SavedProject>) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('localStorage full — could not save projects', e);
  }
}

export function getCurrentProjectId(): string | null {
  return localStorage.getItem(CURRENT_KEY);
}

export function setCurrentProjectId(id: string | null) {
  if (id) localStorage.setItem(CURRENT_KEY, id);
  else localStorage.removeItem(CURRENT_KEY);
}

export function listProjects(): SavedProject[] {
  const projects = loadProjects();
  return Object.values(projects).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getProject(id: string): SavedProject | null {
  return loadProjects()[id] ?? null;
}

export function newProjectId(): string {
  return `proj-${Date.now().toString(36)}`;
}

export function saveProject(project: SavedProject) {
  const projects = loadProjects();
  projects[project.id] = { ...project, updatedAt: Date.now() };
  saveProjects(projects);
  setCurrentProjectId(project.id);
}

export function deleteProject(id: string) {
  const projects = loadProjects();
  delete projects[id];
  saveProjects(projects);
  if (getCurrentProjectId() === id) setCurrentProjectId(null);
}

export function renameProject(id: string, name: string) {
  const projects = loadProjects();
  if (projects[id]) {
    projects[id].name = name;
    saveProjects(projects);
  }
}

/** Serialize live tracks → storable project */
export function serializeTracks(tracks: Track[]): SavedTrack[] {
  return tracks.map((t) => ({
    id: t.id,
    name: t.name,
    trackType: t.trackType,
    clips: t.clips.map((c) => ({
      id: c.id,
      trackId: c.trackId,
      startTime: c.startTime,
      duration: c.duration,
      bufferBase64: audioBufferToBase64(c.buffer),
      name: c.name,
    })),
    notes: t.notes,
  }));
}

/** Deserialize storable project → live tracks */
export async function deserializeTracks(saved: SavedTrack[]): Promise<Track[]> {
  const ctx = getCtx();
  const tracks: Track[] = [];
  for (const st of saved) {
    const clips: Clip[] = [];
    for (const sc of st.clips) {
      try {
        const buffer = await base64ToAudioBuffer(sc.bufferBase64, ctx);
        clips.push({
          id: sc.id,
          trackId: sc.trackId,
          startTime: sc.startTime,
          duration: sc.duration,
          buffer,
          name: sc.name,
        });
      } catch {
        console.warn(`Failed to decode clip ${sc.id}`);
      }
    }
    tracks.push({
      id: st.id,
      name: st.name,
      armed: false,
      muted: false,
      solo: false,
      trackType: st.trackType as 'audio' | 'midi',
      clips: clips.sort((a, b) => a.startTime - b.startTime),
      notes: st.notes,
    });
  }
  return tracks;
}

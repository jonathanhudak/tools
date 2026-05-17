/**
 * IndexedDB project CRUD — virtually unlimited storage for multi-track projects.
 * Audio clips stored as raw WAV ArrayBuffers (no base64 bloat).
 */
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
  waveform: string;
  patchId: string | null;
  clips: SavedClip[];
  notes: NoteEvent[];
  /** Per-track volume, 0–1 linear. Optional for backward-compat. */
  volume?: number;
  /** Per-track pan, -1..1. Optional for backward-compat. */
  pan?: number;
}

interface SavedClip {
  id: string;
  trackId: string;
  startTime: number;
  duration: number;
  /** IndexedDB key for the raw WAV ArrayBuffer. '' if no audio data. */
  bufferKey: string;
  name: string;
}

const DB_NAME = 'tape-looper';
const DB_VERSION = 1;
const CURRENT_KEY = 'current-project';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('clips')) {
        db.createObjectStore('clips');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db: IDBDatabase, stores: string[], mode: IDBTransactionMode = 'readonly') {
  return db.transaction(stores, mode);
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* ── Settings (current project ID) ── */

export async function getCurrentProjectId(): Promise<string | null> {
  const db = await openDB();
  const result = await promisify(tx(db, ['settings']).objectStore('settings').get(CURRENT_KEY));
  db.close();
  if (result == null) return null;
  // Tolerate legacy shape ({ value }) and new shape (raw string).
  if (typeof result === 'string') return result;
  return (result as { value?: string }).value ?? null;
}

export async function setCurrentProjectId(id: string | null) {
  const db = await openDB();
  if (id) {
    // settings store has no keyPath — supply key out-of-line as the 2nd arg.
    await promisify(tx(db, ['settings'], 'readwrite').objectStore('settings').put(id, CURRENT_KEY));
  } else {
    await promisify(tx(db, ['settings'], 'readwrite').objectStore('settings').delete(CURRENT_KEY));
  }
  db.close();
}

/* ── Project CRUD ── */

export async function listProjects(): Promise<SavedProject[]> {
  const db = await openDB();
  const all = await promisify(tx(db, ['projects']).objectStore('projects').getAll());
  db.close();
  return (all as SavedProject[]).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProject(id: string): Promise<SavedProject | null> {
  const db = await openDB();
  const result = await promisify(tx(db, ['projects']).objectStore('projects').get(id));
  db.close();
  return (result as SavedProject) ?? null;
}

export function newProjectId(): string {
  return `proj-${Date.now().toString(36)}`;
}

export async function saveProject(project: SavedProject) {
  const db = await openDB();
  const store = tx(db, ['projects'], 'readwrite').objectStore('projects');
  await promisify(store.put({ ...project, updatedAt: Date.now() }));
  db.close();
  await setCurrentProjectId(project.id);
}

export async function deleteProject(id: string) {
  const db = await openDB();
  // Delete project metadata
  await promisify(tx(db, ['projects'], 'readwrite').objectStore('projects').delete(id));
  // Delete associated clips
  const project = await promisify(tx(db, ['projects']).objectStore('projects').get(id)) as SavedProject | undefined;
  if (project) {
    const clipStore = tx(db, ['clips'], 'readwrite').objectStore('clips');
    for (const track of project.tracks) {
      for (const clip of track.clips) {
        if (clip.bufferKey) {
          await promisify(clipStore.delete(clip.bufferKey));
        }
      }
    }
  }
  db.close();
  const current = await getCurrentProjectId();
  if (current === id) await setCurrentProjectId(null);
}

export async function renameProject(id: string, name: string) {
  const db = await openDB();
  const project = await promisify(tx(db, ['projects']).objectStore('projects').get(id)) as SavedProject | undefined;
  if (project) {
    project.name = name;
    await promisify(tx(db, ['projects'], 'readwrite').objectStore('projects').put(project));
  }
  db.close();
}

/* ── WAV encoding (raw ArrayBuffer, no base64) ── */

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  return arrayBuffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/* ── Serialize / Deserialize ── */

/** Serialize live tracks → storable project. Stores clip audio in IndexedDB clips store. */
export async function serializeTracks(tracks: Track[]): Promise<SavedTrack[]> {
  const db = await openDB();
  const clipStore = tx(db, ['clips'], 'readwrite').objectStore('clips');

  const result: SavedTrack[] = [];
  for (const t of tracks) {
    const savedClips: SavedClip[] = [];
    for (const c of t.clips) {
      const bufferKey = `clip-${c.id}`;
      const wav = audioBufferToWav(c.buffer);
      await promisify(clipStore.put(wav, bufferKey));
      savedClips.push({
        id: c.id,
        trackId: c.trackId,
        startTime: c.startTime,
        duration: c.duration,
        bufferKey,
        name: c.name,
      });
    }
    result.push({
      id: t.id,
      name: t.name,
      trackType: t.trackType,
      waveform: t.waveform,
      patchId: t.patchId,
      clips: savedClips,
      notes: t.notes,
      volume: t.volume,
      pan: t.pan,
    });
  }
  db.close();
  return result;
}

/** Deserialize storable project → live tracks */
export async function deserializeTracks(saved: SavedTrack[]): Promise<Track[]> {
  const ctx = getCtx();
  const db = await openDB();
  const clipStore = tx(db, ['clips']).objectStore('clips');

  const tracks: Track[] = [];
  for (const st of saved) {
    const clips: Clip[] = [];
    for (const sc of st.clips) {
      try {
        if (!sc.bufferKey) continue;
        const wav = await promisify(clipStore.get(sc.bufferKey)) as ArrayBuffer | undefined;
        if (!wav) continue;
        const buffer = await ctx.decodeAudioData(wav.slice(0));
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
      trackType: st.trackType,
      waveform: (st.waveform as Track['waveform']) ?? 'sine',
      patchId: st.patchId ?? null,
      clips: clips.sort((a, b) => a.startTime - b.startTime),
      notes: st.notes,
      volume: typeof st.volume === 'number' ? st.volume : 0.8,
      pan: typeof st.pan === 'number' ? st.pan : 0,
    });
  }
  db.close();
  return tracks;
}

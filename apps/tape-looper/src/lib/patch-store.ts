/**
 * IndexedDB CRUD for synth patches (instrument presets).
 * Patches are lightweight JSON — no audio data, so we use the same DB.
 */
import type { SynthPatch } from './types';
import { DEFAULT_PATCH } from './types';

const DB_NAME = 'tape-looper';
const STORE_NAME = 'patches';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

function tx(db: IDBDatabase, mode: IDBTransactionMode = 'readonly') {
  return db.transaction([STORE_NAME], mode);
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function listPatches(): Promise<SynthPatch[]> {
  const db = await openDB();
  const all = await promisify(tx(db).objectStore(STORE_NAME).getAll());
  db.close();
  return (all as SynthPatch[]).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPatch(id: string): Promise<SynthPatch | null> {
  if (id === '__default__') return DEFAULT_PATCH;
  const db = await openDB();
  const result = await promisify(tx(db).objectStore(STORE_NAME).get(id));
  db.close();
  return (result as SynthPatch) ?? null;
}

export async function savePatch(patch: SynthPatch): Promise<void> {
  const db = await openDB();
  await promisify(tx(db, 'readwrite').objectStore(STORE_NAME).put(patch));
  db.close();
}

export async function deletePatch(id: string): Promise<void> {
  const db = await openDB();
  await promisify(tx(db, 'readwrite').objectStore(STORE_NAME).delete(id));
  db.close();
}

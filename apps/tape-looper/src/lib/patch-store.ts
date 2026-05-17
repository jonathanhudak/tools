/**
 * IndexedDB CRUD for synth patches (instrument presets).
 * Patches are lightweight JSON — no audio data, so we use the same DB.
 */
import type { SynthPatch } from './types';
import { DEFAULT_PATCH } from './types';
import { PATCH_PRESETS, getPresetById } from './patch-presets';

// Separate DB from the main `tape-looper` projects DB. Sharing one DB across
// two modules with independent version histories causes the second opener to
// race the first and find its object stores missing.
const DB_NAME = 'tape-looper-patches';
const STORE_NAME = 'patches';
const SEED_FLAG_KEY = '__seeded_v1__';
let seedPromise: Promise<void> | null = null;

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

/** Seed built-in presets the first time we open the DB. Idempotent. */
async function seedPresetsIfNeeded(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const db = await openDB();
    try {
      // Use the flag key as a sentinel row to avoid re-seeding on every call.
      const flag = await promisify(tx(db).objectStore(STORE_NAME).get(SEED_FLAG_KEY));
      if (flag) return;
      const writeTx = tx(db, 'readwrite');
      const store = writeTx.objectStore(STORE_NAME);
      for (const preset of PATCH_PRESETS) {
        store.put(preset);
      }
      store.put({ id: SEED_FLAG_KEY, seededAt: Date.now() } as unknown as SynthPatch);
      await new Promise<void>((resolve, reject) => {
        writeTx.oncomplete = () => resolve();
        writeTx.onerror = () => reject(writeTx.error);
        writeTx.onabort = () => reject(writeTx.error);
      });
    } finally {
      db.close();
    }
  })();
  return seedPromise;
}

export async function listPatches(): Promise<SynthPatch[]> {
  await seedPresetsIfNeeded();
  const db = await openDB();
  const all = await promisify(tx(db).objectStore(STORE_NAME).getAll());
  db.close();
  return (all as SynthPatch[])
    .filter((p) => p.id !== SEED_FLAG_KEY)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPatch(id: string): Promise<SynthPatch | null> {
  if (id === '__default__') return DEFAULT_PATCH;
  // Fast path for built-in presets — avoids waiting on the seed write.
  const preset = getPresetById(id);
  if (preset) return preset;
  await seedPresetsIfNeeded();
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

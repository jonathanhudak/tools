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

/**
 * Seed built-in presets, idempotent per preset. Only inserts presets whose IDs
 * are not already in the store, so:
 *   - first-time users get all presets
 *   - existing users get newly-added presets on next open
 *   - user edits to existing presets (same IDs) are preserved
 * Runs at most once per session via the cached promise.
 */
async function seedPresetsIfNeeded(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const db = await openDB();
    try {
      const existing = (await promisify(
        tx(db).objectStore(STORE_NAME).getAll(),
      )) as SynthPatch[];
      const existingIds = new Set(existing.map((p) => p.id));
      const missing = PATCH_PRESETS.filter((p) => !existingIds.has(p.id));
      if (missing.length === 0) return;

      const writeTx = tx(db, 'readwrite');
      const store = writeTx.objectStore(STORE_NAME);
      for (const preset of missing) {
        store.put(preset);
      }
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
  return (all as SynthPatch[]).sort((a, b) => a.name.localeCompare(b.name));
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

// Project persistence for Blockworld. Uses localStorage with a versioned schema.
// PWA-safe: localStorage is available offline and syncs per-origin.

import { TextureId } from "./textures";

const STORAGE_KEY = "blockworld-projects-v1";
const CURRENT_KEY = "blockworld-current-v1";

export interface BlockworldProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** Serialized blocks: array of [x, y, z, textureId] for compactness. */
  blocks: Array<[number, number, number, TextureId]>;
}

interface ProjectStore {
  version: 1;
  projects: BlockworldProject[];
}

function readStore(): ProjectStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, projects: [] };
    const parsed = JSON.parse(raw);
    if (parsed?.version === 1 && Array.isArray(parsed.projects)) return parsed;
  } catch (e) {
    console.warn("[blockworld] project store read failed:", e);
  }
  return { version: 1, projects: [] };
}

function writeStore(store: ProjectStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn("[blockworld] project store write failed:", e);
  }
}

export function listProjects(): BlockworldProject[] {
  return [...readStore().projects].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getProject(id: string): BlockworldProject | undefined {
  return readStore().projects.find((p) => p.id === id);
}

export function saveProject(project: BlockworldProject): void {
  const store = readStore();
  const idx = store.projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) store.projects[idx] = project;
  else store.projects.push(project);
  writeStore(store);
}

export function deleteProject(id: string): void {
  const store = readStore();
  store.projects = store.projects.filter((p) => p.id !== id);
  writeStore(store);
  if (getCurrentProjectId() === id) setCurrentProjectId(null);
}

export function renameProject(id: string, name: string): void {
  const store = readStore();
  const p = store.projects.find((p) => p.id === id);
  if (!p) return;
  p.name = name;
  p.updatedAt = Date.now();
  writeStore(store);
}

export function getCurrentProjectId(): string | null {
  try {
    return localStorage.getItem(CURRENT_KEY);
  } catch {
    return null;
  }
}

export function setCurrentProjectId(id: string | null): void {
  try {
    if (id) localStorage.setItem(CURRENT_KEY, id);
    else localStorage.removeItem(CURRENT_KEY);
  } catch {}
}

export function newProjectId(): string {
  return `bw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function blocksMapToArray(
  map: Map<string, TextureId>,
): BlockworldProject["blocks"] {
  const out: BlockworldProject["blocks"] = [];
  for (const [key, tex] of map) {
    const [x, y, z] = key.split(",").map(Number);
    out.push([x, y, z, tex]);
  }
  return out;
}

export function blocksArrayToMap(
  arr: BlockworldProject["blocks"],
): Map<string, TextureId> {
  const map = new Map<string, TextureId>();
  for (const [x, y, z, tex] of arr) {
    map.set(`${x},${y},${z}`, tex);
  }
  return map;
}

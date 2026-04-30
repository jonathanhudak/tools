// Cube geometry — 6 faces, corners defined in world coords (unit cube at origin).

import type { Vec3 } from "./camera";

export type FaceId = "top" | "bottom" | "px" | "nx" | "pz" | "nz";

export interface FaceDef {
  id: FaceId;
  /** Outward normal in world coords. */
  normal: Vec3;
  /** 4 corners (CCW when viewed from outside) of the face on a unit cube with origin at (0,0,0). */
  corners: [Vec3, Vec3, Vec3, Vec3];
}

// Unit cube occupies [0,1]^3. Corners indexed as (x,y,z).
const C = {
  v000: [0, 0, 0] as Vec3,
  v100: [1, 0, 0] as Vec3,
  v010: [0, 1, 0] as Vec3,
  v110: [1, 1, 0] as Vec3,
  v001: [0, 0, 1] as Vec3,
  v101: [1, 0, 1] as Vec3,
  v011: [0, 1, 1] as Vec3,
  v111: [1, 1, 1] as Vec3,
};

export const FACES: FaceDef[] = [
  { id: "top", normal: [0, 1, 0], corners: [C.v010, C.v110, C.v111, C.v011] },
  { id: "bottom", normal: [0, -1, 0], corners: [C.v000, C.v001, C.v101, C.v100] },
  { id: "px", normal: [1, 0, 0], corners: [C.v100, C.v101, C.v111, C.v110] },
  { id: "nx", normal: [-1, 0, 0], corners: [C.v000, C.v010, C.v011, C.v001] },
  { id: "pz", normal: [0, 0, 1], corners: [C.v001, C.v011, C.v111, C.v101] },
  { id: "nz", normal: [0, 0, -1], corners: [C.v000, C.v100, C.v110, C.v010] },
];

/** Face normal -> (dx, dy, dz) for adjacency-on-click. */
export function faceAdjacencyOffset(face: FaceId): Vec3 {
  const f = FACES.find((f) => f.id === face)!;
  return f.normal;
}

export function blockKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

export function parseKey(key: string): [number, number, number] {
  const [x, y, z] = key.split(",").map(Number);
  return [x, y, z];
}

/**
 * Classify face lighting shade ("top" = brightest, "side" = mid, "dark" = darkest)
 * based on the world-space normal — not view-dependent so patterns stay stable on orbit.
 */
export function faceShade(normal: Vec3): "top" | "side" | "dark" {
  const [, ny] = normal;
  if (ny > 0.5) return "top"; // top face
  if (ny < -0.5) return "dark"; // bottom (rarely visible)
  // side faces: differentiate +x from -x etc. by axis so they're distinguishable on orbit
  const [nx, , nz] = normal;
  // Use a deterministic split: +x and +z = "side", -x and -z = "dark"
  if (nx > 0.5 || nz > 0.5) return "side";
  return "dark";
}

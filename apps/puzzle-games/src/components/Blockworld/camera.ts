// Minimal 3D math for Blockworld — orbit camera + orthographic projection.
// World: right-handed, +y up. Camera orbits origin with yaw (around +y) + pitch.

export type Vec3 = [number, number, number];

export interface Camera {
  /** Yaw around Y axis, radians. 0 = looking toward -z. */
  yaw: number;
  /** Pitch, radians. Positive tilts camera down (looking at ground). */
  pitch: number;
  /** Orthographic zoom — screen px per world unit. */
  scale: number;
}

export const ISO_YAW = Math.PI / 4; // 45°
// Game-iso: 30° pitch → clean 2:1 tile ratio on screen (classic retro look).
// True mathematical iso would be atan(1/√2) ≈ 35.26°, but 30° reads as more
// natural and matches what most voxel/block games use.
export const ISO_PITCH = Math.PI / 6; // 30°

export const DEFAULT_CAMERA: Camera = {
  yaw: ISO_YAW,
  pitch: ISO_PITCH,
  scale: 56,
};

/** Rotate a point around origin by camera. */
export function rotate(cam: Camera, [x, y, z]: Vec3): Vec3 {
  // Yaw (around y)
  const cy = Math.cos(cam.yaw);
  const sy = Math.sin(cam.yaw);
  const x1 = cy * x + sy * z;
  const z1 = -sy * x + cy * z;
  // Pitch (around x)
  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  const y2 = cp * y - sp * z1;
  const z2 = sp * y + cp * z1;
  return [x1, y2, z2];
}

/** Orthographic projection: rotate then drop z. Returns screen [sx, sy, depth]. */
export function project(cam: Camera, p: Vec3): [number, number, number] {
  const [x, y, z] = rotate(cam, p);
  // Screen: +x right, -y up (SVG y-down, so we flip y)
  return [x * cam.scale, -y * cam.scale, z];
}

/** View direction in world coords — the direction the camera looks toward. */
export function viewDir(cam: Camera): Vec3 {
  // Camera looks toward +z in camera space. Unrotate (0,0,1).
  const cy = Math.cos(cam.yaw);
  const sy = Math.sin(cam.yaw);
  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  // Inverse rotation of (0,0,1):
  // first undo pitch: (0, sp, cp)
  // then undo yaw: (sy*cp, sp, cy*cp)  (check sign)
  // Forward in world coords (what pixels AT center of screen are looking at)
  const vx = sy * cp;
  const vy = -sp; // pitch rotates camera down, so world y component of view is negative
  const vz = -cy * cp;
  return [vx, vy, vz];
}

export function clampPitch(p: number): number {
  const max = Math.PI / 2 - 0.05;
  const min = 0.05;
  return Math.max(min, Math.min(max, p));
}

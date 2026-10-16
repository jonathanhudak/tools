import type { FigmaComponentInput, FigmaNode } from '@hex/domain';

/** Structural guard for untrusted JSON. Semantic validation lives in the domain. */
const isNode = (v: unknown): v is FigmaNode => {
  if (typeof v !== 'object' || v === null) return false;
  const n = v as Record<string, unknown>;
  return typeof n['id'] === 'string' && typeof n['name'] === 'string' && typeof n['type'] === 'string';
};

export const parseFigmaInput = (raw: string | null | undefined): FigmaComponentInput | null => {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const { fileKey, node } = parsed as Record<string, unknown>;
  return typeof fileKey === 'string' && isNode(node) ? { fileKey, node } : null;
};

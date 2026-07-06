/**
 * Reference pitch (A4 calibration) preference.
 * Persisted to localStorage; consumed anywhere a frequency is displayed,
 * detected, or played. See @hudak/tuning-data for the underlying math.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STANDARD_A4, clampReferencePitch } from '@hudak/tuning-data';

const STORAGE_KEY = 'instrument-tuner:reference-pitch';

interface ReferencePitchContextValue {
  /** Active A4 reference in Hz (default 440). */
  referencePitch: number;
  setReferencePitch: (hz: number) => void;
}

const ReferencePitchContext = createContext<ReferencePitchContextValue | null>(null);

function readStoredPitch(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return STANDARD_A4;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? clampReferencePitch(parsed) : STANDARD_A4;
  } catch {
    return STANDARD_A4;
  }
}

export function ReferencePitchProvider({ children }: { children: ReactNode }) {
  const [referencePitch, setPitchState] = useState<number>(readStoredPitch);

  useEffect(() => {
    try {
      if (referencePitch === STANDARD_A4) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, String(referencePitch));
      }
    } catch {
      // Storage unavailable (private mode) — preference lives for the session.
    }
  }, [referencePitch]);

  const setReferencePitch = useCallback((hz: number) => {
    setPitchState(clampReferencePitch(hz));
  }, []);

  const value = useMemo(
    () => ({ referencePitch, setReferencePitch }),
    [referencePitch, setReferencePitch]
  );

  return <ReferencePitchContext.Provider value={value}>{children}</ReferencePitchContext.Provider>;
}

export function useReferencePitch(): ReferencePitchContextValue {
  const ctx = useContext(ReferencePitchContext);
  if (!ctx) {
    throw new Error('useReferencePitch must be used within ReferencePitchProvider');
  }
  return ctx;
}

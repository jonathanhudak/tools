/**
 * useUrlState — mirror a group of UI selections to the URL search params.
 *
 * - Reads initial values from the current search params (deep-link friendly).
 * - Writes the whole group back to the URL on change in a single `navigate`
 *   call (avoids races between multiple params).
 * - Route-agnostic: works in any component rendered under the router. The host
 *   route only needs a pass-through `validateSearch` so unknown params survive.
 *
 * Pass `enabled: false` to behave like plain `useState` — used when the same
 * component is embedded somewhere that should NOT touch the URL (e.g. the
 * progression player embedded inside the Practice screen).
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

type Serializable = string | number | boolean;

// Loosely-typed navigate: we only ever merge into the current route's search.
type LooseNavigate = (opts: {
  search: (prev: Record<string, unknown>) => Record<string, unknown>;
  replace?: boolean;
}) => void;

function coerce<T extends Serializable>(raw: unknown, fallback: T): T {
  if (raw == null || raw === '') return fallback;
  if (typeof fallback === 'number') {
    const n = Number(raw);
    return (Number.isFinite(n) ? n : fallback) as T;
  }
  if (typeof fallback === 'boolean') {
    return ((raw === 'true' || raw === true) as boolean) as T;
  }
  return String(raw) as T;
}

export function useUrlState<T extends Record<string, Serializable>>(
  defaults: T,
  enabled = true,
): [T, (patch: Partial<T>) => void] {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const navigate = useNavigate() as unknown as LooseNavigate;

  const [state, setState] = useState<T>(() => {
    if (!enabled) return defaults;
    const init = { ...defaults };
    for (const key in defaults) {
      init[key] = coerce(search[key], defaults[key]) as T[Extract<keyof T, string>];
    }
    return init;
  });

  const update = useCallback(
    (patch: Partial<T>) => setState(prev => ({ ...prev, ...patch })),
    [],
  );

  useEffect(() => {
    if (!enabled) return;
    navigate({
      search: prev => {
        const next = { ...prev };
        for (const key in state) next[key] = String(state[key]);
        return next;
      },
      replace: true,
    });
    // navigate identity is stable; re-run only when the synced values change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, JSON.stringify(state)]);

  return [state, update];
}

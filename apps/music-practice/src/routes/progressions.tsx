/**
 * Progressions Route — chord progression library with playback,
 * key cycling, and guide-tone display.
 *
 * Selection lives in the URL so a view can be refreshed, bookmarked and shared.
 * The route owns the search params and navigation; the library is controlled.
 */

import { createFileRoute } from '@tanstack/react-router';
import {
  PROGRESSION_REGISTRY,
  type ProgressionFamily,
} from '../data/progressions/progression-registry';
import { ProgressionLibrary, FAMILIES } from '../components/Progressions/ProgressionLibrary';
import { KEYS } from '../components/shared/ProgressionPlayer';
import { oneOf, intInRange, INSTRUMENTS, type Instrument } from '../lib/search-params';

export interface ProgressionsSearch {
  family: ProgressionFamily;
  progression: string;
  key: string;
  bpm: number;
  instrument: Instrument;
}

const DEFAULT_PROGRESSION = 'ii-V-I-major';
const PROGRESSION_IDS: readonly string[] = PROGRESSION_REGISTRY.map((p) => p.id);

export function validateProgressionsSearch(search: Record<string, unknown>): ProgressionsSearch {
  // `oneOf` rejects inherited names such as `toString` and `__proto__`; the
  // empty fallback marks "no usable progression id" so the family param wins.
  const requestedId = oneOf(PROGRESSION_IDS, search.progression, '');
  const requested = requestedId
    ? PROGRESSION_REGISTRY.find((p) => p.id === requestedId)
    : undefined;

  const family = requested?.family ?? oneOf(FAMILIES, search.family, 'jazz');
  const progression =
    requested?.id ??
    PROGRESSION_REGISTRY.find((p) => p.family === family)?.id ??
    DEFAULT_PROGRESSION;

  return {
    family,
    progression,
    key: oneOf(KEYS, search.key, 'C'),
    bpm: intInRange(search.bpm, 50, 200, 90),
    instrument: oneOf(INSTRUMENTS, search.instrument, 'guitar'),
  };
}

export const Route = createFileRoute('/progressions')({
  component: ProgressionsRoute,
  validateSearch: validateProgressionsSearch,
});

function ProgressionsRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const update = (next: Partial<ProgressionsSearch>) =>
    navigate({ search: { ...search, ...next }, replace: true });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold text-[var(--ink-primary)] mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Chord Progressions
          </h1>
          <p className="text-[var(--ink-secondary)] text-sm">
            {PROGRESSION_REGISTRY.length} progressions across jazz, blues, pop, classical, and modal — play them in any key,
            loop them, or cycle through all 12 keys.
          </p>
        </div>
        <ProgressionLibrary
          family={search.family}
          progression={search.progression}
          musicKey={search.key}
          bpm={search.bpm}
          instrument={search.instrument}
          onChange={update}
        />
      </div>
    </div>
  );
}

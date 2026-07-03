/**
 * Progressions Route — chord progression library with playback,
 * key cycling, and guide-tone display.
 */

import { createFileRoute } from '@tanstack/react-router';
import { PROGRESSION_REGISTRY } from '../data/progressions/progression-registry';
import { ProgressionLibrary } from '../components/Progressions/ProgressionLibrary';

export const Route = createFileRoute('/progressions')({
  component: ProgressionsRoute,
});

function ProgressionsRoute() {
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
        <ProgressionLibrary />
      </div>
    </div>
  );
}

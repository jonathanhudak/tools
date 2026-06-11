/**
 * Scale Explorer Route — all 62 scales across 9 families.
 */

import { createFileRoute } from '@tanstack/react-router';
import { ScaleExplorer } from '../components/ScaleExplorer/ScaleExplorer';

export const Route = createFileRoute('/scale-explorer')({
  component: ScaleExplorerRoute,
});

function ScaleExplorerRoute() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold text-[var(--ink-primary)] mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Scale Explorer
          </h1>
          <p className="text-[var(--ink-secondary)] text-sm">
            62 scales across 9 families — pentatonic, blues, bebop, symmetric, world, and every
            mode of the four parent scales. Hear them, see them, drone over them.
          </p>
        </div>
        <ScaleExplorer />
      </div>
    </div>
  );
}

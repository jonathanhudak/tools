/**
 * Ear Training Route — chord-quality and scale-flavor recognition.
 */

import { createFileRoute } from '@tanstack/react-router';
import { EarTraining } from '../components/EarTraining/EarTraining';

export const Route = createFileRoute('/ear-training')({
  component: EarTrainingRoute,
});

function EarTrainingRoute() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold text-[var(--ink-primary)] mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Ear Training
          </h1>
          <p className="text-[var(--ink-secondary)] text-sm">
            Hear it, name it — chord qualities and scale flavors. Interval ear training lives on
            the Intervals page.
          </p>
        </div>
        <EarTraining />
      </div>
    </div>
  );
}

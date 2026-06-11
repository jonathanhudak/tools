/**
 * Intervals Route — interval reference with playback and quizzes.
 */

import { createFileRoute } from '@tanstack/react-router';
import { IntervalReference } from '../components/Intervals/IntervalReference';

export const Route = createFileRoute('/intervals')({
  component: IntervalsRoute,
});

function IntervalsRoute() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold text-[var(--ink-primary)] mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Intervals
          </h1>
          <p className="text-[var(--ink-secondary)] text-sm">
            Every simple and compound interval — hear them melodically or harmonically, learn the
            inversions, then quiz yourself by sight or by ear.
          </p>
        </div>
        <IntervalReference />
      </div>
    </div>
  );
}

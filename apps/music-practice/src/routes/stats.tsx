/**
 * Stats Route — cross-session practice journal.
 */

import { createFileRoute } from '@tanstack/react-router';
import { PracticeStats } from '../components/Stats/PracticeStats';

export const Route = createFileRoute('/stats')({
  component: StatsRoute,
});

function StatsRoute() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold text-[var(--ink-primary)] mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Practice Journal
          </h1>
          <p className="text-[var(--ink-secondary)] text-sm">
            Your streak, accuracy, and history — everything stays on this device.
          </p>
        </div>
        <PracticeStats />
      </div>
    </div>
  );
}

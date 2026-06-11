/**
 * Review Route — spaced-repetition flashcards.
 */

import { createFileRoute } from '@tanstack/react-router';
import { ReviewQueue } from '../components/Review/ReviewQueue';

export const Route = createFileRoute('/review')({
  component: ReviewRoute,
});

function ReviewRoute() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold text-[var(--ink-primary)] mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Review
          </h1>
          <p className="text-[var(--ink-secondary)] text-sm">
            Spaced repetition for chord spellings, key signatures, and intervals — cards come back
            right before you'd forget them.
          </p>
        </div>
        <ReviewQueue />
      </div>
    </div>
  );
}

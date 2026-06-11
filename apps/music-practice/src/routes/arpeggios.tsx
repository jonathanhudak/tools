/**
 * Arpeggios Route — arpeggio practice with patterns and playback.
 */

import { createFileRoute } from '@tanstack/react-router';
import { ArpeggioPractice } from '../components/Arpeggios/ArpeggioPractice';

export const Route = createFileRoute('/arpeggios')({
  component: ArpeggiosRoute,
});

function ArpeggiosRoute() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold text-[var(--ink-primary)] mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Arpeggios
          </h1>
          <p className="text-[var(--ink-secondary)] text-sm">
            33 arpeggios through 10 practice patterns — hear the pattern, see the tones, take it
            through all 12 keys.
          </p>
        </div>
        <ArpeggioPractice />
      </div>
    </div>
  );
}

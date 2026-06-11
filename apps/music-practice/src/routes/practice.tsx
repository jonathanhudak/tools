/**
 * Practice Route — improv prompt generator and session builder.
 */

import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@hudak/ui/components/button';
import { Shuffle, Timer } from 'lucide-react';
import { ImprovPrompt } from '../components/Practice/ImprovPrompt';
import { SessionBuilder } from '../components/Practice/SessionBuilder';

export const Route = createFileRoute('/practice')({
  component: PracticeRoute,
});

type Tab = 'improv' | 'session';

function PracticeRoute() {
  const [tab, setTab] = useState<Tab>('improv');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold text-[var(--ink-primary)] mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Practice
          </h1>
          <p className="text-[var(--ink-secondary)] text-sm">
            Deal improvisation prompts with lockable constraints, or build a timed session that
            targets your weakest areas.
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          <Button variant={tab === 'improv' ? 'default' : 'outline'} size="lg" className="gap-2" onClick={() => setTab('improv')}>
            <Shuffle className="w-4 h-4" /> Improv prompts
          </Button>
          <Button variant={tab === 'session' ? 'default' : 'outline'} size="lg" className="gap-2" onClick={() => setTab('session')}>
            <Timer className="w-4 h-4" /> Session builder
          </Button>
        </div>

        {tab === 'improv' && <ImprovPrompt />}
        {tab === 'session' && <SessionBuilder />}
      </div>
    </div>
  );
}

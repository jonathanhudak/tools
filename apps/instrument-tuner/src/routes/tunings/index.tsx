import { createRoute, Link } from '@tanstack/react-router';
import { Music } from 'lucide-react';
import { Card, CardContent } from '@hudak/ui';
import { Route as rootRoute } from '../__root';
import { INSTRUMENT_CATEGORIES } from '../../data/tunings';
import { TuningBreadcrumbs } from '../../components/TuningBreadcrumbs';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tunings',
  component: TuningsIndexPage,
});

function TuningsIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-5xl space-y-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <Music className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold">Choose an instrument</h1>
        </div>

        <TuningBreadcrumbs items={[{ label: 'Tunings' }]} />

        <div className="grid gap-3 sm:grid-cols-2">
          {INSTRUMENT_CATEGORIES.map((instrument) => (
            <Link key={instrument.id} to="/tunings/$instrumentId" params={{ instrumentId: instrument.id }}>
              <Card className="h-full border-2 transition hover:border-primary/40">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-base font-semibold">{instrument.name}</p>
                    <p className="text-sm text-muted-foreground">{instrument.tunings.length} tunings</p>
                  </div>
                  <span className="text-2xl">{instrument.icon}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

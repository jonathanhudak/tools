import { createRoute, Link } from '@tanstack/react-router';
import { Card, CardContent } from '@hudak/ui';
import { Route as rootRoute } from '../__root';
import { getInstrumentById, getSectionsForInstrument } from '../../utils/tuning-navigation';
import { TuningBreadcrumbs } from '../../components/TuningBreadcrumbs';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tunings/$instrumentId',
  component: InstrumentSectionsPage,
});

function InstrumentSectionsPage() {
  const { instrumentId } = Route.useParams();
  const instrument = getInstrumentById(instrumentId);

  if (!instrument) {
    return <div className="p-4">Instrument not found.</div>;
  }

  const sections = getSectionsForInstrument(instrument.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-5xl space-y-4 px-4 py-3">
        <h1 className="text-lg font-bold">{instrument.icon} {instrument.name}</h1>

        <TuningBreadcrumbs
          items={[
            { label: 'Tunings', to: '/tunings' },
            { label: instrument.name },
          ]}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.id}
              to="/tunings/$instrumentId/$sectionId"
              params={{ instrumentId: instrument.id, sectionId: section.id }}
            >
              <Card className="h-full border-2 transition hover:border-primary/40">
                <CardContent className="p-4">
                  <p className="text-base font-semibold">{section.name}</p>
                  <p className="text-sm text-muted-foreground">{section.tunings.length} tunings</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

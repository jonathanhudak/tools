import { createRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@hudak/ui';
import { Button } from '@hudak/ui';
import { Route as rootRoute } from '../__root';
import { RouteThemeSettings } from '../../components/RouteThemeSettings';
import { TunerPageHeader } from '../../components/TunerPageHeader';
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
    return (
      <div className="bg-tuner-shell min-h-screen">
        <div className="container mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <Card className="tuner-card-surface w-full gap-0 border py-0 motion-safe:animate-[tuner-fade-up_220ms_ease-out]">
            <CardContent className="space-y-3 p-6 text-center sm:p-8">
              <h1 className="text-2xl font-semibold tracking-tight">Instrument not found</h1>
              <p className="text-sm text-muted-foreground">
                The selected instrument could not be loaded from the tunings catalog.
              </p>
              <div className="pt-2">
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/tunings">
                    <ArrowLeft className="h-4 w-4" />
                    Back to tunings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const sections = getSectionsForInstrument(instrument.id);

  return (
    <div className="bg-tuner-shell min-h-screen">
      <div className="container mx-auto max-w-6xl space-y-6 px-4 py-5 motion-safe:animate-[tuner-fade-up_220ms_ease-out] sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <TunerPageHeader
          subtitle={`${instrument.name} · choose a tuning family`}
          actions={<RouteThemeSettings />}
        />

        <TuningBreadcrumbs
          items={[
            { label: 'Tunings', to: '/tunings' },
            { label: instrument.name },
          ]}
        />

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.id}
              to="/tunings/$instrumentId/$sectionId"
              params={{ instrumentId: instrument.id, sectionId: section.id }}
              className="group block h-full focus-visible:outline-none"
            >
              <Card className="tuner-card-surface tuner-card-interactive h-full gap-0 border py-0 group-focus-visible:border-primary/30 group-focus-visible:ring-2 group-focus-visible:ring-primary/15">
                <CardContent className="flex min-h-[120px] flex-col justify-end p-5">
                  <p className="text-base font-semibold leading-tight">{section.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{section.tunings.length} tunings</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

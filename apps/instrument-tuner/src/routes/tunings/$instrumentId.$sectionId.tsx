import { createRoute, Link, useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@hudak/ui';
import { Button } from '@hudak/ui';
import { Route as rootRoute } from '../__root';
import { getInstrumentById, getSectionById } from '../../utils/tuning-navigation';
import { TuningBreadcrumbs } from '../../components/TuningBreadcrumbs';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tunings/$instrumentId/$sectionId',
  component: SectionTuningsPage,
});

function SectionTuningsPage() {
  const { instrumentId, sectionId } = Route.useParams();
  const instrument = getInstrumentById(instrumentId);
  const section = getSectionById(instrumentId, sectionId);
  const navigate = useNavigate();

  if (!instrument || !section) {
    return <div className="p-4">Section not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-5xl space-y-4 px-4 py-3">
        <h1 className="text-lg font-bold">{section.name} tunings</h1>

        <TuningBreadcrumbs
          items={[
            { label: 'Tunings', to: '/tunings' },
            { label: instrument.name, to: '/tunings/$instrumentId', params: { instrumentId: instrument.id } },
            { label: section.name },
          ]}
        />

        <div className="space-y-3">
          {section.tunings.map((tuning) => (
            <Card key={tuning.id} className="border-2">
              <CardContent className="space-y-3 p-4">
                <div>
                  <p className="text-base font-semibold">{tuning.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[...tuning.notes].sort((a, b) => b.string - a.string).map((note) => note.name).join(' ')}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {[...tuning.notes].sort((a, b) => a.string - b.string).map((note) => (
                    <div key={`${tuning.id}-${note.string}`} className="rounded-md bg-muted p-2 text-center text-sm">
                      <div className="text-muted-foreground">S{note.string}</div>
                      <div className="font-semibold">{note.name}</div>
                    </div>
                  ))}
                </div>
                <Button
                  className="h-11 w-full"
                  onClick={() => navigate({ to: '/', search: { tuning: tuning.id } as never })}
                >
                  Use this tuning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Link to="/tunings/$instrumentId" params={{ instrumentId }} className="inline-block px-1 py-2 text-sm font-medium text-primary">
          Back to sections
        </Link>
      </div>
    </div>
  );
}

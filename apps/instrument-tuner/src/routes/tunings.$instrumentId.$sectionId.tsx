import { createRoute, Link, notFound } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@hudak/ui';
import {
  INSTRUMENT_CATEGORIES,
  getSectionNameById,
  getSectionId,
  inferTuningSection,
} from '../data/tunings';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tunings/$instrumentId/$sectionId',
  component: SectionTunings,
});

function SectionTunings() {
  const { instrumentId, sectionId } = Route.useParams();
  const category = INSTRUMENT_CATEGORIES.find((c) => c.id === instrumentId);
  if (!category) throw notFound();

  const sectionName = getSectionNameById(category, sectionId);
  if (!sectionName) throw notFound();

  const tunings = category.tunings.filter((t) => getSectionId(inferTuningSection(t)) === sectionId);

  const useTuning = (tuningId: string) => {
    window.location.assign(`/tools/instrument-tuner/?tuning=${encodeURIComponent(tuningId)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-4 space-y-4 max-w-5xl">
        <div className="text-sm text-muted-foreground">
          <Link to="/tunings">Tunings</Link> ›{' '}
          <Link to="/tunings/$instrumentId" params={{ instrumentId: category.id }}>{category.name}</Link> ›{' '}
          <span>{sectionName}</span>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{category.icon} {sectionName}</h1>
          <Link to="/">
            <Button variant="outline">Back to tuner</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tunings.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm font-mono">{[...t.notes].sort((a, b) => b.string - a.string).map((n) => n.name).join(' ')}</div>
                {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
                <Button onClick={() => useTuning(t.id)} className="w-full">Use this tuning</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

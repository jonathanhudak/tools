import { createRoute, Link, notFound } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@hudak/ui';
import { INSTRUMENT_CATEGORIES, getSectionsForCategory } from '../data/tunings';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tunings/$instrumentId',
  component: InstrumentSections,
});

function InstrumentSections() {
  const { instrumentId } = Route.useParams();
  const category = INSTRUMENT_CATEGORIES.find((c) => c.id === instrumentId);
  if (!category) throw notFound();
  const sections = getSectionsForCategory(category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-4 space-y-4 max-w-5xl">
        <div className="text-sm text-muted-foreground">
          <Link to="/tunings">Tunings</Link> › <span>{category.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{category.icon} {category.name}</h1>
          <Link to="/">
            <Button variant="outline">Back to tuner</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sections.map((s) => (
            <Link
              key={s.id}
              to="/tunings/$instrumentId/$sectionId"
              params={{ instrumentId: category.id, sectionId: s.id }}
            >
              <Card className="hover:border-primary transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{s.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{s.count} tunings</CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

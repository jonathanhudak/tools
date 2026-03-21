import { createRoute, Link } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@hudak/ui';
import { INSTRUMENT_CATEGORIES, getSectionsForCategory } from '../data/tunings';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tunings',
  component: TuningsHome,
});

function TuningsHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-4 space-y-4 max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Browse Tunings</h1>
          <Link to="/">
            <Button variant="outline">Back to tuner</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INSTRUMENT_CATEGORIES.map((c) => {
            const sections = getSectionsForCategory(c);
            return (
              <Link key={c.id} to="/tunings/$instrumentId" params={{ instrumentId: c.id }}>
                <Card className="hover:border-primary transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{c.icon} {c.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <div>{c.tunings.length} tunings</div>
                    <div>{sections.length} sections</div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

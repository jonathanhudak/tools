/**
 * Chord-Scale Matrix Game Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@hudak/ui/components/button';
import { ArrowLeft } from 'lucide-react';
import { ChordScaleGame } from '../components/ChordScaleGame';

export const Route = createFileRoute('/chord-scale')({
  component: ChordScaleGameRoute,
});

function ChordScaleGameRoute() {
  const navigate = Route.useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/' })}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <ChordScaleGame />
      </div>
    </div>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { CircleOfFifths } from '../components/CircleOfFifths/CircleOfFifths';

export const Route = createFileRoute('/circle-of-fifths')({
  component: CircleOfFifthsPage,
});

function CircleOfFifthsPage() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <CircleOfFifths />
    </div>
  );
}

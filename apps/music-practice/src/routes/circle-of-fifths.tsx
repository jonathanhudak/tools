import { createFileRoute } from '@tanstack/react-router';
import { CircleOfFifths } from '../components/CircleOfFifths/CircleOfFifths';

export const Route = createFileRoute('/circle-of-fifths')({
  component: CircleOfFifthsPage,
  validateSearch: (search: Record<string, unknown>) => search,
});

function CircleOfFifthsPage() {
  return (
    <CircleOfFifths />
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { CircleOfFifths } from '../components/CircleOfFifths/CircleOfFifths';

export const Route = createFileRoute('/circle-of-fifths')({
  component: CircleOfFifthsPage,
});

function CircleOfFifthsPage() {
  return (
    <CircleOfFifths />
  );
}

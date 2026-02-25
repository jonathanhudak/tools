import { createFileRoute } from '@tanstack/react-router';
import { CircleOfFifthsPage } from '@/components/CircleOfFifths/CircleOfFifthsPage';

export const Route = createFileRoute('/circle-of-fifths')({
  component: CircleOfFifthsPage,
});

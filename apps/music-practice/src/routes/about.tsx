import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  return <Navigate to="/" />;
}

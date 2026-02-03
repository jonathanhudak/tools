/**
 * Chord-Scale Matrix Game Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { ChordScaleGame } from '../components/ChordScaleGame';

export const Route = createFileRoute('/chord-scale')({
  component: ChordScaleGameRoute,
});

function ChordScaleGameRoute() {
  return <ChordScaleGame />;
}

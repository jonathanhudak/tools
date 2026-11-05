/**
 * Circle of Fifths Route
 *
 * Selection lives in the URL so a view can be refreshed, bookmarked and shared.
 * The route owns the search params and navigation; the component is controlled.
 */

import { createFileRoute } from '@tanstack/react-router';
import { CircleOfFifths } from '../components/CircleOfFifths/CircleOfFifths';
import { CIRCLE_OF_FIFTHS } from '../data/circle-of-fifths';
import { BORROWED_VIEWS, type BorrowedView } from '../data/borrowed-chords';
import { oneOf, INSTRUMENTS, type Instrument } from '../lib/search-params';

export interface CircleOfFifthsSearch {
  key: string;
  instrument: Instrument;
  view: BorrowedView;
}

const KEYS: readonly string[] = CIRCLE_OF_FIFTHS.map((entry) => entry.majorKey);

export function validateCircleOfFifthsSearch(
  search: Record<string, unknown>,
): CircleOfFifthsSearch {
  return {
    key: oneOf(KEYS, search.key, 'C'),
    instrument: oneOf(INSTRUMENTS, search.instrument, 'guitar'),
    view: oneOf(BORROWED_VIEWS, search.view, 'diatonic'),
  };
}

export const Route = createFileRoute('/circle-of-fifths')({
  component: CircleOfFifthsPage,
  validateSearch: validateCircleOfFifthsSearch,
});

function CircleOfFifthsPage() {
  const { key, instrument, view } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <CircleOfFifths
      selectedKey={key}
      instrument={instrument}
      view={view}
      onChange={(next) => navigate({ search: { key, instrument, view, ...next }, replace: true })}
    />
  );
}

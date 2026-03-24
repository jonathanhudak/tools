import { createRoute, Link, useNavigate } from '@tanstack/react-router';
import { Search, X } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hudak/ui';
import { Route as rootRoute } from '../__root';
import { RouteThemeSettings } from '../../components/RouteThemeSettings';
import { TunerPageHeader } from '../../components/TunerPageHeader';
import { INSTRUMENT_CATEGORIES } from '../../data/tunings';

interface TuningsSearch {
  q?: string;
  instrument?: string;
  strings?: number;
}

const VALID_INSTRUMENT_IDS = new Set(INSTRUMENT_CATEGORIES.map((instrument) => instrument.id));
const STRING_COUNT_OPTIONS = Array.from(
  new Set(
    INSTRUMENT_CATEGORIES.flatMap((instrument) =>
      instrument.tunings.map((tuning) => tuning.notes.length)
    )
  )
).sort((a, b) => a - b);

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tunings',
  validateSearch: (search: Record<string, unknown>): TuningsSearch => {
    const q = typeof search.q === 'string' ? search.q.trim() : '';
    const instrument =
      typeof search.instrument === 'string' && VALID_INSTRUMENT_IDS.has(search.instrument)
        ? search.instrument
        : undefined;
    const parsedStrings =
      typeof search.strings === 'number'
        ? search.strings
        : typeof search.strings === 'string'
          ? Number(search.strings)
          : NaN;
    const strings = Number.isInteger(parsedStrings) && STRING_COUNT_OPTIONS.includes(parsedStrings)
      ? parsedStrings
      : undefined;

    return {
      q: q || undefined,
      instrument,
      strings,
    };
  },
  component: TuningsIndexPage,
});

function TuningsIndexPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();
  const query = search.q?.toLowerCase() ?? '';
  const filteredInstruments = INSTRUMENT_CATEGORIES.filter((instrument) => {
    if (search.instrument && instrument.id !== search.instrument) {
      return false;
    }

    const matchesStrings = search.strings
      ? instrument.tunings.some((tuning) => tuning.notes.length === search.strings)
      : true;
    if (!matchesStrings) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystacks = [
      instrument.name,
      ...instrument.tunings.map((tuning) => tuning.name),
      ...instrument.tunings.flatMap((tuning) => [tuning.description ?? '', tuning.notes.map((note) => note.name).join(' ')]),
    ];

    return haystacks.some((value) => value.toLowerCase().includes(query));
  });
  const hasFilters = Boolean(search.q || search.instrument || search.strings);

  const updateSearch = (next: TuningsSearch, replace = false) => {
    void navigate({
      to: '/tunings',
      search: (prev) => ({
        ...prev,
        ...next,
      }),
      replace,
    });
  };

  return (
    <div className="bg-tuner-shell min-h-screen">
      <div className="container mx-auto max-w-6xl space-y-6 px-4 py-5 motion-safe:animate-[tuner-fade-up_220ms_ease-out] sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <TunerPageHeader
          subtitle="Choose an instrument"
          actions={<RouteThemeSettings />}
        />

        <Card className="tuner-card-surface gap-0 border py-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
              <div className="min-w-0">
                <p className="text-lg font-semibold leading-none">Tunings</p>
                <p className="mt-1 text-xs text-muted-foreground md:hidden">
                  {filteredInstruments.length} instrument{filteredInstruments.length === 1 ? '' : 's'} match
                </p>
              </div>
              <div className="relative min-w-0 md:min-w-[18rem] md:flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search.q ?? ''}
                  onChange={(event) => updateSearch({ q: event.target.value || undefined }, true)}
                  placeholder="Search instruments or tunings"
                  className="pl-9"
                  aria-label="Search instruments or tunings"
                />
              </div>
              <Select
                value={search.instrument ?? 'all'}
                onValueChange={(value) =>
                  updateSearch({ instrument: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger className="w-full md:w-[12.5rem]">
                  <SelectValue placeholder="All instruments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All instruments</SelectItem>
                  {INSTRUMENT_CATEGORIES.map((instrument) => (
                    <SelectItem key={instrument.id} value={instrument.id}>
                      {instrument.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={search.strings ? String(search.strings) : 'all'}
                onValueChange={(value) =>
                  updateSearch({ strings: value === 'all' ? undefined : Number(value) })
                }
              >
                <SelectTrigger className="w-full md:w-[11rem]">
                  <SelectValue placeholder="Any string count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any string count</SelectItem>
                  {STRING_COUNT_OPTIONS.map((count) => (
                    <SelectItem key={count} value={String(count)}>
                      {count} strings
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 md:ml-auto"
                  onClick={() => void navigate({ to: '/tunings', search: {} })}
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              ) : (
                <p className="hidden text-sm text-muted-foreground md:ml-auto md:block">
                  {filteredInstruments.length} instrument{filteredInstruments.length === 1 ? '' : 's'}
                </p>
              )}
            </div>
            {hasFilters ? (
              <p className="mt-3 text-xs text-muted-foreground md:hidden">
                {filteredInstruments.length} instrument{filteredInstruments.length === 1 ? '' : 's'} match
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {filteredInstruments.map((instrument) => (
            <Link
              key={instrument.id}
              to="/tunings/$instrumentId"
              params={{ instrumentId: instrument.id }}
              className="group block h-full focus-visible:outline-none"
            >
              <Card className="tuner-card-surface tuner-card-interactive h-full gap-0 border py-0 group-focus-visible:border-primary/30 group-focus-visible:ring-2 group-focus-visible:ring-primary/15">
                <CardContent className="flex min-h-[112px] items-start justify-between gap-4 p-5">
                  <div>
                    <p className="text-base font-semibold leading-tight">{instrument.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{instrument.tunings.length} tunings</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {Array.from(new Set(instrument.tunings.map((tuning) => tuning.notes.length)))
                        .sort((a, b) => a - b)
                        .map((count) => `${count}-string`)
                        .join(' · ')}
                    </p>
                  </div>
                  <span className="text-xl leading-none opacity-90">{instrument.icon}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredInstruments.length === 0 ? (
          <Card className="tuner-card-surface gap-0 border py-0">
            <CardContent className="p-6 text-center sm:p-8">
              <p className="text-base font-medium">No instruments match those filters.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a broader search term or clear one of the filters.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

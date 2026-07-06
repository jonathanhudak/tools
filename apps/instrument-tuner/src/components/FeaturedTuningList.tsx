/**
 * Scrollable list of curated featured tunings for the landing page.
 * Selecting a row swaps the active tuning in place — the gauge stays live.
 */

import { Link } from '@tanstack/react-router';
import { ArrowRight, Check } from 'lucide-react';
import { Card, CardContent } from '@hudak/ui';
import {
  getAllTunings,
  getFeaturedTunings,
  type Tuning,
} from '@hudak/tuning-data';

interface FeaturedTuningListProps {
  activeTuningId: string;
  onSelect: (tuning: Tuning) => void;
}

const FEATURED = getFeaturedTunings();
const TOTAL_TUNINGS = getAllTunings().length;

export function FeaturedTuningList({ activeTuningId, onSelect }: FeaturedTuningListProps) {
  return (
    <section aria-label="Featured tunings" className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Featured tunings</h2>
        <span className="text-xs text-muted-foreground">Tap to tune — the gauge stays with you</span>
      </div>

      <div className="space-y-2">
        {FEATURED.map(({ tuning, instrument }) => {
          const isActive = tuning.id === activeTuningId;
          const noteLetters = [...tuning.notes]
            .sort((a, b) => b.string - a.string)
            .map((n) => n.name)
            .join(' ');

          return (
            <button
              key={tuning.id}
              type="button"
              onClick={() => onSelect(tuning)}
              aria-pressed={isActive}
              className={`tuner-note-surface group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-[border-color,box-shadow] duration-150 ${
                isActive ? 'tuner-note-active ring-1 ring-primary/25' : 'hover:border-primary/30'
              }`}
            >
              <span className="text-xl leading-none" aria-hidden>
                {instrument.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold leading-tight">{tuning.name}</span>
                  <span className="text-xs text-muted-foreground">{instrument.name}</span>
                </span>
                <span className="mt-0.5 block truncate text-sm tracking-[0.08em] text-muted-foreground">
                  {noteLetters}
                </span>
              </span>
              {isActive ? (
                <Check className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden />
              ) : (
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      <Card className="tuner-card-surface gap-0 border py-0">
        <CardContent className="p-0">
          <Link
            to="/tunings"
            className="flex items-center justify-between gap-3 p-4 text-sm font-medium text-primary/90 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <span>Browse the full library — {TOTAL_TUNINGS} tunings, every instrument</span>
            <ArrowRight className="h-4 w-4 flex-shrink-0" />
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}

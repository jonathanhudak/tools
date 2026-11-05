/**
 * BorrowedChordPanel — modal-interchange reference grouped by source mode.
 *
 * Shared by the chord-scale matrix and circle-of-fifths pages so the two
 * surfaces cannot drift. Presentational: the caller owns key, instrument and
 * view, and the borrowed chords resolve through the existing roman-numeral
 * resolver. `BorrowedViewToggle` is the matching Diatonic/Borrowed switch.
 */

import { Badge } from '@hudak/ui/components/badge';
import { ChordCard } from './ChordCard';
import { getScale } from '@/data/scales/scale-registry';
import {
  BORROWED_VIEWS,
  getBorrowedChords,
  SOURCE_MODE_NAMES,
  SOURCE_MODE_ORDER,
  type BorrowedView,
} from '@/data/borrowed-chords';
import type { Instrument } from '@/lib/search-params';

const VIEW_LABELS: Record<BorrowedView, string> = {
  diatonic: 'Diatonic',
  borrowed: 'Borrowed',
};

interface BorrowedViewToggleProps {
  view: BorrowedView;
  onChange: (view: BorrowedView) => void;
}

/** Controlled Diatonic/Borrowed switch; one pressed button per view. */
export function BorrowedViewToggle({ view, onChange }: BorrowedViewToggleProps): JSX.Element {
  return (
    <div
      role="group"
      aria-label="Chord view"
      className="flex rounded-full border-2 border-border overflow-hidden"
    >
      {BORROWED_VIEWS.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={view === v}
          className={[
            'text-xs min-h-11 px-3 py-1.5 font-medium transition-all',
            view === v
              ? 'bg-[var(--accent-color)] text-white'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {VIEW_LABELS[v]}
        </button>
      ))}
    </div>
  );
}

interface BorrowedChordPanelProps {
  homeKey: string;
  instrument: Instrument;
}

export function BorrowedChordPanel({ homeKey, instrument }: BorrowedChordPanelProps): JSX.Element {
  const chords = getBorrowedChords(homeKey);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground px-1">
        Borrowed into {homeKey} major from its parallel modes
      </p>
      {SOURCE_MODE_ORDER.map((mode) => {
        const group = chords.filter((chord) => chord.sourceMode === mode);
        if (group.length === 0) return null;

        return (
          <section key={mode} className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono-app px-1">
              Borrowed from {SOURCE_MODE_NAMES[mode]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {group.map((chord) => (
                <div key={chord.id} data-testid="borrowed-chord">
                  <ChordCard
                    chordName={chord.symbol}
                    label={chord.romanNumeral}
                    instrument={instrument}
                  />

                  <div className="p-3 space-y-1 border border-t-0 border-border bg-card">
                    <Badge className="text-[10px]">Borrowed</Badge>
                    <p className="text-[11px] text-muted-foreground">
                      Function: {chord.function}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Scale: {chord.root} {getScale(chord.scaleId)?.name ?? chord.scaleId}
                    </p>
                    <p className="text-[11px] text-foreground italic">{chord.behaviour}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

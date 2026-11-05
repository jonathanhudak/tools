/**
 * BorrowedChordPanel — modal-interchange reference grouped by source mode.
 *
 * Shared by the chord-scale matrix and circle-of-fifths pages so the two
 * surfaces cannot drift. Presentational: the caller owns key and instrument,
 * and the borrowed chords resolve through the existing roman-numeral resolver.
 */

import { Badge } from '@hudak/ui/components/badge';
import { ChordCard } from './ChordCard';
import { getScale } from '@/data/scales/scale-registry';
import {
  getBorrowedChords,
  SOURCE_MODE_NAMES,
  SOURCE_MODE_ORDER,
} from '@/data/borrowed-chords';
import type { Instrument } from '@/lib/search-params';

interface BorrowedChordPanelProps {
  homeKey: string;
  instrument: Instrument;
}

export function BorrowedChordPanel({ homeKey, instrument }: BorrowedChordPanelProps): JSX.Element {
  const chords = getBorrowedChords(homeKey);

  return (
    <div className="space-y-6">
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
                <div
                  key={chord.id}
                  className="border border-border bg-card overflow-hidden"
                  data-testid="borrowed-chord"
                >
                  <div className="p-3 border-b border-border flex items-start justify-between gap-2">
                    <p className="font-mono-app text-sm font-semibold uppercase tracking-widest text-foreground">
                      {chord.romanNumeral}
                    </p>
                    <Badge className="text-[10px] shrink-0">Borrowed</Badge>
                  </div>

                  <ChordCard
                    chordName={chord.symbol}
                    label={chord.romanNumeral}
                    instrument={instrument}
                  />

                  <div className="p-3 space-y-1 border-t border-border">
                    <p className="text-[11px] text-muted-foreground">
                      Function: {chord.function}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Scale: {getScale(chord.scaleId)?.name ?? chord.scaleId}
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

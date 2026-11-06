/**
 * Borrowed chords (modal interchange) shown inside a key's own chord row.
 *
 * Shared by the chord-scale matrix and circle-of-fifths pages so the two
 * surfaces cannot drift:
 * - `BorrowedChordCard` — one borrowed chord, flagged with a dashed accent
 *   border and its source mode, with a "hear it in context" button
 *   (I → chord → I) so the colour change is audible, not just visible.
 * - `ShowBorrowedSwitch` — the on/off control that mixes them into the row.
 */

import { useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { ChordCard } from './ChordCard';
import { getScale } from '@/data/scales/scale-registry';
import { SOURCE_MODE_NAMES, type ResolvedBorrowedChord } from '@/data/borrowed-chords';
import { resolveRomanInKey } from '@/lib/theory/roman';
import { playChordSequence, type PlaybackHandle } from '@/lib/audio/player';
import type { Instrument } from '@/lib/search-params';

/** Short source-mode label for the card tag: "Aeolian", not the long name. */
function shortModeName(chord: ResolvedBorrowedChord): string {
  return SOURCE_MODE_NAMES[chord.sourceMode].split(' ')[0];
}

interface BorrowedChordCardProps {
  chord: ResolvedBorrowedChord;
  homeKey: string;
  instrument: Instrument;
}

export function BorrowedChordCard({ chord, homeKey, instrument }: BorrowedChordCardProps): JSX.Element {
  const playback = useRef<PlaybackHandle | null>(null);
  useEffect(() => () => playback.current?.stop(), []);

  const playInContext = (): void => {
    const tonic = resolveRomanInKey(homeKey, 'I');
    playback.current?.stop();
    playback.current = playChordSequence(
      tonic
        ? [
            { midis: tonic.midis, beats: 2 },
            { midis: chord.midis, beats: 2 },
            { midis: tonic.midis, beats: 3 },
          ]
        : [{ midis: chord.midis, beats: 3 }],
      100,
    );
  };

  return (
    <div
      className="border-2 border-dashed border-[var(--accent-color)] bg-card"
      data-testid="borrowed-chord"
      data-numeral={chord.romanNumeral}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[var(--accent-color)]/10">
        <span className="text-[10px] font-semibold uppercase tracking-widest font-mono-app text-[var(--accent-color)]">
          Borrowed · {shortModeName(chord)}
        </span>
        <button
          type="button"
          onClick={playInContext}
          aria-label={`Hear ${chord.symbol} in context: I, ${chord.romanNumeral}, I`}
          title="Hear it in context: I → chord → I"
          className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--accent-color)] hover:underline min-h-8 px-1"
        >
          <Play className="w-3 h-3" aria-hidden /> I–{chord.romanNumeral}–I
        </button>
      </div>

      <ChordCard chordName={chord.symbol} label={chord.romanNumeral} instrument={instrument} />

      <div className="px-3 pb-3 pt-2 space-y-1 border-t border-border">
        <p className="text-[11px] text-muted-foreground">
          From {SOURCE_MODE_NAMES[chord.sourceMode]} · {chord.function}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Scale: {chord.root} {getScale(chord.scaleId)?.name ?? chord.scaleId}
        </p>
        <p className="text-[11px] text-foreground italic leading-snug">{chord.behaviour}</p>
      </div>
    </div>
  );
}

interface ShowBorrowedSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** "Show borrowed chords" on/off switch. */
export function ShowBorrowedSwitch({ checked, onChange }: ShowBorrowedSwitchProps): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 min-h-11 px-3 rounded-full border-2 border-border text-xs font-medium text-foreground hover:border-[var(--accent-color)]"
    >
      <span
        aria-hidden
        className={[
          'relative inline-block w-8 h-4 rounded-full transition-colors',
          checked ? 'bg-[var(--accent-color)]' : 'bg-muted',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all',
            checked ? 'left-4' : 'left-0.5',
          ].join(' ')}
        />
      </span>
      Show borrowed chords
    </button>
  );
}

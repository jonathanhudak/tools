/**
 * ChordCard — a single chord rendered as a guitar, banjo, or piano diagram.
 *
 * Shared by the Circle of Fifths diatonic grids and the Progressions page.
 * The caller owns the instrument state; this component is presentational.
 */

import { useMemo } from 'react';
import { ChordDiagram } from '../ChordReference/ChordDiagram';
import { PianoChordDiagram } from '../ChordReference/PianoChordDiagram';
import { StaffDisplay } from '../notation/StaffDisplay';
import { getChordByShortName } from '@/lib/chord-library';

interface ChordCardProps {
  chordName: string;
  label: string;
  instrument: 'guitar' | 'banjo' | 'piano';
}

export function ChordCard({ chordName, label, instrument }: ChordCardProps): JSX.Element {
  const chord = useMemo(() => getChordByShortName(chordName), [chordName]);
  const voicing = chord?.voicings[0];

  return (
    <div className="border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <p className="font-mono-app text-[10px] text-muted-foreground uppercase tracking-widest">
          {label}
        </p>
        <p className="text-lg font-semibold text-foreground leading-tight font-display">
          {chordName}
        </p>
      </div>

      {/* Chord diagram */}
      <div className="p-3 flex flex-col items-center">
        {chord && voicing ? (
          instrument === 'guitar' && voicing.guitar ? (
            <ChordDiagram chord={chord} voicing={voicing} />
          ) : instrument === 'banjo' ? (
            <ChordDiagram chord={chord} instrument="banjo" hideChordInfo />
          ) : instrument === 'piano' && voicing.piano ? (
            <>
              <PianoChordDiagram voicing={voicing} chordName={chordName} size="small" />
              {voicing.piano.notes.length > 0 && (
                <div
                  className="w-full overflow-hidden"
                  style={{ transform: 'scale(0.75)', transformOrigin: 'top center', marginBottom: '-1rem' }}
                >
                  <StaffDisplay notes={voicing.piano.notes} clef="treble" asChord />
                </div>
              )}
            </>
          ) : (
            <p className="text-[10px] text-muted-foreground italic py-4">No {instrument} voicing</p>
          )
        ) : (
          <p className="text-[10px] text-muted-foreground italic py-4">Not in library</p>
        )}
      </div>
    </div>
  );
}

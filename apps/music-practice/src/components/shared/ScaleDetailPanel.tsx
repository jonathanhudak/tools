/**
 * ScaleDetailPanel — the full scale reference block: spelled notes, step
 * pattern, staff notation, piano diagram, and guitar fretboard. Shared by
 * Scale Explorer and the improv practice prompt.
 */

import { useMemo, useState } from 'react';
import type { ScaleDefinition } from '@/data/scales/scale-registry';
import { assignAscendingOctaves } from '@/lib/utils/music-theory';
import { resolveForScale } from '@/data/enharmonics';
import { StaffDisplay } from '../notation/StaffDisplay';
import { PianoScaleDiagram } from '../ScaleReference/PianoScaleDiagram';
import { GuitarFretboard, BANJO_OPEN_G } from '../GuitarFretboard';
import { InstrumentToggle } from '../Piano/InstrumentToggle';

interface ScaleDetailPanelProps {
  scale: ScaleDefinition;
  root: string;
  showStaff?: boolean;
}

/** Ascending octave-assigned scale notes, closing with the top root. */
function toStaffNotes(notes: string[]): string[] {
  const staffNotes = assignAscendingOctaves(notes);
  if (staffNotes.length > 0) {
    const firstOctave = Number(staffNotes[0].match(/\d+$/)?.[0] ?? 4);
    staffNotes.push(`${notes[0]}${firstOctave + 1}`);
  }
  return staffNotes;
}

export function ScaleDetailPanel({ scale, root, showStaff = true }: ScaleDetailPanelProps): JSX.Element {
  const notes = useMemo(() => resolveForScale(scale.semitones, scale.name, root), [scale, root]);
  const staffNotes = useMemo(() => toStaffNotes(notes), [notes]);
  const [fretboardInstrument, setFretboardInstrument] = useState<'guitar' | 'banjo'>('guitar');

  return (
    <div className="space-y-4">
      {/* Notes + step pattern */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex flex-wrap gap-1">
          {notes.map((n, i) => (
            <span
              key={i}
              className={`font-mono text-sm px-2 py-1 rounded ${
                i === 0
                  ? 'bg-[var(--accent-color)] text-white font-semibold'
                  : 'bg-muted text-foreground'
              }`}
            >
              {n}
            </span>
          ))}
        </div>
        <span className="font-mono text-xs text-muted-foreground">{scale.stepPattern}</span>
      </div>

      {/* Staff notation */}
      {showStaff && (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-card p-2 overflow-x-auto">
          <StaffDisplay notes={staffNotes} clef="treble" />
        </div>
      )}

      {/* Diagrams — piano needs octaved notes to place keys */}
      <div className="space-y-4">
        <PianoScaleDiagram notes={staffNotes} rootNote={staffNotes[0]} size="medium" />
        <div className="space-y-2">
          <InstrumentToggle
            instrument={fretboardInstrument}
            onChange={(inst) => setFretboardInstrument(inst as 'guitar' | 'banjo')}
            options={['guitar', 'banjo']}
          />
          <GuitarFretboard
            notes={notes}
            root={root}
            compact
            label={
              fretboardInstrument === 'banjo'
                ? `${root} ${scale.name} — banjo (Open G)`
                : `${root} ${scale.name}`
            }
            {...(fretboardInstrument === 'banjo' ? BANJO_OPEN_G : {})}
          />
        </div>
      </div>
    </div>
  );
}

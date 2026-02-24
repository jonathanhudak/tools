/**
 * ScaleDisplay - Composite component showing a mode's scale on guitar tab or piano
 * Provides instrument toggle to switch between views
 */

import { useMemo } from 'react';
import { Note } from 'tonal';
import { TabDisplay } from '../notation/TabDisplay';
import { PianoScaleDiagram } from './PianoScaleDiagram';
import { getModeNotes, getModeNotesAsMidi } from '@/data/chord-scale-matrix';
import type { ScaleType, Degree } from '@/data/chord-scale-matrix';

interface ScaleDisplayProps {
  scaleType: ScaleType;
  degree: Degree;
  modeName: string;
  instrument: 'guitar' | 'piano';
}

export function ScaleDisplay({ scaleType, degree, modeName, instrument }: ScaleDisplayProps): JSX.Element {
  const rootOctave = instrument === 'guitar' ? 3 : 4;
  const notes = useMemo(() => getModeNotes(scaleType, degree, rootOctave), [scaleType, degree, rootOctave]);
  const midiNotes = useMemo(() => getModeNotesAsMidi(scaleType, degree, rootOctave), [scaleType, degree, rootOctave]);
  const pitchClasses = useMemo(() => notes.map(n => Note.get(n).pc), [notes]);

  return (
    <div className="space-y-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground">{modeName} Scale</h3>
        <p className="text-xs text-muted-foreground">{pitchClasses.join(' \u2013 ')}</p>
      </div>

      {instrument === 'guitar' ? (
        <TabDisplay midiNotes={midiNotes} />
      ) : (
        <PianoScaleDiagram notes={notes} rootNote={notes[0]} />
      )}
    </div>
  );
}

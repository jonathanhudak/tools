/**
 * ChordDiagramView — shared chord diagram body.
 *
 * Renders a chord's first voicing as a guitar fretboard diagram or a piano
 * keyboard diagram + staff notation. Looks the chord up by symbol/short name
 * in the curated library; when that misses (jazz/modal qualities, theoretical
 * enharmonic roots) it generates a voicing from the supplied pitch classes /
 * MIDI so every chord still shows a diagram.
 *
 * Used by Circle of Fifths, the Chord-Scale Matrix, and the Progression
 * player so every surface shows the same diagrams for a given instrument.
 */

import { useMemo } from 'react';
import { ChordDiagram } from '../ChordReference/ChordDiagram';
import { PianoChordDiagram } from '../ChordReference/PianoChordDiagram';
import { StaffDisplay } from './StaffDisplay';
import { getChordByShortName, type Chord, type ChordVoicing } from '../../lib/chord-library';
import { generateGuitarVoicing, generatePianoVoicing } from '../../lib/notation/chord-voicings';

interface ChordDiagramViewProps {
  /** Chord symbol / short name, e.g. "Dm7", "Cmaj7", "G". */
  chordName: string;
  instrument: 'guitar' | 'piano';
  size?: 'small' | 'medium' | 'large';
  /** Show staff notation beneath the piano diagram (default true). */
  showStaff?: boolean;
  /**
   * Pitch classes of the chord (e.g. ["G","B","D","F"]). Used to generate a
   * guitar voicing when the chord isn't in the curated library.
   */
  notes?: string[];
  /** Chord root pitch class (e.g. "G"). Required for generated guitar shapes. */
  root?: string;
  /**
   * MIDI notes of the chord. Used to generate a piano voicing (with reliable
   * spelling) when the chord isn't in the curated library.
   */
  midis?: number[];
}

const NOT_PLAYABLE = (
  <p className="text-[10px] text-muted-foreground italic py-4">No voicing</p>
);

export function ChordDiagramView({
  chordName,
  instrument,
  size = 'small',
  showStaff = true,
  notes,
  root,
  midis,
}: ChordDiagramViewProps): JSX.Element {
  const libChord = useMemo(() => getChordByShortName(chordName), [chordName]);
  const libVoicing = libChord?.voicings[0];

  // Generated voicings (only computed when the library lacks the instrument).
  const genGuitar = useMemo(
    () =>
      instrument === 'guitar' && !libVoicing?.guitar && notes && root
        ? generateGuitarVoicing(notes, root)
        : null,
    [instrument, libVoicing, notes, root],
  );
  const genPiano = useMemo(
    () =>
      instrument === 'piano' && !libVoicing?.piano && midis
        ? generatePianoVoicing(midis)
        : null,
    [instrument, libVoicing, midis],
  );

  if (instrument === 'guitar') {
    if (libChord && libVoicing?.guitar) {
      return <ChordDiagram chord={libChord} voicing={libVoicing} size={size} />;
    }
    if (genGuitar) {
      const synthetic = {
        name: chordName,
        description: '',
        voicings: [{ guitar: genGuitar } as ChordVoicing],
      } as Chord;
      const voicing = synthetic.voicings[0];
      return <ChordDiagram chord={synthetic} voicing={voicing} size={size} hideChordInfo />;
    }
    return NOT_PLAYABLE;
  }

  // Piano
  const pianoVoicing = libVoicing?.piano ? libVoicing : genPiano ? ({ piano: genPiano } as ChordVoicing) : null;
  if (!pianoVoicing?.piano) return NOT_PLAYABLE;
  return (
    <>
      <PianoChordDiagram voicing={pianoVoicing} chordName={chordName} size={size} />
      {showStaff && pianoVoicing.piano.notes.length > 0 && (
        <div
          className="w-full overflow-hidden"
          style={{ transform: 'scale(0.75)', transformOrigin: 'top center', marginBottom: '-1rem' }}
        >
          <StaffDisplay notes={pianoVoicing.piano.notes} clef="treble" asChord />
        </div>
      )}
    </>
  );
}

/**
 * PianoChordDiagram - Professional piano keyboard visualization for chords
 * Renders realistic piano layout with highlighted chord tones
 */

import type { ChordVoicing } from '@/lib/chord-library';
import { motion } from 'framer-motion';

interface PianoChordDiagramProps {
  voicing: ChordVoicing;
  size?: 'small' | 'medium' | 'large';
}

// Piano note mappings: C0=0 to B8=107 (88 keys on 88-key piano)
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteNameToMidiNumber(noteName: string): number {
  // Parse note name like "C4", "C#4", etc.
  const match = noteName.match(/([A-G]#?)(\d)/);
  if (!match) return -1;
  
  const [, note, octave] = match;
  const noteIndex = NOTE_NAMES.indexOf(note);
  const octaveNum = parseInt(octave);
  
  // MIDI: C0 = 12, C1 = 24, etc.
  return 12 + (octaveNum * 12) + noteIndex;
}

// Piano layout: white keys and black key positions
const WHITE_KEYS_PATTERN = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
const BLACK_KEYS_PATTERN = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

function isBlackKey(noteIndex: number): boolean {
  return BLACK_KEYS_PATTERN.includes(noteIndex % 12);
}

export function PianoChordDiagram({ voicing, size = 'large' }: PianoChordDiagramProps) {
  if (!voicing.piano) {
    return (
      <div className="text-center text-muted-foreground">
        No piano voicing available
      </div>
    );
  }

  const notes = voicing.piano.notes;
  const highlightedMidiNumbers = notes.map(noteNameToMidiNumber);

  // Calculate the octave range needed for the chord
  const minMidi = Math.min(...highlightedMidiNumbers);
  const maxMidi = Math.max(...highlightedMidiNumbers);
  
  // Get starting octave (one octave below minimum, rounded down to C)
  const minOctave = Math.floor(minMidi / 12);
  const maxOctave = Math.floor(maxMidi / 12);
  
  // Intelligent octave range: show only 2-3 octaves spanning the chord
  // Start from C of minOctave-1, but cap total width for mobile responsiveness
  const octaveSpan = maxOctave - minOctave + 1; // How many octaves the chord spans
  const displayOctaves = Math.max(2, Math.min(3, octaveSpan + 1)); // Show 2-3 octaves
  const startOctave = Math.max(0, minOctave - Math.ceil((displayOctaves - octaveSpan) / 2));
  const endOctave = Math.min(8, startOctave + displayOctaves);
  
  // Convert to MIDI numbers: C = 0 of octave, B = 11
  const startMidiKey = Math.max(12, startOctave * 12);
  const endMidiKey = Math.min(108, (endOctave + 1) * 12);

  // Piano keyboard dimensions - responsive based on size
  const sizeConfig = {
    small: { whiteKeyWidth: 20, whiteKeyHeight: 80 },
    medium: { whiteKeyWidth: 28, whiteKeyHeight: 120 },
    large: { whiteKeyWidth: 32, whiteKeyHeight: 140 },
  };

  const config = sizeConfig[size];
  const whiteKeyWidth = config.whiteKeyWidth;
  const whiteKeyHeight = config.whiteKeyHeight;
  const blackKeyHeight = (whiteKeyHeight * 2) / 3;
  const blackKeyWidth = (whiteKeyWidth * 2) / 3;

  // Calculate white key positions
  const whiteKeys: Array<{ midiNum: number; x: number }> = [];
  let whiteKeyX = 0;

  for (let midi = startMidiKey; midi < endMidiKey; midi++) {
    if (!isBlackKey(midi)) {
      whiteKeys.push({ midiNum: midi, x: whiteKeyX });
      whiteKeyX += whiteKeyWidth;
    }
  }

  const totalWidth = whiteKeyX;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 w-full"
    >
      {/* Piano Keyboard SVG - Responsive Container */}
      <div className="w-full overflow-x-auto rounded-lg border border-slate-700">
        <svg
          width={totalWidth + 4}
          height={whiteKeyHeight + 50}
          className="border-2 bg-slate-900 border-slate-700 shadow-2xl"
          style={{ minWidth: totalWidth + 4, display: 'block', margin: '0 auto' }}
        >
        {/* White keys */}
        {whiteKeys.map(({ midiNum, x }) => {
          const isHighlighted = highlightedMidiNumbers.includes(midiNum);
          const octave = Math.floor(midiNum / 12);
          const noteIndex = midiNum % 12;
          const noteName = NOTE_NAMES[noteIndex] + octave;

          return (
            <motion.g key={`white-${midiNum}`}>
              {/* White key background */}
              <rect
                x={x + 2}
                y={10}
                width={whiteKeyWidth - 2}
                height={whiteKeyHeight}
                fill={isHighlighted ? '#3b82f6' : '#ffffff'}
                stroke="#333"
                strokeWidth="1"
                rx="4"
                className={isHighlighted ? '' : 'cursor-pointer hover:fill-gray-100'}
              />
              {/* Key label */}
              {isHighlighted && (
                <text
                  x={x + whiteKeyWidth / 2 + 2}
                  y={whiteKeyHeight + 5}
                  textAnchor="middle"
                  fontSize={size === 'large' ? 12 : 10}
                  fill="#3b82f6"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {noteName}
                </text>
              )}
            </motion.g>
          );
        })}

        {/* Black keys */}
        {whiteKeys.map(({ midiNum, x }) => {
          const nextMidi = midiNum + 1;
          const nextNoteIndex = nextMidi % 12;
          
          // Draw black keys between white keys (except between E-F and B-C)
          if (nextNoteIndex !== 0 && nextNoteIndex !== 5 && isBlackKey(nextMidi)) {
            const isHighlighted = highlightedMidiNumbers.includes(nextMidi);
            const octave = Math.floor(nextMidi / 12);
            const noteName = NOTE_NAMES[nextNoteIndex] + octave;

            return (
              <motion.g key={`black-${nextMidi}`}>
                {/* Black key */}
                <rect
                  x={x + whiteKeyWidth - blackKeyWidth / 2 + 2}
                  y={10}
                  width={blackKeyWidth - 2}
                  height={blackKeyHeight}
                  fill={isHighlighted ? '#ec4899' : '#1f2937'}
                  stroke="#000"
                  strokeWidth="1"
                  rx="3"
                  className={isHighlighted ? '' : 'cursor-pointer hover:fill-gray-800'}
                />
                {/* Key label */}
                {isHighlighted && (
                  <text
                    x={x + whiteKeyWidth - blackKeyWidth / 2 + 2 + blackKeyWidth / 2}
                    y={blackKeyHeight + 15}
                    textAnchor="middle"
                    fontSize={size === 'large' ? 10 : 8}
                    fill="#ec4899"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {noteName}
                  </text>
                )}
              </motion.g>
            );
          }
          return null;
        })}
        </svg>
      </div>

      {/* Chord Notes Info */}
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Chord Tones:</p>
        <div className="flex gap-2 mt-2 flex-wrap justify-center">
          {notes.map((note) => (
            <span
              key={note}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-full text-sm font-medium"
            >
              {note}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

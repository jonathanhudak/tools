/**
 * PianoChordDiagram - Responsive piano keyboard using CSS Grid + HTML buttons
 * Highlights chord tones on white and black keys
 * Mobile-first, touch-friendly implementation
 */

import type { ChordVoicing } from '@/lib/chord-library';
import { motion } from 'framer-motion';
import './PianoChordDiagram.css';

interface PianoChordDiagramProps {
  voicing: ChordVoicing;
  chordName?: string;
}

// Piano note mappings
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_NOTES = ['C#', 'D#', 'F#', 'G#', 'A#'];

function noteNameToMidiNumber(noteName: string): number {
  const match = noteName.match(/([A-G]#?)(\d)/);
  if (!match) return -1;

  const [, note, octave] = match;
  const noteIndex = NOTE_NAMES.indexOf(note);
  const octaveNum = parseInt(octave);

  return 12 + (octaveNum * 12) + noteIndex;
}

function midiNumberToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12);
  const noteIndex = midi % 12;
  return NOTE_NAMES[noteIndex] + octave;
}

function isWhiteKey(noteIndex: number): boolean {
  return WHITE_NOTES.includes(NOTE_NAMES[noteIndex % 12]);
}

interface KeyPosition {
  midiNum: number;
  noteName: string;
  isWhite: boolean;
  isHighlighted: boolean;
  whiteKeyIndex?: number; // Position among white keys (for black key offset)
}

export function PianoChordDiagram({ voicing, chordName }: PianoChordDiagramProps) {
  if (!voicing.piano) {
    return (
      <div className="piano-diagram-container">
        <div className="text-center text-muted-foreground text-sm py-8">
          No piano voicing available for {chordName}
        </div>
      </div>
    );
  }

  const notes = voicing.piano.notes;
  const highlightedMidiNumbers = notes.map(noteNameToMidiNumber);

  // Calculate octave range
  const minMidi = Math.min(...highlightedMidiNumbers);
  const maxMidi = Math.max(...highlightedMidiNumbers);

  const minOctave = Math.floor(minMidi / 12);
  const maxOctave = Math.floor(maxMidi / 12);

  const octaveSpan = maxOctave - minOctave + 1;
  const displayOctaves = Math.max(2, Math.min(3, octaveSpan + 1));
  const startOctave = Math.max(0, minOctave - Math.ceil((displayOctaves - octaveSpan) / 2));
  const endOctave = Math.min(8, startOctave + displayOctaves);

  // Generate all keys in range
  const allKeys: KeyPosition[] = [];
  let whiteKeyIndex = 0;

  for (let octave = startOctave; octave <= endOctave; octave++) {
    for (let noteIndex = 0; noteIndex < 12; noteIndex++) {
      const midiNum = 12 + (octave * 12) + noteIndex;
      const noteName = NOTE_NAMES[noteIndex] + octave;
      const isWhite = isWhiteKey(noteIndex);
      const isHighlighted = highlightedMidiNumbers.includes(midiNum);

      if (isWhite) {
        allKeys.push({
          midiNum,
          noteName,
          isWhite: true,
          isHighlighted,
          whiteKeyIndex: whiteKeyIndex++,
        });
      } else {
        allKeys.push({
          midiNum,
          noteName,
          isWhite: false,
          isHighlighted,
        });
      }
    }
  }

  const whiteKeys = allKeys.filter((k) => k.isWhite);
  const blackKeys = allKeys.filter((k) => !k.isWhite);

  // Calculate which white key index each black key falls between
  const getBlackKeyWhiteKeyIndex = (blackKey: KeyPosition): number => {
    const noteIndex = blackKey.midiNum % 12;
    
    // Map note indices to white key positions
    // White keys: C(0), D(1), E(2), F(3), G(4), A(5), B(6)
    const positions: Record<number, number> = {
      1: 0.5, // C# between white keys 0(C) and 1(D)
      3: 1.5, // D# between white keys 1(D) and 2(E)
      6: 3.5, // F# between white keys 3(F) and 4(G)
      8: 4.5, // G# between white keys 4(G) and 5(A)
      10: 5.5, // A# between white keys 5(A) and 6(B)
    };
    
    return positions[noteIndex] || 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="piano-diagram-container"
    >
      {/* Piano Keyboard */}
      <div className="piano-wrapper">
        <div className="piano-keyboard">
          {/* WHITE KEYS */}
          <div className="white-keys-container">
            {whiteKeys.map((key) => (
              <motion.button
                key={`white-${key.midiNum}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={`piano-key white ${key.isHighlighted ? 'active' : ''}`}
                title={`${key.noteName}${key.isHighlighted ? ' (chord tone)' : ''}`}
                aria-label={`${key.noteName} ${key.isHighlighted ? 'active' : ''}`}
                tabIndex={0}
              >
                <div
                  className={`key-label ${key.isHighlighted ? 'active-label' : ''}`}
                >
                  {key.noteName}
                </div>
              </motion.button>
            ))}
          </div>

          {/* BLACK KEYS */}
          <div className="black-keys-container">
            <div className="black-keys-wrapper">
              {blackKeys.map((key) => {
                // Calculate position as percentage of total width
                // Each white key takes up (100 / whiteKeys.length) percent
                const whiteKeyPercent = 100 / whiteKeys.length;
                const blackKeyPosition = getBlackKeyWhiteKeyIndex(key);
                const leftPercent = blackKeyPosition * whiteKeyPercent;
                
                return (
                  <motion.button
                    key={`black-${key.midiNum}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className={`piano-key black ${key.isHighlighted ? 'active' : ''}`}
                    style={{
                      left: `${leftPercent}%`,
                    }}
                    title={`${key.noteName}${key.isHighlighted ? ' (chord tone)' : ''}`}
                    aria-label={`${key.noteName} ${key.isHighlighted ? 'active' : ''}`}
                    tabIndex={0}
                  >
                    <div
                      className={`key-label ${key.isHighlighted ? 'active-label' : ''}`}
                    >
                      {key.noteName}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chord Notes Info */}
      <div className="chord-notes-info">
        <p className="chord-notes-title">Chord Tones:</p>
        <div className="chord-notes-list">
          {notes.map((note) => (
            <span key={note} className="note-badge">
              {note}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

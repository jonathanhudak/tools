/**
 * PianoChordDiagram - Professional piano keyboard visualization for chords
 * Root note = solid accent fill + white text
 * Chord tones = accent-light fill + accent border + accent text
 */

import type { ChordVoicing } from '@/lib/chord-library';
import { motion } from 'framer-motion';

interface PianoChordDiagramProps {
  voicing: ChordVoicing;
  chordName?: string;
  size?: 'small' | 'medium' | 'large';
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS_PATTERN = [1, 3, 6, 8, 10];

function noteNameToMidiNumber(noteName: string): number {
  const match = noteName.match(/([A-G]#?)(\d)/);
  if (!match) return -1;
  const [, note, octave] = match;
  const noteIndex = NOTE_NAMES.indexOf(note);
  return 12 + (parseInt(octave) * 12) + noteIndex;
}

function isBlackKey(noteIndex: number): boolean {
  return BLACK_KEYS_PATTERN.includes(noteIndex % 12);
}

export function PianoChordDiagram({ voicing, size = 'medium' }: PianoChordDiagramProps) {
  if (!voicing.piano) {
    return (
      <div className="text-center text-muted-foreground">
        No piano voicing available
      </div>
    );
  }

  const notes = voicing.piano.notes;
  const highlightedMidiNumbers = notes.map(noteNameToMidiNumber);
  // First note is the root
  const rootMidi = highlightedMidiNumbers[0];

  const minMidi = Math.min(...highlightedMidiNumbers);
  const maxMidi = Math.max(...highlightedMidiNumbers);

  const minOctave = Math.floor(minMidi / 12);
  const maxOctave = Math.floor(maxMidi / 12);
  const octaveSpan = maxOctave - minOctave + 1;
  const displayOctaves = Math.max(2, Math.min(3, octaveSpan + 1));
  const startOctave = Math.max(0, minOctave - Math.ceil((displayOctaves - octaveSpan) / 2));
  const endOctave = Math.min(8, startOctave + displayOctaves);

  const startMidiKey = Math.max(12, startOctave * 12);
  const endMidiKey = Math.min(108, (endOctave + 1) * 12);

  const sizeConfig = {
    small: { whiteKeyWidth: 20, whiteKeyHeight: 80 },
    medium: { whiteKeyWidth: 28, whiteKeyHeight: 120 },
    large: { whiteKeyWidth: 32, whiteKeyHeight: 140 },
  };

  const config = sizeConfig[size];
  const { whiteKeyWidth, whiteKeyHeight } = config;
  const blackKeyHeight = (whiteKeyHeight * 2) / 3;
  const blackKeyWidth = (whiteKeyWidth * 2) / 3;

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
      <div className="w-full rounded-lg border border-border">
        <svg
          viewBox={`0 0 ${totalWidth + 4} ${whiteKeyHeight + 50}`}
          width="100%"
          style={{ display: 'block', maxWidth: totalWidth + 4, margin: '0 auto' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* White keys */}
          {whiteKeys.map(({ midiNum, x }) => {
            const isHighlighted = highlightedMidiNumbers.includes(midiNum);
            const isRoot = midiNum === rootMidi;
            const octave = Math.floor(midiNum / 12);
            const noteIndex = midiNum % 12;
            const noteName = NOTE_NAMES[noteIndex] + octave;

            return (
              <g key={`white-${midiNum}`}>
                <rect
                  x={x + 2}
                  y={10}
                  width={whiteKeyWidth - 2}
                  height={whiteKeyHeight}
                  fill={isHighlighted
                    ? (isRoot ? 'var(--piano-root)' : 'var(--piano-chord-tone)')
                    : 'var(--piano-white)'}
                  stroke={isHighlighted && !isRoot ? 'var(--accent-color)' : 'var(--piano-key-border)'}
                  strokeWidth={isHighlighted && !isRoot ? 1.5 : 1}
                  rx="4"
                />
                {isHighlighted && (
                  <text
                    x={x + whiteKeyWidth / 2 + 1}
                    y={whiteKeyHeight + 5}
                    textAnchor="middle"
                    fontSize={size === 'large' ? 12 : 10}
                    fill={isRoot ? 'var(--accent-color)' : 'var(--accent-color)'}
                    fontWeight={isRoot ? '900' : 'bold'}
                    className="pointer-events-none"
                  >
                    {noteName}
                  </text>
                )}
              </g>
            );
          })}

          {/* Black keys */}
          {whiteKeys.map(({ midiNum, x }) => {
            const nextMidi = midiNum + 1;
            const nextNoteIndex = nextMidi % 12;

            if (nextNoteIndex !== 0 && nextNoteIndex !== 5 && isBlackKey(nextMidi)) {
              const isHighlighted = highlightedMidiNumbers.includes(nextMidi);
              const isRoot = nextMidi === rootMidi;
              const octave = Math.floor(nextMidi / 12);
              const noteName = NOTE_NAMES[nextNoteIndex] + octave;

              return (
                <g key={`black-${nextMidi}`}>
                  <rect
                    x={x + whiteKeyWidth - blackKeyWidth / 2 + 2}
                    y={10}
                    width={blackKeyWidth - 2}
                    height={blackKeyHeight}
                    fill={isHighlighted
                      ? 'var(--piano-black-highlighted)'
                      : 'var(--piano-black)'}
                    stroke={isHighlighted ? 'var(--accent-hover)' : 'var(--piano-black)'}
                    strokeWidth={isHighlighted ? 2 : 1}
                    rx="3"
                  />
                  {isHighlighted && (
                    <text
                      x={x + whiteKeyWidth - blackKeyWidth / 2 + 2 + blackKeyWidth / 2}
                      y={blackKeyHeight + 15}
                      textAnchor="middle"
                      fontSize={size === 'large' ? 10 : 8}
                      fill="var(--accent-color)"
                      fontWeight={isRoot ? '900' : 'bold'}
                      className="pointer-events-none"
                    >
                      {noteName}
                    </text>
                  )}
                </g>
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
          {notes.map((note, i) => (
            <span
              key={note}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                i === 0
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--accent-color)]/30'
              }`}
            >
              {note}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

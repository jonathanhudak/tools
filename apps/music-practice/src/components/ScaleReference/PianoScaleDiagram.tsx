/**
 * PianoScaleDiagram - Piano keyboard visualization for scale notes
 * Root note = solid accent fill + white text
 * Scale tones = accent-light fill + accent border + accent text
 */

import { Note } from 'tonal';
import { motion } from 'framer-motion';

interface PianoScaleDiagramProps {
  notes: string[];
  rootNote?: string;
  size?: 'small' | 'medium' | 'large';
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS_PATTERN = [1, 3, 6, 8, 10];

function isBlackKey(noteIndex: number): boolean {
  return BLACK_KEYS_PATTERN.includes(noteIndex % 12);
}

export function PianoScaleDiagram({ notes, rootNote, size = 'medium' }: PianoScaleDiagramProps) {
  const midiNumbers = notes.map(n => Note.midi(n)).filter((m): m is number => m !== null);
  const rootMidi = rootNote ? Note.midi(rootNote) : null;

  const midiToName = new Map<number, string>();
  notes.forEach(n => {
    const midi = Note.midi(n);
    if (midi !== null) midiToName.set(midi, n);
  });

  if (midiNumbers.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No scale data available
      </div>
    );
  }

  const minMidi = Math.min(...midiNumbers);
  const maxMidi = Math.max(...midiNumbers);
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
  const pitchClasses = notes.map(n => Note.get(n).pc);

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
            const isHighlighted = midiNumbers.includes(midiNum);
            const isRoot = rootMidi !== null && midiNum === rootMidi;
            const label = midiToName.get(midiNum) || (NOTE_NAMES[midiNum % 12] + Math.floor(midiNum / 12));

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
                    fill="var(--accent-color)"
                    fontWeight={isRoot ? '900' : 'bold'}
                    className="pointer-events-none"
                  >
                    {label}
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
              const isHighlighted = midiNumbers.includes(nextMidi);
              const isRoot = rootMidi !== null && nextMidi === rootMidi;
              const label = midiToName.get(nextMidi) || (NOTE_NAMES[nextNoteIndex] + Math.floor(nextMidi / 12));

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
                      {label}
                    </text>
                  )}
                </g>
              );
            }
            return null;
          })}
        </svg>
      </div>

      {/* Scale Tones */}
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Scale Tones:</p>
        <div className="flex gap-2 mt-2 flex-wrap justify-center">
          {pitchClasses.map((pc, i) => (
            <span
              key={`${pc}-${i}`}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                i === 0
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--accent-color)]/30'
              }`}
            >
              {pc}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

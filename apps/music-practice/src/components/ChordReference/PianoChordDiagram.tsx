/**
 * PianoChordDiagram - SVG piano keyboard visualization for chords
 *
 * Always shows the complete chord — dynamically sizes to fit all notes
 * with 2 white-key padding on each side for context.
 *
 * Root note = solid accent fill + white text
 * Chord tones = accent-light fill + accent border + accent text
 */

import type { ChordVoicing } from '@/lib/chord-library';

interface PianoChordDiagramProps {
  voicing: ChordVoicing;
  chordName?: string;
  size?: 'small' | 'medium' | 'large';
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS_PATTERN = [1, 3, 6, 8, 10];

/**
 * Resolve any enharmonic spelling to a MIDI number.
 * Handles: sharps (#), flats (b), double-sharps (##/x), double-flats (bb),
 * and enharmonic naturals like E# → F, B# → C(+1 octave), Cb → B(-1 octave).
 */
function noteNameToMidiNumber(noteName: string): number {
  const match = noteName.match(/^([A-G])(#{1,2}|b{1,2}|x)?(\d)$/);
  if (!match) return -1;
  const [, letter, accidental = '', octaveStr] = match;
  const octave = parseInt(octaveStr);

  // Base semitone offset for natural notes
  const BASE: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  };
  let semitone = BASE[letter];
  if (semitone === undefined) return -1;

  // Apply accidental offset
  if (accidental === '#') semitone += 1;
  else if (accidental === '##' || accidental === 'x') semitone += 2;
  else if (accidental === 'b') semitone -= 1;
  else if (accidental === 'bb') semitone -= 2;

  // MIDI: C4 = 60, so C0 = 12 (we use octave+1 convention)
  return 12 + octave * 12 + semitone;
}

function isBlackKey(midi: number): boolean {
  return BLACK_KEYS_PATTERN.includes(midi % 12);
}

/** Count white keys from startMidi (inclusive) to endMidi (exclusive) */
function countWhiteKeysInRange(startMidi: number, endMidi: number): number {
  let count = 0;
  for (let m = startMidi; m < endMidi; m++) {
    if (!isBlackKey(m)) count++;
  }
  return count;
}

/** Walk N white keys backward from a midi number */
function walkWhiteKeysBack(midi: number, count: number): number {
  let m = midi;
  let walked = 0;
  while (walked < count && m > 12) {
    m--;
    if (!isBlackKey(m)) walked++;
  }
  // Snap to white key
  while (isBlackKey(m) && m > 12) m--;
  return m;
}

/** Walk N white keys forward from a midi number */
function walkWhiteKeysForward(midi: number, count: number): number {
  let m = midi;
  let walked = 0;
  while (walked < count && m < 108) {
    m++;
    if (!isBlackKey(m)) walked++;
  }
  // Snap to white key
  while (isBlackKey(m) && m < 108) m++;
  return m;
}

export function PianoChordDiagram({ voicing, size = 'medium' }: PianoChordDiagramProps) {
  if (!voicing.piano) {
    return (
      <div className="text-center text-muted-foreground text-sm">
        No piano voicing available
      </div>
    );
  }

  const notes = voicing.piano.notes;
  const highlightedMidiNumbers = notes.map(noteNameToMidiNumber).filter(n => n >= 0);

  if (highlightedMidiNumbers.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm">
        Could not resolve chord notes
      </div>
    );
  }

  const rootMidi = highlightedMidiNumbers[0];
  const minMidi = Math.min(...highlightedMidiNumbers);
  const maxMidi = Math.max(...highlightedMidiNumbers);

  // Pad: 2 white keys on each side, clamped to valid MIDI range
  const PAD_KEYS = 2;
  const rangeStart = Math.max(12, walkWhiteKeysBack(minMidi, PAD_KEYS));
  // endMidi is exclusive — walk forward from the max note, then +1 past it
  const rangeEnd = Math.min(108, walkWhiteKeysForward(maxMidi, PAD_KEYS) + 1);

  // Ensure minimum width: at least 14 white keys (one octave + padding)
  const MIN_WHITE_KEYS = 14;
  let startMidi = rangeStart;
  let endMidi = rangeEnd;
  const currentWhiteKeys = countWhiteKeysInRange(startMidi, endMidi);
  if (currentWhiteKeys < MIN_WHITE_KEYS) {
    const deficit = MIN_WHITE_KEYS - currentWhiteKeys;
    const padLeft = Math.floor(deficit / 2);
    const padRight = deficit - padLeft;
    startMidi = Math.max(12, walkWhiteKeysBack(startMidi, padLeft));
    endMidi = Math.min(108, walkWhiteKeysForward(endMidi, padRight));
  }

  const sizeConfig = {
    small: { whiteKeyWidth: 20, whiteKeyHeight: 80 },
    medium: { whiteKeyWidth: 28, whiteKeyHeight: 120 },
    large: { whiteKeyWidth: 32, whiteKeyHeight: 140 },
  };

  const config = sizeConfig[size];
  const { whiteKeyWidth, whiteKeyHeight } = config;
  const blackKeyHeight = Math.round((whiteKeyHeight * 2) / 3);
  const blackKeyWidth = Math.round((whiteKeyWidth * 2) / 3);

  // Build white key positions
  const whiteKeys: Array<{ midiNum: number; x: number }> = [];
  let whiteKeyX = 0;
  for (let midi = startMidi; midi < endMidi; midi++) {
    if (!isBlackKey(midi)) {
      whiteKeys.push({ midiNum: midi, x: whiteKeyX });
      whiteKeyX += whiteKeyWidth;
    }
  }
  const totalWidth = whiteKeyX;
  const svgPad = 4;
  const labelSpace = 24;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full border border-border">
        <svg
          viewBox={`0 0 ${totalWidth + svgPad} ${whiteKeyHeight + labelSpace}`}
          width="100%"
          style={{ display: 'block' }}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Piano keyboard showing ${notes.join(', ')}`}
        >
          {/* White keys */}
          {whiteKeys.map(({ midiNum, x }) => {
            const isHighlighted = highlightedMidiNumbers.includes(midiNum);
            const isRoot = midiNum === rootMidi;
            const octave = Math.floor(midiNum / 12);
            const noteIndex = midiNum % 12;
            const noteName = NOTE_NAMES[noteIndex] + octave;

            return (
              <g key={`w-${midiNum}`}>
                <rect
                  x={x + 2}
                  y={6}
                  width={whiteKeyWidth - 2}
                  height={whiteKeyHeight}
                  fill={
                    isHighlighted
                      ? isRoot
                        ? 'var(--piano-root)'
                        : 'var(--piano-chord-tone)'
                      : 'var(--piano-white)'
                  }
                  stroke={
                    isHighlighted && !isRoot
                      ? 'var(--accent-color)'
                      : 'var(--piano-key-border)'
                  }
                  strokeWidth={isHighlighted && !isRoot ? 1.5 : 1}
                />
                {isHighlighted && (
                  <text
                    x={x + whiteKeyWidth / 2 + 1}
                    y={whiteKeyHeight + 2}
                    textAnchor="middle"
                    fontSize={size === 'large' ? 12 : 10}
                    fill={isRoot ? 'var(--accent-color)' : 'var(--accent-color)'}
                    fontWeight={isRoot ? '900' : 'bold'}
                    className="pointer-events-none font-mono-app"
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
                <g key={`b-${nextMidi}`}>
                  <rect
                    x={x + whiteKeyWidth - blackKeyWidth / 2 + 2}
                    y={6}
                    width={blackKeyWidth - 2}
                    height={blackKeyHeight}
                    fill={
                      isHighlighted
                        ? 'var(--piano-black-highlighted)'
                        : 'var(--piano-black)'
                    }
                    stroke={
                      isHighlighted
                        ? 'var(--accent-hover)'
                        : 'var(--piano-black)'
                    }
                    strokeWidth={isHighlighted ? 2 : 1}
                  />
                  {isHighlighted && (
                    <text
                      x={x + whiteKeyWidth - blackKeyWidth / 2 + 2 + blackKeyWidth / 2}
                      y={blackKeyHeight + 18}
                      textAnchor="middle"
                      fontSize={size === 'large' ? 10 : 8}
                      fill="var(--accent-color)"
                      fontWeight={isRoot ? '900' : 'bold'}
                      className="pointer-events-none font-mono-app"
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

      {/* Chord tones list */}
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground font-mono-app">Chord Tones</p>
        <div className="flex gap-2 mt-1 flex-wrap justify-center">
          {notes.map((note, i) => (
            <span
              key={note}
              className={`px-2 py-0.5 text-xs font-mono-app font-medium border ${
                i === 0
                  ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
                  : 'bg-[var(--accent-light)] text-[var(--accent-color)] border-[var(--accent-color)]/30'
              }`}
            >
              {note}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

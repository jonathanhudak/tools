/**
 * PianoKeyboard - Visual 88-key piano keyboard component
 * Displays piano keyboard and highlights chord notes
 */

import type { Chord } from '@/lib/chord-library';
import { mapGuitarToPiano, getPianoKeyPositions } from '@/lib/chord-voicing-mapper';
import { motion } from 'framer-motion';

interface PianoKeyboardProps {
  chord: Chord;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
}

export function PianoKeyboard({ chord, size = 'medium', interactive = false }: PianoKeyboardProps): JSX.Element {
  const voicing = mapGuitarToPiano(chord);
  const highlightedKeys = getPianoKeyPositions(voicing);

  // Size configuration
  const sizeConfig = {
    small: { whiteWidth: 16, blackWidth: 10, whiteHeight: 60, blackHeight: 40, fontSize: 10 },
    medium: { whiteWidth: 24, blackWidth: 14, whiteHeight: 90, blackHeight: 60, fontSize: 12 },
    large: { whiteWidth: 32, blackWidth: 18, whiteHeight: 120, blackHeight: 80, fontSize: 14 },
  };

  const config = sizeConfig[size];

  // 88-key piano: A0 to C8
  // Generate all white and black keys
  const whiteKeys: Array<{ position: number; note: string; octave: number }> = [];
  const blackKeys: Array<{ position: number; note: string; octave: number }> = [];

  let whiteKeyIndex = 0;
  const whiteNotePattern = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  for (let octave = 0; octave <= 8; octave++) {
    for (let noteIdx = 0; noteIdx < whiteNotePattern.length; noteIdx++) {
      const note = whiteNotePattern[noteIdx];

      // Skip keys outside 88-key range (A0 to C8)
      if (octave === 0 && noteIdx < 5) continue; // Before A0
      if (octave === 8 && noteIdx > 0) continue; // After C8

      const keyPosition = whiteKeyIndex;
      whiteKeys.push({ position: keyPosition, note, octave });

      // Add black keys after this white key (except E-F and B-C transitions)
      if (note !== 'E' && note !== 'B') {
        const blackNote = `${note}#`;
        blackKeys.push({ position: keyPosition, note: blackNote, octave });
      }

      whiteKeyIndex++;
    }
  }

  // Calculate positions for each key
  const keyboardWidth = whiteKeys.length * config.whiteWidth;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      {/* Chord Name */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-foreground">{chord.name}</h3>
        <p className="text-xs text-muted-foreground">{chord.description}</p>
      </div>

      {/* Piano Keyboard */}
      <div className="relative overflow-x-auto bg-slate-100 dark:bg-slate-800 rounded-lg p-2 border border-slate-300 dark:border-slate-600">
        <svg
          width={keyboardWidth}
          height={config.whiteHeight + 20}
          className="block"
          style={{ minWidth: 'min-content' }}
        >
          {/* White Keys */}
          {whiteKeys.map((key, idx) => {
            const x = idx * config.whiteWidth;
            const isHighlighted = highlightedKeys.includes(key.position);

            return (
              <g key={`white-${key.position}`} className={interactive ? 'cursor-pointer' : ''}>
                {/* White key background */}
                <rect
                  x={x}
                  y={0}
                  width={config.whiteWidth}
                  height={config.whiteHeight}
                  fill={isHighlighted ? '#fbbf24' : '#ffffff'}
                  stroke="#333"
                  strokeWidth={1}
                  rx={4}
                  className="dark:stroke-white transition-colors duration-200"
                />

                {/* Key label */}
                {size !== 'small' && (
                  <text
                    x={x + config.whiteWidth / 2}
                    y={config.whiteHeight - 8}
                    textAnchor="middle"
                    fontSize={config.fontSize}
                    fontWeight="bold"
                    fill="#333"
                    className="dark:fill-white pointer-events-none"
                  >
                    {key.note}
                  </text>
                )}
              </g>
            );
          })}

          {/* Black Keys */}
          {blackKeys.map(key => {
            const whiteKeyPos = whiteKeys.findIndex(
              wk => wk.position === key.position && wk.octave === key.octave
            );
            if (whiteKeyPos === -1) return null;

            const x = (whiteKeyPos + 0.65) * config.whiteWidth - config.blackWidth / 2;
            const isHighlighted = highlightedKeys.some(kPos => {
              const keyPos = whiteKeys.findIndex(wk => wk.position === kPos);
              return keyPos === whiteKeyPos;
            });

            return (
              <g key={`black-${key.position}-${key.note}`} className={interactive ? 'cursor-pointer' : ''}>
                {/* Black key background */}
                <rect
                  x={x}
                  y={0}
                  width={config.blackWidth}
                  height={config.blackHeight}
                  fill={isHighlighted ? '#d97706' : '#1a1a1a'}
                  stroke="#000"
                  strokeWidth={1}
                  rx={2}
                  className="dark:fill-slate-900 transition-colors duration-200"
                />

                {/* Key label */}
                {size === 'large' && (
                  <text
                    x={x + config.blackWidth / 2}
                    y={config.blackHeight - 6}
                    textAnchor="middle"
                    fontSize={config.fontSize - 2}
                    fontWeight="bold"
                    fill="#fff"
                    className="dark:fill-white pointer-events-none"
                  >
                    {key.note}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Notes Display */}
      <div className="text-center text-sm">
        <p className="font-semibold text-foreground">
          Notes: <span className="font-mono text-amber-600 dark:text-amber-400">{voicing.notes.join(' ')}</span>
        </p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-400 border border-gray-400 rounded" />
          <span>Chord Notes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-400 rounded" />
          <span>White Key</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-900 rounded-sm" />
          <span>Black Key</span>
        </div>
      </div>
    </motion.div>
  );
}

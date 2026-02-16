/**
 * ChordDiagram - Visual guitar chord diagram component
 * Displays fingering positions on a guitar fretboard
 */

import type { Chord } from '@/lib/chord-library';
import { motion } from 'framer-motion';

interface ChordDiagramProps {
  chord: Chord;
  interactive?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function ChordDiagram({ chord, interactive = false, size = 'medium' }: ChordDiagramProps): JSX.Element {
  const guitarFingerings = chord.fingerings.guitar;
  const isOpen = guitarFingerings.every(f => f.fret <= 0);
  const maxFret = Math.max(...guitarFingerings.map(f => (f.fret > 0 ? f.fret : 0)), 4);

  // Size configuration
  const sizeConfig = {
    small: { stringSpacing: 20, fretHeight: 20, width: 140 },
    medium: { stringSpacing: 30, fretHeight: 30, width: 210 },
    large: { stringSpacing: 40, fretHeight: 40, width: 280 },
  };

  const config = sizeConfig[size];
  const width = config.width;
  const stringSpacing = config.stringSpacing;
  const fretHeight = config.fretHeight;
  const startX = 20;
  const startY = 30;
  const fretboardWidth = stringSpacing * 5;
  const fretboardHeight = fretHeight * (isOpen ? maxFret : maxFret);

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

      {/* SVG Fretboard */}
      <svg
        width={width}
        height={startY + fretboardHeight + 40}
        className="border rounded-lg bg-amber-50 dark:bg-slate-900 border-amber-200 dark:border-slate-700"
      >
        {/* Fret markers */}
        {!isOpen && (
          <text
            x={startX - 15}
            y={startY + fretHeight / 2 + 5}
            fontSize={12}
            fontWeight="bold"
            fill="currentColor"
            className="text-muted-foreground"
          >
            1
          </text>
        )}

        {/* Horizontal fret lines */}
        {Array.from({ length: isOpen ? maxFret + 1 : maxFret + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={startX}
            y1={startY + i * fretHeight}
            x2={startX + fretboardWidth}
            y2={startY + i * fretHeight}
            stroke={i === 0 ? '#000' : '#ddd'}
            strokeWidth={i === 0 ? 3 : 1}
            className="dark:stroke-slate-600"
          />
        ))}

        {/* Vertical string lines */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={startX + i * stringSpacing}
            y1={startY}
            x2={startX + i * stringSpacing}
            y2={startY + fretboardHeight}
            stroke="#8b7355"
            strokeWidth={1.5}
            className="dark:stroke-amber-700"
          />
        ))}

        {/* Fingering markers and muted strings */}
        {guitarFingerings.map((fingering, index) => {
          const x = startX + index * stringSpacing;
          const isMuted = fingering.fret === -1;
          const isOpen = fingering.fret === 0;

          if (isMuted) {
            // Draw X for muted strings
            return (
              <g key={`fingering-${index}`}>
                <circle cx={x} cy={startY - 15} r={8} fill="none" stroke="#ef4444" strokeWidth={2} />
                <text
                  x={x}
                  y={startY - 10}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight="bold"
                  fill="#ef4444"
                >
                  ✕
                </text>
              </g>
            );
          }

          if (isOpen) {
            // Draw circle for open strings
            return (
              <circle
                key={`fingering-${index}`}
                cx={x}
                cy={startY - 15}
                r={8}
                fill="none"
                stroke="#22c55e"
                strokeWidth={2}
              />
            );
          }

          // Draw filled dot for fretted notes
          const dotY = startY + (fingering.fret - 0.5) * fretHeight;
          return (
            <motion.circle
              key={`fingering-${index}`}
              cx={x}
              cy={dotY}
              r={fretHeight / 2.5}
              fill="#3b82f6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="cursor-pointer"
              onMouseEnter={e => {
                if (interactive) {
                  (e.target as SVGCircleElement).setAttribute('r', String(fretHeight / 2));
                }
              }}
              onMouseLeave={e => {
                if (interactive) {
                  (e.target as SVGCircleElement).setAttribute('r', String(fretHeight / 2.5));
                }
              }}
            />
          );
        })}

        {/* String labels at bottom */}
        {['E', 'A', 'D', 'G', 'B', 'E'].map((note, i) => (
          <text
            key={`label-${i}`}
            x={startX + i * stringSpacing}
            y={startY + fretboardHeight + 20}
            textAnchor="middle"
            fontSize={12}
            fontWeight="bold"
            fill="currentColor"
            className="text-foreground"
          >
            {note}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 text-xs justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-green-500 rounded-full" />
          <span>Open</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full" />
          <span>Fret</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-500 font-bold">✕</span>
          <span>Muted</span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * ChordDiagram - Visual guitar chord diagram component
 * Displays fingering positions on a guitar fretboard
 */

import type { Chord, ChordVoicing } from '@/lib/chord-library';

interface ChordDiagramProps {
  chord: Chord;
  voicing?: ChordVoicing;
  size?: 'small' | 'medium' | 'large';
  /** Hide chord name and description (for quiz mode to prevent answer leak) */
  hideChordInfo?: boolean;
}

const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

export function ChordDiagram({ chord, voicing, size = 'medium', hideChordInfo = false }: ChordDiagramProps): JSX.Element {
  // Use voicing if provided, otherwise use first voicing from chord
  const guitarData = voicing?.guitar || chord.voicings[0]?.guitar;
  const guitarFingerings = guitarData ? [
    { string: 1, fret: guitarData.frets[0] },
    { string: 2, fret: guitarData.frets[1] },
    { string: 3, fret: guitarData.frets[2] },
    { string: 4, fret: guitarData.frets[3] },
    { string: 5, fret: guitarData.frets[4] },
    { string: 6, fret: guitarData.frets[5] },
  ] : chord.fingerings.guitar;

  const frettedNotes = guitarFingerings.filter(f => f.fret > 0);
  const minFret = frettedNotes.length > 0 ? Math.min(...frettedNotes.map(f => f.fret)) : 1;
  const maxFret = frettedNotes.length > 0 ? Math.max(...frettedNotes.map(f => f.fret)) : 4;
  const isOpenPosition = minFret <= 3;
  const startFret = isOpenPosition ? 1 : minFret;
  const numFrets = Math.max(4, maxFret - startFret + 1);

  // Size configuration
  const sizeConfig = {
    small: { stringSpacing: 18, fretHeight: 22, fontSize: 10 },
    medium: { stringSpacing: 24, fretHeight: 28, fontSize: 12 },
    large: { stringSpacing: 32, fretHeight: 36, fontSize: 14 },
  };

  const config = sizeConfig[size];
  const { stringSpacing, fretHeight, fontSize } = config;
  const leftPad = 28; // space for fret numbers
  const topPad = 24; // space for open/muted indicators
  const bottomPad = 24; // space for string labels
  const fretboardWidth = stringSpacing * 5;
  const fretboardHeight = fretHeight * numFrets;
  const nutHeight = isOpenPosition ? 4 : 0;
  const svgWidth = leftPad + fretboardWidth + 16;
  const svgHeight = topPad + nutHeight + fretboardHeight + bottomPad;
  const startX = leftPad;
  const startY = topPad + nutHeight;
  const dotRadius = Math.min(stringSpacing, fretHeight) / 2.8;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Chord Name — hidden in quiz mode */}
      {!hideChordInfo && (
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">{chord.name}</h3>
          <p className="text-xs text-muted-foreground">{chord.description}</p>
        </div>
      )}

      {/* SVG Fretboard */}
      <svg width={svgWidth} height={svgHeight}>
        {/* Nut bar (only for open position) */}
        {isOpenPosition && (
          <rect
            x={startX}
            y={topPad}
            width={fretboardWidth}
            height={nutHeight}
            fill="var(--ink-primary, #1a1714)"
            rx={1}
          />
        )}

        {/* Fret number label (when not open position) */}
        {!isOpenPosition && (
          <text
            x={startX - 8}
            y={startY + fretHeight / 2 + fontSize / 3}
            textAnchor="end"
            fontSize={fontSize - 1}
            fontFamily="var(--font-mono)"
            fill="var(--ink-secondary, #5c5650)"
          >
            {startFret}
          </text>
        )}

        {/* Horizontal fret lines */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={startX}
            y1={startY + i * fretHeight}
            x2={startX + fretboardWidth}
            y2={startY + i * fretHeight}
            stroke="var(--ink-tertiary, #9c9590)"
            strokeWidth={1}
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
            stroke="var(--ink-tertiary, #9c9590)"
            strokeWidth={1.5}
          />
        ))}

        {/* Open / Muted indicators above nut */}
        {guitarFingerings.map((fingering, index) => {
          const x = startX + index * stringSpacing;
          const indicatorY = topPad - 10;

          if (fingering.fret === -1) {
            // X for muted
            const sz = 5;
            return (
              <g key={`ind-${index}`}>
                <line x1={x - sz} y1={indicatorY - sz} x2={x + sz} y2={indicatorY + sz} stroke="var(--ink-secondary, #5c5650)" strokeWidth={2} strokeLinecap="round" />
                <line x1={x + sz} y1={indicatorY - sz} x2={x - sz} y2={indicatorY + sz} stroke="var(--ink-secondary, #5c5650)" strokeWidth={2} strokeLinecap="round" />
              </g>
            );
          }

          if (fingering.fret === 0) {
            // Circle for open
            return (
              <circle
                key={`ind-${index}`}
                cx={x}
                cy={indicatorY}
                r={5}
                fill="none"
                stroke="var(--ink-secondary, #5c5650)"
                strokeWidth={1.5}
              />
            );
          }

          return null;
        })}

        {/* Fretted note dots */}
        {guitarFingerings.map((fingering, index) => {
          if (fingering.fret <= 0) return null;

          const x = startX + index * stringSpacing;
          const relFret = fingering.fret - startFret;
          const dotY = startY + (relFret + 0.5) * fretHeight;

          return (
            <g key={`dot-${index}`}>
              <circle
                cx={x}
                cy={dotY}
                r={dotRadius}
                fill="var(--accent-color)"
              />
              {/* Finger number inside dot */}
              {guitarData?.fingers[index] && guitarData.fingers[index] !== 'open' && (
                <text
                  x={x}
                  y={dotY + (fontSize - 2) / 3}
                  textAnchor="middle"
                  fontSize={fontSize - 2}
                  fontFamily="var(--font-mono)"
                  fill="white"
                  fontWeight="bold"
                >
                  {guitarData.fingers[index]}
                </text>
              )}
            </g>
          );
        })}

        {/* String labels at bottom */}
        {STRING_LABELS.map((label, i) => (
          <text
            key={`label-${i}`}
            x={startX + i * stringSpacing}
            y={startY + fretboardHeight + 16}
            textAnchor="middle"
            fontSize={fontSize - 1}
            fontFamily="var(--font-mono)"
            fill="var(--ink-secondary, #5c5650)"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

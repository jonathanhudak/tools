/**
 * GuitarFretboard - Horizontal full-neck scale diagram
 *
 * Renders an SVG fretboard (nut → fret 15+) with scale notes highlighted.
 * Strings run horizontally; frets are vertical lines with equal spacing.
 * Uses Tonal.js for note computation and the app's CSS custom properties.
 */

import { useMemo } from 'react';
import { Note } from 'tonal';

// ── Types ────────────────────────────────────────────────

export interface FretboardNote {
  string: number;   // 0-5 (0 = high E, 5 = low E)
  fret: number;     // 0-maxFret
  note: string;     // pitch class e.g. "C", "F#"
  isRoot: boolean;
  interval?: string; // e.g. "1P", "3M", "5P"
  degree?: number;   // scale degree 1-7
}

export interface GuitarFretboardProps {
  /** Notes to highlight (pitch classes like ["C","D","E","F","G","A","B"]) */
  notes: string[];
  /** Root note pitch class (e.g. "C") — highlighted differently */
  root: string;
  /** Number of frets to display (default 15) */
  fretCount?: number;
  /** Guitar tuning, low to high (default standard EADGBE) */
  tuning?: string[];
  /** Show note names inside dots */
  showNoteNames?: boolean;
  /** Show scale degree numbers instead of note names */
  showDegrees?: boolean;
  /** Optional label */
  label?: string;
  /** Compact mode for embedding */
  compact?: boolean;
}

// Standard guitar tuning (low E to high E)
const STANDARD_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

// Fret inlay marker positions
const SINGLE_DOTS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_DOTS = [12, 24];

// ── Helpers ──────────────────────────────────────────────

function noteAtFret(openString: string, fret: number): string {
  const midi = Note.midi(openString);
  if (midi === null || midi === undefined) return '';
  return Note.pitchClass(Note.fromMidi(midi + fret));
}

/** Normalize enharmonics for comparison (Db→C#, Gb→F#, etc.) */
function normalizeNote(note: string): string {
  const chroma = Note.chroma(note);
  if (chroma === null || chroma === undefined) return note;
  // Use sharps as canonical form
  const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return sharpNames[chroma];
}

function computeNotes(
  notes: string[],
  root: string,
  tuning: string[],
  fretCount: number
): FretboardNote[] {
  const normalizedNotes = new Set(notes.map(normalizeNote));
  const normalizedRoot = normalizeNote(root);
  const result: FretboardNote[] = [];

  // Strings are displayed top=high E, bottom=low E, so reverse tuning
  const reversedTuning = [...tuning].reverse();

  for (let stringIdx = 0; stringIdx < reversedTuning.length; stringIdx++) {
    for (let fret = 0; fret <= fretCount; fret++) {
      const note = noteAtFret(reversedTuning[stringIdx], fret);
      const normalized = normalizeNote(note);
      if (normalizedNotes.has(normalized)) {
        const degree = notes.findIndex(n => normalizeNote(n) === normalized) + 1;
        result.push({
          string: stringIdx,
          fret,
          note: notes.find(n => normalizeNote(n) === normalized) || note,
          isRoot: normalized === normalizedRoot,
          degree: degree > 0 ? degree : undefined,
        });
      }
    }
  }
  return result;
}

// ── Component ────────────────────────────────────────────

export function GuitarFretboard({
  notes,
  root,
  fretCount = 15,
  tuning = STANDARD_TUNING,
  showNoteNames = true,
  showDegrees = false,
  label,
  compact = false,
}: GuitarFretboardProps): JSX.Element {
  const fretboardNotes = useMemo(
    () => computeNotes(notes, root, tuning, fretCount),
    [notes, root, tuning, fretCount]
  );

  // ── Layout constants ─────────────────────────────────
  const stringCount = tuning.length;
  const leftPad = compact ? 30 : 38;    // space for string labels
  const rightPad = compact ? 8 : 14;
  const topPad = compact ? 12 : 18;
  const bottomPad = compact ? 22 : 28;  // space for fret numbers
  const stringSpacing = compact ? 16 : 22;
  const fretWidth = compact ? 48 : 64;
  const nutWidth = compact ? 4 : 6;

  const fretboardWidth = fretWidth * fretCount;
  const fretboardHeight = stringSpacing * (stringCount - 1);
  const svgWidth = leftPad + nutWidth + fretboardWidth + rightPad;
  const svgHeight = topPad + fretboardHeight + bottomPad;
  const fretboardStartX = leftPad + nutWidth;
  const dotRadius = compact ? 6.5 : 9;
  const rootDotRadius = dotRadius + (compact ? 1 : 1.5);
  const fontSize = compact ? 8 : 10;

  // String labels (high to low, top to bottom)
  const stringLabels = [...tuning].reverse().map(t => Note.pitchClass(t));

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="block"
          role="img"
          aria-label={`Guitar fretboard showing ${root} scale`}
        >
          {/* ── Nut ─────────────────────────────────── */}
          <rect
            x={leftPad}
            y={topPad - 1}
            width={nutWidth}
            height={fretboardHeight + 2}
            fill="var(--ink-primary, #1a1714)"
          />

          {/* ── Fret lines (vertical) ───────────────── */}
          {Array.from({ length: fretCount }).map((_, i) => {
            const x = fretboardStartX + (i + 1) * fretWidth;
            return (
              <line
                key={`fret-${i}`}
                x1={x}
                y1={topPad}
                x2={x}
                y2={topPad + fretboardHeight}
                stroke="var(--ink-tertiary, #9c9590)"
                strokeWidth={1}
              />
            );
          })}

          {/* ── Strings (horizontal) ─────────────────── */}
          {Array.from({ length: stringCount }).map((_, i) => {
            const y = topPad + i * stringSpacing;
            // Thicker strings for bass, thinner for treble
            const thickness = 1 + (i * 0.3);
            return (
              <line
                key={`string-${i}`}
                x1={leftPad}
                y1={y}
                x2={fretboardStartX + fretboardWidth}
                y2={y}
                stroke="var(--ink-tertiary, #9c9590)"
                strokeWidth={thickness}
              />
            );
          })}

          {/* ── Fret inlay markers ───────────────────── */}
          {Array.from({ length: fretCount }).map((_, i) => {
            const fretNum = i + 1;
            const centerX = fretboardStartX + i * fretWidth + fretWidth / 2;
            const centerY = topPad + fretboardHeight / 2;
            const markerR = compact ? 2.5 : 3.5;

            if (DOUBLE_DOTS.includes(fretNum)) {
              const offset = stringSpacing * 1.2;
              return (
                <g key={`marker-${fretNum}`}>
                  <circle cx={centerX} cy={centerY - offset} r={markerR} fill="var(--ink-disabled, #c8c4be)" opacity={0.5} />
                  <circle cx={centerX} cy={centerY + offset} r={markerR} fill="var(--ink-disabled, #c8c4be)" opacity={0.5} />
                </g>
              );
            }
            if (SINGLE_DOTS.includes(fretNum)) {
              return (
                <circle
                  key={`marker-${fretNum}`}
                  cx={centerX}
                  cy={centerY}
                  r={markerR}
                  fill="var(--ink-disabled, #c8c4be)"
                  opacity={0.5}
                />
              );
            }
            return null;
          })}

          {/* ── Scale note dots ──────────────────────── */}
          {fretboardNotes.map((n, idx) => {
            const cx = n.fret === 0
              ? leftPad - (compact ? 10 : 14)
              : fretboardStartX + (n.fret - 1) * fretWidth + fretWidth / 2;
            const cy = topPad + n.string * stringSpacing;
            const r = n.isRoot ? rootDotRadius : dotRadius;

            return (
              <g key={`note-${idx}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={n.isRoot ? 'var(--accent-color, #2d7a6e)' : 'var(--ink-primary, #1a1714)'}
                  opacity={n.isRoot ? 1 : 0.85}
                />
                {(showNoteNames || showDegrees) && (
                  <text
                    x={cx}
                    y={cy + fontSize / 3}
                    textAnchor="middle"
                    fontSize={fontSize}
                    fontFamily="var(--font-mono)"
                    fill={n.isRoot ? 'var(--accent-foreground, white)' : 'white'}
                    fontWeight={n.isRoot ? 'bold' : 'normal'}
                  >
                    {showDegrees && n.degree ? n.degree : n.note}
                  </text>
                )}
              </g>
            );
          })}

          {/* ── String labels (left side) ────────────── */}
          {stringLabels.map((label, i) => (
            <text
              key={`slabel-${i}`}
              x={leftPad - (compact ? 14 : 20)}
              y={topPad + i * stringSpacing + fontSize / 3}
              textAnchor="end"
              fontSize={fontSize}
              fontFamily="var(--font-mono)"
              fill="var(--ink-secondary, #5c5650)"
            >
              {label}
            </text>
          ))}

          {/* ── Fret numbers (below) ─────────────────── */}
          {Array.from({ length: fretCount }).map((_, i) => {
            const fretNum = i + 1;
            // Only show numbers at marker frets + fret 1
            if (fretNum !== 1 && !SINGLE_DOTS.includes(fretNum) && !DOUBLE_DOTS.includes(fretNum)) return null;
            const x = fretboardStartX + i * fretWidth + fretWidth / 2;
            return (
              <text
                key={`fnum-${i}`}
                x={x}
                y={topPad + fretboardHeight + (compact ? 14 : 18)}
                textAnchor="middle"
                fontSize={fontSize - 1}
                fontFamily="var(--font-mono)"
                fill="var(--ink-secondary, #5c5650)"
              >
                {fretNum}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

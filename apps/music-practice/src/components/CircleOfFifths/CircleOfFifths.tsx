/**
 * CircleOfFifths — Interactive SVG circle-of-fifths diagram
 *
 * Layout: circle + key info side-by-side on desktop,
 * then diatonic chord grids full-width below.
 *
 * All SVG fills use --color-* CSS vars (Tailwind v4 convention).
 */

import { useState, useMemo, useCallback } from 'react';
import {
  getKeyInfo,
  getFifthAbove,
  getFifthBelow,
} from '../../data/circle-of-fifths';
import type { CircleOfFifthsEntry } from '../../data/circle-of-fifths';
import { Badge } from '@hudak/ui/components/badge';
import { Button } from '@hudak/ui/components/button';
import { InstrumentToggle } from '../Piano/InstrumentToggle';
import { ChordDiagram } from '../ChordReference/ChordDiagram';
import { PianoChordDiagram } from '../ChordReference/PianoChordDiagram';
import { StaffDisplay } from '../notation/StaffDisplay';
import { getChordByShortName } from '../../lib/chord-library';

// ─── Constants ───────────────────────────────────────────────────────────────

const CLOCKWISE_ORDER = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F',
] as const;

const TRIAD_LABELS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] as const;
const SEVENTH_LABELS = ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7'] as const;

const CX = 200;
const CY = 200;
const OUTER_R = 170;
const MID_R = 130;
const INNER_R = 90;
const SEGMENT_COUNT = 12;
const SEGMENT_ANGLE = (2 * Math.PI) / SEGMENT_COUNT;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.sin(angleRad),
    y: cy - r * Math.cos(angleRad),
  };
}

function segmentPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startAngle: number, endAngle: number,
): string {
  const oStart = polarToCartesian(cx, cy, outerR, startAngle);
  const oEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const iStart = polarToCartesian(cx, cy, innerR, startAngle);
  const iEnd = polarToCartesian(cx, cy, innerR, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iEnd.x} ${iEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${iStart.x} ${iStart.y}`,
    'Z',
  ].join(' ');
}

function accidentalLabel(entry: CircleOfFifthsEntry): string {
  if (entry.accidentals === 0) return '0';
  if (entry.accidentals > 0) return `${entry.accidentals}♯`;
  return `${Math.abs(entry.accidentals)}♭`;
}

// ─── Chord card (renders diagram inline) ─────────────────────────────────────

interface ChordCardProps {
  chordName: string;
  label: string;
  instrument: 'guitar' | 'piano';
}

function ChordCard({ chordName, label, instrument }: ChordCardProps) {
  const chord = useMemo(() => getChordByShortName(chordName), [chordName]);
  const voicing = chord?.voicings[0];

  return (
    <div className="border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <p className="font-mono-app text-[10px] text-muted-foreground uppercase tracking-widest">
          {label}
        </p>
        <p className="text-lg font-semibold text-foreground leading-tight font-display">
          {chordName}
        </p>
      </div>

      {/* Chord diagram */}
      <div className="p-3 flex flex-col items-center">
        {chord && voicing ? (
          instrument === 'guitar' && voicing.guitar ? (
            <ChordDiagram chord={chord} voicing={voicing} />
          ) : instrument === 'piano' && voicing.piano ? (
            <>
              <PianoChordDiagram voicing={voicing} chordName={chordName} size="small" />
              {voicing.piano.notes.length > 0 && (
                <StaffDisplay notes={voicing.piano.notes} clef="treble" asChord />
              )}
            </>
          ) : (
            <p className="text-[10px] text-muted-foreground italic py-4">No {instrument} voicing</p>
          )
        ) : (
          <p className="text-[10px] text-muted-foreground italic py-4">Not in library</p>
        )}
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CircleOfFifths() {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [instrument, setInstrument] = useState<'guitar' | 'piano'>('guitar');

  const selectedEntry = useMemo(() => getKeyInfo(selectedKey), [selectedKey]);
  const fifthAbove = useMemo(() => getFifthAbove(selectedKey), [selectedKey]);
  const fifthBelow = useMemo(() => getFifthBelow(selectedKey), [selectedKey]);

  const keyEntries = useMemo(() => {
    return CLOCKWISE_ORDER.map((key) => getKeyInfo(key)!);
  }, []);

  const handleKeyClick = useCallback((key: string) => {
    setSelectedKey(key);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* ── Header ─────────────────────────────── */}
      <header>
        <h1 className="text-3xl font-display font-bold text-foreground">Circle of Fifths</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Click any key to explore its signature, chords, and relationships.
          Sharps on the right, flats on the left.
        </p>
      </header>

      {/* ── Circle + Key info — side by side on lg ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SVG Circle */}
        <div className="border border-border bg-card p-4 flex items-center justify-center">
          <svg
            viewBox="0 0 400 400"
            className="w-full max-w-[420px] h-auto"
            role="img"
            aria-label="Circle of Fifths diagram"
          >
            {/* Background circle */}
            <circle
              cx={CX} cy={CY} r={OUTER_R + 4}
              fill="none"
              stroke="hsl(var(--color-border))"
              strokeWidth="1"
            />

            {keyEntries.map((entry, i) => {
              const startAngle = i * SEGMENT_ANGLE - SEGMENT_ANGLE / 2;
              const endAngle = startAngle + SEGMENT_ANGLE;
              const midAngle = i * SEGMENT_ANGLE;

              const isSelected = entry.majorKey === selectedKey;
              const isFifthAbove = entry.majorKey === fifthAbove;
              const isFifthBelow = entry.majorKey === fifthBelow;

              const outerLabelPos = polarToCartesian(CX, CY, (OUTER_R + MID_R) / 2, midAngle);
              const innerLabelPos = polarToCartesian(CX, CY, (MID_R + INNER_R) / 2, midAngle);

              // Fills — using correct --color-* vars
              let outerFill = 'hsl(var(--color-muted))';
              let innerFill = 'hsl(var(--color-secondary))';
              let outerStroke = 'hsl(var(--color-border))';

              if (isSelected) {
                outerFill = 'var(--accent-color)';
                innerFill = 'var(--accent-light)';
                outerStroke = 'var(--accent-color)';
              } else if (isFifthAbove) {
                outerFill = 'hsl(var(--color-primary) / 0.25)';
                innerFill = 'hsl(var(--color-primary) / 0.15)';
                outerStroke = 'hsl(var(--color-primary) / 0.5)';
              } else if (isFifthBelow) {
                outerFill = 'hsl(var(--color-primary) / 0.2)';
                innerFill = 'hsl(var(--color-primary) / 0.1)';
                outerStroke = 'hsl(var(--color-primary) / 0.4)';
              }

              // Text: selected = white on accent, else foreground
              const textColor = isSelected
                ? 'hsl(var(--color-primary-foreground))'
                : 'hsl(var(--color-foreground))';

              return (
                <g
                  key={entry.majorKey}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => handleKeyClick(entry.majorKey)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${entry.majorKey} major`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleKeyClick(entry.majorKey);
                    }
                  }}
                >
                  {/* Outer ring segment (major key) */}
                  <path
                    d={segmentPath(CX, CY, OUTER_R, MID_R, startAngle, endAngle)}
                    fill={outerFill}
                    stroke={outerStroke}
                    strokeWidth={isSelected ? 2.5 : 1}
                  />
                  {/* Inner ring segment (relative minor) */}
                  <path
                    d={segmentPath(CX, CY, MID_R, INNER_R, startAngle, endAngle)}
                    fill={innerFill}
                    stroke={outerStroke}
                    strokeWidth={isSelected ? 2 : 0.5}
                  />
                  {/* Major key label */}
                  <text
                    x={outerLabelPos.x}
                    y={outerLabelPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={textColor}
                    fontSize={isSelected ? 16 : 14}
                    fontWeight={isSelected ? 700 : 600}
                    className="pointer-events-none select-none"
                  >
                    {entry.majorKey}
                  </text>
                  {/* Relative minor label */}
                  <text
                    x={innerLabelPos.x}
                    y={innerLabelPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={textColor}
                    fontSize={isSelected ? 12 : 10}
                    fontWeight={isSelected ? 600 : 400}
                    opacity={isSelected ? 1 : 0.7}
                    className="pointer-events-none select-none"
                  >
                    {entry.relativeMinor}
                  </text>
                </g>
              );
            })}

            {/* Center circle */}
            <circle
              cx={CX} cy={CY} r={INNER_R - 2}
              fill="hsl(var(--color-background))"
              stroke="hsl(var(--color-border))"
              strokeWidth={1}
            />
            {selectedEntry && (
              <>
                <text
                  x={CX} y={CY - 20}
                  textAnchor="middle" dominantBaseline="central"
                  fill="hsl(var(--color-foreground))"
                  fontSize={24} fontWeight={700}
                >
                  {selectedEntry.majorKey}
                </text>
                <text
                  x={CX} y={CY + 5}
                  textAnchor="middle" dominantBaseline="central"
                  fill="hsl(var(--color-foreground))"
                  fontSize={13} opacity={0.7}
                >
                  {selectedEntry.relativeMinor}
                </text>
                <text
                  x={CX} y={CY + 25}
                  textAnchor="middle" dominantBaseline="central"
                  fill="hsl(var(--color-foreground))"
                  fontSize={12} opacity={0.5}
                >
                  {accidentalLabel(selectedEntry)}
                </text>
              </>
            )}

            {fifthAbove && (
              <text
                x={CX} y={CY + 42}
                textAnchor="middle" dominantBaseline="central"
                fill="hsl(var(--color-muted-foreground))"
                fontSize={9}
              >
                ↻ {fifthAbove} · ↺ {fifthBelow}
              </text>
            )}
          </svg>
        </div>

        {/* Key Details Panel */}
        {selectedEntry && (
          <div className="space-y-4">
            {/* Key signature info */}
            <div className="border border-border bg-card p-4 space-y-3">
              <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                {selectedEntry.majorKey} Major
                {selectedEntry.enharmonicMajor && (
                  <Badge variant="outline" className="text-xs font-normal">
                    = {selectedEntry.enharmonicMajor} Major
                  </Badge>
                )}
              </h2>

              <div>
                <span className="text-sm text-muted-foreground">Key Signature: </span>
                {selectedEntry.accidentals === 0 ? (
                  <span className="text-sm font-medium font-mono-app">No sharps or flats</span>
                ) : (
                  <span className="text-sm font-medium font-mono-app">
                    {accidentalLabel(selectedEntry)} — {selectedEntry.accidentalNotes.join(', ')}
                  </span>
                )}
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Relative Minor: </span>
                <span className="text-sm font-medium font-mono-app">{selectedEntry.relativeMinor}</span>
                {selectedEntry.enharmonicMinor && (
                  <Badge variant="outline" className="ml-2 text-xs font-normal">
                    = {selectedEntry.enharmonicMinor}
                  </Badge>
                )}
              </div>

              {/* Fifth relationships */}
              <div className="flex gap-3 pt-1">
                {fifthBelow && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedKey(fifthBelow)}>
                    ← {fifthBelow}
                  </Button>
                )}
                {fifthAbove && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedKey(fifthAbove)}>
                    {fifthAbove} →
                  </Button>
                )}
              </div>
            </div>

            {/* Instrument toggle */}
            <div className="flex justify-center">
              <InstrumentToggle instrument={instrument} onChange={setInstrument} />
            </div>

            {/* All Keys quick selector */}
            <div className="border border-border bg-card p-4 space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono-app">
                All Keys
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {CLOCKWISE_ORDER.map((key) => {
                  const entry = getKeyInfo(key)!;
                  return (
                    <Button
                      key={key}
                      variant={key === selectedKey ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs px-2 py-1 h-auto"
                      onClick={() => setSelectedKey(key)}
                    >
                      {key}
                      <span className="ml-1 opacity-50 text-[10px]">
                        {accidentalLabel(entry)}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Diatonic chord grids — FULL WIDTH below ────── */}
      {selectedEntry && (
        <div className="space-y-6">
          {/* Diatonic Triads */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono-app">
              Diatonic Triads
            </h2>
            <div
              className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory lg:grid lg:grid-cols-7 lg:overflow-visible"
              style={{ scrollbarWidth: 'none' }}
            >
              {selectedEntry.chords.triads.map((chordName, i) => (
                <div key={chordName} className="snap-start flex-shrink-0 w-[75vw] sm:w-[240px] lg:w-auto">
                  <ChordCard
                    chordName={chordName}
                    label={TRIAD_LABELS[i]}
                    instrument={instrument}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Diatonic 7th Chords */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono-app">
              Diatonic 7th Chords
            </h2>
            <div
              className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory lg:grid lg:grid-cols-7 lg:overflow-visible"
              style={{ scrollbarWidth: 'none' }}
            >
              {selectedEntry.chords.sevenths.map((chordName, i) => (
                <div key={chordName} className="snap-start flex-shrink-0 w-[75vw] sm:w-[240px] lg:w-auto">
                  <ChordCard
                    chordName={chordName}
                    label={SEVENTH_LABELS[i]}
                    instrument={instrument}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

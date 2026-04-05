/**
 * CircleOfFifths — Interactive SVG circle-of-fifths diagram
 *
 * Shows all 12 keys arranged clockwise with major/minor labels,
 * key signature details, diatonic chords, and fifth relationships.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  CIRCLE_OF_FIFTHS,
  getKeyInfo,
  getClockwiseOrder,
  getFifthAbove,
  getFifthBelow,
} from '../../data/circle-of-fifths';
import type { CircleOfFifthsEntry } from '../../data/circle-of-fifths';
import { Card, CardContent, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Badge } from '@hudak/ui/components/badge';
import { Button } from '@hudak/ui/components/button';

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

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function segmentPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
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

// ─── Component ───────────────────────────────────────────────────────────────

export function CircleOfFifths() {
  const [selectedKey, setSelectedKey] = useState<string>('C');

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
    <div className="flex flex-col gap-6">
      {/* Title */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">Circle of Fifths</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Click any key to explore its signature, chords, and relationships.
            Sharps are on the right, flats on the left.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SVG Circle */}
        <Card>
          <CardContent className="flex items-center justify-center p-4">
            <svg
              viewBox="0 0 400 400"
              className="w-full max-w-[480px] h-auto"
              role="img"
              aria-label="Circle of Fifths diagram"
            >
              {/* Background circle */}
              <circle cx={CX} cy={CY} r={OUTER_R + 4} fill="none" stroke="currentColor" strokeWidth="1" opacity={0.15} />

              {keyEntries.map((entry, i) => {
                const startAngle = i * SEGMENT_ANGLE - SEGMENT_ANGLE / 2;
                const endAngle = startAngle + SEGMENT_ANGLE;
                const midAngle = i * SEGMENT_ANGLE;

                const isSelected = entry.majorKey === selectedKey;
                const isFifthAbove = entry.majorKey === fifthAbove;
                const isFifthBelow = entry.majorKey === fifthBelow;

                // Positions for labels
                const outerLabelPos = polarToCartesian(CX, CY, (OUTER_R + MID_R) / 2, midAngle);
                const innerLabelPos = polarToCartesian(CX, CY, (MID_R + INNER_R) / 2, midAngle);
                const accLabelPos = polarToCartesian(CX, CY, INNER_R - 16, midAngle);

                // Colors
                let outerFill = 'hsl(var(--muted))';
                let innerFill = 'hsl(var(--muted) / 0.5)';
                let outerStroke = 'hsl(var(--border))';

                if (isSelected) {
                  outerFill = 'var(--accent-color, hsl(var(--primary)))';
                  innerFill = 'var(--accent-color, hsl(var(--primary) / 0.7))';
                  outerStroke = 'var(--accent-color, hsl(var(--primary)))';
                } else if (isFifthAbove) {
                  outerFill = 'hsl(var(--primary) / 0.25)';
                  innerFill = 'hsl(var(--primary) / 0.15)';
                  outerStroke = 'hsl(var(--primary) / 0.5)';
                } else if (isFifthBelow) {
                  outerFill = 'hsl(var(--primary) / 0.2)';
                  innerFill = 'hsl(var(--primary) / 0.1)';
                  outerStroke = 'hsl(var(--primary) / 0.4)';
                }

                const textColor = isSelected
                  ? 'hsl(var(--primary-foreground))'
                  : 'currentColor';

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

              {/* Center circle with accidental info */}
              <circle
                cx={CX}
                cy={CY}
                r={INNER_R - 2}
                fill="hsl(var(--background))"
                stroke="hsl(var(--border))"
                strokeWidth={1}
              />
              {selectedEntry && (
                <>
                  <text
                    x={CX}
                    y={CY - 20}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="currentColor"
                    fontSize={24}
                    fontWeight={700}
                  >
                    {selectedEntry.majorKey}
                  </text>
                  <text
                    x={CX}
                    y={CY + 5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="currentColor"
                    fontSize={13}
                    opacity={0.7}
                  >
                    {selectedEntry.relativeMinor}
                  </text>
                  <text
                    x={CX}
                    y={CY + 25}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="currentColor"
                    fontSize={12}
                    opacity={0.5}
                  >
                    {accidentalLabel(selectedEntry)}
                  </text>
                </>
              )}

              {/* Relationship arrows/labels */}
              {fifthAbove && (
                <text
                  x={CX}
                  y={CY + 42}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="currentColor"
                  fontSize={9}
                  opacity={0.4}
                >
                  ↻ {fifthAbove} · ↺ {fifthBelow}
                </text>
              )}
            </svg>
          </CardContent>
        </Card>

        {/* Key Details Panel */}
        {selectedEntry && (
          <div className="flex flex-col gap-4">
            {/* Key signature */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {selectedEntry.majorKey} Major
                  {selectedEntry.enharmonicMajor && (
                    <Badge variant="outline" className="text-xs font-normal">
                      = {selectedEntry.enharmonicMajor} Major
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Accidentals */}
                <div>
                  <span className="text-sm text-muted-foreground">Key Signature: </span>
                  {selectedEntry.accidentals === 0 ? (
                    <span className="text-sm font-medium">No sharps or flats</span>
                  ) : (
                    <span className="text-sm font-medium">
                      {accidentalLabel(selectedEntry)} — {selectedEntry.accidentalNotes.join(', ')}
                    </span>
                  )}
                </div>

                {/* Relative minor */}
                <div>
                  <span className="text-sm text-muted-foreground">Relative Minor: </span>
                  <span className="text-sm font-medium">{selectedEntry.relativeMinor}</span>
                  {selectedEntry.enharmonicMinor && (
                    <Badge variant="outline" className="ml-2 text-xs font-normal">
                      = {selectedEntry.enharmonicMinor}
                    </Badge>
                  )}
                </div>

                {/* Fifth relationships */}
                <div className="flex gap-4">
                  {fifthBelow && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedKey(fifthBelow)}
                    >
                      ← Fifth below: {fifthBelow}
                    </Button>
                  )}
                  {fifthAbove && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedKey(fifthAbove)}
                    >
                      Fifth above: {fifthAbove} →
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Diatonic Triads */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Diatonic Triads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.chords.triads.map((chord, i) => (
                    <div key={chord} className="flex-1 min-w-[3.5rem] text-center rounded-lg border border-border/50 bg-muted/30 py-2 px-1">
                      <div className="text-[10px] text-muted-foreground mb-1.5">
                        {TRIAD_LABELS[i]}
                      </div>
                      <Badge
                        variant={i === 0 ? 'default' : 'secondary'}
                        className="text-xs w-full justify-center whitespace-nowrap"
                      >
                        {chord}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Diatonic 7th Chords */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Diatonic 7th Chords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.chords.sevenths.map((chord, i) => (
                    <div key={chord} className="flex-1 min-w-[3.5rem] text-center rounded-lg border border-border/50 bg-muted/30 py-2 px-1">
                      <div className="text-[10px] text-muted-foreground mb-1.5">
                        {SEVENTH_LABELS[i]}
                      </div>
                      <Badge
                        variant={i === 0 ? 'default' : 'secondary'}
                        className="text-xs w-full justify-center whitespace-nowrap"
                      >
                        {chord}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick key selector */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">All Keys</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@hudak/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { cn } from '@hudak/ui/lib/utils';
import type { Chord } from '@/lib/chord-library';
import {
  buildScaleChords,
  getChordFromLibrary,
  getChordName,
  SCALE_TYPE_NAMES,
  type Degree,
  type ScaleType,
} from '@/data/chord-scale-matrix';
import { ChordVoicingDisplay } from '../ChordScaleGame/ChordVoicingDisplay';

type RingFocus = 'major' | 'minor';
type MinorMode = 'relative' | 'independent';
type InstrumentMode = 'guitar' | 'piano';

const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'] as const;
const MINOR_KEYS = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'] as const;
const SCALE_TYPES: ScaleType[] = ['major', 'naturalMinor', 'melodicMinor', 'harmonicMinor'];

function normalizeIndex(index: number) {
  return ((index % 12) + 12) % 12;
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function ringSegmentPath(index: number, innerR: number, outerR: number) {
  const start = -90 + index * 30;
  const end = start + 30;

  const p1 = polarToCartesian(210, 210, outerR, start);
  const p2 = polarToCartesian(210, 210, outerR, end);
  const p3 = polarToCartesian(210, 210, innerR, end);
  const p4 = polarToCartesian(210, 210, innerR, start);

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${outerR} ${outerR} 0 0 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${innerR} ${innerR} 0 0 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

function useChordFromLibrary(chordId: string | undefined) {
  const [chord, setChord] = useState<Chord | null>(null);

  useEffect(() => {
    if (!chordId) {
      setChord(null);
      return;
    }
    let cancelled = false;
    getChordFromLibrary(chordId).then((c) => {
      if (!cancelled) setChord(c ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [chordId]);

  return chord;
}

export function CircleOfFifthsPage() {
  const [majorIndex, setMajorIndex] = useState(0);
  const [minorIndex, setMinorIndex] = useState(0);
  const [ringFocus, setRingFocus] = useState<RingFocus>('major');
  const [minorMode, setMinorMode] = useState<MinorMode>('relative');
  const [scaleType, setScaleType] = useState<ScaleType>('major');
  const [selectedDegree, setSelectedDegree] = useState<Degree>(1);
  const [instrument, setInstrument] = useState<InstrumentMode>('guitar');

  const selectedMajor = MAJOR_KEYS[majorIndex];
  const selectedMinorIndex = minorMode === 'relative' ? majorIndex : minorIndex;
  const selectedMinor = MINOR_KEYS[selectedMinorIndex];

  const degreeEntries = useMemo(() => buildScaleChords(scaleType), [scaleType]);

  const chords = useMemo(
    () => degreeEntries.map((entry) => ({
      degree: entry.degree,
      label: getChordName(scaleType, entry.degree, selectedMajor),
      chordId: entry.chordId,
    })),
    [degreeEntries, scaleType, selectedMajor]
  );

  const activeChordId = chords.find((c) => c.degree === selectedDegree)?.chordId;
  const activeChord = useChordFromLibrary(activeChordId);

  useEffect(() => {
    setSelectedDegree(1);
  }, [scaleType, selectedMajor]);

  const moveClockwise = (direction: 1 | -1) => {
    if (ringFocus === 'major' || minorMode === 'relative') {
      setMajorIndex((prev) => normalizeIndex(prev + direction));
    } else {
      setMinorIndex((prev) => normalizeIndex(prev + direction));
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        moveClockwise(-1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        moveClockwise(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setRingFocus('major');
        break;
      case 'ArrowDown':
        e.preventDefault();
        setRingFocus('minor');
        if (minorMode === 'relative') {
          setMinorIndex(majorIndex);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8">
        <Card className="border-border/70 shadow-[var(--shadow-warm-md)]">
          <CardHeader className="space-y-2 pb-3 sm:pb-4">
            <CardTitle className="font-display text-2xl sm:text-3xl text-foreground">Circle of Fifths</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Segmented circle + chord visualization. Arrow keys: ←/→ rotate, ↑/↓ switch outer/inner ring focus.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3" role="group" aria-label="Minor ring behavior">
              <span className="text-xs uppercase tracking-[0.12em] text-[var(--ink-tertiary)] font-mono-app">Minor ring</span>
              <Button
                variant={minorMode === 'relative' ? 'default' : 'outline'}
                className={cn('min-h-11', minorMode === 'relative' && 'bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white')}
                onClick={() => {
                  setMinorMode('relative');
                  setMinorIndex(majorIndex);
                }}
              >
                Relative
              </Button>
              <Button
                variant={minorMode === 'independent' ? 'default' : 'outline'}
                className={cn('min-h-11', minorMode === 'independent' && 'bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white')}
                onClick={() => setMinorMode('independent')}
              >
                Independent
              </Button>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Scale type">
              {SCALE_TYPES.map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={scaleType === type ? 'default' : 'outline'}
                  onClick={() => setScaleType(type)}
                  className={cn(scaleType === type && 'bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white')}
                >
                  {SCALE_TYPE_NAMES[type]}
                </Button>
              ))}
            </div>

            <div
              tabIndex={0}
              onKeyDown={onKeyDown}
              className="rounded-2xl border border-border/70 bg-card p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]/50 sm:p-4"
              aria-label="Interactive circle of fifths"
            >
              <svg viewBox="0 0 420 420" className="mx-auto w-full max-w-[360px] sm:max-w-[420px]">
                {MAJOR_KEYS.map((key, i) => {
                  const selected = i === majorIndex;
                  const angle = -90 + i * 30 + 15;
                  const labelPoint = polarToCartesian(210, 210, 160, angle);
                  return (
                    <g key={key} onClick={() => { setMajorIndex(i); setRingFocus('major'); }} className="cursor-pointer">
                      <path
                        d={ringSegmentPath(i, 132, 192)}
                        fill={selected ? 'var(--accent-color)' : 'hsl(var(--color-card))'}
                        stroke={'hsl(var(--color-border))'}
                        strokeWidth="1.2"
                      />
                      <text
                        x={labelPoint.x}
                        y={labelPoint.y + 4}
                        textAnchor="middle"
                        fontSize="14"
                        fill={selected ? '#fff' : 'var(--ink-primary)'}
                        fontWeight={selected ? '700' : '500'}
                      >
                        {key}
                      </text>
                    </g>
                  );
                })}

                {MINOR_KEYS.map((key, i) => {
                  const selected = i === selectedMinorIndex;
                  const angle = -90 + i * 30 + 15;
                  const labelPoint = polarToCartesian(210, 210, 112, angle);
                  return (
                    <g
                      key={key}
                      onClick={() => {
                        setRingFocus('minor');
                        if (minorMode === 'independent') {
                          setMinorIndex(i);
                        } else {
                          setMajorIndex(i);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <path
                        d={ringSegmentPath(i, 84, 126)}
                        fill={selected ? 'var(--accent-light)' : 'hsl(var(--color-secondary))'}
                        stroke={'hsl(var(--color-border))'}
                        strokeWidth="1"
                      />
                      <text
                        x={labelPoint.x}
                        y={labelPoint.y + 3}
                        textAnchor="middle"
                        fontSize="12"
                        fill={selected ? 'var(--accent-color)' : 'var(--ink-secondary)'}
                        fontWeight={selected ? '700' : '500'}
                      >
                        {key}
                      </text>
                    </g>
                  );
                })}

                <circle cx="210" cy="210" r="72" fill="hsl(var(--color-background))" stroke="hsl(var(--color-border))" />
                <text x="210" y="192" textAnchor="middle" fill="var(--ink-secondary)" fontSize="12">{SCALE_TYPE_NAMES[scaleType]}</text>
                <text x="210" y="216" textAnchor="middle" fill="var(--ink-primary)" fontSize="26">{selectedMajor}</text>
                <text x="210" y="236" textAnchor="middle" fill="var(--ink-tertiary)" fontSize="11">Relative: {selectedMinor}</text>
              </svg>
            </div>

            <Card className="border-border/70 bg-card shadow-[var(--shadow-warm-sm)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display">{selectedMajor} · {SCALE_TYPE_NAMES[scaleType]} chord set</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                  {chords.map((chord) => (
                    <button
                      key={`${chord.degree}-${chord.label}`}
                      type="button"
                      onClick={() => setSelectedDegree(chord.degree)}
                      className={cn(
                        'rounded-md border px-3 py-2 text-left transition',
                        selectedDegree === chord.degree
                          ? 'border-[var(--accent-color)] bg-[var(--accent-light)]'
                          : 'border-border/60 bg-secondary hover:bg-secondary/80'
                      )}
                    >
                      <div className="text-[10px] uppercase tracking-wider text-[var(--ink-tertiary)]">Degree {chord.degree}</div>
                      <div className="text-sm font-medium">{chord.label}</div>
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={instrument === 'guitar' ? 'default' : 'outline'}
                    onClick={() => setInstrument('guitar')}
                  >
                    Guitar
                  </Button>
                  <Button
                    size="sm"
                    variant={instrument === 'piano' ? 'default' : 'outline'}
                    onClick={() => setInstrument('piano')}
                  >
                    Piano
                  </Button>
                </div>

                {activeChord ? (
                  <ChordVoicingDisplay
                    chord={activeChord}
                    externalInstrument={instrument}
                    onInstrumentChange={setInstrument}
                  />
                ) : (
                  <p className="text-sm text-[var(--ink-tertiary)]">
                    Chord visualization unavailable for this quality in the current library.
                  </p>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

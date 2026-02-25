import { useMemo, useState } from 'react';
import { Button } from '@hudak/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { cn } from '@hudak/ui/lib/utils';

type RingFocus = 'major' | 'minor';
type MinorMode = 'relative' | 'independent';

const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'D♭', 'A♭', 'E♭', 'B♭', 'F'] as const;
const MINOR_KEYS = ['Am', 'Em', 'Bm', 'F♯m', 'C♯m', 'G♯m', 'E♭m', 'B♭m', 'Fm', 'Cm', 'Gm', 'Dm'] as const;

const DIATONIC_CHORDS: Record<string, string[]> = {
  C: ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7♭5'],
  G: ['Gmaj7', 'Am7', 'Bm7', 'Cmaj7', 'D7', 'Em7', 'F♯m7♭5'],
  D: ['Dmaj7', 'Em7', 'F♯m7', 'Gmaj7', 'A7', 'Bm7', 'C♯m7♭5'],
  A: ['Amaj7', 'Bm7', 'C♯m7', 'Dmaj7', 'E7', 'F♯m7', 'G♯m7♭5'],
  E: ['Emaj7', 'F♯m7', 'G♯m7', 'Amaj7', 'B7', 'C♯m7', 'D♯m7♭5'],
  B: ['Bmaj7', 'C♯m7', 'D♯m7', 'Emaj7', 'F♯7', 'G♯m7', 'A♯m7♭5'],
  'F♯': ['F♯maj7', 'G♯m7', 'A♯m7', 'Bmaj7', 'C♯7', 'D♯m7', 'Fm7♭5'],
  'D♭': ['D♭maj7', 'E♭m7', 'Fm7', 'G♭maj7', 'A♭7', 'B♭m7', 'Cm7♭5'],
  'A♭': ['A♭maj7', 'B♭m7', 'Cm7', 'D♭maj7', 'E♭7', 'Fm7', 'Gm7♭5'],
  'E♭': ['E♭maj7', 'Fm7', 'Gm7', 'A♭maj7', 'B♭7', 'Cm7', 'Dm7♭5'],
  'B♭': ['B♭maj7', 'Cm7', 'Dm7', 'E♭maj7', 'F7', 'Gm7', 'Am7♭5'],
  F: ['Fmaj7', 'Gm7', 'Am7', 'B♭maj7', 'C7', 'Dm7', 'Em7♭5'],
};

function normalizeIndex(index: number) {
  return ((index % 12) + 12) % 12;
}

export function CircleOfFifthsPage() {
  const [majorIndex, setMajorIndex] = useState(0);
  const [minorIndex, setMinorIndex] = useState(0);
  const [ringFocus, setRingFocus] = useState<RingFocus>('major');
  const [minorMode, setMinorMode] = useState<MinorMode>('relative');

  const selectedMajor = MAJOR_KEYS[majorIndex];
  const selectedMinorIndex = minorMode === 'relative' ? majorIndex : minorIndex;
  const selectedMinor = MINOR_KEYS[selectedMinorIndex];

  const chords = useMemo(() => DIATONIC_CHORDS[selectedMajor] ?? [], [selectedMajor]);

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
              Use arrow keys to move around the circle (←/→ = clockwise/counterclockwise, ↑/↓ = major/minor ring).
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

            <div
              tabIndex={0}
              onKeyDown={onKeyDown}
              className="rounded-2xl border border-border/70 bg-card p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]/50 sm:p-4"
              aria-label="Interactive circle of fifths"
            >
              <svg viewBox="0 0 420 420" className="mx-auto w-full max-w-[360px] sm:max-w-[420px]">
                {MAJOR_KEYS.map((key, i) => {
                  const angle = ((i - 3) * 30 * Math.PI) / 180;
                  const x = 210 + Math.cos(angle) * 156;
                  const y = 210 + Math.sin(angle) * 156;
                  const selected = i === majorIndex;
                  return (
                    <g key={key} onClick={() => { setMajorIndex(i); setRingFocus('major'); }} className="cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r={22}
                        fill={selected ? 'var(--accent-color)' : 'hsl(var(--color-card))'}
                        stroke={selected ? 'var(--accent-color)' : 'hsl(var(--color-border))'}
                        strokeWidth="1.5"
                      />
                      <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fill={selected ? '#fff' : 'var(--ink-primary)'}>{key}</text>
                    </g>
                  );
                })}

                {MINOR_KEYS.map((key, i) => {
                  const angle = ((i - 3) * 30 * Math.PI) / 180;
                  const x = 210 + Math.cos(angle) * 108;
                  const y = 210 + Math.sin(angle) * 108;
                  const selected = i === selectedMinorIndex;
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
                      <circle
                        cx={x}
                        cy={y}
                        r={17}
                        fill={selected ? 'var(--accent-light)' : 'hsl(var(--color-secondary))'}
                        stroke={selected ? 'var(--accent-color)' : 'hsl(var(--color-border))'}
                        strokeWidth="1.25"
                      />
                      <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fill={selected ? 'var(--accent-color)' : 'var(--ink-secondary)'}>{key}</text>
                    </g>
                  );
                })}

                <circle cx="210" cy="210" r="62" fill="hsl(var(--color-background))" stroke="hsl(var(--color-border))" />
                <text x="210" y="200" textAnchor="middle" fill="var(--ink-secondary)" fontSize="12">Selected Key</text>
                <text x="210" y="223" textAnchor="middle" fill="var(--ink-primary)" fontSize="26">{selectedMajor}</text>
                <text x="210" y="242" textAnchor="middle" fill="var(--ink-tertiary)" fontSize="11">Relative: {selectedMinor}</text>
              </svg>
            </div>

            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <Card className="border-border/70 bg-card shadow-[var(--shadow-warm-sm)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display">{selectedMajor} major diatonic chords</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-2 gap-2 text-sm sm:text-base">
                    {chords.map((chord) => (
                      <li key={chord} className="rounded-md border border-border/60 bg-secondary px-3 py-2">{chord}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card shadow-[var(--shadow-warm-sm)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-[var(--ink-secondary)] space-y-2">
                  <p>• Ring focus: <span className="text-foreground">{ringFocus === 'major' ? 'Major (outer)' : 'Minor (inner)'}</span></p>
                  <p>• Minor mode: <span className="text-foreground">{minorMode === 'relative' ? 'Relative to selected major' : 'Independent minor selection'}</span></p>
                  <p>• Mobile spacing tightened for small screens while keeping 44px tap targets.</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

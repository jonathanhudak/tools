/**
 * Progression Library — browse, transpose, and play every progression
 * in the registry. Includes guide-tone display and "all 12 keys" cycling.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@hudak/ui/components/badge';
import { Button } from '@hudak/ui/components/button';
import { Play, Square, Repeat, ArrowRight } from 'lucide-react';
import {
  PROGRESSION_REGISTRY,
  type ProgressionDefinition,
  type ProgressionFamily,
} from '@/data/progressions/progression-registry';
import { resolveProgression, guideTones, type ResolvedChord } from '@/lib/theory/roman';
import { playChordSequence, type PlaybackHandle } from '@/lib/audio/player';

const FAMILIES: ProgressionFamily[] = ['jazz', 'blues', 'pop', 'classical', 'modal'];
const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
/** Circle-of-fifths order for key cycling */
const FIFTHS = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'B', 'E', 'A', 'D', 'G'];

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  advanced: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

export function ProgressionLibrary(): JSX.Element {
  const [family, setFamily] = useState<ProgressionFamily>('jazz');
  const [selectedId, setSelectedId] = useState<string>('ii-V-I-major');
  const [musicKey, setMusicKey] = useState('C');
  const [bpm, setBpm] = useState(90);
  const [loop, setLoop] = useState(false);
  const [cycleKeys, setCycleKeys] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [playingStep, setPlayingStep] = useState<number | null>(null);
  const handleRef = useRef<PlaybackHandle | null>(null);
  const keyRef = useRef(musicKey);
  keyRef.current = musicKey;

  const progressions = useMemo(
    () => PROGRESSION_REGISTRY.filter(p => p.family === family),
    [family],
  );
  const selected: ProgressionDefinition | undefined = useMemo(
    () =>
      PROGRESSION_REGISTRY.find(p => p.id === selectedId) ?? progressions[0],
    [selectedId, progressions],
  );
  const resolved: ResolvedChord[] = useMemo(
    () => (selected ? resolveProgression(musicKey, selected.steps.map(s => s.romanNumeral)) : []),
    [selected, musicKey],
  );

  const stop = () => {
    handleRef.current?.stop();
    handleRef.current = null;
    setPlayingStep(null);
  };
  useEffect(() => stop, []);
  // stop when switching progressions
  useEffect(() => {
    stop();
  }, [selectedId]);

  const play = () => {
    if (!selected) return;
    stop();
    const startPass = (key: string) => {
      const chords = resolveProgression(key, selected.steps.map(s => s.romanNumeral));
      handleRef.current = playChordSequence(
        chords.map((c, i) => ({ midis: c.midis, beats: selected.steps[i]?.bars ? selected.steps[i].bars * 4 : 4 })),
        bpm,
        {
          loop: false,
          onStep: i => setPlayingStep(i),
          onCycle: () => {
            if (cycleKeys) {
              const next = FIFTHS[(FIFTHS.indexOf(keyRef.current) + 1 + FIFTHS.length) % FIFTHS.length];
              setMusicKey(next);
              startPass(next);
            } else if (loop) {
              startPass(keyRef.current);
            } else {
              setPlayingStep(null);
            }
          },
        },
      );
    };
    startPass(musicKey);
  };

  return (
    <div className="space-y-6">
      {/* Family filter */}
      <div className="flex flex-wrap gap-1.5">
        {FAMILIES.map(f => (
          <button
            key={f}
            onClick={() => setFamily(f)}
            className={`min-h-11 px-4 py-1.5 text-xs font-medium capitalize rounded-full border-2 transition-colors ${
              family === f
                ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-white'
                : 'border-[var(--border-subtle)] bg-card hover:border-[var(--accent-color)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Progression list */}
        <div className="space-y-1.5 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-2">
          {progressions.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full min-h-11 text-left p-3 rounded-lg border transition-colors ${
                selected?.id === p.id
                  ? 'border-[var(--accent-color)] bg-[var(--accent-light)]'
                  : 'border-[var(--border-subtle)] bg-card hover:border-[var(--accent-color)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{p.name}</span>
                <Badge className={`text-[9px] shrink-0 ${DIFFICULTY_COLOR[p.difficulty]}`}>
                  {p.difficulty}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {p.steps.map(s => s.romanNumeral).join(' → ')}
              </p>
            </button>
          ))}
        </div>

        {/* Detail + player */}
        {selected && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                {selected.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
            </div>

            {/* Key + tempo controls */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Key</label>
                <select
                  value={musicKey}
                  onChange={e => setMusicKey(e.target.value)}
                  className="min-h-11 px-3 text-sm font-mono bg-card border border-[var(--border-subtle)] rounded-md"
                >
                  {KEYS.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Tempo</label>
                <input
                  type="range"
                  min={50}
                  max={200}
                  value={bpm}
                  onChange={e => setBpm(Number(e.target.value))}
                  className="accent-[var(--accent-color)] w-28"
                />
                <span className="text-xs font-mono w-14">{bpm} bpm</span>
              </div>
            </div>

            {/* Chord cards */}
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
              {resolved.map((c, i) => {
                const guides = showGuides ? guideTones(c.symbol) : null;
                const next = showGuides ? resolved[i + 1] : undefined;
                const nextGuides = next ? guideTones(next.symbol) : null;
                return (
                  <div
                    key={`${c.symbol}-${i}`}
                    className={`min-w-[120px] snap-start rounded-xl border-2 p-3 text-center transition-colors ${
                      playingStep === i
                        ? 'border-[var(--accent-color)] bg-[var(--accent-light)]'
                        : 'border-[var(--border-subtle)] bg-card'
                    }`}
                  >
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">{c.numeral}</p>
                    <p className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                      {c.symbol}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-1">
                      {c.notes.join(' ')}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {selected.steps[i]?.bars ?? 1} bar{(selected.steps[i]?.bars ?? 1) > 1 ? 's' : ''}
                    </p>
                    {guides && (
                      <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono space-y-0.5">
                        <p>
                          3rd: <strong>{guides.third ?? '—'}</strong>
                          {nextGuides?.seventh && guides.third && (
                            <span className="text-muted-foreground"> → {nextGuides.seventh}</span>
                          )}
                        </p>
                        <p>
                          7th: <strong>{guides.seventh ?? '—'}</strong>
                          {nextGuides?.third && guides.seventh && (
                            <span className="text-muted-foreground"> → {nextGuides.third}</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Transport */}
            <div className="flex flex-wrap items-center gap-2">
              {playingStep === null ? (
                <Button onClick={play} size="lg" className="gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white">
                  <Play className="w-4 h-4" /> Play
                </Button>
              ) : (
                <Button onClick={stop} size="lg" variant="outline" className="gap-2">
                  <Square className="w-4 h-4" /> Stop
                </Button>
              )}
              <Button
                variant={loop && !cycleKeys ? 'default' : 'outline'}
                size="lg"
                className="gap-2"
                onClick={() => { setLoop(!loop); setCycleKeys(false); }}
              >
                <Repeat className="w-4 h-4" /> Loop
              </Button>
              <Button
                variant={cycleKeys ? 'default' : 'outline'}
                size="lg"
                className="gap-2"
                onClick={() => { setCycleKeys(!cycleKeys); setLoop(false); }}
                title="After each pass, transpose around the circle of fifths"
              >
                <ArrowRight className="w-4 h-4" /> All 12 keys
              </Button>
              <Button
                variant={showGuides ? 'default' : 'outline'}
                size="lg"
                onClick={() => setShowGuides(!showGuides)}
                title="Show 3rds and 7ths — the voice-leading skeleton"
              >
                Guide tones
              </Button>
            </div>
            {cycleKeys && (
              <p className="text-xs text-muted-foreground">
                Cycling around the circle of fifths: after each pass the key moves C → F → B♭ → …
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

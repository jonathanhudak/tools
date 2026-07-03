/**
 * ProgressionPlayer — the full progression reference block: key + tempo
 * controls, chord cards with guide tones, transport (play / loop / all-12-keys),
 * and tap-a-chord voicing diagrams (guitar tab, piano, staff notation).
 * Shared by the Progression Library and the improv practice prompt.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@hudak/ui/components/button';
import { Play, Square, Repeat, ArrowRight } from 'lucide-react';
import type { ProgressionDefinition } from '@/data/progressions/progression-registry';
import { resolveProgression, guideTones, type ResolvedChord } from '@/lib/theory/roman';
import { playChordSequence, type PlaybackHandle } from '@/lib/audio/player';
import { getChordByShortName } from '@/lib/chord-library';
import { ChordVoicingDisplay } from '../ChordScaleGame/ChordVoicingDisplay';

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
/** Circle-of-fifths order for key cycling */
const FIFTHS = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'B', 'E', 'A', 'D', 'G'];

interface ProgressionPlayerProps {
  progression: ProgressionDefinition;
  musicKey: string;
  onKeyChange: (key: string) => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
}

export function ProgressionPlayer({
  progression,
  musicKey,
  onKeyChange,
  bpm,
  onBpmChange,
}: ProgressionPlayerProps): JSX.Element {
  const [loop, setLoop] = useState(false);
  const [cycleKeys, setCycleKeys] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [playingStep, setPlayingStep] = useState<number | null>(null);
  const [voicingStep, setVoicingStep] = useState<number | null>(null);
  const handleRef = useRef<PlaybackHandle | null>(null);
  const keyRef = useRef(musicKey);
  keyRef.current = musicKey;

  const resolved: ResolvedChord[] = useMemo(
    () => resolveProgression(musicKey, progression.steps.map(s => s.romanNumeral)),
    [progression, musicKey],
  );

  const voicingChord = useMemo(
    () => (voicingStep !== null && resolved[voicingStep] ? getChordByShortName(resolved[voicingStep].symbol) : undefined),
    [voicingStep, resolved],
  );

  const stop = () => {
    handleRef.current?.stop();
    handleRef.current = null;
    setPlayingStep(null);
  };
  useEffect(() => stop, []);
  // stop + close voicing when switching progressions
  useEffect(() => {
    stop();
    setVoicingStep(null);
  }, [progression.id]);

  const play = () => {
    stop();
    const startPass = (key: string) => {
      const chords = resolveProgression(key, progression.steps.map(s => s.romanNumeral));
      handleRef.current = playChordSequence(
        chords.map((c, i) => ({ midis: c.midis, beats: progression.steps[i]?.bars ? progression.steps[i].bars * 4 : 4 })),
        bpm,
        {
          loop: false,
          onStep: i => setPlayingStep(i),
          onCycle: () => {
            if (cycleKeys) {
              const next = FIFTHS[(FIFTHS.indexOf(keyRef.current) + 1 + FIFTHS.length) % FIFTHS.length];
              onKeyChange(next);
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
    <div className="space-y-4">
      {/* Key + tempo controls */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex items-center gap-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Key</label>
          <select
            value={musicKey}
            onChange={e => onKeyChange(e.target.value)}
            className="min-h-11 px-3 text-sm font-mono bg-card border border-[var(--border-subtle)] rounded-md"
          >
            {(KEYS.includes(musicKey) ? KEYS : [musicKey, ...KEYS]).map(k => (
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
            onChange={e => onBpmChange(Number(e.target.value))}
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
            <button
              key={`${c.symbol}-${i}`}
              onClick={() => setVoicingStep(voicingStep === i ? null : i)}
              title="Show voicing diagrams"
              className={`min-w-[120px] snap-start rounded-xl border-2 p-3 text-center transition-colors ${
                playingStep === i
                  ? 'border-[var(--accent-color)] bg-[var(--accent-light)]'
                  : voicingStep === i
                    ? 'border-[var(--accent-color)] bg-card'
                    : 'border-[var(--border-subtle)] bg-card hover:border-[var(--accent-color)]'
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
                {progression.steps[i]?.bars ?? 1} bar{(progression.steps[i]?.bars ?? 1) > 1 ? 's' : ''}
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
            </button>
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

      {/* Tapped-chord voicing diagrams */}
      {voicingStep !== null && (
        voicingChord ? (
          <ChordVoicingDisplay chord={voicingChord} />
        ) : (
          <p className="text-sm text-muted-foreground border border-[var(--border-subtle)] rounded-xl p-4">
            No voicing diagrams in the chord library yet for{' '}
            <span className="font-mono">{resolved[voicingStep]?.symbol}</span>.
          </p>
        )
      )}
    </div>
  );
}

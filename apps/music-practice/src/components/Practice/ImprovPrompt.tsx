/**
 * Improv Prompt Generator — deals practice cards combining key, scale,
 * progression, constraint, and tempo. Lock any axis and re-deal the rest.
 * The dealt scale and progression render with the full reference UX:
 * staff notation, piano + fretboard diagrams, and the progression player.
 */

import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { Shuffle, Lock, LockOpen, Waves, Play, Music2 } from 'lucide-react';
import { Note } from 'tonal';
import { SCALE_REGISTRY } from '@/data/scales/scale-registry';
import { PROGRESSION_REGISTRY } from '@/data/progressions/progression-registry';
import { resolveForScale } from '@/data/enharmonics';
import { Drone, playMelody, type PlaybackHandle } from '@/lib/audio/player';
import { ScaleDetailPanel } from '../shared/ScaleDetailPanel';
import { ProgressionPlayer } from '../shared/ProgressionPlayer';

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

/** Scales worth improvising over (skip the most exotic bebop/world entries). */
const SCALE_IDS = [
  'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian',
  'melodic-minor', 'harmonic-minor', 'harmonic-major',
  'lydian-dominant', 'altered', 'phrygian-dominant',
  'major-pentatonic', 'minor-pentatonic', 'minor-blues', 'major-blues',
  'whole-tone', 'hirajoshi',
];

const CONSTRAINTS = [
  'Only chord tones — no passing notes',
  'Start every phrase on the 3rd',
  'Start every phrase on the b7',
  'End every phrase on the root',
  'Rhythm: only quarter notes and rests',
  'Rhythm: dotted-quarter + eighth pulses',
  'Leave two beats of silence between phrases',
  'Play only on strings 1–3 / right hand only',
  'Maximum 4 notes per phrase',
  'Use one motif, vary it every repeat',
  'No root notes anywhere',
  'Descending lines only',
  'Call and response: 1 bar question, 1 bar answer',
  'Double every note',
  'Target the 9th on every chord change',
  'Play behind the beat all the way through',
];

const TEMPOS = [60, 70, 80, 90, 100, 120, 140, 160];

interface Prompt {
  key: string;
  scaleId: string;
  progressionId: string;
  constraint: string;
  tempo: number;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dealPrompt(prev: Prompt | null, locks: Set<keyof Prompt>): Prompt {
  return {
    key: locks.has('key') && prev ? prev.key : pick(KEYS),
    scaleId: locks.has('scaleId') && prev ? prev.scaleId : pick(SCALE_IDS),
    progressionId:
      locks.has('progressionId') && prev ? prev.progressionId : pick(PROGRESSION_REGISTRY).id,
    constraint: locks.has('constraint') && prev ? prev.constraint : pick(CONSTRAINTS),
    tempo: locks.has('tempo') && prev ? prev.tempo : pick(TEMPOS),
  };
}

export function ImprovPrompt(): JSX.Element {
  const [locks, setLocks] = useState<Set<keyof Prompt>>(new Set());
  const [prompt, setPrompt] = useState<Prompt>(() => dealPrompt(null, new Set()));
  const [droneOn, setDroneOn] = useState(false);
  const [drone] = useState(() => new Drone());
  const [playHandle, setPlayHandle] = useState<PlaybackHandle | null>(null);
  // Progression key/tempo start from the prompt but stay adjustable in the player
  const [progressionKey, setProgressionKey] = useState(prompt.key);
  const [bpm, setBpm] = useState(prompt.tempo);

  const scale = SCALE_REGISTRY.find(s => s.id === prompt.scaleId);
  const progression = PROGRESSION_REGISTRY.find(p => p.id === prompt.progressionId);
  const notes = scale ? resolveForScale(scale.semitones, scale.name, prompt.key) : [];

  useEffect(() => () => { drone.stop(); playHandle?.stop(); }, [drone, playHandle]);

  const toggleLock = (k: keyof Prompt) => {
    const next = new Set(locks);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setLocks(next);
  };

  const deal = () => {
    const next = dealPrompt(prompt, locks);
    setPrompt(next);
    setProgressionKey(next.key);
    setBpm(next.tempo);
    if (droneOn && next.key !== prompt.key) {
      drone.stop();
      setDroneOn(false);
    }
  };

  const toggleDrone = () => {
    if (droneOn) {
      drone.stop();
    } else {
      drone.start((Note.midi(`${prompt.key}3`) ?? 48));
    }
    setDroneOn(!droneOn);
  };

  const playScale = () => {
    if (!scale) return;
    playHandle?.stop();
    const base = Note.midi(`${prompt.key}4`) ?? 60;
    const ascending = [...scale.semitones.map(s => base + s), base + 12];
    setPlayHandle(playMelody(ascending, 180));
  };

  const rows: Array<{ id: keyof Prompt; label: string; value: React.ReactNode }> = [
    { id: 'key', label: 'Key', value: <span className="text-2xl font-mono font-bold">{prompt.key}</span> },
    {
      id: 'scaleId',
      label: 'Scale',
      value: (
        <div>
          <span className="text-lg font-semibold">{scale?.name}</span>
          <span className="block text-xs font-mono text-muted-foreground">{notes.join(' ')}</span>
        </div>
      ),
    },
    {
      id: 'progressionId',
      label: 'Progression',
      value: (
        <div>
          <span className="text-lg font-semibold">{progression?.name}</span>
          <span className="block text-xs font-mono text-muted-foreground">
            {progression?.steps.map(s => s.romanNumeral).join(' → ')}
          </span>
        </div>
      ),
    },
    { id: 'constraint', label: 'Constraint', value: <span className="text-base">{prompt.constraint}</span> },
    { id: 'tempo', label: 'Tempo', value: <span className="text-lg font-mono">{prompt.tempo} bpm</span> },
  ];

  return (
    <div className="max-w-4xl space-y-4">
      <div className="space-y-2 max-w-2xl">
        {rows.map(row => (
          <div
            key={row.id}
            className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-card p-4"
          >
            <button
              onClick={() => toggleLock(row.id)}
              aria-label={`${locks.has(row.id) ? 'Unlock' : 'Lock'} ${row.label}`}
              title={locks.has(row.id) ? 'Locked — kept on re-deal' : 'Unlocked — changes on re-deal'}
              className={`min-h-11 min-w-11 flex items-center justify-center rounded-lg border transition-colors ${
                locks.has(row.id)
                  ? 'border-[var(--accent-color)] bg-[var(--accent-light)] text-[var(--accent-color)]'
                  : 'border-[var(--border-subtle)] text-muted-foreground hover:border-[var(--accent-color)]'
              }`}
            >
              {locks.has(row.id) ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
            </button>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{row.label}</p>
              {row.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={deal} size="lg" className="gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white">
          <Shuffle className="w-4 h-4" /> New prompt
        </Button>
        <Button variant={droneOn ? 'default' : 'outline'} size="lg" className="gap-2" onClick={toggleDrone}>
          <Waves className="w-4 h-4" /> {droneOn ? 'Stop drone' : `Drone on ${prompt.key}`}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Lock the axes you want to keep <Badge variant="outline" className="text-[9px] align-middle">🔒</Badge>,
        then deal a new prompt for the rest. Improvise for at least 5 minutes before re-dealing.
      </p>

      {/* Full scale reference */}
      {scale && (
        <section className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {prompt.key} {scale.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button onClick={playScale} variant="outline" className="gap-2">
                <Play className="w-4 h-4" /> Play scale
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/play" search={{ scaleRoot: prompt.key, scaleId: scale.id } as never}>
                  <Music2 className="w-4 h-4" /> Sight-read this scale
                </Link>
              </Button>
            </div>
          </div>
          <ScaleDetailPanel scale={scale} root={prompt.key} />
        </section>
      )}

      {/* Full progression reference + player */}
      {progression && (
        <section className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
          <div>
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {progression.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{progression.description}</p>
          </div>
          <ProgressionPlayer
            progression={progression}
            musicKey={progressionKey}
            onKeyChange={setProgressionKey}
            bpm={bpm}
            onBpmChange={setBpm}
          />
        </section>
      )}
    </div>
  );
}

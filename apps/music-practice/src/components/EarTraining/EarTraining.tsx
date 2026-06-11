/**
 * Ear Training — identify chord qualities and scale flavors by ear.
 * (Interval ear training lives on the Intervals page.)
 */

import { useState } from 'react';
import { Button } from '@hudak/ui/components/button';
import { Play, RefreshCw } from 'lucide-react';
import { getChordType } from '@/data/chords/chord-types';
import { getScale } from '@/data/scales/scale-registry';
import { playChordMidis, playMelody } from '@/lib/audio/player';

type Mode = 'chords' | 'scales';

const CHORD_POOL = [
  { id: 'major', label: 'Major' },
  { id: 'minor', label: 'Minor' },
  { id: 'dim', label: 'Diminished' },
  { id: 'aug', label: 'Augmented' },
  { id: 'maj7', label: 'Major 7' },
  { id: 'm7', label: 'Minor 7' },
  { id: '7', label: 'Dominant 7' },
  { id: 'm7b5', label: 'Half-diminished' },
  { id: 'dim7', label: 'Diminished 7' },
  { id: 'sus4', label: 'Sus4' },
];

const SCALE_POOL = [
  { id: 'ionian', label: 'Major (Ionian)' },
  { id: 'dorian', label: 'Dorian' },
  { id: 'phrygian', label: 'Phrygian' },
  { id: 'lydian', label: 'Lydian' },
  { id: 'mixolydian', label: 'Mixolydian' },
  { id: 'aeolian', label: 'Natural Minor' },
  { id: 'harmonic-minor', label: 'Harmonic Minor' },
  { id: 'melodic-minor', label: 'Melodic Minor' },
  { id: 'major-pentatonic', label: 'Major Pentatonic' },
  { id: 'minor-blues', label: 'Minor Blues' },
];

interface Question {
  id: string;
  label: string;
  options: { id: string; label: string }[];
  rootMidi: number;
}

function makeQuestion(mode: Mode, optionCount: number): Question {
  const pool = mode === 'chords' ? CHORD_POOL : SCALE_POOL;
  const target = pool[Math.floor(Math.random() * pool.length)];
  const wrong = pool
    .filter(p => p.id !== target.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, optionCount - 1);
  return {
    id: target.id,
    label: target.label,
    options: [...wrong, target].sort(() => Math.random() - 0.5),
    rootMidi: 55 + Math.floor(Math.random() * 10), // G3..E4
  };
}

function playQuestion(mode: Mode, q: Question): void {
  if (mode === 'chords') {
    const semitones = getChordType(q.id)?.semitones ?? [0, 4, 7];
    playChordMidis(semitones.map(s => q.rootMidi + s), 1.8);
  } else {
    const semitones = getScale(q.id)?.semitones ?? [0, 2, 4, 5, 7, 9, 11];
    playMelody([...semitones.map(s => q.rootMidi + s), q.rootMidi + 12], 200);
  }
}

export function EarTraining(): JSX.Element {
  const [mode, setMode] = useState<Mode>('chords');
  const [question, setQuestion] = useState<Question>(() => makeQuestion('chords', 4));
  const [answered, setAnswered] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const reset = (m: Mode) => {
    setMode(m);
    setQuestion(makeQuestion(m, 4));
    setAnswered(null);
    setScore({ correct: 0, total: 0 });
  };
  const next = () => {
    setQuestion(makeQuestion(mode, 4));
    setAnswered(null);
  };
  const answer = (id: string) => {
    if (answered) return;
    setAnswered(id);
    setScore(s => ({ correct: s.correct + (id === question.id ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex gap-2">
        <Button variant={mode === 'chords' ? 'default' : 'outline'} size="lg" onClick={() => reset('chords')}>
          Chord qualities
        </Button>
        <Button variant={mode === 'scales' ? 'default' : 'outline'} size="lg" onClick={() => reset('scales')}>
          Scale flavors
        </Button>
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] bg-card p-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          {mode === 'chords' ? 'Listen to the chord, then name its quality:' : 'Listen to the scale, then name it:'}
        </p>
        <Button
          onClick={() => playQuestion(mode, question)}
          size="lg"
          className="gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white"
        >
          <Play className="w-4 h-4" /> Play {mode === 'chords' ? 'chord' : 'scale'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {question.options.map(opt => {
          const isCorrect = opt.id === question.id;
          const state = !answered ? 'idle' : isCorrect ? 'correct' : opt.id === answered ? 'wrong' : 'idle';
          return (
            <Button
              key={opt.id}
              variant="outline"
              size="lg"
              onClick={() => answer(opt.id)}
              className={
                state === 'correct'
                  ? 'border-[var(--success-color,#10b981)] bg-emerald-50 dark:bg-emerald-900/20'
                  : state === 'wrong'
                    ? 'border-[var(--error-color,#ef4444)] bg-rose-50 dark:bg-rose-900/20'
                    : ''
              }
            >
              {opt.label}
            </Button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Score: {score.correct}/{score.total}</p>
        {answered && (
          <Button onClick={next} className="gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white">
            <RefreshCw className="w-4 h-4" /> Next
          </Button>
        )}
      </div>
    </div>
  );
}

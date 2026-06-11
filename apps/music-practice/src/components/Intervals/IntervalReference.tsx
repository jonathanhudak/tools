/**
 * Interval Reference & Quiz — every simple and compound interval with
 * audio playback, inversions, and a name-the-interval quiz (visual or by ear).
 */

import { useMemo, useState } from 'react';
import { Badge } from '@hudak/ui/components/badge';
import { Button } from '@hudak/ui/components/button';
import { Play, RefreshCw, Ear, Eye } from 'lucide-react';
import { Note } from 'tonal';
import { INTERVALS, COMPOUND_INTERVALS, type IntervalDefinition } from '@/data/intervals';
import { playMelody, playChordMidis } from '@/lib/audio/player';

const QUALITY_COLOR: Record<string, string> = {
  perfect: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  major: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  minor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  augmented: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  diminished: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

function playInterval(semitones: number, harmonic = false): void {
  const base = 60; // middle C
  if (harmonic) playChordMidis([base, base + semitones], 1.4);
  else playMelody([base, base + semitones], 100);
}

// ─── Reference table ─────────────────────────────────────────────────────────

function ReferenceTable({ intervals }: { intervals: IntervalDefinition[] }): JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {intervals.map(ivl => (
        <div
          key={ivl.shortName}
          className="rounded-lg border border-[var(--border-subtle)] bg-card p-3 flex items-center justify-between gap-2"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm">{ivl.shortName}</span>
              <Badge className={`text-[9px] ${QUALITY_COLOR[ivl.quality]}`}>{ivl.quality}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{ivl.fullName}</p>
            <p className="text-[10px] font-mono text-muted-foreground">
              {ivl.semitones} st · inverts to {ivl.inversion}
              {ivl.simpleEquivalent ? ` · simple: ${ivl.simpleEquivalent}` : ''}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="outline" size="icon" aria-label={`Play ${ivl.fullName} melodically`} onClick={() => playInterval(ivl.semitones)}>
              <Play className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="icon" aria-label={`Play ${ivl.fullName} harmonically`} onClick={() => playInterval(ivl.semitones, true)}>
              <span className="text-[10px] font-mono">⠿</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Quiz ────────────────────────────────────────────────────────────────────

interface Question {
  interval: IntervalDefinition;
  rootMidi: number;
  options: string[];
}

function makeQuestion(): Question {
  const interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
  const rootMidi = 55 + Math.floor(Math.random() * 13); // G3..G4
  const wrong = INTERVALS.filter(i => i.shortName !== interval.shortName)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(i => i.shortName);
  const options = [...wrong, interval.shortName].sort(() => Math.random() - 0.5);
  return { interval, rootMidi, options };
}

function IntervalQuiz({ byEar }: { byEar: boolean }): JSX.Element {
  const [question, setQuestion] = useState<Question>(makeQuestion);
  const [answered, setAnswered] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const next = () => {
    setQuestion(makeQuestion());
    setAnswered(null);
  };
  const hear = () => playMelody([question.rootMidi, question.rootMidi + question.interval.semitones], 100);

  const answer = (shortName: string) => {
    if (answered) return;
    setAnswered(shortName);
    setScore(s => ({
      correct: s.correct + (shortName === question.interval.shortName ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const noteA = Note.fromMidi(question.rootMidi);
  const noteB = Note.fromMidi(question.rootMidi + question.interval.semitones);

  return (
    <div className="max-w-xl space-y-5">
      <div className="rounded-xl border border-[var(--border-subtle)] bg-card p-6 text-center space-y-3">
        {byEar ? (
          <>
            <p className="text-sm text-muted-foreground">Listen, then name the interval:</p>
            <Button onClick={hear} size="lg" className="gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white">
              <Play className="w-4 h-4" /> Play interval
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Name the interval between:</p>
            <p className="text-3xl font-mono font-semibold">
              {noteA} → {noteB}
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {question.options.map(opt => {
          const isCorrect = opt === question.interval.shortName;
          const state = !answered ? 'idle' : isCorrect ? 'correct' : opt === answered ? 'wrong' : 'idle';
          return (
            <Button
              key={opt}
              variant="outline"
              size="lg"
              onClick={() => answer(opt)}
              className={
                state === 'correct'
                  ? 'border-[var(--success-color,#10b981)] bg-emerald-50 dark:bg-emerald-900/20'
                  : state === 'wrong'
                    ? 'border-[var(--error-color,#ef4444)] bg-rose-50 dark:bg-rose-900/20'
                    : ''
              }
            >
              <span className="font-mono font-bold mr-2">{opt}</span>
              <span className="text-xs text-muted-foreground">
                {INTERVALS.find(i => i.shortName === opt)?.fullName}
              </span>
            </Button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Score: {score.correct}/{score.total}
        </p>
        {answered && (
          <Button onClick={next} className="gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white">
            <RefreshCw className="w-4 h-4" /> Next
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type Tab = 'reference' | 'quiz-visual' | 'quiz-ear';

export function IntervalReference(): JSX.Element {
  const [tab, setTab] = useState<Tab>('reference');
  const simple = useMemo(() => INTERVALS, []);
  const compound = useMemo(() => COMPOUND_INTERVALS, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant={tab === 'reference' ? 'default' : 'outline'} size="lg" onClick={() => setTab('reference')}>
          Reference
        </Button>
        <Button variant={tab === 'quiz-visual' ? 'default' : 'outline'} size="lg" className="gap-2" onClick={() => setTab('quiz-visual')}>
          <Eye className="w-4 h-4" /> Quiz (visual)
        </Button>
        <Button variant={tab === 'quiz-ear' ? 'default' : 'outline'} size="lg" className="gap-2" onClick={() => setTab('quiz-ear')}>
          <Ear className="w-4 h-4" /> Quiz (by ear)
        </Button>
      </div>

      {tab === 'reference' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Simple intervals
            </h2>
            <ReferenceTable intervals={simple} />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Compound intervals
            </h2>
            <ReferenceTable intervals={compound} />
          </div>
        </div>
      )}
      {tab === 'quiz-visual' && <IntervalQuiz byEar={false} />}
      {tab === 'quiz-ear' && <IntervalQuiz byEar={true} />}
    </div>
  );
}

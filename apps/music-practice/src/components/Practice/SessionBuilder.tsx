/**
 * Session Builder — generates a timed, structured practice session from
 * the activity catalog, weighted toward your weakest modules, and walks
 * you through it block by block.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { Play, Pause, SkipForward, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getStats } from '@/lib/utils/storage';

interface Activity {
  id: string;
  title: string;
  module: string; // matches storage byModule keys where applicable
  link: { to: string; label: string };
  detail: string;
}

const CATALOG: Activity[] = [
  { id: 'sight-reading', title: 'Sight reading', module: 'sight-reading', link: { to: '/play', label: 'Open Sight Reading' }, detail: 'Read and play notes — practice mode, your usual clef.' },
  { id: 'chords', title: 'Chord study', module: 'chord-quiz', link: { to: '/chord-quiz', label: 'Open Chord Library' }, detail: 'Pick one chord quality and learn it across 3 roots.' },
  { id: 'scales', title: 'Scale study', module: 'scales-quiz', link: { to: '/scale-explorer', label: 'Open Scale Explorer' }, detail: 'Pick one scale and play it in 4 keys, ascending and descending.' },
  { id: 'arpeggios', title: 'Arpeggios', module: 'arpeggios', link: { to: '/arpeggios', label: 'Open Arpeggios' }, detail: 'One arpeggio, two patterns, around the circle of fifths.' },
  { id: 'progressions', title: 'Progression play-along', module: 'progressions', link: { to: '/progressions', label: 'Open Progressions' }, detail: 'Loop one progression and comp or solo over it.' },
  { id: 'improv', title: 'Improvisation', module: 'improv', link: { to: '/practice', label: 'Deal an improv prompt' }, detail: 'Deal a prompt and improvise — stick to the constraint.' },
  { id: 'ear-training', title: 'Ear training', module: 'ear-training', link: { to: '/ear-training', label: 'Open Ear Training' }, detail: '20 questions: chord qualities or scale flavors.' },
  { id: 'intervals', title: 'Intervals', module: 'intervals', link: { to: '/intervals', label: 'Open Intervals' }, detail: 'Interval quiz by ear — aim for 90%.' },
];

interface Block {
  activity: Activity;
  minutes: number;
}

/**
 * Order activities so modules with the lowest historical accuracy come
 * first; unseen modules slot in the middle.
 */
function buildPlan(totalMinutes: number, blockCount: number): Block[] {
  const stats = getStats();
  const accuracy = (m: string): number => {
    const s = stats.byModule[m];
    if (!s || s.correct + s.incorrect === 0) return 0.5; // unseen → middle priority
    return s.correct / (s.correct + s.incorrect);
  };
  const ordered = [...CATALOG].sort((a, b) => accuracy(a.module) - accuracy(b.module));
  const chosen = ordered.slice(0, blockCount);
  const per = Math.max(3, Math.floor(totalMinutes / blockCount));
  return chosen.map((activity, i) => ({
    activity,
    minutes: i === blockCount - 1 ? totalMinutes - per * (blockCount - 1) : per,
  }));
}

export function SessionBuilder(): JSX.Element {
  const [totalMinutes, setTotalMinutes] = useState(20);
  const [plan, setPlan] = useState<Block[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const blockCount = useMemo(() => (totalMinutes <= 15 ? 3 : totalMinutes <= 30 ? 4 : 5), [totalMinutes]);

  const start = () => {
    const p = buildPlan(totalMinutes, blockCount);
    setPlan(p);
    setCurrent(0);
    setSecondsLeft(p[0].minutes * 60);
    setRunning(true);
  };

  const advance = () => {
    if (!plan) return;
    if (current + 1 < plan.length) {
      setCurrent(c => c + 1);
      setSecondsLeft(plan[current + 1].minutes * 60);
    } else {
      setRunning(false);
      setSecondsLeft(0);
      setCurrent(plan.length); // done state
    }
  };

  useEffect(() => {
    if (!running) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          advance();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, current, plan]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const done = plan && current >= plan.length;

  if (!plan) {
    return (
      <div className="max-w-xl space-y-5">
        <p className="text-sm text-muted-foreground">
          Pick a session length — the builder assembles {blockCount} blocks, putting your weakest
          areas (by historical accuracy) first.
        </p>
        <div className="flex flex-wrap gap-2">
          {[10, 20, 30, 45, 60].map(m => (
            <button
              key={m}
              onClick={() => setTotalMinutes(m)}
              className={`min-h-11 px-4 rounded-lg border-2 font-mono text-sm transition-colors ${
                totalMinutes === m
                  ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-white'
                  : 'border-[var(--border-subtle)] bg-card hover:border-[var(--accent-color)]'
              }`}
            >
              {m} min
            </button>
          ))}
        </div>
        <Button onClick={start} size="lg" className="gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white">
          <Play className="w-4 h-4" /> Build session
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      {done ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-card p-8 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 mx-auto text-[var(--success-color,#10b981)]" />
          <h3 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            Session complete
          </h3>
          <p className="text-sm text-muted-foreground">{totalMinutes} minutes across {plan.length} blocks. Nice work.</p>
          <Button onClick={() => setPlan(null)} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> New session
          </Button>
        </div>
      ) : (
        <>
          {/* Current block */}
          <div className="rounded-xl border-2 border-[var(--accent-color)] bg-[var(--accent-light)] p-6 space-y-2">
            <div className="flex items-center justify-between">
              <Badge className="bg-[var(--accent-color)] text-white text-[10px]">
                Block {current + 1} of {plan.length}
              </Badge>
              <span className="font-mono text-3xl font-bold">{fmt(secondsLeft)}</span>
            </div>
            <h3 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {plan[current].activity.title}
            </h3>
            <p className="text-sm text-muted-foreground">{plan[current].activity.detail}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild variant="outline" size="sm">
                <Link to={plan[current].activity.link.to as never}>{plan[current].activity.link.label}</Link>
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setRunning(!running)}>
                {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {running ? 'Pause' : 'Resume'}
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={advance}>
                <SkipForward className="w-3.5 h-3.5" /> Next block
              </Button>
            </div>
          </div>

          {/* Upcoming blocks */}
          <div className="space-y-1.5">
            {plan.map((b, i) => (
              <div
                key={b.activity.id}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                  i < current
                    ? 'border-[var(--border-subtle)] text-muted-foreground line-through'
                    : i === current
                      ? 'border-[var(--accent-color)]'
                      : 'border-[var(--border-subtle)]'
                }`}
              >
                <span>{b.activity.title}</span>
                <span className="font-mono text-xs">{b.minutes} min</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

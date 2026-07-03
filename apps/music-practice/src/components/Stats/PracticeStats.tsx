/**
 * Practice Stats — cross-session journal built from localStorage history:
 * day streak, totals, per-module accuracy, and a 30-day activity chart.
 */

import { useMemo } from 'react';
import { Flame, Target, Clock3, Trophy } from 'lucide-react';
import { getSessions, getStats, type Session } from '@/lib/utils/storage';

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/** Consecutive days with at least one session, ending today or yesterday. */
export function computeStreak(sessions: Session[], now = Date.now()): number {
  const days = new Set(sessions.map(s => dayKey(s.timestamp ?? 0)));
  let streak = 0;
  // A streak survives if you practiced today OR yesterday (today not over yet)
  let cursor = days.has(dayKey(now)) ? now : now - DAY_MS;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

const MODULE_LABELS: Record<string, string> = {
  'sight-reading': 'Sight Reading',
  'chord-quiz': 'Chords',
  'scales-quiz': 'Scales',
  'chord-scale': 'Chord-Scale',
  'ear-training': 'Ear Training',
  intervals: 'Intervals',
};

export function PracticeStats(): JSX.Element {
  const sessions = useMemo(() => getSessions(), []);
  const stats = useMemo(() => getStats(), []);
  const streak = useMemo(() => computeStreak(sessions), [sessions]);

  const accuracy =
    stats.totalCorrect + stats.totalIncorrect > 0
      ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalIncorrect)) * 100)
      : null;

  // Last 30 days activity (session counts per day)
  const days = useMemo(() => {
    const now = Date.now();
    return Array.from({ length: 30 }, (_, i) => {
      const ts = now - (29 - i) * DAY_MS;
      const key = dayKey(ts);
      const count = sessions.filter(s => dayKey(s.timestamp ?? 0) === key).length;
      return { key, count };
    });
  }, [sessions]);
  const maxCount = Math.max(1, ...days.map(d => d.count));

  const modules = Object.entries(stats.byModule).filter(
    ([, m]) => m.correct + m.incorrect > 0,
  );

  const summary = [
    { icon: Flame, label: 'Day streak', value: String(streak) },
    { icon: Target, label: 'Accuracy', value: accuracy === null ? '—' : `${accuracy}%` },
    { icon: Clock3, label: 'Sessions', value: String(stats.totalSessions) },
    { icon: Trophy, label: 'Best streak (notes)', value: String(stats.bestStreak) },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summary.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-[var(--border-subtle)] bg-card p-4 text-center">
            <Icon className="w-5 h-5 mx-auto text-[var(--accent-color)]" />
            <p className="text-2xl font-bold font-mono mt-1">{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* 30-day activity */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Last 30 days
        </h2>
        <div className="flex items-end gap-[3px] h-24" role="img" aria-label="Practice sessions per day, last 30 days">
          {days.map(d => (
            <div
              key={d.key}
              title={`${d.key}: ${d.count} session${d.count === 1 ? '' : 's'}`}
              className={`flex-1 rounded-t ${d.count > 0 ? 'bg-[var(--accent-color)]' : 'bg-muted'}`}
              style={{ height: d.count > 0 ? `${Math.max(12, (d.count / maxCount) * 100)}%` : '6px' }}
            />
          ))}
        </div>
      </div>

      {/* Per-module accuracy */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          By module
        </h2>
        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No graded practice yet — play a sight-reading round or take a quiz and your accuracy
            will show up here.
          </p>
        ) : (
          <div className="space-y-3">
            {modules.map(([id, m]) => {
              const pct = Math.round((m.correct / (m.correct + m.incorrect)) * 100);
              return (
                <div key={id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{MODULE_LABELS[id] ?? id}</span>
                    <span className="font-mono text-muted-foreground">
                      {pct}% · {m.correct + m.incorrect} answers · {m.sessions} sessions
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent-color)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent sessions */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Recent sessions
        </h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing yet.</p>
        ) : (
          <div className="space-y-1.5">
            {sessions.slice(0, 10).map(s => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-card px-3 py-2 text-sm"
              >
                <span>
                  {MODULE_LABELS[s.module ?? ''] ?? s.module ?? 'Practice'}
                  {s.instrument ? ` · ${s.instrument}` : ''}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {(s.correct ?? 0)}/{(s.correct ?? 0) + (s.incorrect ?? 0)} ·{' '}
                  {new Date(s.timestamp ?? 0).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

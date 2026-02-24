import { Trophy, Flame, Target } from 'lucide-react';
import type { GameMode } from '../../hooks/use-game-round';
import { LivesDisplay } from '../lives-display';
import type { GameRoundState } from '../../hooks/use-game-round';

interface PracticeStats {
  correct: number;
  incorrect: number;
  streak: number;
}

interface ScoreHudProps {
  gameMode: GameMode;
  roundState: GameRoundState;
  stats: PracticeStats;
}

export function ScoreHud({ gameMode, roundState, stats }: ScoreHudProps) {
  return (
    <div className="flex items-center justify-between px-4">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-[var(--warning-bg,var(--accent-light))]">
            <Trophy className="h-5 w-5 text-[var(--warning-color)]" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Score</div>
            <div className="text-2xl font-bold tabular-nums">
              {gameMode === 'timed' ? (roundState.currentScore?.finalScore || 0) : stats.correct * 10}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-[var(--error-bg)]">
            <Flame className="h-5 w-5 text-[var(--error-color)]" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Streak</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">
                {gameMode === 'timed' ? roundState.streak : stats.streak}
              </span>
              {stats.streak >= 3 && (
                <Flame className="h-3 w-3 text-[var(--error-color)]" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {gameMode === 'timed' && roundState.isActive ? (
          <>
            <LivesDisplay lives={roundState.lives} maxLives={roundState.maxLives} />
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Progress</div>
              <div className="text-2xl font-bold text-[var(--accent-color)]">
                {roundState.notesCompleted}/{roundState.notesRequired}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success-light">
                <Target className="h-5 w-5 text-[var(--success-color)]" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Correct</div>
                <div className="text-2xl font-bold tabular-nums text-[var(--success-color)]">{stats.correct}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Incorrect</div>
              <div className="text-2xl font-bold tabular-nums text-[var(--error-color)]">{stats.incorrect}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

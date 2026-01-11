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
          <div className="p-2 rounded-full bg-amber-500/20">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Score</div>
            <div className="text-2xl font-bold tabular-nums">
              {gameMode === 'timed' ? (roundState.currentScore?.finalScore || 0) : stats.correct * 10}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-orange-500/20">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Streak</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">
                {gameMode === 'timed' ? roundState.streak : stats.streak}
              </span>
              {stats.streak >= 3 && (
                <span className="text-xs text-orange-500">🔥</span>
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
              <div className="text-2xl font-bold text-blue-500">
                {roundState.notesCompleted}/{roundState.notesRequired}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-500/20">
                <Target className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Correct</div>
                <div className="text-2xl font-bold tabular-nums text-emerald-500">{stats.correct}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Incorrect</div>
              <div className="text-2xl font-bold tabular-nums text-red-500">{stats.incorrect}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

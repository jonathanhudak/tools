import { Trophy, TrendingUp } from 'lucide-react';

interface GameHUDProps {
  score: number;
  streak: number;
  timeLeft: number;
  maxTime: number;
}

export function GameHUD({ score, streak, timeLeft, maxTime }: GameHUDProps) {
  const percentage = (timeLeft / maxTime) * 100;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isLow = percentage < 30;
  const isMedium = percentage < 60 && percentage >= 30;

  return (
    <div className="flex items-center justify-between">
      {/* Score and Streak */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <Trophy className="size-5 text-accent" />
          <div>
            <div className="text-xs text-muted-foreground tracking-wider">SCORE</div>
            <div className="text-2xl tabular-nums">{score}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TrendingUp className="size-5 text-accent" />
          <div>
            <div className="text-xs text-muted-foreground tracking-wider">STREAK</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl tabular-nums">{streak}</span>
              {streak >= 3 && (
                <span className="text-xs text-accent">+{Math.floor(streak / 3) * 5}pts</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Circular Timer */}
      <div className="relative">
        <svg width="110" height="110" viewBox="0 0 110 110" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-100 ${
              isLow ? 'text-destructive' : isMedium ? 'text-warning' : 'text-accent'
            }`}
          />
        </svg>
        {/* Time text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl tabular-nums ${isLow ? 'text-destructive' : ''}`}>
              {Math.ceil(timeLeft)}
            </div>
            <div className="text-xs text-muted-foreground">SEC</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RadialTimerProps {
  timeLeft: number;
  maxTime: number;
}

export function RadialTimer({ timeLeft, maxTime }: RadialTimerProps) {
  const percentage = (timeLeft / maxTime) * 100;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isLow = percentage < 30;
  const isMedium = percentage < 60 && percentage >= 30;

  return (
    <div className="relative">
      <svg width="130" height="130" viewBox="0 0 130 130" className="transform -rotate-90">
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-muted/30"
        />
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-100 ${
            isLow ? 'text-red-500' : isMedium ? 'text-amber-500' : 'text-emerald-500'
          }`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-3xl font-bold tabular-nums ${isLow ? 'text-red-500 animate-pulse' : ''}`}>
            {Math.ceil(timeLeft)}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">sec</div>
        </div>
      </div>
    </div>
  );
}

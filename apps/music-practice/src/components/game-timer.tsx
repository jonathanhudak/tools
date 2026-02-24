/**
 * Game Timer Component
 * Displays countdown timer with circular progress animation
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@hudak/ui/components/badge';
import { Clock } from 'lucide-react';

interface GameTimerProps {
  timeLeft: number; // seconds
  maxTime: number; // seconds
  isActive: boolean;
  onTimeUp?: () => void;
  className?: string;
}

export function GameTimer({ timeLeft, maxTime, isActive, onTimeUp, className = '' }: GameTimerProps) {
  const [prevTime, setPrevTime] = useState(timeLeft);

  // Calculate progress (0-1)
  const progress = maxTime > 0 ? timeLeft / maxTime : 1;

  // Trigger callback when time runs out
  useEffect(() => {
    if (isActive && timeLeft === 0 && prevTime > 0 && onTimeUp) {
      onTimeUp();
    }
    setPrevTime(timeLeft);
  }, [timeLeft, isActive, onTimeUp, prevTime]);

  // Color based on time remaining
  const getColor = () => {
    if (progress > 0.5) return 'text-[var(--success-color)]';
    if (progress > 0.25) return 'text-[var(--warning-color)]';
    return 'text-[var(--error-color)]';
  };

  const getBgColor = () => {
    if (progress > 0.5) return 'bg-[var(--success-bg)]';
    if (progress > 0.25) return 'bg-[var(--warning-bg,var(--accent-light))]';
    return 'bg-[var(--error-bg)]';
  };

  const getBarColor = () => {
    if (progress > 0.5) return 'bg-[var(--success-color)]';
    if (progress > 0.25) return 'bg-[var(--warning-color)]';
    return 'bg-[var(--error-color)]';
  };

  // Animation when time is running low
  const shouldPulse = isActive && progress <= 0.25 && progress > 0;

  return (
    <motion.div
      className={className}
      animate={{
        scale: shouldPulse ? [1, 1.05, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        repeat: shouldPulse ? Infinity : 0,
        repeatType: 'loop',
      }}
    >
      <Badge
        variant="outline"
        className={`flex items-center gap-2 px-3 py-2 text-lg font-bold ${getBgColor()} ${getColor()} border-current`}
      >
        <motion.div
          animate={{ rotate: isActive ? 360 : 0 }}
          transition={{
            duration: 2,
            repeat: isActive ? Infinity : 0,
            repeatType: 'loop',
            ease: 'linear',
          }}
        >
          <Clock className="h-5 w-5" />
        </motion.div>
        <span>{timeLeft}s</span>
      </Badge>

      {/* Progress bar */}
      <motion.div
        className="mt-2 h-1 rounded-full bg-muted overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
      >
        <motion.div
          className={`h-full ${getBarColor()}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}

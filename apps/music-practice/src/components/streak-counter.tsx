/**
 * Streak Counter Component
 * Displays current streak with animated flame icon
 */

import { motion } from 'framer-motion';
import { Badge } from '@hudak/ui/components/badge';
import { Flame } from 'lucide-react';
import { getStreakMultiplier } from '../lib/utils/scoring';

interface StreakCounterProps {
  streak: number;
  className?: string;
}

export function StreakCounter({ streak, className = '' }: StreakCounterProps) {
  const multiplier = getStreakMultiplier(streak);
  const hasStreak = streak > 0;
  const isMilestone = streak > 0 && (streak === 5 || streak === 10 || streak === 20 || streak % 25 === 0);

  // Color based on streak level
  const getFlameColor = () => {
    if (streak >= 20) return 'text-orange-600 dark:text-orange-400';
    if (streak >= 10) return 'text-orange-500 dark:text-orange-300';
    if (streak >= 5) return 'text-yellow-500 dark:text-yellow-300';
    return 'text-gray-400 dark:text-gray-600';
  };

  const getBgColor = () => {
    if (streak >= 20) return 'bg-orange-500/10';
    if (streak >= 10) return 'bg-orange-400/10';
    if (streak >= 5) return 'bg-yellow-500/10';
    return 'bg-gray-500/10';
  };

  return (
    <motion.div
      className={className}
      animate={{
        scale: isMilestone ? [1, 1.15, 1] : 1,
        rotate: isMilestone ? [0, -5, 5, 0] : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 15,
      }}
    >
      <Badge
        variant="outline"
        className={`flex items-center gap-2 px-3 py-2 ${getBgColor()} border-current`}
      >
        <motion.div
          animate={{
            scale: hasStreak ? [1, 1.2, 1] : 1,
            rotate: hasStreak ? [0, -5, 5, -5, 0] : 0,
          }}
          transition={{
            duration: 0.5,
            repeat: hasStreak ? Infinity : 0,
            repeatDelay: 1,
          }}
        >
          <Flame className={`h-5 w-5 ${getFlameColor()}`} />
        </motion.div>

        <div className="flex flex-col items-start">
          <span className={`text-lg font-bold ${getFlameColor()}`}>
            {streak}
          </span>
          {multiplier > 1 && (
            <span className="text-xs text-muted-foreground">
              ×{multiplier.toFixed(1)}
            </span>
          )}
        </div>
      </Badge>
    </motion.div>
  );
}

/**
 * Lives Display Component
 * Shows hearts representing remaining lives with animations
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface LivesDisplayProps {
  lives: number;
  maxLives: number;
  className?: string;
}

export function LivesDisplay({ lives, maxLives = 3, className = '' }: LivesDisplayProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(maxLives)].map((_, index) => {
        const isAlive = index < lives;
        const isLastLife = lives === 1 && index === 0;

        return (
          <motion.div
            key={index}
            initial={{ scale: 1 }}
            animate={{
              scale: isLastLife ? [1, 1.2, 1] : 1,
              rotate: isLastLife ? [0, -10, 10, 0] : 0,
            }}
            transition={{
              duration: 0.5,
              repeat: isLastLife ? Infinity : 0,
              repeatDelay: 0.5,
            }}
          >
            <AnimatePresence mode="wait">
              {isAlive ? (
                <motion.div
                  key="alive"
                  initial={{ scale: 1 }}
                  exit={{ scale: 0, rotate: -90, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 15,
                  }}
                >
                  <Heart
                    className={`h-6 w-6 ${
                      isLastLife
                        ? 'fill-red-500 text-red-500'
                        : 'fill-red-400 text-red-400'
                    }`}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="lost"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  <Heart className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      <span className="ml-2 text-sm font-medium text-muted-foreground">
        {lives}/{maxLives}
      </span>
    </div>
  );
}

/**
 * Score Summary Component
 * Displays round results with confetti celebration
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { Trophy, TrendingUp, Clock, Target } from 'lucide-react';
import { type ScoreResult, SCORE_RANKS } from '../lib/utils/scoring';

interface ScoreSummaryProps {
  scoreResult: ScoreResult;
  correctCount: number;
  totalNotes: number;
  isSuccessful: boolean;
  onContinue: () => void;
  onRetry?: () => void;
  showConfetti?: boolean;
  className?: string;
}

export function ScoreSummary({
  scoreResult,
  correctCount,
  totalNotes,
  isSuccessful,
  onContinue,
  onRetry,
  showConfetti = true,
  className = '',
}: ScoreSummaryProps) {
  const [showConfettiEffect, setShowConfettiEffect] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Update window size for confetti
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Trigger confetti on successful round
  useEffect(() => {
    if (isSuccessful && showConfetti) {
      setShowConfettiEffect(true);
      const timer = setTimeout(() => setShowConfettiEffect(false), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isSuccessful, showConfetti]);

  const rankInfo = SCORE_RANKS[scoreResult.rank];
  const accuracy = totalNotes > 0 ? (correctCount / totalNotes) * 100 : 0;

  return (
    <>
      {showConfettiEffect && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
          colors={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']}
        />
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={className}
      >
        <Card className="border-2">
          <CardHeader className="text-center">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <Trophy className={`h-16 w-16 ${rankInfo.color}`} />
            </motion.div>
            <CardTitle className="text-3xl font-bold">
              {isSuccessful ? 'Round Complete!' : 'Round Failed'}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              <Badge
                variant="outline"
                className={`text-2xl font-bold px-4 py-2 ${rankInfo.color} border-current`}
              >
                Rank {scoreResult.rank}
              </Badge>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="text-2xl font-bold">{accuracy.toFixed(0)}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-xl font-semibold">
                    {correctCount}/{totalNotes}
                  </p>
                </div>
              </div>

              {scoreResult.speedBonus > 0 && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Speed Bonus</p>
                      <p className="text-xl font-bold text-yellow-500">
                        +{scoreResult.speedBonus}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {scoreResult.streakMultiplier > 1 && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-between p-4 bg-orange-500/10 rounded-lg border border-orange-500/20"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Streak Multiplier</p>
                      <p className="text-xl font-bold text-orange-500">
                        ×{scoreResult.streakMultiplier.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border-2 border-blue-500/20"
              >
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Total Score
                </p>
                <p className="text-5xl font-bold text-center text-blue-500">
                  {scoreResult.finalScore}
                </p>
                <p className="text-center text-lg font-medium mt-2 text-muted-foreground">
                  {rankInfo.label}
                </p>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {onRetry && !isSuccessful && (
                <Button onClick={onRetry} variant="outline" className="flex-1">
                  Try Again
                </Button>
              )}
              <Button onClick={onContinue} className="flex-1">
                {isSuccessful ? 'Next Round' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}

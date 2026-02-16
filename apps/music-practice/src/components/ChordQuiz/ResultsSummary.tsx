/**
 * ResultsSummary - Quiz results and leaderboard
 */

import { useState } from 'react';
import type { QuizStats, LeaderboardEntry } from '@/lib/chord-quiz-modes';
import { saveLeaderboardEntry, getTopScores } from '@/lib/chord-quiz-modes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { Input } from '@hudak/ui/components/input';
import { motion } from 'framer-motion';
import { Trophy, Share2, RotateCcw, Home } from 'lucide-react';

interface ResultsSummaryProps {
  stats: QuizStats;
  onPlayAgain: () => void;
  onBack?: () => void;
}

export function ResultsSummary({ stats, onPlayAgain, onBack }: ResultsSummaryProps): JSX.Element {
  const [playerName, setPlayerName] = useState('');
  const [saved, setSaved] = useState(false);
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>(() =>
    getTopScores(stats.mode, stats.difficulty, 5)
  );

  const handleSaveScore = () => {
    if (!playerName.trim()) return;

    saveLeaderboardEntry(stats, playerName);

    setSaved(true);
    setTopScores(getTopScores(stats.mode, stats.difficulty, 5));
  };

  const accuracyColor =
    stats.accuracy >= 80 ? 'text-green-600' : stats.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600';

  const ratingEmoji =
    stats.accuracy >= 90
      ? '🏆'
      : stats.accuracy >= 80
        ? '⭐'
        : stats.accuracy >= 70
          ? '👍'
          : stats.accuracy >= 50
            ? '💪'
            : '📚';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl mb-4"
          >
            {ratingEmoji}
          </motion.div>
          <h1 className="text-4xl font-bold">Quiz Complete!</h1>
          <p className="text-muted-foreground mt-2">Great job learning chords</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Stats Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Your Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main score */}
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">{stats.score}</div>
                <div className="text-muted-foreground">Total Points</div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <div className={`text-2xl font-bold ${accuracyColor}`}>{stats.accuracy.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>

                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold text-blue-600">{stats.correct}</div>
                  <div className="text-xs text-muted-foreground">Correct</div>
                </div>

                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold text-orange-600">{stats.incorrect}</div>
                  <div className="text-xs text-muted-foreground">Incorrect</div>
                </div>

                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold text-green-600">
                    {(stats.averageTime / 1000).toFixed(1)}s
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Time</div>
                </div>
              </div>

              {/* Details */}
              <div className="pt-4 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="font-semibold capitalize">{stats.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="font-semibold capitalize">{stats.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="font-semibold">{stats.totalQuestions}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save & Share */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Save Your Score</CardTitle>
              <CardDescription>Join the leaderboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!saved ? (
                <>
                  <Input
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSaveScore()}
                  />
                  <Button
                    onClick={handleSaveScore}
                    disabled={!playerName.trim()}
                    className="w-full"
                    size="lg"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Save Score
                  </Button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6"
                >
                  <div className="text-2xl mb-2">✓</div>
                  <p className="font-semibold">Score saved!</p>
                  <p className="text-sm text-muted-foreground">Check the leaderboard to see where you rank</p>
                </motion.div>
              )}

              {/* Share button */}
              <Button variant="secondary" className="w-full gap-2">
                <Share2 className="w-4 h-4" />
                Share Score
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        {topScores.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Leaderboard - {stats.mode} ({stats.difficulty})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topScores.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      index === 0
                        ? 'bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-300 dark:border-yellow-700'
                        : 'bg-secondary/50'
                    }`}
                  >
                    <div className="text-xl font-bold w-8">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{entry.playerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.correct}/{entry.totalQuestions} correct • {entry.accuracy.toFixed(0)}% accuracy
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{entry.score}</div>
                      <div className="text-xs text-muted-foreground">pts</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button onClick={onPlayAgain} variant="default" size="lg" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Play Again
          </Button>
          {onBack && (
            <Button onClick={onBack} variant="secondary" size="lg" className="gap-2">
              <Home className="w-4 h-4" />
              Back to Menu
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

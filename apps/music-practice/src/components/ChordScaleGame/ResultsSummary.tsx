/**
 * Results Summary Component
 *
 * Displays final score, accuracy, and detailed answer breakdown.
 */

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import Confetti from 'react-confetti';
import { useState } from 'react';
import { SCALE_TYPE_NAMES } from '../../data/chord-scale-matrix';
import type { QuizResults, AnswerRecord } from './QuizGame';

export interface ResultsSummaryProps {
  results: QuizResults;
  onRetry: () => void;
}

export function ResultsSummary({ results, onRetry }: ResultsSummaryProps): JSX.Element {
  const [showDetails, setShowDetails] = useState(false);
  const isExcellent = results.accuracy >= 85;
  const isGood = results.accuracy >= 70;

  let feedbackMessage = '';
  let feedbackColor = '';

  if (isExcellent) {
    feedbackMessage = '🌟 Outstanding! You have excellent knowledge of scales and modes!';
    feedbackColor = 'text-yellow-600 dark:text-yellow-400';
  } else if (isGood) {
    feedbackMessage = '👏 Great job! You&apos;re getting solid with scales and modes.';
    feedbackColor = 'text-green-600 dark:text-green-400';
  } else {
    feedbackMessage = '💪 Keep practicing! You&apos;ll master scales and modes in no time.';
    feedbackColor = 'text-blue-600 dark:text-blue-400';
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {isExcellent && <Confetti numberOfPieces={100} recycle={false} />}

      {/* Main Results Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2">
          <CardHeader className="text-center">
            <Badge variant="secondary" className="w-fit mx-auto mb-4">
              Quiz Complete
            </Badge>
            <CardTitle className="text-4xl">
              {results.correctAnswers}/{results.totalQuestions}
            </CardTitle>
            <CardDescription className="text-xl">{results.accuracy.toFixed(1)}% Accuracy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Feedback Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-center text-lg font-semibold ${feedbackColor}`}
            >
              {feedbackMessage}
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-4"
            >
              <Card>
                <CardContent className="pt-6 pb-4 text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {results.correctAnswers}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Correct</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 pb-4 text-center">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {results.incorrectAnswers}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Incorrect</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 pb-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {results.accuracy.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Accuracy</div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <Button onClick={onRetry} size="lg" className="w-full">
                Try Again 🎯
              </Button>
              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="outline"
                size="lg"
                className="w-full"
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Answer Breakdown */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold">Answer Breakdown</h3>
          {results.answers.map((answer: AnswerRecord, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`${
                  answer.isCorrect
                    ? 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20'
                }`}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-semibold mb-1">
                        Question {index + 1}: {answer.question.questionText}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Scale: {SCALE_TYPE_NAMES[answer.question.scaleType]}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Your answer:</span>{' '}
                        <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {answer.selectedAnswer}
                        </span>
                      </div>
                      {!answer.isCorrect && (
                        <div className="text-sm mt-1">
                          <span className="font-semibold">Correct answer:</span>{' '}
                          <span className="text-green-600">{answer.question.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={answer.isCorrect ? 'default' : 'destructive'}
                      className="shrink-0 mt-1"
                    >
                      {answer.isCorrect ? '✓ Correct' : '✗ Wrong'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

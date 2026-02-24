/**
 * Quiz Game Component
 *
 * Main quiz interface with questions, scoring, and visual feedback.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Skeleton } from '@hudak/ui/components/skeleton';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import {
  generateScaleQuizQuestion,
  validateAnswer,
  type QuizQuestion,
} from './QuizGenerator';
import { SCALE_TYPE_NAMES, type ScaleType } from '../../data/chord-scale-matrix';

export interface QuizGameProps {
  selectedScales: ScaleType[];
  onQuizComplete: (results: QuizResults) => void;
}

export interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  answers: AnswerRecord[];
}

export interface AnswerRecord {
  question: QuizQuestion;
  selectedAnswer: string;
  isCorrect: boolean;
}

export function QuizGame({ selectedScales, onQuizComplete }: QuizGameProps): JSX.Element {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [questionCount] = useState(10);

  // Generate initial question on mount
  useEffect(() => {
    if (!currentQuestion) {
      const question = generateScaleQuizQuestion(selectedScales);
      setCurrentQuestion(question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateNextQuestion = (): void => {
    const question = generateScaleQuizQuestion(selectedScales);
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleAnswer = (answer: string): void => {
    if (selectedAnswer) return; // Already answered

    if (!currentQuestion) return;

    setSelectedAnswer(answer);
    const correct = validateAnswer(currentQuestion, answer);
    setIsCorrect(correct);

    const newScore = {
      correct: score.correct + (correct ? 1 : 0),
      total: score.total + 1,
    };
    setScore(newScore);
    setStreak(correct ? streak + 1 : 0);

    // Add to answer history
    setAnswers(prev => [
      ...prev,
      {
        question: currentQuestion,
        selectedAnswer: answer,
        isCorrect: correct,
      },
    ]);

    // Check if quiz is complete
    if (newScore.total >= questionCount) {
      setTimeout(() => {
        onQuizComplete({
          totalQuestions: newScore.total,
          correctAnswers: newScore.correct,
          incorrectAnswers: newScore.total - newScore.correct,
          accuracy: (newScore.correct / newScore.total) * 100,
          answers,
        });
      }, 1500);
    }
  };

  const handleNextQuestion = (): void => {
    generateNextQuestion();
  };

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex gap-4 justify-center">
          {[1, 2, 3].map(i => (
            <Card key={i} className="flex-1">
              <CardContent className="pt-4 pb-3 text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-2">
          <CardHeader className="pb-4">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-40 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-16 rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  const progress = (score.total / questionCount) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          className="bg-[var(--accent-color)] h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 justify-center">
        <Card className="flex-1">
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-foreground">
              {score.correct}/{score.total}
            </div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-[var(--accent-color)]">
              {accuracy}%
            </div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-foreground">
              {streak}
            </div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Question Card */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <Badge variant="outline" className="w-fit mb-2">
            Question {score.total + 1} of {questionCount}
          </Badge>
          <CardTitle className="text-2xl font-display">{currentQuestion.questionText}</CardTitle>
          <CardDescription>
            Scale Type: {SCALE_TYPE_NAMES[currentQuestion.scaleType]}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="wait">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const showCorrect = selectedAnswer && option === currentQuestion.correctAnswer;
                const showIncorrect = selectedAnswer && isSelected && !isCorrect;

                let variant: 'default' | 'outline' | 'secondary' | 'ghost' = 'outline';
                let className = 'h-16 text-lg font-semibold transition-all';

                if (showCorrect) {
                  variant = 'ghost';
                  className += ' bg-success-solid text-white border-2 border-success';
                } else if (showIncorrect) {
                  variant = 'ghost';
                  className += ' bg-error-solid text-white border-2 border-error';
                } else if (selectedAnswer) {
                  // Dim non-selected options after answer
                  className += ' opacity-50';
                }

                return (
                  <motion.div
                    key={option}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant={variant}
                      className={className}
                      onClick={() => handleAnswer(option)}
                      disabled={!!selectedAnswer}
                    >
                      {option}
                    </Button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Feedback */}
          <AnimatePresence mode="wait">
            {selectedAnswer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {isCorrect ? (
                  <div className="p-4 rounded-lg bg-[var(--success-bg)] border-2 border-[var(--success-color)]">
                    <div className="font-semibold text-[var(--success-color)] flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Correct!
                    </div>
                    <div className="text-sm text-[var(--success-color)] mt-1">
                      {currentQuestion.correctAnswer} is the {currentQuestion.degree}th mode of{' '}
                      {SCALE_TYPE_NAMES[currentQuestion.scaleType]}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[var(--error-bg)] border-2 border-[var(--error-color)]">
                    <div className="font-semibold text-[var(--error-color)] flex items-center gap-2">
                      <XCircle className="w-5 h-5" /> Incorrect
                    </div>
                    <div className="text-sm text-[var(--error-color)] mt-1">
                      The correct answer is <strong>{currentQuestion.correctAnswer}</strong> (
                      {currentQuestion.degree}th degree of {SCALE_TYPE_NAMES[currentQuestion.scaleType]}
                      )
                    </div>
                  </div>
                )}

                {score.total < questionCount && (
                  <Button onClick={handleNextQuestion} size="lg" className="w-full">
                    Next Question <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

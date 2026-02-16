/**
 * Quiz Game Component
 *
 * Main quiz interface with questions, scoring, and visual feedback.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [questionCount, setQuestionCount] = useState(10);
  const [quizStarted, setQuizStarted] = useState(false);

  // Generate initial question
  useEffect(() => {
    if (quizStarted && !currentQuestion) {
      const question = generateScaleQuizQuestion(selectedScales);
      setCurrentQuestion(question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted]);

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

  if (!quizStarted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Ready to Start?</CardTitle>
          <CardDescription>Answer {questionCount} questions about scales and modes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="text-sm font-semibold mb-2">Selected Scales:</div>
            <div className="flex flex-wrap gap-2">
              {selectedScales.map(scale => (
                <Badge key={scale} variant="secondary" className="capitalize">
                  {SCALE_TYPE_NAMES[scale]}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Number of Questions</label>
            <select
              value={questionCount}
              onChange={e => setQuestionCount(parseInt(e.target.value))}
              className="w-full p-2 border rounded-lg dark:bg-gray-800"
            >
              <option value="5">5 Questions</option>
              <option value="10">10 Questions</option>
              <option value="20">20 Questions</option>
              <option value="30">30 Questions</option>
            </select>
          </div>

          <Button onClick={() => setQuizStarted(true)} size="lg" className="w-full">
            Let&apos;s Go! 🎵
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return <div className="text-center p-4">Loading question...</div>;
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  const progress = (score.total / questionCount) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 justify-center">
        <Card className="flex-1">
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {score.correct}/{score.total}
            </div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {accuracy}%
            </div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
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
          <CardTitle className="text-2xl">{currentQuestion.questionText}</CardTitle>
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

                let variant: 'default' | 'outline' | 'secondary' = 'outline';
                let className = 'h-16 text-lg font-semibold transition-all';

                if (showCorrect) {
                  className += ' bg-green-500 text-white hover:bg-green-600 border-green-600';
                } else if (showIncorrect) {
                  className += ' bg-red-500 text-white hover:bg-red-600 border-red-600';
                } else if (isSelected) {
                  variant = 'secondary';
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
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border-2 border-green-500">
                    <div className="font-semibold text-green-900 dark:text-green-100">
                      ✓ Correct!
                    </div>
                    <div className="text-sm text-green-800 dark:text-green-200 mt-1">
                      {currentQuestion.correctAnswer} is the {currentQuestion.degree}th mode of{' '}
                      {SCALE_TYPE_NAMES[currentQuestion.scaleType]}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border-2 border-red-500">
                    <div className="font-semibold text-red-900 dark:text-red-100">
                      ✗ Incorrect
                    </div>
                    <div className="text-sm text-red-800 dark:text-red-200 mt-1">
                      The correct answer is <strong>{currentQuestion.correctAnswer}</strong> (
                      {currentQuestion.degree}th degree of {SCALE_TYPE_NAMES[currentQuestion.scaleType]}
                      )
                    </div>
                  </div>
                )}

                {score.total < questionCount && (
                  <Button onClick={handleNextQuestion} size="lg" className="w-full">
                    Next Question →
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

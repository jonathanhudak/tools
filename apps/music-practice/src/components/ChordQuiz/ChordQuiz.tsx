/**
 * ChordQuiz - Main quiz game component
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  QuizState,
  QuizMode,
} from '@/lib/chord-quiz-modes';
import {
  initializeQuizState,
  recordAnswer,
  nextQuestion,
  calculateStats,
} from '@/lib/chord-quiz-modes';
import { Card, CardContent, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { ChordDiagram } from '../ChordReference/ChordDiagram';
import { PianoKeyboard } from '../ChordReference/PianoKeyboard';
import { ChordPlayer } from '../ChordReference/ChordPlayer';
import { InstrumentSelector, type Instrument } from '../InstrumentSelector';
import { ResultsSummary } from './ResultsSummary';
import { Progress } from '@hudak/ui/components/progress';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

interface ChordQuizProps {
  mode: QuizMode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount?: number;
  onBack?: () => void;
}

export function ChordQuiz({ mode, difficulty, questionCount = 10, onBack }: ChordQuizProps): JSX.Element {
  const [quizState, setQuizState] = useState<QuizState>(() =>
    initializeQuizState(mode, difficulty, questionCount)
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('guitar');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const progress = ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100;

  const handleAnswer = useCallback((optionIndex: number) => {
    setAnswered(true);
    setSelectedAnswer(optionIndex);

    if (timerRef.current) clearInterval(timerRef.current);

    const newState = recordAnswer(quizState, optionIndex);
    setQuizState(newState);
  }, [quizState]);

  // Timer for speed mode
  useEffect(() => {
    if (mode === 'speed' && !answered && !quizState.isComplete) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-submit wrong answer if time runs out
            handleAnswer(-1);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [answered, mode, quizState.isComplete, handleAnswer]);

  if (quizState.isComplete) {
    const stats = calculateStats(quizState);
    return (
      <ResultsSummary
        stats={stats}
        onPlayAgain={() => {
          setQuizState(initializeQuizState(mode, difficulty, questionCount));
          setSelectedAnswer(null);
          setAnswered(false);
          setTimeLeft(30);
        }}
        onBack={onBack}
      />
    );
  }

  const handleNext = () => {
    if (!answered) return;

    setSelectedAnswer(null);
    setAnswered(false);
    setTimeLeft(30);

    const newState = nextQuestion(quizState);
    setQuizState(newState);
  };

  const isCorrect = selectedAnswer === currentQuestion.correctIndex && answered;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header with stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Chord Quiz</h1>
            <div className="flex gap-3">
              <Badge variant="secondary" className="capitalize">
                {mode} Mode
              </Badge>
              <Badge variant="outline" className="capitalize">
                {difficulty}
              </Badge>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{quizState.score}</div>
            <div className="text-sm text-muted-foreground">Points</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
            </span>
            {mode === 'speed' && (
              <span className={`font-bold ${timeLeft > 10 ? 'text-green-600' : 'text-red-600'}`}>
                {timeLeft}s
              </span>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question card */}
        <Card className="border-2 mb-6">
          <CardHeader className="text-center">
            <CardTitle className="mb-4">What chord is this?</CardTitle>

            {/* Instrument Selector */}
            <div className="flex justify-center my-4">
              <InstrumentSelector
                selected={selectedInstrument}
                onChange={setSelectedInstrument}
                size="sm"
              />
            </div>

            {/* Chord diagram or piano keyboard */}
            <div className="flex justify-center my-6">
              {selectedInstrument === 'guitar' ? (
                <ChordDiagram chord={currentQuestion.chord} size="large" />
              ) : (
                <PianoKeyboard chord={currentQuestion.chord} size="large" />
              )}
            </div>

            {/* Play button */}
            <div className="flex justify-center gap-3">
              <ChordPlayer chord={currentQuestion.chord} size="lg" variant="primary" />
              <Button variant="outline" size="sm" disabled>
                <Volume2 className="w-4 h-4 mr-2" />
                Listen Again
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Answer options */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={answered}
                  whileHover={{ scale: answered ? 1 : 1.05 }}
                  whileTap={{ scale: answered ? 1 : 0.95 }}
                  className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                    selectedAnswer === index
                      ? isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-red-500 bg-red-50 dark:bg-red-950'
                      : answered && index === currentQuestion.correctIndex
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-border hover:border-primary'
                  } ${answered ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="text-sm md:text-base">{option.shortName}</div>
                  <div className="text-xs text-muted-foreground capitalize">{option.type}</div>
                </motion.button>
              ))}
            </div>

            {/* Feedback */}
            {answered && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-lg text-center font-semibold ${
                  isCorrect
                    ? 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100'
                    : 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100'
                }`}
              >
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                {!isCorrect && (
                  <div className="text-sm mt-2">
                    The correct answer is <strong>{currentQuestion.options[currentQuestion.correctIndex].shortName}</strong>
                  </div>
                )}
              </motion.div>
            )}

            {/* Next button */}
            {answered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex gap-3"
              >
                <Button
                  onClick={handleNext}
                  className="flex-1"
                  size="lg"
                  variant={quizState.currentQuestionIndex + 1 < quizState.questions.length ? 'default' : 'secondary'}
                >
                  {quizState.currentQuestionIndex + 1 < quizState.questions.length ? 'Next Question' : 'See Results'}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Back button */}
        {onBack && !answered && (
          <div className="text-center">
            <Button variant="ghost" onClick={onBack}>
              ← Back to Menu
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/**
 * Degree Quiz Component
 *
 * Quick-fire quiz mode that tests knowledge of chord qualities by scale degree.
 * Example: "What chord quality is on degree 4 of Melodic Minor?" → Answer: "7" (Lydian Dominant)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ChordVoicingDisplay } from './ChordVoicingDisplay';
import { getChordById } from '@/lib/chord-library';
import type { Chord } from '@/lib/chord-library';
import {
  CHORD_SCALE_MATRIX,
  getDegreeInfo,
  getAllChordQualities,
  SCALE_TYPE_NAMES,
  type ScaleType,
  type Degree,
} from '../../data/chord-scale-matrix';

interface DegreeQuizProps {
  /** Difficulty level - determines which scale types to include */
  difficulty: 'major' | 'majorMinor' | 'allScales';
}

interface QuizQuestion {
  scaleType: ScaleType;
  degree: Degree;
  correctAnswer: string;
  options: string[];
}

/**
 * Generate a random quiz question based on difficulty level
 */
function generateQuestion(difficulty: 'major' | 'majorMinor' | 'allScales'): QuizQuestion {
  // Filter scale types based on difficulty
  const scaleTypes: ScaleType[] =
    difficulty === 'major'
      ? ['major']
      : difficulty === 'majorMinor'
        ? ['major', 'naturalMinor']
        : ['major', 'naturalMinor', 'melodicMinor', 'harmonicMinor'];

  // Pick a random scale type
  const scaleType = scaleTypes[Math.floor(Math.random() * scaleTypes.length)];

  // Pick a random degree (1-7)
  const degree = (Math.floor(Math.random() * 7) + 1) as Degree;

  // Get the correct answer
  const entry = getDegreeInfo(scaleType, degree);
  if (!entry) {
    throw new Error(`No entry found for ${scaleType} degree ${degree}`);
  }

  const correctAnswer = entry.chordQuality;

  // Generate 4 multiple choice options (including the correct one)
  const allQualities = getAllChordQualities();
  const incorrectOptions = allQualities
    .filter(q => q !== correctAnswer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctAnswer, ...incorrectOptions].sort(() => Math.random() - 0.5);

  return {
    scaleType,
    degree,
    correctAnswer,
    options,
  };
}

type Instrument = 'guitar' | 'piano';

export function DegreeQuiz({ difficulty }: DegreeQuizProps): JSX.Element {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [currentChord, setCurrentChord] = useState<Chord | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('guitar');

  // Generate initial question
  useEffect(() => {
    setQuestion(generateQuestion(difficulty));
  }, [difficulty]);

  // Fetch chord when question is answered
  useEffect(() => {
    if (selectedAnswer && question) {
      const entry = getDegreeInfo(question.scaleType, question.degree);
      if (entry?.chordId) {
        const chord = getChordById(entry.chordId);
        if (chord) {
          setCurrentChord(chord);
        }
      }
    }
  }, [selectedAnswer, question]);

  const handleAnswer = (answer: string): void => {
    if (selectedAnswer) return; // Already answered

    setSelectedAnswer(answer);
    const correct = answer === question?.correctAnswer;
    setIsCorrect(correct);

    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    setStreak(prev => (correct ? prev + 1 : 0));
  };

  const nextQuestion = (): void => {
    setQuestion(generateQuestion(difficulty));
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCurrentChord(null);
    setSelectedInstrument('guitar');
  };

  if (!question) {
    return <div>Loading...</div>;
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Stats Bar */}
      <div className="flex gap-4 justify-center">
        <Card className="flex-1">
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-[var(--success-color)]">
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
            <div className="text-2xl font-bold text-[var(--accent-color)]">
              {streak}
            </div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Question Card */}
      <Card className="border-2 shadow-[var(--shadow-warm-md)]">
        <CardHeader className="pb-4">
          <Badge variant="outline" className="w-fit mb-2 font-mono-app">
            Degree Quiz
          </Badge>
          <CardTitle className="text-2xl font-display">
            What chord quality is on degree {question.degree} of {SCALE_TYPE_NAMES[question.scaleType]}?
          </CardTitle>
          <CardDescription>
            Select the correct chord quality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="wait">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const showCorrect = selectedAnswer && option === question.correctAnswer;
                const showIncorrect = selectedAnswer && isSelected && !isCorrect;

                let variant: 'default' | 'outline' | 'secondary' = 'outline';
                let className = 'h-16 text-lg font-semibold transition-all';

                if (showCorrect) {
                  className += ' bg-[var(--success-color)] text-white border-[var(--success-color)]';
                } else if (showIncorrect) {
                  className += ' bg-[var(--error-color)] text-white border-[var(--error-color)]';
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
                  <div className="p-4 rounded-lg bg-[var(--success-bg)] border-2 border-[var(--success-color)]">
                    <div className="font-semibold text-foreground">
                      ✓ Correct!
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {getDegreeInfo(question.scaleType, question.degree)?.modeName} mode
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[var(--error-bg)] border-2 border-[var(--error-color)]">
                    <div className="font-semibold text-foreground">
                      ✗ Incorrect
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      The correct answer is <strong>{question.correctAnswer}</strong> (
                      {getDegreeInfo(question.scaleType, question.degree)?.modeName})
                    </div>
                  </div>
                )}

                {/* Chord Voicing Display */}
                {currentChord && (
                  <div className="py-4">
                    <ChordVoicingDisplay
                      chord={currentChord}
                      voicingIndex={0}
                      onInstrumentChange={setSelectedInstrument}
                    />
                  </div>
                )}

                <Button onClick={nextQuestion} size="lg" className="w-full">
                  Next Question →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

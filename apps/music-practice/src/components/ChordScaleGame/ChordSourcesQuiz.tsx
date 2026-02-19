/**
 * Chord Sources Quiz Component
 *
 * Tests knowledge of which parent scales contain a given chord quality.
 * Example: "Which of these is a valid source for m7?" → "Major, degree 2 (Dorian)"
 *
 * After answering, shows the full list of all sources for that chord quality.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CHORD_SCALE_MATRIX,
  getChordSources,
  SCALE_TYPE_NAMES,
  type ScaleType,
  type ChordScaleEntry,
} from '../../data/chord-scale-matrix';

interface ChordSourcesQuizProps {
  /** Difficulty level - determines which chord qualities are eligible */
  difficulty: 'major' | 'majorMinor' | 'allScales';
}

interface QuizQuestion {
  chordQuality: string;
  correctSource: ChordScaleEntry;
  allSources: ChordScaleEntry[];
  options: FormattedOption[];
}

interface FormattedOption {
  label: string;
  entry: ChordScaleEntry;
  isCorrect: boolean;
}

/**
 * Format a ChordScaleEntry as a readable option string
 */
function formatSource(entry: ChordScaleEntry): string {
  return `${SCALE_TYPE_NAMES[entry.scaleType]}, degree ${entry.degree} (${entry.modeName})`;
}

/**
 * Get chord qualities available for a given difficulty
 */
function getQualitiesForDifficulty(difficulty: 'major' | 'majorMinor' | 'allScales'): string[] {
  const scaleTypes: ScaleType[] =
    difficulty === 'major'
      ? ['major']
      : difficulty === 'majorMinor'
        ? ['major', 'naturalMinor']
        : ['major', 'naturalMinor', 'melodicMinor', 'harmonicMinor'];

  const qualities = new Set(
    CHORD_SCALE_MATRIX
      .filter(entry => scaleTypes.includes(entry.scaleType))
      .map(entry => entry.chordQuality)
  );

  return Array.from(qualities);
}

/**
 * Generate a random quiz question based on difficulty level
 */
function generateQuestion(difficulty: 'major' | 'majorMinor' | 'allScales'): QuizQuestion {
  // Get eligible chord qualities for this difficulty
  const eligibleQualities = getQualitiesForDifficulty(difficulty);

  // Pick a random chord quality
  const chordQuality = eligibleQualities[Math.floor(Math.random() * eligibleQualities.length)];

  // Get all sources for this chord quality
  const allSources = getChordSources(chordQuality);

  // Pick one correct source randomly
  const correctSource = allSources[Math.floor(Math.random() * allSources.length)];

  // Build a set of source keys for quick lookup
  const sourceKeys = new Set(
    allSources.map(s => `${s.scaleType}-${s.degree}`)
  );

  // Generate 3 wrong distractors from entries NOT in the sources list
  const wrongEntries = CHORD_SCALE_MATRIX
    .filter(entry => !sourceKeys.has(`${entry.scaleType}-${entry.degree}`))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Build formatted options
  const options: FormattedOption[] = [
    { label: formatSource(correctSource), entry: correctSource, isCorrect: true },
    ...wrongEntries.map(entry => ({
      label: formatSource(entry),
      entry,
      isCorrect: false,
    })),
  ].sort(() => Math.random() - 0.5);

  return {
    chordQuality,
    correctSource,
    allSources,
    options,
  };
}

export function ChordSourcesQuiz({ difficulty }: ChordSourcesQuizProps): JSX.Element {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  // Generate initial question
  useEffect(() => {
    setQuestion(generateQuestion(difficulty));
  }, [difficulty]);

  const handleAnswer = (optionLabel: string, correct: boolean): void => {
    if (selectedAnswer) return; // Already answered

    setSelectedAnswer(optionLabel);
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
            Chord Sources
          </Badge>
          <CardTitle className="text-2xl font-display">
            Which of these is a valid source for <span className="text-[var(--accent-color)]">{question.chordQuality}</span>?
          </CardTitle>
          <CardDescription>
            Select the scale degree that produces this chord quality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode="wait">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === option.label;
                const showCorrect = selectedAnswer && option.isCorrect;
                const showIncorrect = selectedAnswer && isSelected && !option.isCorrect;

                let variant: 'default' | 'outline' | 'secondary' = 'outline';
                let className = 'h-auto min-h-14 text-sm font-semibold transition-all whitespace-normal py-3 px-4';

                if (showCorrect) {
                  className += ' bg-[var(--success-color)] text-white border-[var(--success-color)]';
                } else if (showIncorrect) {
                  className += ' bg-[var(--error-color)] text-white border-[var(--error-color)]';
                } else if (isSelected) {
                  variant = 'secondary';
                }

                return (
                  <motion.div
                    key={option.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant={variant}
                      className={className}
                      onClick={() => handleAnswer(option.label, option.isCorrect)}
                      disabled={!!selectedAnswer}
                    >
                      {option.label}
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
                      Correct!
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatSource(question.correctSource)} produces {question.chordQuality}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[var(--error-bg)] border-2 border-[var(--error-color)]">
                    <div className="font-semibold text-foreground">
                      Incorrect
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      A valid source is <strong>{formatSource(question.correctSource)}</strong>
                    </div>
                  </div>
                )}

                {/* All Sources for this chord quality */}
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="text-sm font-semibold text-foreground mb-3">
                    All sources for {question.chordQuality} ({question.allSources.length} total):
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {question.allSources.map((source) => (
                      <div
                        key={`${source.scaleType}-${source.degree}`}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Badge variant="outline" className="font-mono-app text-xs shrink-0">
                          {source.romanNumeral}
                        </Badge>
                        <span className="text-muted-foreground">
                          {formatSource(source)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={nextQuestion} size="lg" className="w-full">
                  Next Question
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

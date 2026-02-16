/**
 * Scales & Modes Quiz Container
 *
 * Main component that orchestrates the quiz flow:
 * 1. Scale selection
 * 2. Quiz game
 * 3. Results summary
 */

import { useState } from 'react';
import { ScaleSelector } from './ScaleSelector';
import { QuizGame, type QuizResults } from './QuizGame';
import { ResultsSummary } from './ResultsSummary';
import { type ScaleType } from '../../data/chord-scale-matrix';

type QuizStage = 'selection' | 'playing' | 'results';

export function ScalesModesQuiz(): JSX.Element {
  const [stage, setStage] = useState<QuizStage>('selection');
  const [selectedScales, setSelectedScales] = useState<ScaleType[]>(['major']);
  const [results, setResults] = useState<QuizResults | null>(null);

  const handleScalesSelected = (scales: ScaleType[]): void => {
    setSelectedScales(scales);
    setStage('playing');
  };

  const handleQuizComplete = (quizResults: QuizResults): void => {
    setResults(quizResults);
    setStage('results');
  };

  const handleRetry = (): void => {
    setStage('selection');
    setSelectedScales(['major']);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-8">
          <h1 className="text-4xl font-bold mb-2">🎵 Scales & Modes Quiz</h1>
          <p className="text-muted-foreground text-lg">
            Master the connection between scales, modes, and their chord qualities
          </p>
        </div>

        {/* Content */}
        <div className="mb-8">
          {stage === 'selection' && <ScaleSelector onScalesSelected={handleScalesSelected} />}
          {stage === 'playing' && (
            <QuizGame selectedScales={selectedScales} onQuizComplete={handleQuizComplete} />
          )}
          {stage === 'results' && results && (
            <ResultsSummary results={results} onRetry={handleRetry} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mb-4">
          <p>
            Tip: Study the 7 modes (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian) and
            their parent scales.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Scale Selector Component
 *
 * Dropdown component to select which scale types to include in the quiz.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Badge } from '@hudak/ui/components/badge';
import { Button } from '@hudak/ui/components/button';
import { type ScaleType } from '../../data/chord-scale-matrix';

export interface ScaleSelectorProps {
  onScalesSelected: (scales: ScaleType[]) => void;
}

const SCALE_OPTIONS: { value: ScaleType; label: string; description: string }[] = [
  { value: 'major', label: 'Major', description: 'Ionian mode and relatives' },
  { value: 'naturalMinor', label: 'Natural Minor', description: 'Aeolian mode and relatives' },
  { value: 'melodicMinor', label: 'Melodic Minor', description: 'Dorian #4 and relatives' },
  { value: 'harmonicMinor', label: 'Harmonic Minor', description: 'Locrian #6 and relatives' },
];

export function ScaleSelector({ onScalesSelected }: ScaleSelectorProps): JSX.Element {
  const [selectedScales, setSelectedScales] = useState<ScaleType[]>(['major']);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'intermediate',
  );

  const handleDifficultyChange = (
    newDifficulty: 'beginner' | 'intermediate' | 'advanced',
  ): void => {
    setDifficulty(newDifficulty);

    let scales: ScaleType[] = [];
    if (newDifficulty === 'beginner') {
      scales = ['major'];
    } else if (newDifficulty === 'intermediate') {
      scales = ['major', 'naturalMinor'];
    } else {
      scales = ['major', 'naturalMinor', 'melodicMinor', 'harmonicMinor'];
    }

    setSelectedScales(scales);
  };

  const toggleScale = (scale: ScaleType): void => {
    setSelectedScales(prev => {
      if (prev.includes(scale)) {
        // Don't allow deselecting all scales
        if (prev.length === 1) return prev;
        return prev.filter(s => s !== scale);
      }
      return [...prev, scale];
    });
  };

  const handleStart = (): void => {
    if (selectedScales.length > 0) {
      onScalesSelected(selectedScales);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Scales & Modes Quiz</CardTitle>
        <CardDescription>Select which scales to include in your quiz</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Difficulty Presets */}
        <div className="space-y-3">
          <label className="text-sm font-semibold">Difficulty Presets</label>
          <div className="grid grid-cols-3 gap-2">
            {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
              <Button
                key={level}
                variant={difficulty === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDifficultyChange(level)}
                className="capitalize"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* Scale Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold">Include Scales</label>
          <div className="space-y-2">
            {SCALE_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => toggleScale(option.value)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  selectedScales.includes(option.value)
                    ? 'border-[var(--accent-color)] bg-[var(--accent-light)]'
                    : 'border-border hover:border-[var(--accent-color)]'
                }`}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
                {selectedScales.includes(option.value) && (
                  <Badge className="mt-2 bg-[var(--accent-color)]">Selected</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Scales Summary */}
        <div className="p-3 rounded-lg bg-secondary">
          <div className="text-sm font-semibold mb-2">Selected:</div>
          <div className="flex flex-wrap gap-2">
            {selectedScales.length > 0 ? (
              selectedScales.map(scale => (
                <Badge key={scale} variant="secondary" className="capitalize">
                  {scale === 'naturalMinor'
                    ? 'Natural Minor'
                    : scale === 'melodicMinor'
                      ? 'Melodic Minor'
                      : scale === 'harmonicMinor'
                        ? 'Harmonic Minor'
                        : 'Major'}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">Select at least one scale</span>
            )}
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStart}
          disabled={selectedScales.length === 0}
          size="lg"
          className="w-full"
        >
          Start Quiz →
        </Button>
      </CardContent>
    </Card>
  );
}

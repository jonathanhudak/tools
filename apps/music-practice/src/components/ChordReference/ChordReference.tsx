/**
 * ChordReference - Main chord learning interface
 * Combines search, diagram, and audio playback
 */

import { useState } from 'react';
import type { Chord } from '@/lib/chord-library';
import { getRandomChord } from '@/lib/chord-library';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { ChordDiagram } from './ChordDiagram';
import { PianoKeyboard } from './PianoKeyboard';
import { ChordPlayer } from './ChordPlayer';
import { ChordSearch } from './ChordSearch';
import { InstrumentSelector, type Instrument } from '../InstrumentSelector';
import { Shuffle, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChordReferenceProps {
  onStartQuiz?: () => void;
}

export function ChordReference({ onStartQuiz }: ChordReferenceProps): JSX.Element {
  const [selectedChord, setSelectedChord] = useState<Chord | null>(() => getRandomChord());
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('guitar');

  const handleRandomChord = () => {
    setSelectedChord(getRandomChord());
  };

  const handleDifficultyRandom = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    setSelectedChord(getRandomChord(difficulty));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Chord Reference Library
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Learn chord fingerings, shapes, and sounds
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search & Filter */}
          <div className="lg:col-span-1">
            <ChordSearch onChordSelect={setSelectedChord} selectedChord={selectedChord || undefined} />
          </div>

          {/* Main content - Chord diagram + player */}
          <div className="lg:col-span-2 space-y-4">
            {selectedChord ? (
              <>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>{selectedChord.name}</CardTitle>
                    <CardDescription>{selectedChord.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Instrument Selector */}
                    <div className="flex justify-center">
                      <InstrumentSelector
                        selected={selectedInstrument}
                        onChange={setSelectedInstrument}
                        size="default"
                      />
                    </div>

                    {/* Chord Diagram - Guitar or Piano */}
                    <div className="flex justify-center">
                      {selectedInstrument === 'guitar' ? (
                        <ChordDiagram chord={selectedChord} size="large" />
                      ) : (
                        <PianoKeyboard chord={selectedChord} size="large" />
                      )}
                    </div>

                    {/* Audio Player */}
                    <div className="flex justify-center">
                      <ChordPlayer chord={selectedChord} size="lg" />
                    </div>

                    {/* Chord Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-semibold capitalize">{selectedChord.type}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Difficulty:</span>
                        <p className="font-semibold capitalize">{selectedChord.difficulty}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Tags:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedChord.tags.map(tag => (
                            <span key={tag} className="text-xs bg-secondary px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    onClick={handleRandomChord}
                    variant="secondary"
                    className="gap-2"
                  >
                    <Shuffle className="w-4 h-4" />
                    Random Chord
                  </Button>
                  {onStartQuiz && (
                    <Button
                      onClick={onStartQuiz}
                      variant="default"
                      className="gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Start Quiz
                    </Button>
                  )}
                </div>

                {/* Difficulty-based navigation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Jump by Difficulty</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDifficultyRandom('beginner')}
                      className="text-xs"
                    >
                      🟢 Beginner
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDifficultyRandom('intermediate')}
                      className="text-xs"
                    >
                      🟡 Intermediate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDifficultyRandom('advanced')}
                      className="text-xs"
                    >
                      🔴 Advanced
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <p className="text-muted-foreground">Select a chord to get started</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

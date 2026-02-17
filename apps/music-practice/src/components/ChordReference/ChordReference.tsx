/**
 * ChordReference - Main chord learning interface
 * Combines search, diagram, and audio playback with tier filtering and piano support
 */

import { useState } from 'react';
import type { Chord } from '@/lib/chord-library';
import { CHORD_LIBRARY } from '@/lib/chord-library';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { ChordDiagram } from './ChordDiagram';
import { ChordPlayer } from './ChordPlayer';
import { ChordSearch } from './ChordSearch';
import { InstrumentToggle } from '../Piano/InstrumentToggle';
import { PianoKeyboard } from '../Piano/PianoKeyboard';
import { Shuffle, BookOpen, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChordReferenceProps {
  onStartQuiz?: () => void;
}

type Instrument = 'guitar' | 'piano';
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'jazz';

export function ChordReference({ onStartQuiz }: ChordReferenceProps): JSX.Element {
  const [selectedChord, setSelectedChord] = useState<Chord | null>(() => CHORD_LIBRARY[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('beginner');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('guitar');
  const [selectedVoicing, setSelectedVoicing] = useState(0);

  // Filter chords by difficulty
  const filteredChords = CHORD_LIBRARY.filter(chord => chord.difficulty === selectedDifficulty);

  const handleRandomChord = () => {
    if (filteredChords.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredChords.length);
      setSelectedChord(filteredChords[randomIndex]);
      setSelectedVoicing(0);
    }
  };

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    const chordsInDifficulty = CHORD_LIBRARY.filter(c => c.difficulty === difficulty);
    if (chordsInDifficulty.length > 0) {
      setSelectedChord(chordsInDifficulty[0]);
      setSelectedVoicing(0);
    }
  };

  const handleInstrumentChange = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    setSelectedVoicing(0);
  };

  const currentVoicing = selectedChord?.voicings[selectedVoicing];

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
            Learn chord fingerings with guitar & piano support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1 space-y-4">
            {/* Difficulty Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Difficulty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(['beginner', 'intermediate', 'advanced', 'jazz'] as const).map(diff => {
                  const count = CHORD_LIBRARY.filter(c => c.difficulty === diff).length;
                  return (
                    <Button
                      key={diff}
                      variant={selectedDifficulty === diff ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDifficultyChange(diff)}
                      className="w-full justify-start"
                    >
                      <span className="capitalize">{diff}</span>
                      <span className="ml-auto text-xs opacity-60">({count})</span>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Search & Select */}
            <ChordSearch onChordSelect={setSelectedChord} selectedChord={selectedChord || undefined} />

            {/* Quick Actions */}
            <Button
              onClick={handleRandomChord}
              variant="secondary"
              className="w-full gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Random Chord
            </Button>

            {onStartQuiz && (
              <Button
                onClick={onStartQuiz}
                variant="default"
                className="w-full gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Start Quiz
              </Button>
            )}
          </div>

          {/* Main Content - Chord Display */}
          <div className="lg:col-span-3 space-y-4">
            {selectedChord ? (
              <>
                {/* Chord Header */}
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-3xl">{selectedChord.shortName}</CardTitle>
                        <CardDescription>{selectedChord.name}</CardDescription>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-secondary rounded-full text-xs font-medium capitalize">
                          {selectedChord.difficulty}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedChord.description}</p>
                  </CardContent>
                </Card>

                {/* Instrument Toggle */}
                <div className="flex justify-center">
                  <InstrumentToggle
                    instrument={selectedInstrument}
                    onInstrumentChange={handleInstrumentChange}
                  />
                </div>

                {/* Main Chord Display */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedInstrument === 'guitar' ? '🎸 Guitar' : '🎹 Piano'} Voicing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Voicing Selector */}
                    {selectedChord.voicings.length > 1 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Voicing Options:</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedChord.voicings.map((voicing, idx) => (
                            <Button
                              key={idx}
                              variant={selectedVoicing === idx ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setSelectedVoicing(idx)}
                              className="text-xs"
                            >
                              {voicing.voicingName}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Display Based on Instrument */}
                    {selectedInstrument === 'guitar' && currentVoicing?.guitar ? (
                      <>
                        {/* Guitar Diagram */}
                        <div className="flex justify-center py-4">
                          <ChordDiagram chord={selectedChord} voicing={currentVoicing} size="large" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          {currentVoicing.guitar.description}
                        </p>
                      </>
                    ) : selectedInstrument === 'piano' && currentVoicing?.piano ? (
                      <>
                        {/* Piano Keyboard Display */}
                        <div className="flex flex-col items-center gap-4">
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 w-full overflow-x-auto">
                            <div className="inline-flex gap-0.5">
                              {currentVoicing.piano.notes.map((note, idx) => {
                                const noteNum = note.charCodeAt(0) - 'C'.charCodeAt(0);
                                const octave = parseInt(note.slice(1));
                                const noteClass = note.includes('#') ? 'bg-black' : 'bg-white';
                                const isBlackKey = note.includes('#');

                                return (
                                  <div key={idx} className="flex flex-col items-center gap-1">
                                    <div
                                      className={`${
                                        isBlackKey
                                          ? 'w-8 h-20 rounded-b'
                                          : 'w-10 h-24 rounded-b border-2 border-gray-400'
                                      } ${noteClass} shadow-md flex items-end justify-center pb-2`}
                                    >
                                      <span className="text-xs font-bold">{note}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground text-center">
                            {currentVoicing.piano.description}
                          </p>
                        </div>
                      </>
                    ) : null}

                    {/* Audio Player */}
                    <div className="flex justify-center pt-4 border-t">
                      <ChordPlayer chord={selectedChord} size="lg" />
                    </div>
                  </CardContent>
                </Card>

                {/* Theory Info */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      <CardTitle className="text-base">Theory</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Construction:</span>
                      <p className="text-sm mt-1">{selectedChord.theory.construction}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Intervals:</span>
                      <p className="text-sm mt-1">{selectedChord.theory.intervals.join(' - ')}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Common Progressions:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedChord.theory.commonProgressions.map(prog => (
                          <span key={prog} className="text-xs bg-secondary px-2 py-1 rounded-full">
                            {prog}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedChord.tags.map(tag => (
                          <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Select a chord to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

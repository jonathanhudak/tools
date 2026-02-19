/**
 * ChordReference - Main chord learning interface
 * Combines search, diagram, and audio playback with tier filtering and piano support
 */

import { useState, useMemo, useCallback } from 'react';
import type { Chord } from '@/lib/chord-library';
import { CHORD_LIBRARY } from '@/lib/chord-library';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { ChordDiagram } from './ChordDiagram';
import { PianoChordDiagram } from './PianoChordDiagram';
import { ChordPlayer } from './ChordPlayer';
import { ChordSearch } from './ChordSearch';
import { ChordTierFilter } from './ChordTierFilter';
import { ChordProgressionBuilder } from './ChordProgressionBuilder';
import { InstrumentToggle } from '../Piano/InstrumentToggle';
import { Shuffle, BookOpen, Info, Grid3x3, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@hudak/ui/components/tabs';

interface ChordReferenceProps {
  onStartQuiz?: () => void;
}

type Instrument = 'guitar' | 'piano';
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'jazz';
type ViewMode = 'browser' | 'progression' | 'comparison';

export function ChordReference({ onStartQuiz }: ChordReferenceProps): JSX.Element {
  const [selectedChord, setSelectedChord] = useState<Chord | null>(() => CHORD_LIBRARY[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('beginner');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('guitar');
  const [selectedVoicing, setSelectedVoicing] = useState(0);
  const [selectedTiers, setSelectedTiers] = useState<Set<Difficulty>>(
    new Set(['beginner', 'intermediate', 'advanced', 'jazz'] as const)
  );
  const [viewMode, setViewMode] = useState<ViewMode>('browser');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  // Handle tier toggle with immutable Set
  const handleTierToggle = useCallback((tier: Difficulty) => {
    setSelectedTiers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tier)) {
        newSet.delete(tier);
      } else {
        newSet.add(tier);
      }
      return newSet;
    });
  }, []);

  // Memoized filtered chords by tier
  const chordsInSelectedTiers = useMemo(() => {
    return CHORD_LIBRARY.filter(chord => selectedTiers.has(chord.difficulty));
  }, [selectedTiers]);

  // Filter chords by difficulty (legacy support)
  const filteredChords = useMemo(
    () => CHORD_LIBRARY.filter(chord => chord.difficulty === selectedDifficulty),
    [selectedDifficulty]
  );

  const handleRandomChord = useCallback(() => {
    const chordsToUse = selectedTiers.size > 0 ? chordsInSelectedTiers : filteredChords;
    if (chordsToUse.length > 0) {
      const randomIndex = Math.floor(Math.random() * chordsToUse.length);
      setSelectedChord(chordsToUse[randomIndex]);
      setSelectedVoicing(0);
    }
  }, [filteredChords, chordsInSelectedTiers, selectedTiers.size]);

  const handleDifficultyChange = useCallback((difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    const chordsInDifficulty = CHORD_LIBRARY.filter(c => c.difficulty === difficulty);
    if (chordsInDifficulty.length > 0) {
      setSelectedChord(chordsInDifficulty[0]);
      setSelectedVoicing(0);
    }
  }, []);

  const handleInstrumentChange = useCallback((instrument: Instrument) => {
    setSelectedInstrument(instrument);
    setSelectedVoicing(0);
  }, []);

  const handleProgressionSelect = useCallback((chords: Chord[]) => {
    if (chords.length > 0) {
      setSelectedChord(chords[0]);
      setSelectedVoicing(0);
      // Could extend to show progression sequence
    }
  }, []);

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
            <div className="p-3 rounded-2xl bg-[var(--accent-color)] shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground">
            Chord Reference Library
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-lg">
            Learn chord fingerings with guitar & piano support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters (responsive) */}
          <div className="lg:col-span-1 space-y-4">
            {/* Tier Filter */}
            <ChordTierFilter
              selectedTiers={selectedTiers}
              onTierToggle={handleTierToggle}
              showCounts={true}
              compact={isMobile}
            />

            {/* Difficulty Filter (legacy) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Filter</CardTitle>
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
                      className="w-full justify-start text-xs md:text-sm"
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
              className="w-full gap-2 text-sm"
            >
              <Shuffle className="w-4 h-4" />
              Random Chord
            </Button>

            {onStartQuiz && (
              <Button
                onClick={onStartQuiz}
                variant="default"
                className="w-full gap-2 text-sm"
              >
                <BookOpen className="w-4 h-4" />
                Start Quiz
              </Button>
            )}
          </div>

          {/* Main Content - Chord Display with Tabs */}
          <div className="lg:col-span-3 space-y-4">
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as ViewMode)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="browser" className="gap-2 text-xs md:text-sm">
                  <Grid3x3 className="w-4 h-4" />
                  Browser
                </TabsTrigger>
                <TabsTrigger value="progression" className="gap-2 text-xs md:text-sm">
                  <BarChart3 className="w-4 h-4" />
                  Progressions
                </TabsTrigger>
                <TabsTrigger value="comparison" className="gap-2 text-xs md:text-sm">
                  <Info className="w-4 h-4" />
                  Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="browser" className="space-y-4">
                {selectedChord ? (
                  <>
                    {/* Chord Header */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Card className="border-2">
                        <CardHeader>
                          <div className="flex items-start justify-between flex-col md:flex-row gap-2">
                            <div>
                              <CardTitle className="text-2xl md:text-3xl">{selectedChord.shortName}</CardTitle>
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
                    </motion.div>

                    {/* Instrument Toggle */}
                    <div className="flex justify-center">
                      <InstrumentToggle
                        instrument={selectedInstrument}
                        onChange={handleInstrumentChange}
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
                            {/* Piano Keyboard Diagram */}
                            <div className="flex flex-col items-center gap-4 py-4">
                              <PianoChordDiagram voicing={currentVoicing} size="large" />
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                              {currentVoicing.piano.description}
                            </p>
                          </>
                        ) : null}

                        {/* Audio Player */}
                        <div className="flex justify-center pt-4 border-t">
                          <ChordPlayer chord={selectedChord} size="lg" />
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
              </TabsContent>

              <TabsContent value="progression">
                <ChordProgressionBuilder
                  rootChord={selectedChord || undefined}
                  onProgressionSelect={handleProgressionSelect}
                />
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                {selectedChord ? (
                  <>
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
                              <span
                                key={prog}
                                className="text-xs bg-secondary px-2 py-1 rounded-full"
                              >
                                {prog}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedChord.tags.map(tag => (
                              <span
                                key={tag}
                                className="text-xs bg-[var(--accent-light)] text-[var(--accent-color)] px-2 py-1 rounded-full"
                              >
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

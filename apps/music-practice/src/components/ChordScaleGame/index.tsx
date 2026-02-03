/**
 * Chord-Scale Matrix Game - Main Container
 *
 * Based on Jeff Schneider's "Last Chord Scale Charts" system.
 * Helps internalize chord-scale relationships across all 4 scale families.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@hudak/ui/components/select';
import { Label } from '@hudak/ui/components/label';
import { Brain, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { DegreeQuiz } from './DegreeQuiz';

type GameMode = 'degreeQuiz';
type Difficulty = 'major' | 'majorMinor' | 'allScales';

export function ChordScaleGame(): JSX.Element {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode] = useState<GameMode>('degreeQuiz');
  const [difficulty, setDifficulty] = useState<Difficulty>('major');

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-3 mb-4"
            >
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Chord-Scale Matrix Trainer
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Master chord-scale relationships for jazz improvisation
            </p>
          </div>

          {/* Settings Card */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Practice Settings</CardTitle>
              </div>
              <CardDescription>Configure your practice session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Game Mode Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Game Mode</Label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    className="relative p-4 rounded-xl border-2 border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                  >
                    <div className="flex items-center gap-3">
                      <Brain className="h-6 w-6 text-violet-600" />
                      <div className="text-left">
                        <div className="text-sm font-medium">Degree Quiz</div>
                        <div className="text-xs text-muted-foreground">
                          Quick-fire questions: "What chord is on degree 4 of Melodic Minor?"
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-auto">Active</Badge>
                    </div>
                  </button>

                  {/* Coming Soon Game Modes */}
                  <div className="relative p-4 rounded-xl border-2 border-dashed border-muted opacity-50">
                    <div className="flex items-center gap-3">
                      <Brain className="h-6 w-6 text-muted-foreground" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-muted-foreground">Chord → Sources</div>
                        <div className="text-xs text-muted-foreground">
                          Find all parent scales for a given chord
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-auto">Coming Soon</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="major">Major Scale Only</SelectItem>
                    <SelectItem value="majorMinor">Major + Natural Minor</SelectItem>
                    <SelectItem value="allScales">All 4 Scale Families</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {difficulty === 'major' && 'Learn the 7 chords of the major scale'}
                  {difficulty === 'majorMinor' && 'Add natural minor scale chords'}
                  {difficulty === 'allScales' && 'Master all 28 chord-scale relationships'}
                </p>
              </div>

              {/* Start Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => setGameStarted(true)}
                  size="lg"
                  className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg"
                >
                  <Brain className="mr-3 h-6 w-6" />
                  Start Practice
                </Button>
              </motion.div>

              {/* Info */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Based on Jeff Schneider's "Last Chord Scale Charts" system</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Game started - render the active game mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Exit Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-violet-600" />
            <h1 className="text-2xl font-bold">Chord-Scale Matrix Trainer</h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => setGameStarted(false)}
          >
            ← Back to Settings
          </Button>
        </div>

        {/* Render Game Mode */}
        {gameMode === 'degreeQuiz' && <DegreeQuiz difficulty={difficulty} />}
      </div>
    </div>
  );
}

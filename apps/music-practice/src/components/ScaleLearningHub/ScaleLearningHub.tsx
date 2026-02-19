/**
 * ScaleLearningHub - Main entry point for scale learning & quiz
 * Manages navigation between reference library and quiz games
 */

import { useState } from 'react';
import { ScaleReference } from '../ScaleReference/ScaleReference';
import { ScalesModesQuiz } from '../ChordScaleGame/ScalesModesQuiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { BookOpen, Zap, Music, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

type View = 'menu' | 'reference' | 'quiz';

export function ScaleLearningHub(): JSX.Element {
  const [view, setView] = useState<View>('menu');

  // Reference View
  if (view === 'reference') {
    return <ScaleReference onBack={() => setView('menu')} />;
  }

  // Quiz View
  if (view === 'quiz') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('menu')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Button>
          <ScalesModesQuiz />
        </div>
      </div>
    );
  }

  // Menu View
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="p-3 rounded-2xl bg-[var(--accent-color)] shadow-lg">
              <Music className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-5xl font-bold font-display text-foreground mb-3">
            Scale Learning System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master scales, modes, and their chord relationships through interactive reference and practice
          </p>
        </div>

        {/* Main options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Scales Reference Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card
              className="border-2 h-full cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setView('reference')}
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-6 h-6 text-[var(--accent-color)]" />
                  <CardTitle>Scales Reference</CardTitle>
                </div>
                <CardDescription>
                  Explore all scale families, modes, and their chord relationships
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🎼</span>
                    <span>4 scale families with all 28 modes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🎹</span>
                    <span>Chord quality for every degree</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🎸</span>
                    <span>Interactive chord voicing display</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">📖</span>
                    <span>Mode descriptions and theory</span>
                  </li>
                </ul>
                <Button className="w-full mt-4" variant="default">
                  Open Scales Reference &rarr;
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quiz Modes Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card
              className="border-2 h-full cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setView('quiz')}
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-6 h-6 text-[var(--accent-color)]" />
                  <CardTitle>Quiz Modes</CardTitle>
                </div>
                <CardDescription>
                  Test your scale-mode knowledge through practice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <span>Scale selection by family</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🧩</span>
                    <span>Mode identification challenges</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🔗</span>
                    <span>Chord quality recognition</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    <span>Track your progress</span>
                  </li>
                </ul>
                <Button className="w-full mt-4" variant="default">
                  Start Quiz &rarr;
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

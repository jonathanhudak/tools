/**
 * ChordLearningHub - Main entry point for chord learning & quiz
 * Manages navigation between reference library and quiz games
 */

import { useState } from 'react';
import { ChordReference } from '../ChordReference/ChordReference';
import { ChordQuiz } from '../ChordQuiz/ChordQuiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { BookOpen, Zap, Target, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

type View = 'menu' | 'reference' | 'quiz';
type QuizMode = 'speed' | 'accuracy' | 'progression';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface QuizConfig {
  mode: QuizMode;
  difficulty: Difficulty;
}

export function ChordLearningHub(): JSX.Element {
  const [view, setView] = useState<View>('menu');
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);

  const handleStartQuiz = (mode: QuizMode, difficulty: Difficulty) => {
    setQuizConfig({ mode, difficulty });
    setView('quiz');
  };

  const handleBackToMenu = () => {
    setView('menu');
    setQuizConfig(null);
  };

  const handleToReference = () => {
    setView('reference');
  };

  const handleToQuiz = () => {
    setView('menu');
  };

  // Reference View
  if (view === 'reference') {
    return (
      <ChordReference
        onStartQuiz={() => {
          setView('menu');
        }}
      />
    );
  }

  // Quiz View
  if (view === 'quiz' && quizConfig) {
    return (
      <ChordQuiz
        mode={quizConfig.mode}
        difficulty={quizConfig.difficulty}
        questionCount={10}
        onBack={handleBackToMenu}
      />
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
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Chord Learning System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master guitar chords with our interactive reference library and challenging quiz games
          </p>
        </div>

        {/* Main options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Reference Library Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card className="border-2 h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={handleToReference}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-6 h-6 text-amber-600" />
                  <CardTitle>Chord Reference</CardTitle>
                </div>
                <CardDescription>Learn and explore all chord fingerings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <span>100+ chord diagrams with fingerings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🔊</span>
                    <span>Audio playback for each chord</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🔍</span>
                    <span>Search and filter by difficulty & type</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    <span>Progress from beginner to advanced</span>
                  </li>
                </ul>
                <Button className="w-full mt-4" variant="default">
                  Open Reference Library →
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quiz Mode Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card className="border-2 h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={handleToQuiz}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-6 h-6 text-yellow-600" />
                  <CardTitle>Quiz Modes</CardTitle>
                </div>
                <CardDescription>Test your chord knowledge in different game modes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    <span>Speed Mode - Answer fast!</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <span>Accuracy Mode - Get every one right</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    <span>Progression Mode - Increasing difficulty</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <span>Leaderboard tracking</span>
                  </li>
                </ul>
                <Button className="w-full mt-4" variant="default">
                  Choose Quiz Mode →
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quiz mode selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Start a Quiz</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Speed Mode */}
            <Card className="border cursor-pointer hover:shadow-lg transition-all hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <CardTitle className="text-lg">Speed Mode</CardTitle>
                </div>
                <CardDescription>Race against time! 30 seconds per question.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  More points for faster correct answers. Perfect for quick drills.
                </p>
                <div className="space-y-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map(diff => (
                    <Button
                      key={diff}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleStartQuiz('speed', diff)}
                    >
                      {diff === 'beginner' ? '🟢' : diff === 'intermediate' ? '🟡' : '🔴'} {diff}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Accuracy Mode */}
            <Card className="border cursor-pointer hover:shadow-lg transition-all hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg">Accuracy Mode</CardTitle>
                </div>
                <CardDescription>No time limit. Focus on getting every answer right.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Take your time and maximize accuracy. Perfect for learning.
                </p>
                <div className="space-y-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map(diff => (
                    <Button
                      key={diff}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleStartQuiz('accuracy', diff)}
                    >
                      {diff === 'beginner' ? '🟢' : diff === 'intermediate' ? '🟡' : '🔴'} {diff}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progression Mode */}
            <Card className="border cursor-pointer hover:shadow-lg transition-all hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-lg">Progression</CardTitle>
                </div>
                <CardDescription>Start easy, difficulty increases with your score.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Adaptive difficulty. Best for challenging yourself.
                </p>
                <div className="space-y-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map(diff => (
                    <Button
                      key={diff}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleStartQuiz('progression', diff)}
                    >
                      {diff === 'beginner' ? '🟢' : diff === 'intermediate' ? '🟡' : '🔴'} {diff}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Features */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2">
          <CardHeader>
            <CardTitle className="text-center">Why Use Our Chord System?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🎸</div>
                <h3 className="font-semibold mb-2">Complete Library</h3>
                <p className="text-sm text-muted-foreground">
                  Over 100 chords covering all common shapes and variations
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🎓</div>
                <h3 className="font-semibold mb-2">Progressive Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Structured difficulty levels from beginner to advanced
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="font-semibold mb-2">Gamified Practice</h3>
                <p className="text-sm text-muted-foreground">
                  Compete on leaderboards and track your progress over time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

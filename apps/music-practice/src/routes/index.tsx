/**
 * Landing Route - Music Theory Reference Hub
 * Shows all available reference modules and theory tools
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@hudak/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Music, Zap, BookOpen, Grid3x3, ArrowRight, Target, Compass, ListMusic, Ruler, AudioWaveform, Shuffle, Ear, Layers, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Route = createFileRoute('/')(  {
  component: LandingRoute,
});

function LandingRoute() {
  const navigate = useNavigate();

  const referenceModules = [
    {
      id: 'scales-quiz',
      title: 'Scales & Modes',
      description: 'Explore 5 scale families, 35 modes, and their chord relationships',
      icon: Music,
      buttonText: 'Explore',
    },
    {
      id: 'chord-quiz',
      title: 'Chord Library',
      description: 'Browse 100+ chord diagrams with guitar and piano voicings',
      icon: BookOpen,
      buttonText: 'Browse',
    },
    {
      id: 'circle-of-fifths',
      title: 'Circle of Fifths',
      description: 'Interactive key relationship diagram with diatonic chords',
      icon: Target,
      buttonText: 'Open',
    },
    {
      id: 'scale-explorer',
      title: 'Scale Explorer',
      description: '62 scales in 9 families — pentatonic, blues, bebop, symmetric, world — with audio and drone',
      icon: Compass,
      buttonText: 'Explore',
    },
    {
      id: 'progressions',
      title: 'Progressions',
      description: '35 progressions with playback, guide tones, and all-12-keys cycling',
      icon: ListMusic,
      buttonText: 'Play',
    },
    {
      id: 'intervals',
      title: 'Intervals',
      description: 'Every interval with audio, inversions, and visual or by-ear quizzes',
      icon: Ruler,
      buttonText: 'Learn',
    },
    {
      id: 'arpeggios',
      title: 'Arpeggios',
      description: '33 arpeggios through 10 practice patterns in any key',
      icon: AudioWaveform,
      buttonText: 'Practice',
    },
  ];

  const toolModules = [
    {
      id: 'chord-scale',
      title: 'Chord-Scale Matrix',
      description: 'See which chords live on every degree of every scale',
      icon: Grid3x3,
      buttonText: 'Open',
    },
    {
      id: 'play',
      title: 'Sight Reading',
      description: 'Practice reading notation with MIDI, microphone, or virtual keyboard',
      icon: Zap,
      buttonText: 'Open',
    },
    {
      id: 'practice',
      title: 'Practice Hub',
      description: 'Improv prompt generator with lockable constraints, plus a timed session builder',
      icon: Shuffle,
      buttonText: 'Open',
    },
    {
      id: 'ear-training',
      title: 'Ear Training',
      description: 'Identify chord qualities and scale flavors by ear',
      icon: Ear,
      buttonText: 'Train',
    },
    {
      id: 'review',
      title: 'Review (SRS)',
      description: 'Spaced-repetition flashcards: chord spellings, key signatures, intervals',
      icon: Layers,
      buttonText: 'Review',
    },
    {
      id: 'stats',
      title: 'Practice Journal',
      description: 'Streaks, accuracy trends, and session history — all on this device',
      icon: BarChart3,
      buttonText: 'View',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold font-display text-foreground mb-4">Music Theory Reference</h1>
          <p className="text-muted-foreground text-xl">Interactive reference for scales, chords, and music theory</p>
        </motion.div>

        {/* Reference Library */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h2 className="text-2xl font-bold font-display text-foreground mb-6">Reference Library</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {referenceModules.map((module, idx) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.2) }}
              >
                <Card
                  onClick={() => navigate({ to: `/${module.id}` })}
                  className="cursor-pointer transition-all hover:shadow-[var(--shadow-warm-lg)] hover:scale-[1.02] shadow-[var(--shadow-warm-sm)] h-full"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{module.title}</CardTitle>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--accent-color)] text-white">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({ to: `/${module.id}` });
                      }}
                      className="w-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white"
                    >
                      {module.buttonText} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Theory Tools */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-2xl font-bold font-display text-foreground mb-6">Theory Tools</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {toolModules.map((module, idx) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(0.15 + idx * 0.04, 0.35) }}
              >
                <Card
                  onClick={() => navigate({ to: `/${module.id}` })}
                  className="cursor-pointer transition-all hover:shadow-[var(--shadow-warm-lg)] hover:scale-[1.02] shadow-[var(--shadow-warm-sm)] h-full"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{module.title}</CardTitle>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--accent-color)] text-white">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({ to: `/${module.id}` });
                      }}
                      className="w-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white"
                    >
                      {module.buttonText} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

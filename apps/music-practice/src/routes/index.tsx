/**
 * Landing Route - Music Practice Suite Hub
 * Shows all available practice modules
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@hudak/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Music, Zap, BookOpen, Grid3x3, ArrowRight, Disc3 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Route = createFileRoute('/')({
  component: LandingRoute,
});

function LandingRoute() {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'scales-quiz',
      title: 'Scales Quiz',
      description: 'Practice major and minor scales with guitar and piano',
      details: 'Learn scale theory through interactive identification practice. Toggle between guitar fretboard and piano keyboard.',
      icon: Music,
      buttonText: 'Start Quiz',
    },
    {
      id: 'chord-quiz',
      title: 'Chord Quiz',
      description: 'Learn and identify chords with visual reference',
      details: 'Master chord theory with interactive learning. Browse chord diagrams and audio, then test yourself with quizzes. Supports guitar and piano.',
      icon: BookOpen,
      buttonText: 'Start Quiz',
    },
    {
      id: 'chord-scale',
      title: 'Chord-Scale Matrix',
      description: 'Understand which scales work with which chords',
      details: 'Learn the relationships between chords and scales. Interactive matrix game shows you which scales contain which chords.',
      icon: Grid3x3,
      buttonText: 'Play Game',
    },
    {
      id: 'circle-of-fifths',
      title: 'Circle of Fifths',
      description: 'Navigate all 12 keys and relative minor relationships',
      details: 'Interactive key wheel with major/minor rings, keyboard navigation, and diatonic chord reference.',
      icon: Disc3,
      buttonText: 'Explore',
    },
    {
      id: 'play',
      title: 'Sight Reading',
      description: 'Practice reading sheet music in real-time',
      details: 'Become a fluent music reader. See a note on staff, identify it on your instrument. Supports MIDI, microphone, and virtual keyboard.',
      icon: Zap,
      buttonText: 'Start Practice',
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
          <h1 className="text-5xl font-bold font-display text-foreground mb-4">Music Practice Suite</h1>
          <p className="text-muted-foreground text-xl">Master your music theory, scales, chords, and sight-reading</p>
        </motion.div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {modules.map((module, idx) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  onClick={() => navigate({ to: `/${module.id}` })}
                  className="cursor-pointer transition-all hover:shadow-[var(--shadow-warm-lg)] hover:scale-[1.02] shadow-[var(--shadow-warm-sm)]"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{module.title}</CardTitle>
                        <CardDescription className="mt-1">{module.description}</CardDescription>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--accent-color)] text-white">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{module.details}</p>
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

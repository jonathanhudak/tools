/**
 * Landing Route - Music Theory Reference Hub
 * Shows all available reference modules and theory tools
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@hudak/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Music, Zap, BookOpen, Grid3x3, ArrowRight, Target } from 'lucide-react';
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
      description: 'Explore 4 scale families, 28 modes, and their chord relationships',
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
                transition={{ delay: idx * 0.1 }}
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
          transition={{ delay: 0.3 }}
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
                transition={{ delay: 0.3 + idx * 0.1 }}
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

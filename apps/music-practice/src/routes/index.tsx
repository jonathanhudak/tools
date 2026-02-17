/**
 * Landing Route - Music Practice Suite Hub
 * Shows all available practice modules
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@hudak/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Music, Zap, BookOpen, Grid3x3 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Route = createFileRoute('/')({
  component: LandingRoute,
});

function LandingRoute() {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'scales-quiz',
      title: '🎸 Scales Quiz',
      description: 'Practice major and minor scales with guitar and piano',
      details: 'Learn scale theory through interactive identification practice. Toggle between guitar fretboard and piano keyboard.',
      icon: Music,
      color: 'from-blue-500 to-blue-600',
      borderColor: 'hover:border-blue-500',
      buttonText: 'Start Quiz',
    },
    {
      id: 'chord-quiz',
      title: '🎹 Chord Recognition',
      description: 'Learn and identify chords with visual reference',
      details: 'Master chord theory with interactive learning. Browse chord diagrams and audio, then test yourself with quizzes. Supports guitar and piano.',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      borderColor: 'hover:border-purple-500',
      buttonText: 'Start Quiz',
    },
    {
      id: 'chord-scale',
      title: '🔗 Chord-Scale Matrix',
      description: 'Understand which scales work with which chords',
      details: 'Learn the relationships between chords and scales. Interactive matrix game shows you which scales contain which chords.',
      icon: Grid3x3,
      color: 'from-green-500 to-green-600',
      borderColor: 'hover:border-green-500',
      buttonText: 'Play Game',
    },
    {
      id: 'play',
      title: '📖 Sight Reading',
      description: 'Practice reading sheet music in real-time',
      details: 'Become a fluent music reader. See a note on staff, identify it on your instrument. Supports MIDI, microphone, and virtual keyboard.',
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      borderColor: 'hover:border-orange-500',
      buttonText: 'Start Practice',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-4">Music Practice Suite</h1>
          <p className="text-slate-300 text-xl">Master your music theory, scales, chords, and sight-reading</p>
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
                  className={`bg-slate-800/50 border-slate-700 ${module.borderColor} cursor-pointer transition-all hover:shadow-2xl hover:scale-105`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-white">{module.title}</CardTitle>
                        <CardDescription className="text-slate-400 mt-1">{module.description}</CardDescription>
                      </div>
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 mb-4">{module.details}</p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({ to: `/${module.id}` });
                      }}
                      className={`w-full bg-gradient-to-r ${module.color} hover:opacity-90 text-white`}
                    >
                      {module.buttonText} →
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Why Choose Music Practice?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">🎵 Guitar & Piano</h3>
              <p className="text-slate-400 text-sm">Practice on your preferred instrument</p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">📊 Instant Feedback</h3>
              <p className="text-slate-400 text-sm">Real-time validation and detailed results</p>
            </div>
            <div>
              <h3 className="font-semibold text-green-400 mb-2">🎯 Comprehensive</h3>
              <p className="text-slate-400 text-sm">Theory, sight-reading, and ear training</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

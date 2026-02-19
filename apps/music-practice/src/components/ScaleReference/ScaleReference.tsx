/**
 * ScaleReference - Interactive scale family explorer
 * Displays all 4 scale families with their 7 degrees, modes, and chord voicings
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { ArrowLeft, ChevronDown, ChevronUp, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChordVoicingDisplay } from '../ChordScaleGame/ChordVoicingDisplay';
import { getChordById } from '@/lib/chord-library';
import type { Chord } from '@/lib/chord-library';
import {
  buildScaleChords,
  SCALE_TYPE_NAMES,
  type ScaleType,
} from '../../data/chord-scale-matrix';

interface ScaleReferenceProps {
  onBack: () => void;
}

const SCALE_TYPES: ScaleType[] = ['major', 'naturalMinor', 'melodicMinor', 'harmonicMinor'];

const SCALE_DESCRIPTIONS: Record<ScaleType, string> = {
  major: 'The foundation of Western harmony. All 7 modes derive from this scale.',
  naturalMinor: 'The relative minor — same notes as major, starting from degree 6 (Aeolian mode).',
  melodicMinor: 'Minor scale with raised 6th and 7th. Source of Lydian Dominant and Altered scales.',
  harmonicMinor: 'Minor scale with raised 7th only. Creates the dominant V7 chord in minor keys.',
};

export function ScaleReference({ onBack }: ScaleReferenceProps): JSX.Element {
  const [activeScale, setActiveScale] = useState<ScaleType>('major');
  const [expandedDegree, setExpandedDegree] = useState<number | null>(null);

  const degrees = buildScaleChords(activeScale);

  const handleScaleChange = (scale: ScaleType) => {
    setActiveScale(scale);
    setExpandedDegree(null);
  };

  const handleDegreeToggle = (degree: number) => {
    setExpandedDegree(prev => (prev === degree ? null : degree));
  };

  // Look up the chord for the expanded degree
  const getExpandedChord = (chordId?: string): Chord | undefined => {
    if (!chordId) return undefined;
    return getChordById(chordId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Top bar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="p-3 rounded-2xl bg-[var(--accent-color)] shadow-lg">
              <Music className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground">
            Scales &amp; Modes Reference
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-lg">
            Explore scale families, their modes, and chord relationships
          </p>
        </div>

        {/* Scale Family Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SCALE_TYPES.map(scale => (
            <Button
              key={scale}
              variant={activeScale === scale ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleScaleChange(scale)}
              className="text-xs md:text-sm"
            >
              {SCALE_TYPE_NAMES[scale]}
            </Button>
          ))}
        </div>

        {/* Scale Description */}
        <Card className="mb-6 bg-[var(--accent-light)] border-2">
          <CardContent className="py-4">
            <p className="text-sm text-center text-foreground">
              <span className="font-semibold">{SCALE_TYPE_NAMES[activeScale]}:</span>{' '}
              {SCALE_DESCRIPTIONS[activeScale]}
            </p>
          </CardContent>
        </Card>

        {/* Degrees Grid */}
        <div className="space-y-3">
          {degrees.map(entry => {
            const isExpanded = expandedDegree === entry.degree;
            const chord = isExpanded ? getExpandedChord(entry.chordId) : undefined;

            return (
              <motion.div
                key={entry.degree}
                layout
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`border-2 cursor-pointer transition-all hover:shadow-md ${
                    isExpanded ? 'border-[var(--accent-color)] shadow-lg' : ''
                  }`}
                  onClick={() => handleDegreeToggle(entry.degree)}
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground w-16">
                          Degree {entry.degree}
                        </span>
                        <CardTitle className="text-base md:text-lg">
                          {entry.modeName}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {entry.chordQuality}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono">
                          {entry.romanNumeral}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <CardContent
                          className="pt-0 pb-6"
                          onClick={e => e.stopPropagation()}
                        >
                          {chord ? (
                            <ChordVoicingDisplay
                              chord={chord}
                              voicingIndex={entry.voicingIndex ?? 0}
                            />
                          ) : (
                            <div className="text-center text-sm text-muted-foreground py-8">
                              <p>No chord voicing available for this degree.</p>
                            </div>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * ChordProgressionBuilder - Build and explore chord progressions
 * Supports preset patterns and custom progression creation
 */

import { useState, useMemo } from 'react';
import type { Chord } from '@/lib/chord-library';
import { CHORD_LIBRARY } from '@/lib/chord-library';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hudak/ui/components/select';
import { Plus, Trash2, Play, Music } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgressionPattern {
  name: string;
  romanNumerals: string[];
  description: string;
  tags: string[];
}

const COMMON_PROGRESSIONS: ProgressionPattern[] = [
  {
    name: 'ii-V-I',
    romanNumerals: ['ii', 'V', 'I'],
    description: 'Jazz standard turnaround',
    tags: ['jazz', 'turnaround'],
  },
  {
    name: 'I-IV-V',
    romanNumerals: ['I', 'IV', 'V'],
    description: 'Classic pop/rock progression',
    tags: ['beginner', 'popular'],
  },
  {
    name: 'I-vi-IV-V',
    romanNumerals: ['I', 'vi', 'IV', 'V'],
    description: 'Very popular four-chord progression',
    tags: ['pop', 'modern'],
  },
  {
    name: 'vi-IV-I-V',
    romanNumerals: ['vi', 'IV', 'I', 'V'],
    description: 'Sad progression variation',
    tags: ['emotional', 'alternative'],
  },
  {
    name: 'I-IV-vi-V',
    romanNumerals: ['I', 'IV', 'vi', 'V'],
    description: 'Pop progression variant',
    tags: ['pop'],
  },
  {
    name: 'vi-IV-V-I',
    romanNumerals: ['vi', 'IV', 'V', 'I'],
    description: 'Ascending emotional progression',
    tags: ['modern', 'indie'],
  },
  {
    name: 'I-V-vi-IV',
    romanNumerals: ['I', 'V', 'vi', 'IV'],
    description: 'Descending pop progression',
    tags: ['pop', 'catchy'],
  },
  {
    name: '12-Bar Blues',
    romanNumerals: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'],
    description: 'Classic blues form',
    tags: ['blues', 'standard'],
  },
  {
    name: 'I-iii-IV-IV',
    romanNumerals: ['I', 'iii', 'IV', 'IV'],
    description: 'Doo-wop progression',
    tags: ['vintage', 'classic'],
  },
];

interface ChordProgressionBuilderProps {
  onProgressionSelect?: (chords: Chord[]) => void;
  rootChord?: Chord;
  disabled?: boolean;
}

export function ChordProgressionBuilder({
  onProgressionSelect,
  rootChord,
  disabled = false,
}: ChordProgressionBuilderProps): JSX.Element {
  const [selectedProgression, setSelectedProgression] = useState<ProgressionPattern | null>(
    COMMON_PROGRESSIONS[0]
  );
  const [currentRoot, setCurrentRoot] = useState(rootChord?.root || 'C');

  // Calculate degree values from root
  const degreeMap: Record<string, number> = {
    I: 0,
    ii: 2,
    iii: 4,
    IV: 5,
    V: 7,
    vi: 9,
    vii: 11,
  };

  const noteMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const getChordForDegree = (romanNumeral: string): Chord | null => {
    const degree = degreeMap[romanNumeral];
    if (degree === undefined) return null;

    const rootIndex = noteMap.indexOf(currentRoot);
    const targetIndex = (rootIndex + degree) % 12;
    const targetNote = noteMap[targetIndex];

    // Find a chord with this root note
    const chord = CHORD_LIBRARY.find(c => c.root === targetNote);
    return chord || null;
  };

  const progressionChords = useMemo(() => {
    if (!selectedProgression) return [];
    return selectedProgression.romanNumerals
      .map(rn => getChordForDegree(rn))
      .filter((chord): chord is Chord => chord !== null);
  }, [selectedProgression, currentRoot]);

  const handleApplyProgression = () => {
    if (onProgressionSelect && progressionChords.length > 0) {
      onProgressionSelect(progressionChords);
    }
  };

  if (disabled) {
    return <></>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Music className="w-4 h-4" />
          Chord Progression Builder
        </CardTitle>
        <CardDescription>Explore and practice common progressions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Root Note Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Root Note</label>
          <Select value={currentRoot} onValueChange={setCurrentRoot}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {noteMap.map(note => (
                <SelectItem key={note} value={note}>
                  {note}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Progression Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Progression</label>
          <Select
            value={selectedProgression?.name || ''}
            onValueChange={name => {
              const prog = COMMON_PROGRESSIONS.find(p => p.name === name);
              setSelectedProgression(prog || null);
            }}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMON_PROGRESSIONS.map(prog => (
                <SelectItem key={prog.name} value={prog.name}>
                  {prog.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Progression Description */}
        {selectedProgression && (
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">{selectedProgression.description}</p>
            <div className="flex flex-wrap gap-1">
              {selectedProgression.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Progression Chords */}
        {progressionChords.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Progression in {currentRoot}
            </label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {progressionChords.map((chord, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-2 bg-secondary/30 rounded-lg border border-border text-center"
                >
                  <div className="font-semibold text-sm">{chord.shortName}</div>
                  <div className="text-xs text-muted-foreground">{chord.type}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          {onProgressionSelect && (
            <Button
              onClick={handleApplyProgression}
              size="sm"
              className="gap-2"
              disabled={progressionChords.length === 0}
            >
              <Play className="w-3 h-3" />
              Use Progression
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2">
            <Music className="w-3 h-3" />
            Transpose
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

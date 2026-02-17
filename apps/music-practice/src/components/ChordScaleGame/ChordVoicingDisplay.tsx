/**
 * ChordVoicingDisplay - Shows guitar/piano voicings for a chord quality
 *
 * Displayed after answering (correctly or incorrectly) in DegreeQuiz.
 * Maps chord qualities from the chord-scale matrix to representative
 * chords from the library for visual/audio playback.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChordDiagram } from '../ChordReference/ChordDiagram';
import { PianoChordDiagram } from '../ChordReference/PianoChordDiagram';
import { ChordPlayer } from '../ChordReference/ChordPlayer';
import { InstrumentToggle } from '../Piano/InstrumentToggle';
import { CHORD_LIBRARY, type Chord, type ChordVoicing } from '@/lib/chord-library';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ChordVoicingDisplayProps {
  /** Chord quality from the matrix (e.g., "Maj7", "m7", "7", "m7b5") */
  chordQuality: string;
  /** Display label shown above the diagram (e.g., "IMaj7 — Ionian") */
  label: string;
}

/**
 * Maps a chord quality string from the matrix to a chord ID in the library.
 * Uses C root for consistency since we're demonstrating quality, not a specific key.
 */
const QUALITY_TO_CHORD_ID: Record<string, string> = {
  'Maj7':    'c-major-7',        // CMaj7
  'm7':      'a-minor-7',        // Am7 (common voicing, open position)
  '7':       'c-dominant-7',     // C7 (dominant 7th)
  'm7b5':    'd-half-diminished', // Dm7b5 (half diminished)
  'mMaj7':   'a-minor-7',        // Closest: Am7 (mMaj7 not in library — fallback)
  'Maj7#5':  'c-augmented',      // Closest: C+ (Maj7#5 not in library — fallback)
  'dim7':    'c-diminished-7',   // Cdim7
};

/**
 * Friendly description for each chord quality
 */
const QUALITY_DESCRIPTIONS: Record<string, string> = {
  'Maj7':    'Major 7th — warm, jazzy resolution',
  'm7':      'Minor 7th — smooth, slightly melancholy',
  '7':       'Dominant 7th — tension, wants to resolve',
  'm7b5':    'Half Diminished — dark, unstable',
  'mMaj7':   'Minor Major 7th — exotic, mysterious',
  'Maj7#5':  'Major 7th #5 — dreamy, augmented color',
  'dim7':    'Diminished 7th — maximum tension',
};

function findChordForQuality(quality: string): Chord | null {
  const id = QUALITY_TO_CHORD_ID[quality];
  if (!id) return null;
  return CHORD_LIBRARY.find(c => c.id === id) ?? null;
}

export function ChordVoicingDisplay({ chordQuality, label }: ChordVoicingDisplayProps): JSX.Element {
  const [instrument, setInstrument] = useState<'guitar' | 'piano'>(() => {
    try {
      const saved = localStorage.getItem('chord-scale-game-instrument');
      return saved === 'piano' ? 'piano' : 'guitar';
    } catch {
      return 'guitar';
    }
  });
  const [voicingIndex, setVoicingIndex] = useState(0);

  const chord = findChordForQuality(chordQuality);

  // Persist instrument selection
  useEffect(() => {
    try {
      localStorage.setItem('chord-scale-game-instrument', instrument);
    } catch {
      // ignore storage errors
    }
  }, [instrument]);

  // Reset voicing index when chord changes
  useEffect(() => {
    setVoicingIndex(0);
  }, [chordQuality]);

  const handleInstrumentChange = (newInstrument: 'guitar' | 'piano'): void => {
    setInstrument(newInstrument);
    setVoicingIndex(0);
  };

  if (!chord) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-4 text-center text-muted-foreground">
          No voicing available for <strong>{chordQuality}</strong>
        </CardContent>
      </Card>
    );
  }

  // Filter voicings that have data for the selected instrument
  const availableVoicings: ChordVoicing[] = chord.voicings.filter(v =>
    instrument === 'guitar' ? v.guitar !== undefined : v.piano !== undefined
  );

  const currentVoicing = availableVoicings[voicingIndex] ?? availableVoicings[0];
  const totalVoicings = availableVoicings.length;

  const prevVoicing = (): void => {
    setVoicingIndex(i => (i - 1 + totalVoicings) % totalVoicings);
  };

  const nextVoicing = (): void => {
    setVoicingIndex(i => (i + 1) % totalVoicings);
  };

  const qualityDescription = QUALITY_DESCRIPTIONS[chordQuality] ?? chordQuality;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mt-4 border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg">{label}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{qualityDescription}</p>
            </div>
            <div className="flex items-center gap-3">
              <ChordPlayer chord={chord} size="sm" />
              <InstrumentToggle instrument={instrument} onChange={handleInstrumentChange} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {currentVoicing ? (
              <motion.div
                key={`${instrument}-${voicingIndex}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-4"
              >
                {instrument === 'guitar' ? (
                  <ChordDiagram chord={chord} voicing={currentVoicing} size="medium" />
                ) : (
                  <PianoChordDiagram voicing={currentVoicing} size="medium" />
                )}

                {/* Voicing name */}
                {currentVoicing.voicingName && (
                  <p className="text-xs text-muted-foreground text-center">
                    {currentVoicing.voicingName}
                    {instrument === 'guitar' && currentVoicing.guitar?.description && (
                      <span className="block mt-0.5">{currentVoicing.guitar.description}</span>
                    )}
                    {instrument === 'piano' && currentVoicing.piano?.description && (
                      <span className="block mt-0.5">{currentVoicing.piano.description}</span>
                    )}
                  </p>
                )}

                {/* Voicing selector */}
                {totalVoicings > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevVoicing}
                      className="h-8 w-8 p-0"
                      aria-label="Previous voicing"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Voicing {voicingIndex + 1} of {totalVoicings}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextVoicing}
                      className="h-8 w-8 p-0"
                      aria-label="Next voicing"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center italic">
                  Showing C root — same quality applies to any root note
                </p>
              </motion.div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No {instrument} voicing available
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

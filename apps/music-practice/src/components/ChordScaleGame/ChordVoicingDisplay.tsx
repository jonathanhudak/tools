/**
 * ChordVoicingDisplay - Show chord diagrams and audio for chord-scale matrix
 * Displays guitar/piano voicings with instrument toggle and playback
 */

import { useState, useCallback, useMemo } from 'react';
import type { Chord } from '@/lib/chord-library';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Button } from '@hudak/ui/components/button';
import { ChordDiagram } from '../ChordReference/ChordDiagram';
import { PianoChordDiagram } from '../ChordReference/PianoChordDiagram';
import { ChordPlayer } from '../ChordReference/ChordPlayer';
import { InstrumentToggle } from '../Piano/InstrumentToggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@hudak/ui/components/select';
import { Label } from '@hudak/ui/components/label';
import { Play, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChordVoicingDisplayProps {
  chord: Chord;
  voicingIndex?: number;
  onInstrumentChange?: (instrument: 'guitar' | 'piano') => void;
}

type Instrument = 'guitar' | 'piano';

export function ChordVoicingDisplay({
  chord,
  voicingIndex = 0,
  onInstrumentChange,
}: ChordVoicingDisplayProps): JSX.Element {
  const [instrument, setInstrument] = useState<Instrument>('guitar');
  const [selectedVoicing, setSelectedVoicing] = useState(voicingIndex);
  const [isPlaying, setIsPlaying] = useState(false);

  // Ensure voicing index is within bounds
  const safeVoicingIndex = Math.min(selectedVoicing, chord.voicings.length - 1);
  const currentVoicing = chord.voicings[safeVoicingIndex];

  // Check which voicings are available for each instrument
  const guitarVoicings = useMemo(() => 
    chord.voicings.filter((v, _idx) => v.guitar),
    [chord]
  );
  
  const pianoVoicings = useMemo(() => 
    chord.voicings.filter((v, _idx) => v.piano),
    [chord]
  );

  const handleInstrumentChange = useCallback((inst: Instrument) => {
    setInstrument(inst);
    setSelectedVoicing(0); // Reset voicing on instrument switch
    onInstrumentChange?.(inst);
  }, [onInstrumentChange]);

  const handleVoicingChange = useCallback((index: string) => {
    setSelectedVoicing(parseInt(index, 10));
  }, []);

  const availableVoicings = instrument === 'guitar' ? guitarVoicings : pianoVoicings;
  const voicingLabel = currentVoicing.voicingName || `Voicing ${safeVoicingIndex + 1}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-2 shadow-lg bg-gradient-to-br from-background to-muted/30">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{chord.name}</CardTitle>
              <CardDescription className="text-base mt-1">
                {voicingLabel}
              </CardDescription>
            </div>
            <InstrumentToggle
              instrument={instrument}
              onInstrumentChange={handleInstrumentChange}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Voicing Selector */}
          {availableVoicings.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="voicing-select" className="text-sm font-medium">
                Voicing ({safeVoicingIndex + 1} of {availableVoicings.length})
              </Label>
              <Select 
                value={String(safeVoicingIndex)} 
                onValueChange={handleVoicingChange}
              >
                <SelectTrigger id="voicing-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableVoicings.map((voicing, idx) => (
                    <SelectItem key={idx} value={String(idx)}>
                      {voicing.voicingName || `Voicing ${idx + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Chord Diagram */}
          <div className="flex flex-col items-center justify-center gap-6 py-6">
            {instrument === 'guitar' && currentVoicing.guitar ? (
              <>
                <ChordDiagram
                  voicing={currentVoicing}
                  chordName={chord.name}
                />
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  {currentVoicing.guitar.description}
                </p>
              </>
            ) : instrument === 'piano' && currentVoicing.piano ? (
              <>
                <PianoChordDiagram
                  voicing={currentVoicing}
                  chordName={chord.name}
                />
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  {currentVoicing.piano.description}
                </p>
              </>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-12">
                <p>No {instrument} voicing available for this chord</p>
              </div>
            )}
          </div>

          {/* Audio Player & Play Button */}
          {currentVoicing.guitar || currentVoicing.piano ? (
            <div className="flex items-center gap-3 pt-4 border-t">
              <ChordPlayer
                chord={chord}
                voicingIndex={safeVoicingIndex}
                onPlayStart={() => setIsPlaying(true)}
                onPlayEnd={() => setIsPlaying(false)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={isPlaying}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                {isPlaying ? 'Playing...' : 'Play Chord'}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

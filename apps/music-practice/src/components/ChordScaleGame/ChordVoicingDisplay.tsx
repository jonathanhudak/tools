/**
 * ChordVoicingDisplay - Show chord diagrams and audio for chord-scale matrix
 * Displays guitar/piano voicings with instrument toggle and playback
 */

import { useState, useCallback, useMemo } from 'react';
import type { Chord } from '@/lib/chord-library';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { ChordDiagram } from '../ChordReference/ChordDiagram';
import { PianoChordDiagram } from '../ChordReference/PianoChordDiagram';
import { ChordPlayer } from '../ChordReference/ChordPlayer';
import { InstrumentToggle } from '../Piano/InstrumentToggle';
import { TabDisplay } from '../notation/TabDisplay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@hudak/ui/components/select';
import { Label } from '@hudak/ui/components/label';
import { motion } from 'framer-motion';

const STANDARD_TUNING = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4

interface ChordVoicingDisplayProps {
  chord: Chord;
  voicingIndex?: number;
  onInstrumentChange?: (instrument: 'guitar' | 'piano') => void;
  externalInstrument?: 'guitar' | 'piano';
}

type Instrument = 'guitar' | 'piano';

export function ChordVoicingDisplay({
  chord,
  voicingIndex = 0,
  onInstrumentChange,
  externalInstrument,
}: ChordVoicingDisplayProps): JSX.Element {
  const [internalInstrument, setInternalInstrument] = useState<Instrument>('guitar');
  const instrument = externalInstrument ?? internalInstrument;
  const [selectedVoicing, setSelectedVoicing] = useState(voicingIndex);

  const hasVoicings = chord.voicings && chord.voicings.length > 0;

  // Check which voicings are available for each instrument
  const guitarVoicings = useMemo(() =>
    hasVoicings ? chord.voicings.filter((v) => v.guitar) : [],
    [chord, hasVoicings]
  );

  const pianoVoicings = useMemo(() =>
    hasVoicings ? chord.voicings.filter((v) => v.piano) : [],
    [chord, hasVoicings]
  );

  const availableVoicings = instrument === 'guitar' ? guitarVoicings : pianoVoicings;

  // Ensure voicing index is within bounds for the currently selected instrument
  const safeVoicingIndex = availableVoicings.length > 0
    ? Math.min(selectedVoicing, availableVoicings.length - 1)
    : 0;
  const currentVoicing = availableVoicings[safeVoicingIndex];

  const handleInstrumentChange = useCallback((inst: Instrument) => {
    setInternalInstrument(inst);
    setSelectedVoicing(0); // Reset voicing on instrument switch
    onInstrumentChange?.(inst);
  }, [onInstrumentChange]);

  const handleVoicingChange = useCallback((index: string) => {
    setSelectedVoicing(parseInt(index, 10));
  }, []);

  // Guard against empty voicings array
  if (!hasVoicings || !currentVoicing) {
    return (
      <div className="w-full text-center text-sm text-muted-foreground py-8">
        <p>No voicing data available for {chord.name}.</p>
      </div>
    );
  }

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
            {!externalInstrument && (
              <InstrumentToggle
                instrument={instrument}
                onChange={handleInstrumentChange}
              />
            )}
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
                  chord={chord}
                  voicing={currentVoicing}
                />
                {/* Tab notation for guitar voicing */}
                {(() => {
                  const frets = currentVoicing.guitar!.frets;
                  const midiNotes = frets
                    .map((fret, i) => fret >= 0 ? STANDARD_TUNING[i] + fret : null)
                    .filter((n): n is number => n !== null);
                  return midiNotes.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                      <TabDisplay
                        midiNotes={midiNotes}
                        instrumentId="guitar"
                        className="min-w-[700px]"
                      />
                    </div>
                  ) : null;
                })()}
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

          {/* Audio Player */}
          {currentVoicing.guitar || currentVoicing.piano ? (
            <div className="flex items-center gap-3 pt-4 border-t">
              <ChordPlayer
                chord={chord}
                notes={currentVoicing.piano?.notes}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

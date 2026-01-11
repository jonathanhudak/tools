import { AnimatePresence, motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { Badge } from '@hudak/ui/components/badge';
import { Card, CardContent } from '@hudak/ui/components/card';
import { PitchGauge } from '@hudak/audio-components';
import type { RefObject } from 'react';

interface DetectedNote {
  note: number;
  noteName: string;
  centsOff?: number;
}

interface DetectedPitch {
  note: string;
  cents: number;
  clarity: number;
}

interface NotationCardProps {
  instrument: string;
  tabDisplayMode: 'staff' | 'tab' | 'both';
  isMicrophoneInstrument: boolean;
  staffContainerRef: RefObject<HTMLDivElement>;
  tabContainerRef: RefObject<HTMLDivElement>;
  detectedPitch: DetectedPitch | null;
  pitchSensitivity: number;
  pitchSmoothing: number;
  feedback: string;
  lastDetectedNote: DetectedNote | null;
}

export function NotationCard({
  instrument,
  tabDisplayMode,
  isMicrophoneInstrument,
  staffContainerRef,
  tabContainerRef,
  detectedPitch,
  pitchSensitivity,
  pitchSmoothing,
  feedback,
  lastDetectedNote,
}: NotationCardProps) {
  return (
    <Card className="border-2 shadow-2xl bg-card/95 backdrop-blur overflow-hidden">
      <CardContent className="p-0">
        <div className={`flex ${isMicrophoneInstrument ? 'flex-row' : 'flex-col'} items-center justify-center`}>
          <div className={`flex-1 p-8 flex items-center justify-center ${
            instrument === 'guitar' && tabDisplayMode === 'both' ? 'min-h-[400px]' : 'min-h-[300px]'
          }`}>
            <div
              id="staff-display"
              ref={staffContainerRef}
              className={(instrument === 'guitar' && tabDisplayMode !== 'staff') ? 'hidden' : 'block'}
            />
            <div
              id="tab-display"
              ref={tabContainerRef}
              className={(instrument === 'guitar' && (tabDisplayMode === 'tab' || tabDisplayMode === 'both')) ? 'block' : 'hidden'}
            />
          </div>

          {isMicrophoneInstrument && (
            <div className="flex-shrink-0 p-6 border-l border-border bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30">
              {detectedPitch ? (
                <PitchGauge
                  note={detectedPitch.note}
                  cents={detectedPitch.cents}
                  clarity={detectedPitch.clarity}
                  inTuneThreshold={pitchSensitivity}
                  smoothingFactor={pitchSmoothing}
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Volume2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Waiting for audio...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              key={feedback}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`px-6 py-3 text-center text-sm font-medium ${
                feedback.includes('✓')
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : feedback.includes('✗') || feedback.includes('Try again')
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {(instrument === 'piano' || instrument === 'piano-virtual') && lastDetectedNote && (
          <div className="px-6 py-3 flex items-center justify-center gap-4 bg-blue-50/50 dark:bg-blue-950/30 border-t border-border">
            <Volume2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Detected: {lastDetectedNote.noteName}
            </span>
            {lastDetectedNote.centsOff !== undefined && (
              <Badge variant={Math.abs(lastDetectedNote.centsOff) < 10 ? "default" : "secondary"}>
                {lastDetectedNote.centsOff > 0 ? '+' : ''}{lastDetectedNote.centsOff.toFixed(0)}¢
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

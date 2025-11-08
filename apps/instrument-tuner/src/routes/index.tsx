import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Note } from 'tonal';
import { toast } from 'sonner';
import { PitchGauge } from '@hudak/audio-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui';
import { Button } from '@hudak/ui';
import { Badge } from '@hudak/ui';
import { Label } from '@hudak/ui';
import { Music, Mic, MicOff, Settings as SettingsIcon } from 'lucide-react';

// Audio detection (we'll create this utility)
import { AudioManager, type PitchDetectedEvent } from '../utils/audio-manager';

export const Route = createFileRoute('/')({
  component: TunerPage,
});

// Standard guitar tuning (low to high)
const GUITAR_TUNINGS = {
  standard: [
    { note: 'E2', name: 'E', string: 6, frequency: 82.41 },
    { note: 'A2', name: 'A', string: 5, frequency: 110.00 },
    { note: 'D3', name: 'D', string: 4, frequency: 146.83 },
    { note: 'G3', name: 'G', string: 3, frequency: 196.00 },
    { note: 'B3', name: 'B', string: 2, frequency: 246.94 },
    { note: 'E4', name: 'E', string: 1, frequency: 329.63 },
  ],
  dropD: [
    { note: 'D2', name: 'D', string: 6, frequency: 73.42 },
    { note: 'A2', name: 'A', string: 5, frequency: 110.00 },
    { note: 'D3', name: 'D', string: 4, frequency: 146.83 },
    { note: 'G3', name: 'G', string: 3, frequency: 196.00 },
    { note: 'B3', name: 'B', string: 2, frequency: 246.94 },
    { note: 'E4', name: 'E', string: 1, frequency: 329.63 },
  ],
};

type TuningType = keyof typeof GUITAR_TUNINGS;

interface DetectedPitch {
  note: string;
  cents: number;
  frequency: number;
  clarity: number;
}

function TunerPage() {
  // State
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [detectedPitch, setDetectedPitch] = useState<DetectedPitch | null>(null);
  const [selectedTuning, setSelectedTuning] = useState<TuningType>('standard');
  const [pitchSensitivity, setPitchSensitivity] = useState(10);
  const [pitchSmoothing, setPitchSmoothing] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const [autoDetectString, setAutoDetectString] = useState(true);
  const [highlightedString, setHighlightedString] = useState<number | null>(null);

  // Refs
  const audioManager = useRef<AudioManager | null>(null);
  const audioInitAttemptedRef = useRef(false);

  // Get current tuning
  const currentTuning = GUITAR_TUNINGS[selectedTuning];

  // Handle pitch detection
  const handlePitchDetected = useCallback((event: PitchDetectedEvent) => {
    const { frequency, clarity } = event;

    // Get note info
    const noteInfo = Note.fromFreq(frequency);
    const noteName = noteInfo || 'Unknown';

    // Calculate cents deviation
    const midiNumber = Note.midi(noteName);
    if (midiNumber === null) return;

    const expectedFreq = Note.freq(noteName);
    if (!expectedFreq) return;

    const cents = 1200 * Math.log2(frequency / expectedFreq);

    setDetectedPitch({
      note: noteName,
      cents: Math.round(cents * 10) / 10,
      frequency,
      clarity,
    });

    // Auto-detect which string is being played
    if (autoDetectString) {
      const closestString = currentTuning.reduce((closest, tuning) => {
        const diff = Math.abs(frequency - tuning.frequency);
        const closestDiff = Math.abs(frequency - closest.frequency);
        return diff < closestDiff ? tuning : closest;
      });

      // Only highlight if within reasonable range (within 50 cents / ~3% frequency difference)
      const freqDiff = Math.abs(frequency - closestString.frequency);
      const percentDiff = freqDiff / closestString.frequency;
      if (percentDiff < 0.03) {
        setHighlightedString(closestString.string);
      } else {
        setHighlightedString(null);
      }
    }
  }, [autoDetectString, currentTuning]);

  // Initialize audio on mount
  useEffect(() => {
    if (audioInitAttemptedRef.current) return;

    const initAudio = async () => {
      audioInitAttemptedRef.current = true;

      audioManager.current = new AudioManager();
      const success = await audioManager.current.init();
      setMicrophoneActive(success);

      if (success) {
        audioManager.current.on('pitchDetected', handlePitchDetected);
        audioManager.current.on('statusChange', (status) => {
          setMicrophoneActive(status.microphoneActive);
        });
        audioManager.current.startListening();
        toast.success('Microphone connected', {
          description: 'Start playing to tune your instrument',
        });
      } else {
        toast.error('Microphone Access Required', {
          description: 'Click the camera/microphone icon in your browser\'s address bar to allow microphone access, then reload the page.',
          duration: 10000,
        });
      }
    };

    initAudio();

    return () => {
      audioManager.current?.disconnect();
    };
  }, [handlePitchDetected]);

  // Toggle microphone
  const toggleMicrophone = () => {
    if (microphoneActive) {
      audioManager.current?.stopListening();
      setMicrophoneActive(false);
    } else {
      audioManager.current?.startListening();
      setMicrophoneActive(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-2 pt-6">
          <div className="flex items-center justify-center gap-3">
            <Music className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Instrument Tuner</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Free online tuner with real-time pitch detection
          </p>
        </div>

        {/* Microphone Status */}
        <div className="flex justify-center">
          <Button
            onClick={toggleMicrophone}
            variant={microphoneActive ? 'default' : 'outline'}
            size="lg"
            className="gap-2"
          >
            {microphoneActive ? (
              <>
                <Mic className="h-5 w-5" />
                Microphone Active
              </>
            ) : (
              <>
                <MicOff className="h-5 w-5" />
                Microphone Off
              </>
            )}
          </Button>
        </div>

        {/* Settings Toggle */}
        <div className="flex justify-center">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <SettingsIcon className="h-4 w-4" />
            {showSettings ? 'Hide' : 'Show'} Settings
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle>Tuner Settings</CardTitle>
              <CardDescription>Customize sensitivity and tuning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tuning Selection */}
              <div className="space-y-2">
                <Label>Tuning</Label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedTuning === 'standard' ? 'default' : 'outline'}
                    onClick={() => setSelectedTuning('standard')}
                  >
                    Standard (E A D G B E)
                  </Button>
                  <Button
                    variant={selectedTuning === 'dropD' ? 'default' : 'outline'}
                    onClick={() => setSelectedTuning('dropD')}
                  >
                    Drop D (D A D G B E)
                  </Button>
                </div>
              </div>

              {/* Auto Detect String */}
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-detect">Auto-detect string</Label>
                <input
                  id="auto-detect"
                  type="checkbox"
                  checked={autoDetectString}
                  onChange={(e) => setAutoDetectString(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>

              {/* Pitch Sensitivity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="pitch-sensitivity">Pitch Sensitivity</Label>
                  <span className="text-sm text-muted-foreground">±{pitchSensitivity} cents</span>
                </div>
                <input
                  id="pitch-sensitivity"
                  type="range"
                  min="3"
                  max="20"
                  step="1"
                  value={pitchSensitivity}
                  onChange={(e) => setPitchSensitivity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More Strict (3¢)</span>
                  <span>More Lenient (20¢)</span>
                </div>
              </div>

              {/* Dial Smoothing */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="pitch-smoothing">Dial Smoothing</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(pitchSmoothing * 100)}%</span>
                </div>
                <input
                  id="pitch-smoothing"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={pitchSmoothing}
                  onChange={(e) => setPitchSmoothing(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Instant (0%)</span>
                  <span>Very Smooth (100%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guitar Strings Display */}
        <Card>
          <CardHeader>
            <CardTitle>Guitar Strings</CardTitle>
            <CardDescription>
              {selectedTuning === 'standard' ? 'Standard Tuning' : 'Drop D Tuning'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-3">
              {currentTuning.map((tuning) => {
                const isHighlighted = highlightedString === tuning.string;
                const isInTune =
                  detectedPitch &&
                  isHighlighted &&
                  Math.abs(detectedPitch.cents) <= pitchSensitivity;

                return (
                  <div
                    key={tuning.string}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      isHighlighted
                        ? isInTune
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                          : 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      String {tuning.string}
                    </div>
                    <div className="text-3xl font-bold">{tuning.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {tuning.note}
                    </div>
                    {isHighlighted && detectedPitch && (
                      <Badge
                        variant={isInTune ? 'default' : 'secondary'}
                        className="mt-2 text-xs"
                      >
                        {detectedPitch.cents > 0 ? '+' : ''}
                        {detectedPitch.cents.toFixed(0)}¢
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pitch Gauge */}
        {detectedPitch && (
          <Card>
            <CardHeader>
              <CardTitle>Live Tuner</CardTitle>
              <CardDescription>
                Play a string to see real-time tuning feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PitchGauge
                note={detectedPitch.note}
                cents={detectedPitch.cents}
                clarity={detectedPitch.clarity}
                inTuneThreshold={pitchSensitivity}
                smoothingFactor={pitchSmoothing}
              />
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!detectedPitch && microphoneActive && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Music className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Play any string on your guitar to start tuning
                </p>
                <p className="text-sm text-muted-foreground">
                  The tuner will automatically detect which string you're playing
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

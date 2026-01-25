import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Note } from 'tonal';
import { toast } from 'sonner';
import { PitchGauge } from '@hudak/audio-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui';
import { Button } from '@hudak/ui';
import { Badge } from '@hudak/ui';
import { Label } from '@hudak/ui';
import {
  Music,
  Mic,
  MicOff,
  Settings as SettingsIcon,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

// Audio detection
import { AudioManager, type PitchDetectedEvent } from '../utils/audio-manager';

// Tuning system
import {
  type Tuning,
  INSTRUMENT_CATEGORIES,
  findTuningById,
} from '../data/tunings';
import { parseTuningFromUrl, getTuningFromParams, updateUrlWithTuning } from '../utils/tuning-url';

// Components
import { TuningSelector } from '../components/TuningSelector';
import { CustomTuningBuilder } from '../components/CustomTuningBuilder';
import { ShareTuning } from '../components/ShareTuning';

export const Route = createFileRoute('/')({
  component: TunerPage,
});

// Get default tuning (guitar standard)
const DEFAULT_TUNING = findTuningById('guitar-standard') || INSTRUMENT_CATEGORIES[0].tunings[0];

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
  const [currentTuning, setCurrentTuning] = useState<Tuning>(DEFAULT_TUNING);
  const [pitchSensitivity, setPitchSensitivity] = useState(10);
  const [pitchSmoothing, setPitchSmoothing] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const [showTuningSelector, setShowTuningSelector] = useState(false);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [autoDetectString, setAutoDetectString] = useState(true);
  const [highlightedString, setHighlightedString] = useState<number | null>(null);

  // Refs
  const audioManager = useRef<AudioManager | null>(null);
  const audioInitAttemptedRef = useRef(false);
  const handlePitchDetectedRef = useRef(handlePitchDetected);

  // Parse tuning from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlParams = parseTuningFromUrl(searchParams);
    const urlTuning = getTuningFromParams(urlParams);

    if (urlTuning) {
      setCurrentTuning(urlTuning);
    }
  }, []);

  // Update URL when tuning changes
  const handleTuningChange = useCallback((tuning: Tuning) => {
    setCurrentTuning(tuning);
    updateUrlWithTuning(tuning);
    setShowTuningSelector(false);
    setShowCustomBuilder(false);
    setHighlightedString(null);
    toast.success('Tuning changed', {
      description: `Now using ${tuning.name}`,
    });
  }, []);

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
      const closestString = currentTuning.notes.reduce((closest, tuning) => {
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

    // Stable handler that always calls the latest callback via ref
    const stablePitchHandler = (event: PitchDetectedEvent) => {
      handlePitchDetectedRef.current(event);
    };

    const initAudio = async () => {
      audioInitAttemptedRef.current = true;

      audioManager.current = new AudioManager();
      const success = await audioManager.current.init();
      setMicrophoneActive(success);

      if (success) {
        audioManager.current.on('pitchDetected', stablePitchHandler);
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
  }, []);

  // Keep pitch detection callback ref in sync with current tuning
  useEffect(() => {
    handlePitchDetectedRef.current = handlePitchDetected;
  }, [handlePitchDetected]);

  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    if (!audioManager.current) return;

    if (microphoneActive) {
      audioManager.current.stopListening();
      setMicrophoneActive(false);
    } else {
      audioManager.current.startListening();
      setMicrophoneActive(true);
    }
  }, [microphoneActive]);

  // Sort notes by string number (high to low for display)
  const sortedNotes = useMemo(() => {
    return [...currentTuning.notes].sort((a, b) => a.string - b.string);
  }, [currentTuning]);

  // Dynamic grid columns based on number of strings
  const gridCols = useMemo(() => {
    const count = currentTuning.notes.length;
    if (count === 1) return 'grid-cols-1 max-w-[200px] mx-auto';
    if (count === 2) return 'grid-cols-2 max-w-[400px] mx-auto';
    if (count === 3) return 'grid-cols-3 max-w-[500px] mx-auto';
    if (count === 4) return 'grid-cols-4';
    if (count <= 6) return 'grid-cols-3 sm:grid-cols-6';
    if (count <= 8) return 'grid-cols-4 md:grid-cols-8';
    if (count <= 10) return 'grid-cols-5 md:grid-cols-10';
    return 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8';
  }, [currentTuning.notes.length]);

  // Get tuning display
  const tuningDisplay = useMemo(() => {
    const notes = [...currentTuning.notes]
      .sort((a, b) => b.string - a.string)
      .map((n) => n.name)
      .join(' ');
    return notes;
  }, [currentTuning]);

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

        {/* Current Tuning Display */}
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowTuningSelector(!showTuningSelector)}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Current Tuning</div>
                <div className="text-xl font-bold">{currentTuning.name}</div>
                <div className="text-sm text-muted-foreground font-mono">{tuningDisplay}</div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <ShareTuning tuning={currentTuning} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowTuningSelector(!showTuningSelector)}
                  aria-label={showTuningSelector ? 'Hide tuning selector' : 'Show tuning selector'}
                >
                  {showTuningSelector ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tuning Selector (collapsible) */}
        {showTuningSelector && !showCustomBuilder && (
          <TuningSelector
            currentTuning={currentTuning}
            onTuningSelect={handleTuningChange}
            onCustomTuningClick={() => {
              setShowCustomBuilder(true);
              setShowTuningSelector(false);
            }}
          />
        )}

        {/* Custom Tuning Builder */}
        {showCustomBuilder && (
          <CustomTuningBuilder
            onTuningCreate={handleTuningChange}
            onCancel={() => setShowCustomBuilder(false)}
          />
        )}

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
              <CardDescription>Customize sensitivity and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <span className="text-sm text-muted-foreground">+/-{pitchSensitivity} cents</span>
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
                  <span>More Strict (3 cents)</span>
                  <span>More Lenient (20 cents)</span>
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

        {/* Strings Display */}
        <Card>
          <CardHeader>
            <CardTitle>Strings</CardTitle>
            <CardDescription>
              {currentTuning.name} - {currentTuning.notes.length} strings
              {currentTuning.description && ` - ${currentTuning.description}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`grid ${gridCols} gap-3`}>
              {sortedNotes.map((tuning) => {
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
                    <div className="text-xs text-muted-foreground">
                      {tuning.frequency.toFixed(1)} Hz
                    </div>
                    {isHighlighted && detectedPitch && (
                      <Badge
                        variant={isInTune ? 'default' : 'secondary'}
                        className="mt-2 text-xs"
                      >
                        {detectedPitch.cents > 0 ? '+' : ''}
                        {detectedPitch.cents.toFixed(0)} cents
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
                  Play any string on your instrument to start tuning
                </p>
                <p className="text-sm text-muted-foreground">
                  The tuner will automatically detect which string you're playing
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pb-6">
          <p>
            Supports {INSTRUMENT_CATEGORIES.length} instrument types with{' '}
            {INSTRUMENT_CATEGORIES.reduce((sum, cat) => sum + cat.tunings.length, 0)}+ preset tunings
          </p>
          <p className="mt-1">
            Create custom tunings and share them via URL
          </p>
        </div>
      </div>
    </div>
  );
}

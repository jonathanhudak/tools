import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { PitchGauge, useReferenceTonePlayer } from '@hudak/audio-components';
import { Card, CardContent } from '@hudak/ui';
import { Button } from '@hudak/ui';
import { Label } from '@hudak/ui';
import {
  Mic,
  MicOff,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

// Audio detection
import { AudioManager, type PitchDetectedEvent } from '../utils/audio-manager';

// Tuning system
import {
  type Tuning,
  INSTRUMENT_CATEGORIES,
  findTuningById,
  applyReferencePitch,
  frequencyToNote,
  getInstrumentForTuning,
  getSectionForTuning,
} from '@hudak/tuning-data';
import { parseTuningFromUrl, getTuningFromParams, updateUrlWithTuning } from '../utils/tuning-url';

// Components
import { ShareTuning } from '../components/ShareTuning';
import { TunerPageHeader } from '../components/TunerPageHeader';
import { TuningBreadcrumbs } from '../components/TuningBreadcrumbs';
import { FeaturedTuningList } from '../components/FeaturedTuningList';
import { ReferencePitchBadge } from '../components/ReferencePitchBadge';
import { ReferencePitchControl } from '../components/ReferencePitchControl';
import { useReferencePitch } from '../hooks/use-reference-pitch';
import { useTheme } from '../hooks/use-theme';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
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

interface GaugePanelProps {
  detectedPitch: DetectedPitch | null;
  isStale: boolean;
  microphoneActive: boolean;
  pitchSensitivity: number;
  pitchSmoothing: number;
  subdueNote: boolean;
  referencePitch: number;
  size?: 'sm' | 'md';
}

function GaugePanel({
  detectedPitch,
  isStale,
  microphoneActive,
  pitchSensitivity,
  pitchSmoothing,
  subdueNote,
  referencePitch,
  size = 'md',
}: GaugePanelProps) {
  return (
    <div
      className={`flex flex-col items-center transition-opacity duration-300 ${
        !detectedPitch ? 'opacity-40' : isStale ? 'opacity-40 saturate-50' : 'opacity-100'
      }`}
    >
      <PitchGauge
        note={detectedPitch?.note ?? '—'}
        cents={detectedPitch?.cents ?? 0}
        clarity={size === 'md' ? detectedPitch?.clarity : undefined}
        inTuneThreshold={pitchSensitivity}
        smoothingFactor={pitchSmoothing}
        subdueNote={subdueNote}
        size={size}
      />
      <ReferencePitchBadge hz={referencePitch} className="mt-1" />
      {size === 'md' && !detectedPitch && microphoneActive && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          Play a string to start tuning
        </p>
      )}
      {size === 'md' && !microphoneActive && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          Enable microphone to begin
        </p>
      )}
    </div>
  );
}

function TunerPage() {
  // Theme
  const { theme, setTheme } = useTheme();

  // Reference pitch (A4) preference
  const { referencePitch } = useReferencePitch();

  // State
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [detectedPitch, setDetectedPitch] = useState<DetectedPitch | null>(null);
  const [currentTuning, setCurrentTuning] = useState<Tuning>(DEFAULT_TUNING);
  const [pitchSensitivity, setPitchSensitivity] = useState(10);
  const [pitchSmoothing, setPitchSmoothing] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const [autoDetectString, setAutoDetectString] = useState(true);
  const [highlightedString, setHighlightedString] = useState<number | null>(null);
  const [isStale, setIsStale] = useState(false);
  const { playingString, startTone, stopTone } = useReferenceTonePlayer();

  // Refs
  const audioManager = useRef<AudioManager | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePitchDetectedRef = useRef<(event: PitchDetectedEvent) => void>(null as any);
  const lastPitchUpdateRef = useRef(0);
  const lastPitchTimeRef = useRef(0);
  const highlightedStringRef = useRef<number | null>(null);

  // The active tuning with all frequencies calibrated to the chosen A4.
  // Exact in 12-TET: every catalog frequency is scaled by referencePitch/440.
  const activeTuning = useMemo(
    () => applyReferencePitch(currentTuning, referencePitch),
    [currentTuning, referencePitch]
  );

  // Parse tuning from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlParams = parseTuningFromUrl(searchParams);
    const urlTuning = getTuningFromParams(urlParams);

    if (urlTuning) {
      setCurrentTuning(urlTuning);
    }
  }, []);

  // Stale pitch detection — fade gauge after 2s of silence (3.2)
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastPitchTimeRef.current && Date.now() - lastPitchTimeRef.current > 2000) {
        setIsStale(true);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Handle pitch detection with throttling (1.1) and hysteresis (1.2)
  const handlePitchDetected = useCallback((event: PitchDetectedEvent) => {
    const { frequency, clarity } = event;

    // Track last pitch time for stale detection (3.2)
    lastPitchTimeRef.current = Date.now();
    setIsStale(false);

    // Auto-detect which string with hysteresis (1.2)
    if (autoDetectString) {
      const closestString = activeTuning.notes.reduce((closest, tuning) => {
        const diff = Math.abs(frequency - tuning.frequency);
        const closestDiff = Math.abs(frequency - closest.frequency);
        return diff < closestDiff ? tuning : closest;
      });

      const freqDiff = Math.abs(frequency - closestString.frequency);
      const percentDiff = freqDiff / closestString.frequency;
      const currentHighlight = highlightedStringRef.current;

      if (currentHighlight === null) {
        // No current highlight — use 3% threshold for initial detection
        if (percentDiff < 0.03) {
          highlightedStringRef.current = closestString.string;
          setHighlightedString(closestString.string);
        }
      } else if (closestString.string === currentHighlight) {
        // Still nearest to the highlighted string — use wider 5% to keep (hysteresis)
        if (percentDiff >= 0.05) {
          highlightedStringRef.current = null;
          setHighlightedString(null);
        }
      } else {
        // Closest string differs from highlighted — require drift >5% from current
        // AND <3% to new string before switching
        const currentStringData = activeTuning.notes.find(n => n.string === currentHighlight);
        if (currentStringData) {
          const driftFromCurrent = Math.abs(frequency - currentStringData.frequency) / currentStringData.frequency;
          if (driftFromCurrent > 0.05 && percentDiff < 0.03) {
            highlightedStringRef.current = closestString.string;
            setHighlightedString(closestString.string);
          }
        }
      }
    }

    // Throttle UI display updates to ~10/sec (1.1)
    const now = Date.now();
    if (now - lastPitchUpdateRef.current < 100) return;
    lastPitchUpdateRef.current = now;

    // Map frequency to the nearest note under the active A4 reference
    const detected = frequencyToNote(frequency, referencePitch);
    if (!detected) return;

    setDetectedPitch({
      note: detected.name,
      cents: Math.round(detected.cents),
      frequency,
      clarity,
    });
  }, [autoDetectString, activeTuning, referencePitch]);

  // Stable pitch handler that always calls the latest callback via ref
  const stablePitchHandler = useCallback((event: PitchDetectedEvent) => {
    handlePitchDetectedRef.current(event);
  }, []);

  // Initialize audio — called on user gesture (mic button click)
  const initAudio = useCallback(async () => {
    // Already initialized and connected
    if (audioManager.current) return true;

    const manager = new AudioManager();
    const success = await manager.init();

    if (success) {
      manager.on('pitchDetected', stablePitchHandler);
      manager.on('statusChange', (status) => {
        setMicrophoneActive(status.microphoneActive);
      });
      audioManager.current = manager;
      return true;
    } else {
      toast.error('Microphone Access Required', {
        description: 'Click the camera/microphone icon in your browser\'s address bar to allow microphone access, then reload the page.',
        duration: 10000,
      });
      return false;
    }
  }, [stablePitchHandler]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioManager.current?.disconnect();
      audioManager.current = null;
    };
  }, []);

  // Keep pitch detection callback ref in sync with current tuning
  useEffect(() => {
    handlePitchDetectedRef.current = handlePitchDetected;
  }, [handlePitchDetected]);

  // Toggle microphone — initializes audio on first click (requires user gesture)
  const toggleMicrophone = useCallback(async () => {
    if (microphoneActive && audioManager.current) {
      audioManager.current.stopListening();
      setMicrophoneActive(false);
      return;
    }

    // Init audio if needed (first click or after disconnect)
    const success = await initAudio();
    if (success && audioManager.current) {
      audioManager.current.startListening();
      setMicrophoneActive(true);
      toast.success('Microphone connected', {
        description: 'Start playing to tune your instrument',
      });
    }
  }, [microphoneActive, initAudio]);

  // Select a tuning from the featured list without leaving the page
  const selectTuning = useCallback((tuning: Tuning) => {
    setCurrentTuning(tuning);
    highlightedStringRef.current = null;
    setHighlightedString(null);
    updateUrlWithTuning(tuning);
  }, []);

  // Sort notes by string number (high to low for display)
  const sortedNotes = useMemo(() => {
    return [...activeTuning.notes].sort((a, b) => a.string - b.string);
  }, [activeTuning]);

  // Dynamic grid columns based on number of strings
  const gridCols = useMemo(() => {
    const count = activeTuning.notes.length;
    if (count === 1) return 'grid-cols-1 max-w-[200px] mx-auto';
    if (count === 2) return 'grid-cols-2 max-w-[400px] mx-auto';
    if (count === 3) return 'grid-cols-3 max-w-[500px] mx-auto';
    if (count === 4) return 'grid-cols-4';
    if (count <= 6) return 'grid-cols-3 sm:grid-cols-6';
    if (count <= 8) return 'grid-cols-4 md:grid-cols-8';
    if (count <= 10) return 'grid-cols-5 md:grid-cols-10';
    return 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8';
  }, [activeTuning.notes.length]);

  // Get tuning display
  const tuningDisplay = useMemo(() => {
    const notes = [...activeTuning.notes]
      .sort((a, b) => b.string - a.string)
      .map((n) => n.name)
      .join(' ');
    return notes;
  }, [activeTuning]);


  const currentInstrument = useMemo(() => getInstrumentForTuning(currentTuning.id), [currentTuning.id]);
  const currentSection = useMemo(
    () => (currentInstrument ? getSectionForTuning(currentInstrument.id, currentTuning.id) : null),
    [currentInstrument, currentTuning.id]
  );

  const gaugePanelProps = {
    detectedPitch,
    isStale,
    microphoneActive,
    pitchSensitivity,
    pitchSmoothing,
    subdueNote: highlightedString !== null,
    referencePitch,
  };

  return (
    <div className="bg-tuner-shell min-h-screen">
      <div className="container mx-auto max-w-6xl space-y-6 px-4 py-5 motion-safe:animate-[tuner-fade-up_220ms_ease-out] sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <TunerPageHeader
          subtitle={
            <span className="inline-flex flex-wrap items-center gap-2">
              {`${currentTuning.name} · ${tuningDisplay}`}
              <ReferencePitchBadge hz={referencePitch} />
            </span>
          }
          actions={
            <>
            <ShareTuning tuning={currentTuning} />
            <Button
              onClick={toggleMicrophone}
              variant={microphoneActive ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5 h-10 px-3"
            >
              {microphoneActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              <span className="hidden sm:inline">{microphoneActive ? 'Mic On' : 'Mic Off'}</span>
            </Button>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              aria-label={showSettings ? 'Hide settings' : 'Show settings'}
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
            </>
          }
        />

        <TuningBreadcrumbs
          items={[
            { label: 'Tunings', to: '/tunings' },
            ...(currentInstrument
              ? [{ label: currentInstrument.name, to: '/tunings/$instrumentId', params: { instrumentId: currentInstrument.id } }]
              : []),
            ...(currentInstrument && currentSection
              ? [{ label: currentSection.name, to: '/tunings/$instrumentId/$sectionId', params: { instrumentId: currentInstrument.id, sectionId: currentSection.id } }]
              : []),
            { label: currentTuning.name },
          ]}
        />

        {/* Settings Panel */}
        {showSettings && (
          <Card className="tuner-card-surface">
            <CardContent className="pt-4 pb-4 space-y-3">
              {/* Reference Pitch (A4) */}
              <ReferencePitchControl />

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

              {/* Theme */}
              <div className="flex items-center justify-between">
                <Label>Theme</Label>
                <div className="flex gap-1">
                  {([
                    { value: 'system' as const, icon: Monitor, label: 'System' },
                    { value: 'light' as const, icon: Sun, label: 'Light' },
                    { value: 'dark' as const, icon: Moon, label: 'Dark' },
                  ]).map(({ value, icon: Icon, label }) => (
                    <Button
                      key={value}
                      variant={theme === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme(value)}
                      className="gap-1.5 h-8"
                      aria-label={label}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline text-xs">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tuner workspace: scrollable content left, sticky gauge rail right (lg+).
            On mobile a compact gauge pins to the top and follows the scroll. */}
        <div className="lg:flex lg:items-start lg:gap-6">
          <div className="min-w-0 space-y-6 lg:flex-1">
            {/* Mobile sticky gauge — follows you down the featured list */}
            <div className="sticky top-0 z-30 -mx-4 border-b border-border/60 bg-tuner-shell/95 px-4 py-2 backdrop-blur lg:hidden">
              <GaugePanel {...gaugePanelProps} size="sm" />
            </div>

            {/* Strings Grid */}
            <div className={`grid ${gridCols} gap-3`}>
              {sortedNotes.map((tuning) => {
                const isHighlighted = highlightedString === tuning.string;
                const isPlaying = playingString === tuning.string;
                const isInTune =
                  detectedPitch &&
                  isHighlighted &&
                  Math.abs(detectedPitch.cents) <= pitchSensitivity;

                return (
                  <div
                    key={tuning.string}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      void startTone(tuning.frequency, {
                        key: `string-${tuning.string}`,
                        stringNumber: tuning.string,
                      });
                    }}
                    onPointerUp={stopTone}
                    onPointerLeave={stopTone}
                    onPointerCancel={stopTone}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        void startTone(tuning.frequency, {
                          key: `string-${tuning.string}`,
                          stringNumber: tuning.string,
                        });
                      }
                    }}
                    onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') stopTone(); }}
                    style={{ touchAction: 'none' }}
                    className={`tuner-note-button tuner-note-surface relative rounded-lg border p-3 text-center transition-[border-color,background-image,box-shadow,filter] duration-150 ease-in-out cursor-pointer select-none ${
                      isPlaying ? 'brightness-105 ' : ''
                    }${
                      isHighlighted
                        ? isInTune
                          ? 'tuner-note-active tuner-note-active-success ring-1 ring-green-500/20 animate-[in-tune-pulse_300ms_ease-out]'
                          : 'tuner-note-active'
                        : ''
                    }`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      String {tuning.string}
                    </div>
                    <div className="text-2xl font-bold">{tuning.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {tuning.frequency.toFixed(0)} Hz
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Featured tunings — scroll and tap while the gauge follows */}
            <FeaturedTuningList activeTuningId={currentTuning.id} onSelect={selectTuning} />
          </div>

          {/* Desktop sticky gauge rail */}
          <div className="hidden flex-shrink-0 lg:sticky lg:top-8 lg:block lg:w-80">
            <GaugePanel {...gaugePanelProps} size="md" />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground/70 pb-4">
          {INSTRUMENT_CATEGORIES.reduce((sum, cat) => sum + cat.tunings.length, 0)}+ tunings across {INSTRUMENT_CATEGORIES.length} instruments · Share via URL
        </div>
      </div>
    </div>
  );
}

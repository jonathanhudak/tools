import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Note } from 'tonal';
import { toast } from 'sonner';
import { PitchGauge } from '@hudak/audio-components';
import { Card, CardContent } from '@hudak/ui';
import { Button } from '@hudak/ui';
import { Label } from '@hudak/ui';
import {
  Music,
  Mic,
  MicOff,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp,
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
} from '../data/tunings';
import { parseTuningFromUrl, getTuningFromParams, updateUrlWithTuning } from '../utils/tuning-url';

// Components
import { TuningSelector } from '../components/TuningSelector';
import { CustomTuningBuilder } from '../components/CustomTuningBuilder';
import { ShareTuning } from '../components/ShareTuning';
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

function TunerPage() {
  // Theme
  const { theme, setTheme } = useTheme();

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
  const [isStale, setIsStale] = useState(false);
  const [playingString, setPlayingString] = useState<number | null>(null);

  // Refs
  const audioManager = useRef<AudioManager | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePitchDetectedRef = useRef<(event: PitchDetectedEvent) => void>(null as any);
  const lastPitchUpdateRef = useRef(0);
  const lastPitchTimeRef = useRef(0);
  const highlightedStringRef = useRef<number | null>(null);
  const stringsRef = useRef<HTMLDivElement>(null);
  const toneContextRef = useRef<AudioContext | null>(null);
  const toneOscRef = useRef<OscillatorNode | null>(null);
  const toneGainRef = useRef<GainNode | null>(null);
  const toneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Update URL when tuning changes + scroll to strings (3.7)
  const handleTuningChange = useCallback((tuning: Tuning) => {
    setCurrentTuning(tuning);
    updateUrlWithTuning(tuning);
    setShowTuningSelector(false);
    setShowCustomBuilder(false);
    setHighlightedString(null);
    highlightedStringRef.current = null;
    toast.success('Tuning changed', {
      description: `Now using ${tuning.name}`,
    });
    // Scroll to strings after selection
    setTimeout(() => {
      stringsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  // Handle pitch detection with throttling (1.1) and hysteresis (1.2)
  const handlePitchDetected = useCallback((event: PitchDetectedEvent) => {
    const { frequency, clarity } = event;

    // Track last pitch time for stale detection (3.2)
    lastPitchTimeRef.current = Date.now();
    setIsStale(false);

    // Auto-detect which string with hysteresis (1.2)
    if (autoDetectString) {
      const closestString = currentTuning.notes.reduce((closest, tuning) => {
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
        const currentStringData = currentTuning.notes.find(n => n.string === currentHighlight);
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
      cents: Math.round(cents),
      frequency,
      clarity,
    });
  }, [autoDetectString, currentTuning]);

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

  // Stop the current reference tone with a smooth fade-out
  const stopTone = useCallback(() => {
    if (toneTimeoutRef.current) {
      clearTimeout(toneTimeoutRef.current);
      toneTimeoutRef.current = null;
    }
    setPlayingString(null);

    const gain = toneGainRef.current;
    const osc = toneOscRef.current;
    const ctx = toneContextRef.current;
    if (!gain || !osc || !ctx) return;

    // Clear refs immediately to prevent double-stop
    toneGainRef.current = null;
    toneOscRef.current = null;

    try {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);
      osc.stop(now + 0.2);
    } catch {
      // Oscillator already stopped — ignore
    }
  }, []);

  // Start a reference tone (plays until stopTone, max 5s safety)
  const startTone = useCallback((frequency: number, stringNum?: number) => {
    if (stringNum !== undefined) setPlayingString(stringNum);

    // Stop any currently playing tone first
    stopTone();

    // Create or reuse AudioContext for tone playback
    if (!toneContextRef.current || toneContextRef.current.state === 'closed') {
      toneContextRef.current = new AudioContext();
    }
    const ctx = toneContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Fade in over 50ms, sustain until release
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);

    osc.start(now);
    toneOscRef.current = osc;
    toneGainRef.current = gain;

    // Safety timeout — auto-stop after 5s in case release event is lost
    toneTimeoutRef.current = setTimeout(stopTone, 5000);
  }, [stopTone]);

  // Global safety net: stop tone if pointer/touch released anywhere on the page
  useEffect(() => {
    const handleGlobalRelease = () => {
      if (toneOscRef.current) stopTone();
    };
    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('pointercancel', handleGlobalRelease);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) handleGlobalRelease();
    });
    return () => {
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('pointercancel', handleGlobalRelease);
    };
  }, [stopTone]);

  // Cleanup tone context on unmount
  useEffect(() => {
    return () => {
      if (toneTimeoutRef.current) clearTimeout(toneTimeoutRef.current);
      toneOscRef.current?.stop();
      toneContextRef.current?.close();
    };
  }, []);

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
      <div className="container mx-auto px-4 py-3 space-y-3 max-w-5xl">
        {/* Compact header bar: title + tuning + controls all in one row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold">Instrument Tuner</h1>
          </div>
          <div className="h-5 w-px bg-border hidden sm:block" />
          {/* Tuning selector trigger */}
          <button
            onClick={() => setShowTuningSelector(!showTuningSelector)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer"
          >
            <span className="font-semibold">{currentTuning.name}</span>
            <span className="text-sm text-muted-foreground font-mono hidden sm:inline">{tuningDisplay}</span>
            {showTuningSelector ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {/* Right-side controls */}
          <div className="flex items-center gap-1 ml-auto">
            <ShareTuning tuning={currentTuning} />
            <Button
              onClick={toggleMicrophone}
              variant={microphoneActive ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
            >
              {microphoneActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              <span className="hidden sm:inline">{microphoneActive ? 'Mic On' : 'Mic Off'}</span>
            </Button>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={showSettings ? 'Hide settings' : 'Show settings'}
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

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

        {/* Settings Panel */}
        {showSettings && (
          <Card>
            <CardContent className="pt-4 pb-4 space-y-3">
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

        {/* Unified Tuning View: Strings + Gauge (1.4) */}
        <div ref={stringsRef} className="lg:flex lg:gap-6 space-y-4 lg:space-y-0">
          {/* Strings Grid */}
          <div className="lg:flex-1 min-w-0">
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
                    onPointerDown={(e) => { e.preventDefault(); startTone(tuning.frequency, tuning.string); }}
                    onPointerUp={stopTone}
                    onPointerLeave={stopTone}
                    onPointerCancel={stopTone}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startTone(tuning.frequency, tuning.string); } }}
                    onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') stopTone(); }}
                    style={{ touchAction: 'none' }}
                    className={`p-3 rounded-lg border-2 text-center transition-all duration-150 ease-in-out cursor-pointer select-none ${
                      isPlaying ? 'scale-95 brightness-110 ' : ''
                    }${
                      isHighlighted
                        ? isInTune
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/30 ring-2 ring-green-500/30 animate-[in-tune-pulse_300ms_ease-out]'
                          : 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
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
          </div>

          {/* Pitch Gauge — always rendered (1.3), stale fade (3.2), subdued note (3.6) */}
          <div className={`lg:w-80 flex-shrink-0 flex flex-col items-center justify-start transition-opacity duration-300 ${
            !detectedPitch ? 'opacity-40' : isStale ? 'opacity-40 saturate-50' : 'opacity-100'
          }`}>
            <PitchGauge
              note={detectedPitch?.note ?? '—'}
              cents={detectedPitch?.cents ?? 0}
              clarity={detectedPitch?.clarity}
              inTuneThreshold={pitchSensitivity}
              smoothingFactor={pitchSmoothing}
              subdueNote={highlightedString !== null}
            />
            {!detectedPitch && microphoneActive && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Play a string to start tuning
              </p>
            )}
            {!microphoneActive && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Enable microphone to begin
              </p>
            )}
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

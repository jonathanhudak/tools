/**
 * Tuner Route — microphone tuner embedded in the practice app.
 * Shares the tuning catalog and reference-pitch math with the dedicated
 * Instrument Tuner app (@hudak/tuning-data) and the gauge/tone components
 * (@hudak/audio-components). The full library UX lives in the dedicated app.
 */

import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Mic, MicOff } from 'lucide-react';
import { PitchGauge, useReferenceTonePlayer } from '@hudak/audio-components';
import { Button } from '@hudak/ui/components/button';
import { Card, CardContent } from '@hudak/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hudak/ui/components/select';
import {
  INSTRUMENT_CATEGORIES,
  MAX_REFERENCE_PITCH,
  MIN_REFERENCE_PITCH,
  REFERENCE_PITCH_PRESETS,
  STANDARD_A4,
  applyReferencePitch,
  clampReferencePitch,
  findTuningById,
  frequencyToNote,
  getFeaturedTunings,
  getInstrumentForTuning,
  type Tuning,
} from '@hudak/tuning-data';
import { AudioManager, type PitchDetectedEvent } from '@/lib/input/audio-manager';
import { getSettings, saveSettings } from '@/lib/utils/storage';

export const Route = createFileRoute('/tuner')({
  component: TunerRoute,
});

const FEATURED = getFeaturedTunings();
const DEFAULT_TUNING_ID = 'guitar-standard';

/** Dedicated tuner app (GitHub Pages) — carries the selected tuning along. */
function fullTunerUrl(tuningId: string): string {
  return `https://jonathanhudak.github.io/tools/instrument-tuner/?tuning=${encodeURIComponent(tuningId)}`;
}

interface DetectedPitch {
  note: string;
  cents: number;
  clarity: number;
}

function TunerRoute() {
  // Persisted preferences
  const initialSettings = useMemo(() => getSettings(), []);
  const [referencePitch, setReferencePitchState] = useState<number>(() =>
    clampReferencePitch(initialSettings.referencePitch ?? STANDARD_A4)
  );
  const [currentTuning, setCurrentTuning] = useState<Tuning>(() =>
    findTuningById(initialSettings.tunerTuningId ?? DEFAULT_TUNING_ID) ??
    findTuningById(DEFAULT_TUNING_ID) ??
    INSTRUMENT_CATEGORIES[0].tunings[0]
  );

  // Mic + pitch state
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [detectedPitch, setDetectedPitch] = useState<DetectedPitch | null>(null);
  const [highlightedString, setHighlightedString] = useState<number | null>(null);
  const [isStale, setIsStale] = useState(false);
  const { playingString, startTone, stopTone } = useReferenceTonePlayer();

  const audioManagerRef = useRef<AudioManager | null>(null);
  const pitchHandlerRef = useRef<(event: PitchDetectedEvent) => void>(() => {});
  const lastPitchUpdateRef = useRef(0);
  const lastPitchTimeRef = useRef(0);
  const highlightedStringRef = useRef<number | null>(null);

  // Active tuning calibrated to the chosen A4 (exact ×ref/440 scaling)
  const activeTuning = useMemo(
    () => applyReferencePitch(currentTuning, referencePitch),
    [currentTuning, referencePitch]
  );
  const currentInstrument = useMemo(
    () => getInstrumentForTuning(currentTuning.id),
    [currentTuning.id]
  );

  const setReferencePitch = useCallback((hz: number) => {
    const clamped = clampReferencePitch(hz);
    setReferencePitchState(clamped);
    saveSettings({ referencePitch: clamped });
  }, []);

  const selectTuning = useCallback((tuning: Tuning) => {
    setCurrentTuning(tuning);
    highlightedStringRef.current = null;
    setHighlightedString(null);
    saveSettings({ tunerTuningId: tuning.id });
  }, []);

  // Stale pitch — fade the gauge after 2s of silence
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastPitchTimeRef.current && Date.now() - lastPitchTimeRef.current > 2000) {
        setIsStale(true);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handlePitchDetected = useCallback(
    (event: PitchDetectedEvent) => {
      const { frequency, clarity } = event;
      lastPitchTimeRef.current = Date.now();
      setIsStale(false);

      // Highlight the closest string with hysteresis (3% acquire / 5% release)
      const closest = activeTuning.notes.reduce((best, note) =>
        Math.abs(frequency - note.frequency) < Math.abs(frequency - best.frequency) ? note : best
      );
      const percentDiff = Math.abs(frequency - closest.frequency) / closest.frequency;
      const held = highlightedStringRef.current;
      if (held === null) {
        if (percentDiff < 0.03) {
          highlightedStringRef.current = closest.string;
          setHighlightedString(closest.string);
        }
      } else if (closest.string === held) {
        if (percentDiff >= 0.05) {
          highlightedStringRef.current = null;
          setHighlightedString(null);
        }
      } else {
        const heldNote = activeTuning.notes.find((n) => n.string === held);
        if (heldNote) {
          const drift = Math.abs(frequency - heldNote.frequency) / heldNote.frequency;
          if (drift > 0.05 && percentDiff < 0.03) {
            highlightedStringRef.current = closest.string;
            setHighlightedString(closest.string);
          }
        }
      }

      // Throttle display updates to ~10/sec
      const now = Date.now();
      if (now - lastPitchUpdateRef.current < 100) return;
      lastPitchUpdateRef.current = now;

      // When a string is held, measure against its exact target frequency so
      // microtonal targets (e.g. F#−14¢) can read in tune
      const heldNote = highlightedStringRef.current !== null
        ? activeTuning.notes.find((n) => n.string === highlightedStringRef.current)
        : undefined;

      if (heldNote) {
        setDetectedPitch({
          note: heldNote.name,
          cents: Math.round(1200 * Math.log2(frequency / heldNote.frequency)),
          clarity,
        });
        return;
      }

      const detected = frequencyToNote(frequency, referencePitch);
      if (!detected) return;
      setDetectedPitch({
        note: detected.name,
        cents: Math.round(detected.cents),
        clarity,
      });
    },
    [activeTuning, referencePitch]
  );

  useEffect(() => {
    pitchHandlerRef.current = handlePitchDetected;
  }, [handlePitchDetected]);

  useEffect(() => {
    return () => {
      audioManagerRef.current?.disconnect();
      audioManagerRef.current = null;
    };
  }, []);

  const toggleMicrophone = useCallback(async () => {
    if (microphoneActive && audioManagerRef.current) {
      audioManagerRef.current.stopListening();
      setMicrophoneActive(false);
      return;
    }

    if (!audioManagerRef.current) {
      const manager = new AudioManager();
      const success = await manager.init();
      if (!success) {
        toast.error('Microphone access required', {
          description: 'Allow microphone access in your browser to use the tuner.',
        });
        return;
      }
      manager.on('pitchDetected', (event: PitchDetectedEvent) => pitchHandlerRef.current(event));
      manager.on('statusChange', (status) => setMicrophoneActive(status.microphoneActive));
      audioManagerRef.current = manager;
    }

    audioManagerRef.current.startListening();
    setMicrophoneActive(true);
  }, [microphoneActive]);

  const sortedNotes = useMemo(
    () => [...activeTuning.notes].sort((a, b) => a.string - b.string),
    [activeTuning]
  );

  const isPresetPitch = REFERENCE_PITCH_PRESETS.some((p) => p.hz === referencePitch);

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto max-w-5xl space-y-6 px-4 py-6">
        {/* Title + mic */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-display">Tuner</h1>
            <p className="text-sm text-muted-foreground">
              {currentTuning.name}
              {currentInstrument ? ` · ${currentInstrument.name}` : ''}
              {referencePitch !== STANDARD_A4 ? ` · A4 = ${referencePitch} Hz` : ''}
            </p>
          </div>
          <Button onClick={toggleMicrophone} variant={microphoneActive ? 'default' : 'outline'} className="gap-2">
            {microphoneActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            {microphoneActive ? 'Mic On' : 'Enable Mic'}
          </Button>
        </div>

        <div className="lg:flex lg:items-start lg:gap-6">
          <div className="min-w-0 space-y-6 lg:flex-1">
            {/* Gauge — sticky on mobile so it follows while you pick tunings */}
            <div className="sticky top-0 z-30 -mx-4 border-b bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
              <TunerGauge
                detectedPitch={detectedPitch}
                isStale={isStale}
                microphoneActive={microphoneActive}
                referencePitch={referencePitch}
                subdueNote={highlightedString !== null}
                size="sm"
              />
            </div>

            {/* String cards — hold to hear the reference tone */}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {sortedNotes.map((note) => {
                const isHighlighted = highlightedString === note.string;
                const isInTune =
                  detectedPitch && isHighlighted && Math.abs(detectedPitch.cents) <= 10;
                const isPlaying = playingString === note.string;

                return (
                  <button
                    key={note.string}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      void startTone(note.frequency, {
                        key: `string-${note.string}`,
                        stringNumber: note.string,
                      });
                    }}
                    onPointerUp={stopTone}
                    onPointerLeave={stopTone}
                    onPointerCancel={stopTone}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        void startTone(note.frequency, {
                          key: `string-${note.string}`,
                          stringNumber: note.string,
                        });
                      }
                    }}
                    onKeyUp={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') stopTone();
                    }}
                    style={{ touchAction: 'none' }}
                    className={`rounded-lg border bg-card p-3 text-center transition-colors select-none ${
                      isPlaying ? 'brightness-105' : ''
                    } ${
                      isHighlighted
                        ? isInTune
                          ? 'border-green-500 ring-1 ring-green-500/30'
                          : 'border-[var(--accent-color)] ring-1 ring-[var(--accent-color)]'
                        : 'hover:border-[var(--accent-color)]'
                    }`}
                    aria-label={`String ${note.string}, ${note.name}, ${Math.round(note.frequency)} hertz. Hold to hear the reference tone.`}
                  >
                    <div className="mb-1 text-xs text-muted-foreground">String {note.string}</div>
                    <div className="text-2xl font-bold">{note.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {note.frequency.toFixed(0)} Hz
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tuning picker */}
            <Card>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold">Featured tunings</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {FEATURED.map(({ tuning, instrument }) => (
                      <Button
                        key={tuning.id}
                        variant={tuning.id === currentTuning.id ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => selectTuning(tuning)}
                        title={`${instrument.name} — ${tuning.description ?? tuning.name}`}
                      >
                        <span aria-hidden>{instrument.icon}</span>
                        {tuning.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Instrument</label>
                    <Select
                      value={currentInstrument?.id ?? ''}
                      onValueChange={(instrumentId) => {
                        const instrument = INSTRUMENT_CATEGORIES.find((c) => c.id === instrumentId);
                        if (instrument?.tunings[0]) selectTuning(instrument.tunings[0]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose instrument" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSTRUMENT_CATEGORIES.map((instrument) => (
                          <SelectItem key={instrument.id} value={instrument.id}>
                            {instrument.icon} {instrument.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Tuning</label>
                    <Select
                      value={currentTuning.id}
                      onValueChange={(tuningId) => {
                        const tuning = findTuningById(tuningId);
                        if (tuning) selectTuning(tuning);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose tuning" />
                      </SelectTrigger>
                      <SelectContent>
                        {(currentInstrument?.tunings ?? []).map((tuning) => (
                          <SelectItem key={tuning.id} value={tuning.id}>
                            {tuning.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <a
                  href={fullTunerUrl(currentTuning.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-color)] hover:underline"
                >
                  Open the full Instrument Tuner app
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </CardContent>
            </Card>

            {/* Reference pitch */}
            <Card>
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Reference Pitch (A4)</h2>
                  <span className="text-sm text-muted-foreground">A4 = {referencePitch} Hz</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {REFERENCE_PITCH_PRESETS.map((preset) => (
                    <Button
                      key={preset.hz}
                      variant={referencePitch === preset.hz ? 'default' : 'outline'}
                      size="sm"
                      className="h-8"
                      onClick={() => setReferencePitch(preset.hz)}
                      title={preset.description}
                    >
                      {preset.label}
                    </Button>
                  ))}
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="tuner-custom-a4" className="text-xs text-muted-foreground">
                      Custom
                    </label>
                    <input
                      id="tuner-custom-a4"
                      type="number"
                      min={MIN_REFERENCE_PITCH}
                      max={MAX_REFERENCE_PITCH}
                      step={1}
                      value={isPresetPitch ? '' : referencePitch}
                      placeholder={String(referencePitch)}
                      onChange={(e) => {
                        const parsed = Number(e.target.value);
                        if (
                          Number.isFinite(parsed) &&
                          parsed >= MIN_REFERENCE_PITCH &&
                          parsed <= MAX_REFERENCE_PITCH
                        ) {
                          setReferencePitch(parsed);
                        }
                      }}
                      className="h-8 w-20 rounded-md border bg-background px-2 text-sm"
                      aria-label={`Custom A4 reference in hertz (${MIN_REFERENCE_PITCH}–${MAX_REFERENCE_PITCH})`}
                    />
                    <span className="text-xs text-muted-foreground">Hz</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {referencePitch === STANDARD_A4
                    ? 'Concert standard. Every note is derived from A4 = 440 Hz in equal temperament.'
                    : `True mathematical retuning: detection, string targets, and reference tones are all scaled by exactly ${referencePitch}/440. Microtonal cent offsets are preserved.`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Desktop sticky gauge rail */}
          <div className="hidden flex-shrink-0 lg:sticky lg:top-6 lg:block lg:w-80">
            <TunerGauge
              detectedPitch={detectedPitch}
              isStale={isStale}
              microphoneActive={microphoneActive}
              referencePitch={referencePitch}
              subdueNote={highlightedString !== null}
              size="md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface TunerGaugeProps {
  detectedPitch: DetectedPitch | null;
  isStale: boolean;
  microphoneActive: boolean;
  referencePitch: number;
  subdueNote: boolean;
  size: 'sm' | 'md';
}

function TunerGauge({
  detectedPitch,
  isStale,
  microphoneActive,
  referencePitch,
  subdueNote,
  size,
}: TunerGaugeProps) {
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
        inTuneThreshold={10}
        smoothingFactor={0.7}
        subdueNote={subdueNote}
        size={size}
      />
      {referencePitch !== STANDARD_A4 && (
        <span
          className="mt-1 inline-flex items-center rounded-full border border-[var(--accent-color)]/40 bg-[var(--accent-light)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent-color)]"
          title={`Reference pitch: every frequency is scaled by exactly ${referencePitch}/440`}
        >
          A4 = {referencePitch} Hz
        </span>
      )}
      {size === 'md' && !microphoneActive && (
        <p className="mt-2 text-center text-sm text-muted-foreground">Enable microphone to begin</p>
      )}
      {size === 'md' && microphoneActive && !detectedPitch && (
        <p className="mt-2 text-center text-sm text-muted-foreground">Play a string to start tuning</p>
      )}
    </div>
  );
}

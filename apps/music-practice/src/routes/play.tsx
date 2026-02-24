/**
 * Play Route - Sight reading game with setup phase
 * Shows settings form first, then starts the flash card game
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { Label } from '@hudak/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@hudak/ui/components/select';
import { Slider } from '@hudak/ui/components/slider';
import { X, SkipForward, Piano, Guitar, Mic, Play } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Import our libraries
import { MidiManager, type NoteOnEvent, type DeviceChangeEvent } from '../lib/input/midi-manager';
import { AudioManager, type PitchDetectedEvent } from '../lib/input/audio-manager';
import { StaffRenderer } from '../lib/notation/staff-renderer';
import { TabRenderer } from '../lib/notation/tab-renderer';
import { getInstrument, requiresMIDI } from '../lib/utils/instrument-config';
import { generateRandomNote, validateNote } from '../lib/utils/music-theory';
import { Storage } from '../lib/utils/storage';
import { AudioPlayback } from '../lib/utils/audio-playback';
import { getNoteRange } from '../lib/game/note-range';
import { renderPracticeNote } from '../lib/game/render-note';

// Game components
import { useGameRound, type GameMode } from '../hooks/use-game-round';
import { getStreakMilestoneMessage } from '../lib/utils/scoring';
import { VirtualKeyboard } from '../components/virtual-keyboard';
import { RadialTimer } from '../components/play/radial-timer';
import { ScoreHud } from '../components/play/score-hud';
import { NotationCard } from '../components/play/notation-card';
import { ScoreSummaryModal } from '../components/play/score-summary-modal';

// Search params for game settings (backward compatibility)
interface PlaySearchParams {
  instrument?: string;
  clef?: string;
  difficulty?: string;
  gameMode?: string;
  tabDisplayMode?: string;
  pitchSensitivity?: number;
  pitchSmoothing?: number;
  selectedAudioDevice?: string;
}

export const Route = createFileRoute('/play')({
  component: PlayRoute,
  validateSearch: (search: Record<string, unknown>): PlaySearchParams => ({
    instrument: (search.instrument as string) || undefined,
    clef: (search.clef as string) || undefined,
    difficulty: (search.difficulty as string) || undefined,
    gameMode: (search.gameMode as string) || undefined,
    tabDisplayMode: (search.tabDisplayMode as string) || undefined,
    pitchSensitivity: search.pitchSensitivity ? Number(search.pitchSensitivity) : undefined,
    pitchSmoothing: search.pitchSmoothing ? Number(search.pitchSmoothing) : undefined,
    selectedAudioDevice: (search.selectedAudioDevice as string) || undefined,
  }),
});

// ─── Instrument definitions ────────────────────────────────
const INSTRUMENTS = [
  { id: 'piano', label: 'Piano (MIDI)', icon: Piano, description: 'Connect a MIDI keyboard' },
  { id: 'piano-virtual', label: 'Piano (Virtual)', icon: Piano, description: 'On-screen keyboard' },
  { id: 'violin', label: 'Violin (Mic)', icon: Mic, description: 'Microphone pitch detection' },
  { id: 'guitar', label: 'Guitar (Mic)', icon: Guitar, description: 'Microphone pitch detection' },
] as const;

const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner', range: 'C4 – C5' },
  { id: 'intermediate', label: 'Intermediate', range: 'C4 – G5' },
  { id: 'advanced', label: 'Advanced', range: 'A3 – C6' },
] as const;

// ─── Setup Screen ──────────────────────────────────────────
function SetupScreen({ onStart }: {
  onStart: (settings: {
    instrument: string;
    clef: string;
    difficulty: string;
    gameMode: string;
    tabDisplayMode: string;
    pitchSensitivity: number;
    pitchSmoothing: number;
    selectedAudioDevice: string;
  }) => void;
}) {
  const navigate = useNavigate();
  const saved = Storage.getSettings();

  const [instrument, setInstrument] = useState(saved.instrument || 'piano');
  const [clef, setClef] = useState<string>(saved.clef || 'treble');
  const [difficulty, setDifficulty] = useState(saved.difficulty || 'beginner');
  const [gameMode, setGameMode] = useState<string>(saved.gameMode || 'practice');
  const [tabDisplayMode, setTabDisplayMode] = useState('both');
  const [pitchSensitivity, setPitchSensitivity] = useState(saved.pitchTolerance || 10);
  const [pitchSmoothing, setPitchSmoothing] = useState(0.7);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState(saved.audioDeviceId || '');
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

  const isMicInstrument = instrument === 'violin' || instrument === 'guitar';

  // Fetch audio devices when mic instrument is selected
  useEffect(() => {
    if (!isMicInstrument) return;
    AudioManager.getAudioInputDevices().then(setAudioDevices).catch(() => {});
  }, [isMicInstrument]);

  const handleStart = () => {
    // Save to storage for persistence
    Storage.saveSettings({
      instrument,
      clef: clef as 'treble' | 'bass',
      gameMode: gameMode as 'practice' | 'timed',
      pitchTolerance: pitchSensitivity,
      audioDeviceId: selectedAudioDevice || null,
      difficulty,
    });

    onStart({
      instrument,
      clef,
      difficulty,
      gameMode,
      tabDisplayMode,
      pitchSensitivity,
      pitchSmoothing,
      selectedAudioDevice,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back button */}
      <div className="fixed top-6 left-6 z-30">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/' })}
          className="h-12 w-12 rounded-full bg-card/80 backdrop-blur hover:bg-muted transition-all shadow-lg"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground">Sight Reading</h1>
            <p className="text-muted-foreground">Configure your practice session</p>
          </div>

          {/* Instrument Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Instrument</Label>
            <div className="grid grid-cols-2 gap-3">
              {INSTRUMENTS.map((inst) => {
                const Icon = inst.icon;
                const isActive = instrument === inst.id;
                return (
                  <button
                    key={inst.id}
                    onClick={() => setInstrument(inst.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      isActive
                        ? 'border-[var(--accent-color)] bg-[var(--accent-light)]'
                        : 'border-border hover:border-[var(--accent-color)]/40 bg-card'
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[var(--accent-color)]' : 'text-muted-foreground'}`} />
                    <div>
                      <div className={`text-sm font-medium ${isActive ? 'text-[var(--accent-color)]' : 'text-foreground'}`}>
                        {inst.label}
                      </div>
                      <div className="text-xs text-muted-foreground">{inst.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clef + Difficulty row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clef-select" className="text-sm font-medium">Clef</Label>
              <Select value={clef} onValueChange={setClef}>
                <SelectTrigger id="clef-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="treble">Treble</SelectItem>
                  <SelectItem value="bass">Bass</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty-select" className="text-sm font-medium">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.label} ({d.range})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Game Mode */}
          <div className="space-y-2">
            <Label htmlFor="mode-select" className="text-sm font-medium">Game Mode</Label>
            <Select value={gameMode} onValueChange={setGameMode}>
              <SelectTrigger id="mode-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="practice">Practice (untimed)</SelectItem>
                <SelectItem value="timed">Timed Challenge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tab Display Mode (guitar only) */}
          {instrument === 'guitar' && (
            <div className="space-y-2">
              <Label htmlFor="tab-display-select" className="text-sm font-medium">Tab Display</Label>
              <Select value={tabDisplayMode} onValueChange={setTabDisplayMode}>
                <SelectTrigger id="tab-display-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Staff + Tab</SelectItem>
                  <SelectItem value="tab">Tab Only</SelectItem>
                  <SelectItem value="staff">Staff Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Microphone Config (violin/guitar only) */}
          {isMicInstrument && (
            <div className="space-y-4 p-4 rounded-xl border border-border bg-card">
              <h3 className="text-sm font-medium text-foreground">Microphone Settings</h3>

              {/* Audio Device */}
              {audioDevices.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="audio-device" className="text-xs text-muted-foreground">Audio Device</Label>
                  <Select value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                    <SelectTrigger id="audio-device">
                      <SelectValue placeholder="Default microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      {audioDevices.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Pitch Sensitivity */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Pitch Sensitivity</Label>
                  <span className="text-xs text-muted-foreground">{pitchSensitivity} cents</span>
                </div>
                <Slider
                  value={[pitchSensitivity]}
                  onValueChange={([v]) => setPitchSensitivity(v)}
                  min={5}
                  max={50}
                  step={5}
                />
              </div>

              {/* Dial Smoothing */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Dial Smoothing</Label>
                  <span className="text-xs text-muted-foreground">{pitchSmoothing.toFixed(1)}</span>
                </div>
                <Slider
                  value={[pitchSmoothing * 10]}
                  onValueChange={([v]) => setPitchSmoothing(v / 10)}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
            </div>
          )}

          {/* Start Button */}
          <Button
            onClick={handleStart}
            className="w-full h-14 text-lg gap-3 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white rounded-xl"
          >
            <Play className="h-5 w-5" />
            Start Practice
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main PlayRoute ────────────────────────────────────────
function PlayRoute() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  // Setup phase
  const [setupComplete, setSetupComplete] = useState(false);
  const [settings, setSettings] = useState({
    instrument: search.instrument || 'piano',
    clef: search.clef || 'treble',
    difficulty: search.difficulty || 'beginner',
    gameMode: search.gameMode || 'practice',
    tabDisplayMode: search.tabDisplayMode || 'both',
    pitchSensitivity: search.pitchSensitivity || 10,
    pitchSmoothing: search.pitchSmoothing || 0.7,
    selectedAudioDevice: search.selectedAudioDevice || '',
  });

  // Derived settings
  const instrument = settings.instrument;
  const clef = settings.clef;
  const difficulty = settings.difficulty as 'beginner' | 'intermediate' | 'advanced';
  const gameMode = settings.gameMode as GameMode;
  const tabDisplayMode = settings.tabDisplayMode as 'staff' | 'tab' | 'both';
  const pitchSensitivity = settings.pitchSensitivity;
  const pitchSmoothing = settings.pitchSmoothing;
  const selectedAudioDevice = settings.selectedAudioDevice;

  // Input status
  const [midiConnected, setMidiConnected] = useState(false);
  const [microphoneActive, setMicrophoneActive] = useState(false);

  // Practice session state
  const [sessionActive, setSessionActive] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, streak: 0, avgTime: '-' });
  const [feedback, setFeedback] = useState('');
  const [, setCurrentNote] = useState<number | null>(null);
  const [lastDetectedNote, setLastDetectedNote] = useState<{ note: number; noteName: string; centsOff?: number } | null>(null);
  const [showScoreSummary, setShowScoreSummary] = useState(false);

  // Pitch detection state
  const [detectedPitch, setDetectedPitch] = useState<{ note: string; cents: number; clarity: number } | null>(null);

  // Tab orientation for left-handed guitarists
  const [tabOrientation, setTabOrientation] = useState<'standard' | 'leftHanded'>(() => {
    const saved = Storage.getSettings();
    return saved.tabOrientation || 'standard';
  });

  // Refs
  const sessionActiveRef = useRef(false);
  const currentNoteRef = useRef<number | null>(null);
  const instrumentRef = useRef(instrument);
  const clefRef = useRef(clef);
  const gameModeRef = useRef(gameMode);
  const roundActionsRef = useRef<any>(null);
  const roundStateRef = useRef<any>(null);
  const midiManager = useRef<MidiManager | null>(null);
  const audioManager = useRef<AudioManager | null>(null);
  const audioPlayback = useRef<AudioPlayback | null>(null);
  const staffRenderer = useRef<StaffRenderer | null>(null);
  const tabRenderer = useRef<TabRenderer | null>(null);
  const staffContainerRef = useRef<HTMLDivElement>(null);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const lastIncorrectFeedbackRef = useRef(0);
  const audioInitAttemptedRef = useRef(false);
  const noteValidatedRef = useRef(false);
  const correctDetectionsRef = useRef(0);
  const lastDetectionTimeRef = useRef(0);

  // Get note range based on difficulty and instrument
  const noteRange = useCallback(() => getNoteRange(instrument, difficulty), [difficulty, instrument]);

  // Stable callbacks for game round hook
  const handleRoundComplete = useCallback((state: any) => {
    setShowScoreSummary(true);
    const range = getNoteRange(instrument, difficulty);
    Storage.saveSession({
      module: 'sightReading',
      correct: state.correctCount,
      incorrect: state.incorrectCount,
      bestStreak: state.streak,
      gameMode,
      roundScore: state.currentScore?.finalScore,
      timeLeft: state.timeLeft,
      livesRemaining: state.lives,
      instrument,
      clef,
      range,
    });
    toast.success('Round Complete!', {
      description: `Score: ${state.currentScore?.finalScore || 0} points`,
    });
  }, [gameMode, instrument, clef, difficulty]);

  const handleRoundFail = useCallback((state: any) => {
    setShowScoreSummary(true);
    toast.error('Round Failed', {
      description: `You scored ${state.currentScore?.finalScore || 0} points. Try again!`,
    });
  }, []);

  const handleLifeLost = useCallback((livesLeft: number) => {
    if (livesLeft === 1) {
      toast.warning('Last Life!', { description: 'Be careful on the next note!', duration: 2000 });
    }
  }, []);

  const handleStreakMilestone = useCallback((streak: number) => {
    const message = getStreakMilestoneMessage(streak);
    if (message) toast.success(message, { duration: 2500 });
  }, []);

  // Game round hook
  const [roundState, roundActions] = useGameRound({
    difficulty,
    gameMode,
    onRoundComplete: handleRoundComplete,
    onRoundFail: handleRoundFail,
    onLifeLost: handleLifeLost,
    onStreakMilestone: handleStreakMilestone,
  });

  // Next note function
  const nextNote = useCallback(() => {
    noteValidatedRef.current = false;
    correctDetectionsRef.current = 0;
    lastDetectionTimeRef.current = 0;

    const note = generateRandomNote(noteRange(), clef as 'treble' | 'bass');
    if (note) {
      setCurrentNote(note.midiNote);
      currentNoteRef.current = note.midiNote;

      renderPracticeNote({
        instrument,
        tabDisplayMode,
        clef: clef as 'treble' | 'bass',
        midiNote: note.midiNote,
        staffRenderer: staffRenderer.current,
        tabRenderer: tabRenderer.current,
      });
    }
  }, [clef, instrument, noteRange, tabDisplayMode]);

  // Handle MIDI device changes
  const handleMidiDeviceChange = useCallback((_event: DeviceChangeEvent) => {
    if (midiManager.current) {
      const devices = midiManager.current.getInputDevices();
      setMidiConnected(devices.length > 0);
    }
  }, []);

  // Handle pitch detection
  const handlePitchDetected = useCallback((event: PitchDetectedEvent) => {
    setDetectedPitch({ note: event.noteName, cents: event.cents, clarity: event.clarity });

    let centsOff: number | undefined;
    if (currentNoteRef.current !== null) {
      const instrumentConfig = getInstrument(instrumentRef.current as 'piano' | 'violin' | 'guitar');
      const result = validateNote(event.midi, currentNoteRef.current, {
        allowOctaveError: instrumentConfig.validation.octaveFlexible,
      });
      centsOff = result.centsOff;
    }

    setLastDetectedNote({ note: event.midi, noteName: event.noteName, centsOff });

    if (sessionActiveRef.current && currentNoteRef.current !== null) {
      const instrumentConfig = getInstrument(instrumentRef.current as 'piano' | 'violin' | 'guitar');
      const result = validateNote(event.midi, currentNoteRef.current, {
        allowOctaveError: instrumentConfig.validation.octaveFlexible,
      });

      if (result.isCorrect) {
        correctDetectionsRef.current += 1;
        lastDetectionTimeRef.current = Date.now();
        const REQUIRED_CONSECUTIVE_DETECTIONS = 4;

        if (correctDetectionsRef.current >= REQUIRED_CONSECUTIVE_DETECTIONS && !noteValidatedRef.current) {
          noteValidatedRef.current = true;
          if (gameModeRef.current === 'timed' && roundStateRef.current?.isActive) {
            roundActionsRef.current?.noteCorrect();
          }
          setStats(prev => ({
            correct: prev.correct + 1,
            incorrect: prev.incorrect,
            streak: gameModeRef.current === 'timed' ? (roundStateRef.current?.streak || 0) : prev.streak + 1,
            avgTime: prev.avgTime
          }));
          setFeedback('Correct!');
          if (staffRenderer.current) staffRenderer.current.showFeedback(true);
        }
      } else {
        correctDetectionsRef.current = 0;
        lastDetectionTimeRef.current = Date.now();
        const now = Date.now();
        if (now - lastIncorrectFeedbackRef.current > 1000 && !noteValidatedRef.current) {
          if (gameModeRef.current === 'timed' && roundStateRef.current?.isActive) {
            roundActionsRef.current?.noteIncorrect();
          }
          setStats(prev => ({ correct: prev.correct, incorrect: prev.incorrect + 1, streak: 0, avgTime: prev.avgTime }));
          setFeedback(`Try again - you played ${event.noteName}`);
          if (staffRenderer.current) staffRenderer.current.showFeedback(false);
          lastIncorrectFeedbackRef.current = now;
        }
      }
    }
  }, []);

  // Handle MIDI note input
  const nextNoteRef = useRef(nextNote);
  useEffect(() => { nextNoteRef.current = nextNote; }, [nextNote]);

  const handleMidiNoteOn = useCallback((event: NoteOnEvent) => {
    if (audioPlayback.current) audioPlayback.current.playNote(event.note);

    let centsOff: number | undefined;
    if (currentNoteRef.current !== null) {
      const instrumentConfig = getInstrument(instrumentRef.current as 'piano' | 'violin' | 'guitar');
      const result = validateNote(event.note, currentNoteRef.current, {
        allowOctaveError: instrumentConfig.validation.octaveFlexible,
      });
      centsOff = result.centsOff;
    }

    setLastDetectedNote({ note: event.note, noteName: event.noteName, centsOff });

    if (sessionActiveRef.current && currentNoteRef.current !== null) {
      const instrumentConfig = getInstrument(instrumentRef.current as 'piano' | 'violin' | 'guitar');
      const result = validateNote(event.note, currentNoteRef.current, {
        allowOctaveError: instrumentConfig.validation.octaveFlexible,
      });

      if (result.isCorrect) {
        if (gameModeRef.current === 'timed' && roundStateRef.current?.isActive) {
          roundActionsRef.current?.noteCorrect();
        }
        setStats(prev => ({
          correct: prev.correct + 1,
          incorrect: prev.incorrect,
          streak: gameModeRef.current === 'timed' ? (roundStateRef.current?.streak || 0) : prev.streak + 1,
          avgTime: prev.avgTime
        }));
        setFeedback('Correct!');
        if (staffRenderer.current) staffRenderer.current.showFeedback(true);
        setTimeout(() => { if (!roundStateRef.current?.isComplete) nextNoteRef.current(); }, 500);
      } else {
        if (gameModeRef.current === 'timed' && roundStateRef.current?.isActive) {
          roundActionsRef.current?.noteIncorrect();
        }
        setStats(prev => ({ correct: prev.correct, incorrect: prev.incorrect + 1, streak: 0, avgTime: prev.avgTime }));
        setFeedback('Try again');
        if (staffRenderer.current) staffRenderer.current.showFeedback(false);
      }
    }
  }, []);

  // Initialize managers when setup is complete
  useEffect(() => {
    if (!setupComplete) return;

    const initManagers = async () => {
      audioPlayback.current = new AudioPlayback();

      if (requiresMIDI(instrument as any)) {
        midiManager.current = new MidiManager();
        const success = await midiManager.current.init();
        setMidiConnected(success);
        if (success) {
          midiManager.current.on('noteOn', handleMidiNoteOn);
          midiManager.current.on('deviceChange', handleMidiDeviceChange);
        }
      }

      setTimeout(() => {
        if (staffContainerRef.current && !staffRenderer.current) {
          staffRenderer.current = new StaffRenderer('staff-display');
        }
        if (tabContainerRef.current && !tabRenderer.current) {
          tabRenderer.current = new TabRenderer('tab-display', instrumentRef.current);
        }
      }, 200);
    };

    initManagers();

    return () => {
      midiManager.current?.disconnectDevice();
      audioManager.current?.disconnect();
      audioPlayback.current?.cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupComplete]);

  // Sync refs
  useEffect(() => {
    instrumentRef.current = instrument;
    if (tabRenderer.current && tabContainerRef.current) {
      tabRenderer.current = new TabRenderer('tab-display', instrument, tabOrientation);
    }
  }, [instrument, tabOrientation]);

  useEffect(() => {
    if (tabRenderer.current) {
      tabRenderer.current.setTabOrientation(tabOrientation);
    }
    Storage.saveSettings({ tabOrientation });
  }, [tabOrientation]);

  useEffect(() => { clefRef.current = clef; }, [clef]);
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);

  roundActionsRef.current = roundActions;
  roundStateRef.current = roundState;

  // Silence detection for microphone
  useEffect(() => {
    if (!sessionActive) return;
    const SILENCE_THRESHOLD_MS = 800;
    const checkInterval = setInterval(() => {
      const timeSinceLastDetection = Date.now() - lastDetectionTimeRef.current;
      if (noteValidatedRef.current && timeSinceLastDetection > SILENCE_THRESHOLD_MS) {
        noteValidatedRef.current = false;
        correctDetectionsRef.current = 0;
        lastDetectionTimeRef.current = 0;
        if (!roundStateRef.current?.isComplete) nextNoteRef.current();
      }
    }, 100);
    return () => clearInterval(checkInterval);
  }, [sessionActive]);

  // Audio manager for microphone instruments
  useEffect(() => {
    if (!setupComplete) return;
    const isMicrophoneInstrument = instrument === 'violin' || instrument === 'guitar';
    if (isMicrophoneInstrument && !audioInitAttemptedRef.current) {
      const initAudio = async () => {
        audioInitAttemptedRef.current = true;
        const devices = await AudioManager.getAudioInputDevices();
        const deviceId = selectedAudioDevice || devices[0]?.deviceId;
        audioManager.current = new AudioManager();
        const success = await audioManager.current.init(deviceId);
        setMicrophoneActive(success);
        if (success) {
          audioManager.current.on('pitchDetected', handlePitchDetected);
          audioManager.current.on('statusChange', (status) => setMicrophoneActive(status.microphoneActive));
          audioManager.current.startListening();
        } else {
          toast.error('Microphone Access Required', {
            description: 'Click the camera/microphone icon in your browser\'s address bar to allow microphone access.',
            duration: 10000,
          });
        }
      };
      initAudio();
    } else if (!isMicrophoneInstrument && audioManager.current) {
      audioManager.current.disconnect();
      audioManager.current = null;
      setMicrophoneActive(false);
      audioInitAttemptedRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupComplete, instrument, selectedAudioDevice]);

  // Start session when setup completes
  useEffect(() => {
    if (!setupComplete) return;

    const startSession = () => {
      if (gameMode === 'timed') roundActions.startRound();
      const note = generateRandomNote(noteRange(), clef as 'treble' | 'bass');
      if (note) {
        setCurrentNote(note.midiNote);
        currentNoteRef.current = note.midiNote;

        setTimeout(() => {
          renderPracticeNote({
            instrument,
            tabDisplayMode,
            clef: clef as 'treble' | 'bass',
            midiNote: note.midiNote,
            staffRenderer: staffRenderer.current,
            tabRenderer: tabRenderer.current,
          });
        }, 100);

        setSessionActive(true);
        sessionActiveRef.current = true;
        setFeedback('Play the note!');
        setStats({ correct: 0, incorrect: 0, streak: 0, avgTime: '-' });
      }
    };

    const timer = setTimeout(startSession, 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupComplete]);

  // Stop session
  const stopSession = () => {
    if (gameMode === 'timed' && roundState.isActive) roundActions.endRound();
    setSessionActive(false);
    sessionActiveRef.current = false;
    if (gameMode !== 'timed' && (stats.correct > 0 || stats.incorrect > 0)) {
      Storage.saveSession({
        module: 'sightReading',
        instrument,
        clef,
        range: noteRange(),
        ...stats,
        timestamp: Date.now()
      });
    }
    navigate({ to: '/' });
  };

  // ─── Setup screen ─────────────────────────────────────────
  if (!setupComplete) {
    return (
      <SetupScreen
        onStart={(s) => {
          setSettings(s);
          setSetupComplete(true);
        }}
      />
    );
  }

  // ─── Game screen ──────────────────────────────────────────
  const isMicrophoneInstrument = instrument === 'violin' || instrument === 'guitar';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Exit Button - Top Right */}
      <div className="fixed top-6 right-6 z-30">
        <Button
          variant="ghost"
          size="icon"
          onClick={stopSession}
          className="h-12 w-12 rounded-full bg-card/80 backdrop-blur hover:bg-destructive hover:text-destructive-foreground transition-all shadow-lg"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Connection Status - Top Left */}
      <div className="fixed top-6 left-6 z-30 flex gap-2">
        {midiConnected && <Badge variant="default" className="bg-[var(--success-color)]">MIDI Connected</Badge>}
        {microphoneActive && isMicrophoneInstrument && (
          <Badge variant="default" className="bg-[var(--success-color)]">Mic Active</Badge>
        )}
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-4"
          >
            <ScoreHud gameMode={gameMode} roundState={roundState} stats={stats} />
            {gameMode === 'timed' && roundState.isActive && (
              <RadialTimer
                timeLeft={roundState.timeLeft}
                maxTime={roundState.maxTime}
              />
            )}
          </motion.div>

          {/* Flash Card with Notation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <NotationCard
              instrument={instrument}
              tabDisplayMode={tabDisplayMode}
              isMicrophoneInstrument={isMicrophoneInstrument}
              staffContainerRef={staffContainerRef}
              tabContainerRef={tabContainerRef}
              detectedPitch={detectedPitch}
              pitchSensitivity={pitchSensitivity}
              pitchSmoothing={pitchSmoothing}
              feedback={feedback}
              lastDetectedNote={lastDetectedNote}
              tabOrientation={tabOrientation}
              onTabOrientationChange={setTabOrientation}
            />
          </motion.div>

          {/* Skip Button (Practice Mode Only) */}
          {gameMode === 'practice' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <Button
                variant="ghost"
                onClick={nextNote}
                className="gap-2"
              >
                <SkipForward className="h-4 w-4" />
                Skip Note
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Virtual Keyboard */}
      {instrument === 'piano-virtual' && (
        <div className="pb-8 px-8">
          <VirtualKeyboard
            onNotePlay={(midiNote, noteName) => {
              const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
              handleMidiNoteOn({
                note: midiNote,
                noteName,
                velocity: 100,
                frequency,
                timestamp: Date.now()
              });
            }}
            enabled={true}
            startOctave={3}
            octaveCount={3}
          />
        </div>
      )}

      <ScoreSummaryModal
        isOpen={showScoreSummary}
        scoreResult={roundState.currentScore}
        correctCount={roundState.correctCount}
        totalNotes={roundState.notesRequired}
        isSuccessful={roundState.isSuccessful || false}
        onContinue={() => {
          setShowScoreSummary(false);
          roundActions.startRound();
          const note = generateRandomNote(noteRange(), clef as 'treble' | 'bass');
          if (note) {
            setCurrentNote(note.midiNote);
            currentNoteRef.current = note.midiNote;
            setSessionActive(true);
            sessionActiveRef.current = true;
            setTimeout(() => {
              renderPracticeNote({
                instrument,
                tabDisplayMode,
                clef: clef as 'treble' | 'bass',
                midiNote: note.midiNote,
                staffRenderer: staffRenderer.current,
                tabRenderer: tabRenderer.current,
              });
            }, 100);
          }
        }}
        onRetry={!roundState.isSuccessful ? () => {
          setShowScoreSummary(false);
          roundActions.resetRound();
          const note = generateRandomNote(noteRange(), clef as 'treble' | 'bass');
          if (note) {
            setCurrentNote(note.midiNote);
            currentNoteRef.current = note.midiNote;
            setSessionActive(true);
            sessionActiveRef.current = true;
            setTimeout(() => {
              renderPracticeNote({
                instrument,
                tabDisplayMode,
                clef: clef as 'treble' | 'bass',
                midiNote: note.midiNote,
                staffRenderer: staffRenderer.current,
                tabRenderer: tabRenderer.current,
              });
            }, 100);
          }
        } : undefined}
      />
    </div>
  );
}

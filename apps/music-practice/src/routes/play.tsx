/**
 * Play Route - Flash card game interface with centered notation display
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { Button } from '@hudak/ui/components/button';
import { Card, CardContent } from '@hudak/ui/components/card';
import { Badge } from '@hudak/ui/components/badge';
import { X, Volume2, Trophy, Flame, Target, SkipForward } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Import our libraries
import { MidiManager, type NoteOnEvent, type DeviceChangeEvent } from '../lib/input/midi-manager';
import { AudioManager, type PitchDetectedEvent } from '../lib/input/audio-manager';
import { StaffRenderer } from '../lib/notation/staff-renderer';
import { TabRenderer } from '../lib/notation/tab-renderer';
import { getInstrument, requiresMIDI } from '../lib/utils/instrument-config';
import { generateRandomNote, midiToVexflow, validateNote } from '../lib/utils/music-theory';
import { Storage } from '../lib/utils/storage';
import { AudioPlayback } from '../lib/utils/audio-playback';
import { PitchGauge } from '@hudak/audio-components';

// Game components
import { useGameRound, type GameMode } from '../hooks/use-game-round';
import { LivesDisplay } from '../components/lives-display';
import { ScoreSummary } from '../components/score-summary';
import { getStreakMilestoneMessage } from '../lib/utils/scoring';
import { VirtualKeyboard } from '../components/virtual-keyboard';

// Search params for game settings
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
    instrument: (search.instrument as string) || 'piano',
    clef: (search.clef as string) || 'treble',
    difficulty: (search.difficulty as string) || 'beginner',
    gameMode: (search.gameMode as string) || 'practice',
    tabDisplayMode: (search.tabDisplayMode as string) || 'both',
    pitchSensitivity: Number(search.pitchSensitivity) || 10,
    pitchSmoothing: Number(search.pitchSmoothing) || 0.7,
    selectedAudioDevice: (search.selectedAudioDevice as string) || '',
  }),
});

// Radial Timer Component
function RadialTimer({
  timeLeft,
  maxTime,
}: {
  timeLeft: number;
  maxTime: number;
  isActive?: boolean;
}) {
  const percentage = (timeLeft / maxTime) * 100;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isLow = percentage < 30;
  const isMedium = percentage < 60 && percentage >= 30;

  return (
    <div className="relative">
      <svg width="130" height="130" viewBox="0 0 130 130" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-100 ${
            isLow ? 'text-red-500' : isMedium ? 'text-amber-500' : 'text-emerald-500'
          }`}
        />
      </svg>
      {/* Time text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-3xl font-bold tabular-nums ${isLow ? 'text-red-500 animate-pulse' : ''}`}>
            {Math.ceil(timeLeft)}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">sec</div>
        </div>
      </div>
    </div>
  );
}

function PlayRoute() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  // Extract settings from search params
  const instrument = search.instrument || 'piano';
  const clef = search.clef || 'treble';
  const difficulty = (search.difficulty || 'beginner') as 'beginner' | 'intermediate' | 'advanced';
  const gameMode = (search.gameMode || 'practice') as GameMode;
  const tabDisplayMode = (search.tabDisplayMode || 'both') as 'staff' | 'tab' | 'both';
  const pitchSensitivity = search.pitchSensitivity || 10;
  const pitchSmoothing = search.pitchSmoothing || 0.7;
  const selectedAudioDevice = search.selectedAudioDevice || '';

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
  const getNoteRange = useCallback((): string => {
    const instrumentRanges: Record<string, Record<typeof difficulty, string>> = {
      'piano': { 'beginner': 'c4-c5', 'intermediate': 'c4-g5', 'advanced': 'a3-c6' },
      'piano-virtual': { 'beginner': 'c4-c5', 'intermediate': 'c4-g5', 'advanced': 'a3-c6' },
      'guitar': { 'beginner': 'e2-e4', 'intermediate': 'e2-a4', 'advanced': 'e2-e5' },
      'violin': { 'beginner': 'g3-g4', 'intermediate': 'g3-c5', 'advanced': 'g3-g5' }
    };
    const ranges = instrumentRanges[instrument] || instrumentRanges['piano'];
    return ranges[difficulty];
  }, [difficulty, instrument]);

  // Stable callbacks for game round hook to prevent infinite re-renders
  const handleRoundComplete = useCallback((state: any) => {
    setShowScoreSummary(true);

    // Calculate range inline to avoid dependency cycle
    const instrumentRanges: Record<string, Record<typeof difficulty, string>> = {
      'piano': { 'beginner': 'c4-c5', 'intermediate': 'c4-g5', 'advanced': 'a3-c6' },
      'piano-virtual': { 'beginner': 'c4-c5', 'intermediate': 'c4-g5', 'advanced': 'a3-c6' },
      'guitar': { 'beginner': 'e2-e4', 'intermediate': 'e2-a4', 'advanced': 'e2-e5' },
      'violin': { 'beginner': 'g3-g4', 'intermediate': 'g3-c5', 'advanced': 'g3-g5' }
    };
    const ranges = instrumentRanges[instrument] || instrumentRanges['piano'];
    const range = ranges[difficulty];

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
    toast.success('Round Complete! 🎉', {
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
      toast.warning('Last Life! 💔', { description: 'Be careful on the next note!', duration: 2000 });
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

    const note = generateRandomNote(getNoteRange(), clef as 'treble' | 'bass');
    if (note) {
      setCurrentNote(note.midiNote);
      currentNoteRef.current = note.midiNote;

      // Render based on instrument/display mode
      if (instrument === 'guitar') {
        if (tabDisplayMode === 'both' && tabRenderer.current) {
          tabRenderer.current.renderStaffAndTab(note.midiNote);
        } else if (tabDisplayMode === 'tab' && tabRenderer.current) {
          tabRenderer.current.renderNote(note.midiNote);
        } else if (tabDisplayMode === 'staff' && staffRenderer.current) {
          const vexflowNote = midiToVexflow(note.midiNote, clef as 'treble' | 'bass');
          if (vexflowNote) staffRenderer.current.renderNote(vexflowNote);
        }
      } else if (staffRenderer.current) {
        const vexflowNote = midiToVexflow(note.midiNote, clef as 'treble' | 'bass');
        if (vexflowNote) staffRenderer.current.renderNote(vexflowNote);
      }
    }
  }, [clef, getNoteRange, instrument, tabDisplayMode]);

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
          setFeedback('Correct! ✓');
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

  // Handle MIDI note input - use refs to avoid recreating callback
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
        setFeedback('Correct! ✓');
        if (staffRenderer.current) staffRenderer.current.showFeedback(true);
        setTimeout(() => { if (!roundStateRef.current?.isComplete) nextNoteRef.current(); }, 500);
      } else {
        if (gameModeRef.current === 'timed' && roundStateRef.current?.isActive) {
          roundActionsRef.current?.noteIncorrect();
        }
        setStats(prev => ({ correct: prev.correct, incorrect: prev.incorrect + 1, streak: 0, avgTime: prev.avgTime }));
        setFeedback('Try again ✗');
        if (staffRenderer.current) staffRenderer.current.showFeedback(false);
      }
    }
  }, []);

  // Initialize managers
  useEffect(() => {
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
  }, []);

  // Sync refs
  useEffect(() => {
    instrumentRef.current = instrument;
    if (tabRenderer.current && tabContainerRef.current) {
      tabRenderer.current = new TabRenderer('tab-display', instrument);
    }
  }, [instrument]);

  useEffect(() => { clefRef.current = clef; }, [clef]);
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);

  // Update refs in render phase - this is safe and doesn't cause re-renders
  // React docs: "You can mutate refs during rendering as long as the mutation doesn't affect rendering output"
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
        // Use refs to avoid dependency on roundState object and nextNote callback
        if (!roundStateRef.current?.isComplete) nextNoteRef.current();
      }
    }, 100);
    return () => clearInterval(checkInterval);
  }, [sessionActive]); // Removed roundState.isComplete and nextNote dependencies

  // Audio manager for microphone instruments
  useEffect(() => {
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
  }, [instrument, selectedAudioDevice]);

  // Auto-start session on mount
  useEffect(() => {
    const startSession = () => {
      if (gameMode === 'timed') roundActions.startRound();
      const note = generateRandomNote(getNoteRange(), clef as 'treble' | 'bass');
      if (note) {
        setCurrentNote(note.midiNote);
        currentNoteRef.current = note.midiNote;

        setTimeout(() => {
          if (instrument === 'guitar') {
            if (tabDisplayMode === 'both' && tabRenderer.current) {
              tabRenderer.current.renderStaffAndTab(note.midiNote);
            } else if (tabDisplayMode === 'tab' && tabRenderer.current) {
              tabRenderer.current.renderNote(note.midiNote);
            } else if (tabDisplayMode === 'staff' && staffRenderer.current) {
              const vexflowNote = midiToVexflow(note.midiNote, clef as 'treble' | 'bass');
              if (vexflowNote) staffRenderer.current.renderNote(vexflowNote);
            }
          } else if (staffRenderer.current) {
            const vexflowNote = midiToVexflow(note.midiNote, clef as 'treble' | 'bass');
            if (vexflowNote) {
              staffRenderer.current.renderNote(vexflowNote);
            }
          }
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
  }, []);

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
        range: getNoteRange(),
        ...stats,
        timestamp: Date.now()
      });
    }
    navigate({ to: '/' });
  };

  const isMicrophoneInstrument = instrument === 'violin' || instrument === 'guitar';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
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
        {midiConnected && <Badge variant="default" className="bg-emerald-600">MIDI Connected</Badge>}
        {microphoneActive && isMicrophoneInstrument && (
          <Badge variant="default" className="bg-emerald-600">🎤 Mic Active</Badge>
        )}
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-8">
          {/* HUD Row - Score, Streak, Timer, Lives */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-4"
          >
            {/* Score & Streak */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-500/20">
                  <Trophy className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Score</div>
                  <div className="text-2xl font-bold tabular-nums">
                    {gameMode === 'timed' ? (roundState.currentScore?.finalScore || 0) : stats.correct * 10}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-500/20">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Streak</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tabular-nums">
                      {gameMode === 'timed' ? roundState.streak : stats.streak}
                    </span>
                    {stats.streak >= 3 && (
                      <span className="text-xs text-orange-500">🔥</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Radial Timer (Timed Mode) or Progress */}
            {gameMode === 'timed' && roundState.isActive && (
              <RadialTimer
                timeLeft={roundState.timeLeft}
                maxTime={roundState.maxTime}
                isActive={roundState.isActive}
              />
            )}

            {/* Lives (Timed Mode) or Stats */}
            <div className="flex items-center gap-8">
              {gameMode === 'timed' && roundState.isActive ? (
                <>
                  <LivesDisplay lives={roundState.lives} maxLives={roundState.maxLives} />
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Progress</div>
                    <div className="text-2xl font-bold text-blue-500">
                      {roundState.notesCompleted}/{roundState.notesRequired}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-emerald-500/20">
                      <Target className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Correct</div>
                      <div className="text-2xl font-bold tabular-nums text-emerald-500">{stats.correct}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Incorrect</div>
                    <div className="text-2xl font-bold tabular-nums text-red-500">{stats.incorrect}</div>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Flash Card with Notation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 shadow-2xl bg-card/95 backdrop-blur overflow-hidden">
              <CardContent className="p-0">
                <div className={`flex ${isMicrophoneInstrument ? 'flex-row' : 'flex-col'} items-center justify-center`}>
                  {/* Notation Display */}
                  <div className={`flex-1 p-8 flex items-center justify-center ${
                    instrument === 'guitar' && tabDisplayMode === 'both' ? 'min-h-[400px]' : 'min-h-[300px]'
                  }`}>
                    {/* Staff Display */}
                    <div
                      id="staff-display"
                      ref={staffContainerRef}
                      className={(instrument === 'guitar' && tabDisplayMode !== 'staff') ? 'hidden' : 'block'}
                    />

                    {/* Tab Display */}
                    <div
                      id="tab-display"
                      ref={tabContainerRef}
                      className={(instrument === 'guitar' && (tabDisplayMode === 'tab' || tabDisplayMode === 'both')) ? 'block' : 'hidden'}
                    />
                  </div>

                  {/* Pitch Gauge for Microphone Instruments */}
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

                {/* Feedback Bar */}
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

                {/* MIDI Input Indicator for Piano */}
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

      {/* Score Summary Modal */}
      <AnimatePresence>
        {showScoreSummary && roundState.currentScore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <ScoreSummary
              scoreResult={roundState.currentScore}
              correctCount={roundState.correctCount}
              totalNotes={roundState.notesRequired}
              isSuccessful={roundState.isSuccessful || false}
              onContinue={() => {
                setShowScoreSummary(false);
                roundActions.startRound();
                const note = generateRandomNote(getNoteRange(), clef as 'treble' | 'bass');
                if (note) {
                  setCurrentNote(note.midiNote);
                  currentNoteRef.current = note.midiNote;
                  setSessionActive(true);
                  sessionActiveRef.current = true;
                  setTimeout(() => {
                    if (staffRenderer.current) {
                      const vexflowNote = midiToVexflow(note.midiNote, clef as 'treble' | 'bass');
                      if (vexflowNote) staffRenderer.current.renderNote(vexflowNote);
                    }
                  }, 100);
                }
              }}
              onRetry={!roundState.isSuccessful ? () => {
                setShowScoreSummary(false);
                roundActions.resetRound();
                const note = generateRandomNote(getNoteRange(), clef as 'treble' | 'bass');
                if (note) {
                  setCurrentNote(note.midiNote);
                  currentNoteRef.current = note.midiNote;
                  setSessionActive(true);
                  sessionActiveRef.current = true;
                  setTimeout(() => {
                    if (staffRenderer.current) {
                      const vexflowNote = midiToVexflow(note.midiNote, clef as 'treble' | 'bass');
                      if (vexflowNote) staffRenderer.current.renderNote(vexflowNote);
                    }
                  }, 100);
                }
              } : undefined}
              showConfetti={roundState.isSuccessful || false}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

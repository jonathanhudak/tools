/**
 * Play Route - Flash card game interface with centered notation display
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { X, SkipForward } from 'lucide-react';
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

  // Tab orientation for left-handed guitarists
  const [tabOrientation, setTabOrientation] = useState<'standard' | 'leftHanded'>(() => {
    const settings = Storage.getSettings();
    return settings.tabOrientation || 'standard';
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

  // Stable callbacks for game round hook to prevent infinite re-renders
  const handleRoundComplete = useCallback((state: any) => {
    setShowScoreSummary(true);

    // Calculate range inline to avoid dependency cycle
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
      tabRenderer.current = new TabRenderer('tab-display', instrument, tabOrientation);
    }
  }, [instrument, tabOrientation]);

  useEffect(() => {
    // Update TabRenderer's tab orientation when setting changes
    if (tabRenderer.current) {
      tabRenderer.current.setTabOrientation(tabOrientation);
    }
    // Persist setting to storage
    Storage.saveSettings({ tabOrientation });
  }, [tabOrientation]);

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
        range: noteRange(),
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

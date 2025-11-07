/**
 * Practice Route - Main sight reading practice interface
 */

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@hudak/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Badge } from '@hudak/ui/components/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@hudak/ui/components/select';
import { Label } from '@hudak/ui/components/label';
import { Play, Square, SkipForward, Volume2, Settings } from 'lucide-react';
import { VirtualKeyboard } from '../components/virtual-keyboard';

// Import our libraries
import { MidiManager, type NoteOnEvent, type DeviceChangeEvent } from '../lib/input/midi-manager';
import { AudioManager, type PitchDetectedEvent } from '../lib/input/audio-manager';
import { StaffRenderer } from '../lib/notation/staff-renderer';
import { FallingNotesRenderer } from '../lib/notation/falling-notes';
import { getInstrument, requiresMIDI } from '../lib/utils/instrument-config';
import { generateRandomNote, midiToVexflow, validateNote, midiToNoteName } from '../lib/utils/music-theory';
import { Storage } from '../lib/utils/storage';
import { AudioPlayback } from '../lib/utils/audio-playback';
import { PitchGauge } from '../components/pitch-gauge';

export const Route = createFileRoute('/')({
  component: PracticeRoute,
});

function PracticeRoute() {
  // Instrument selection
  const [instrument, setInstrument] = useState('piano');

  // Input status
  const [midiConnected, setMidiConnected] = useState(false);
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');

  // Settings
  const [clef, setClef] = useState('treble');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [fallingNotesMode, setFallingNotesMode] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [notationScale, setNotationScale] = useState<'small' | 'medium' | 'large'>('medium');

  // Practice session state
  const [sessionActive, setSessionActive] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, streak: 0, avgTime: '-' });
  const [feedback, setFeedback] = useState('Ready to practice');
  const [currentNote, setCurrentNote] = useState<number | null>(null);
  const [lastDetectedNote, setLastDetectedNote] = useState<{ note: number; noteName: string; centsOff?: number } | null>(null);

  // Pitch detection state (for microphone instruments)
  const [detectedPitch, setDetectedPitch] = useState<{ note: string; cents: number; clarity: number } | null>(null);

  // Refs to track current state in event handlers (avoid closure issues)
  const sessionActiveRef = useRef(false);
  const currentNoteRef = useRef<number | null>(null);
  const instrumentRef = useRef(instrument);
  const clefRef = useRef(clef);

  // Managers (refs to persist across renders)
  const midiManager = useRef<MidiManager | null>(null);
  const audioManager = useRef<AudioManager | null>(null);
  const audioPlayback = useRef<AudioPlayback | null>(null);
  const staffRenderer = useRef<StaffRenderer | null>(null);
  const fallingNotesRenderer = useRef<FallingNotesRenderer | null>(null);

  // Container refs for renderers
  const staffContainerRef = useRef<HTMLDivElement>(null);
  const fallingNotesContainerRef = useRef<HTMLDivElement>(null);

  // Track last incorrect feedback time to avoid spam
  const lastIncorrectFeedbackRef = useRef(0);

  // Get note range based on difficulty
  const getNoteRange = useCallback((): string => {
    const difficultyToRange: Record<typeof difficulty, string> = {
      'beginner': 'c4-c5',
      'intermediate': 'c4-g5',
      'advanced': 'a3-c6'
    };
    return difficultyToRange[difficulty];
  }, [difficulty]);

  // Next note function
  const nextNote = useCallback(() => {
    const note = generateRandomNote(getNoteRange(), clef as 'treble' | 'bass');

    if (note) {
      setCurrentNote(note.midiNote);
      currentNoteRef.current = note.midiNote;

      if (staffRenderer.current && !fallingNotesMode) {
        const vexflowNote = midiToVexflow(note.midiNote, clef as 'treble' | 'bass');
        if (vexflowNote) {
          staffRenderer.current.renderNote(vexflowNote);
        }
      } else if (fallingNotesRenderer.current && fallingNotesMode) {
        const noteName = midiToNoteName(note.midiNote);
        fallingNotesRenderer.current.addNote(note.midiNote, noteName);
      }
    }
  }, [clef, fallingNotesMode, getNoteRange]);

  // Handle MIDI device changes
  const handleMidiDeviceChange = useCallback((_event: DeviceChangeEvent) => {
    if (midiManager.current) {
      const devices = midiManager.current.getInputDevices();
      setMidiConnected(devices.length > 0);
    }
  }, []);

  // Handle pitch detection from microphone
  const handlePitchDetected = useCallback((event: PitchDetectedEvent) => {
    // Update detected pitch for gauge display (keep decimal precision for smooth interpolation)
    setDetectedPitch({
      note: event.noteName,
      cents: event.cents, // Don't round - let the gauge component handle smoothing
      clarity: event.clarity
    });

    // Calculate cents deviation if we have a current note
    let centsOff: number | undefined;
    if (currentNoteRef.current !== null) {
      const instrumentConfig = getInstrument(instrumentRef.current as 'piano' | 'violin' | 'guitar');
      const result = validateNote(event.midi, currentNoteRef.current, {
        allowOctaveError: instrumentConfig.validation.octaveFlexible,
      });
      centsOff = result.centsOff;
    }

    // Update last detected note
    setLastDetectedNote({
      note: event.midi,
      noteName: event.noteName,
      centsOff
    });

    // If session is active, validate and provide feedback
    if (sessionActiveRef.current && currentNoteRef.current !== null) {
      const instrumentConfig = getInstrument(instrumentRef.current as 'piano' | 'violin' | 'guitar');
      const result = validateNote(event.midi, currentNoteRef.current, {
        allowOctaveError: instrumentConfig.validation.octaveFlexible,
      });

      // eslint-disable-next-line no-console
      console.log('Validation result:', result, 'Expected:', currentNoteRef.current, 'Detected:', event.midi);

      if (result.isCorrect) {
        // Correct note!
        setStats(prev => ({
          correct: prev.correct + 1,
          incorrect: prev.incorrect,
          streak: prev.streak + 1,
          avgTime: prev.avgTime
        }));
        setFeedback(result.message || 'Correct! ✓');

        // Show feedback on staff
        if (staffRenderer.current) {
          staffRenderer.current.showFeedback(true);
        }

        // Automatically move to next note after a short delay
        setTimeout(() => {
          nextNote();
        }, 1000);
      } else {
        // Only show incorrect feedback if not already shown recently
        const now = Date.now();
        if (now - lastIncorrectFeedbackRef.current > 1000) {
          setStats(prev => ({
            correct: prev.correct,
            incorrect: prev.incorrect + 1,
            streak: 0,
            avgTime: prev.avgTime
          }));
          setFeedback(`Try again - you played ${event.noteName}`);

          if (staffRenderer.current) {
            staffRenderer.current.showFeedback(false);
          }
          lastIncorrectFeedbackRef.current = now;
        }
      }
    }
  }, [nextNote]);

  // Handle MIDI note input
  const handleMidiNoteOn = useCallback((event: NoteOnEvent) => {
    // eslint-disable-next-line no-console
    console.log('MIDI Note received:', event.note, event.noteName, 'Session active:', sessionActiveRef.current, 'Current note:', currentNoteRef.current);

    // Play the note sound
    if (audioPlayback.current) {
      audioPlayback.current.playNote(event.note);
    }

    // Calculate cents deviation if we have a current note
    let centsOff: number | undefined;
    if (currentNoteRef.current !== null) {
      const instrumentConfig = getInstrument(instrumentRef.current as 'piano' | 'violin' | 'guitar');
      const result = validateNote(event.note, currentNoteRef.current, {
        allowOctaveError: instrumentConfig.validation.octaveFlexible,
      });
      centsOff = result.centsOff;
    }

    // Update last detected note (always, even when session is not active)
    setLastDetectedNote({
      note: event.note,
      noteName: event.noteName,
      centsOff
    });

    // If session is active, validate and provide feedback
    if (sessionActiveRef.current && currentNoteRef.current !== null) {
      const instrumentConfig = getInstrument(instrumentRef.current as 'piano' | 'violin' | 'guitar');
      const result = validateNote(event.note, currentNoteRef.current, {
        allowOctaveError: instrumentConfig.validation.octaveFlexible,
      });

      // eslint-disable-next-line no-console
      console.log('Validation result:', result, 'Expected:', currentNoteRef.current, 'Played:', event.note);

      if (result.isCorrect) {
        // Correct note!
        setStats(prev => ({
          correct: prev.correct + 1,
          incorrect: prev.incorrect,
          streak: prev.streak + 1,
          avgTime: prev.avgTime
        }));
        setFeedback(result.message || 'Correct! ✓');

        // Show feedback on staff
        if (staffRenderer.current) {
          staffRenderer.current.showFeedback(true);
        }

        // Automatically move to next note after a short delay
        setTimeout(() => {
          nextNote();
        }, 500);
      } else {
        // Incorrect note
        setStats(prev => ({
          correct: prev.correct,
          incorrect: prev.incorrect + 1,
          streak: 0,
          avgTime: prev.avgTime
        }));
        setFeedback('Try again ✗');

        if (staffRenderer.current) {
          staffRenderer.current.showFeedback(false);
        }
      }
    }
  }, [nextNote]);

  // Initialize managers on mount
  useEffect(() => {
    const initManagers = async () => {
      // Initialize audio playback
      audioPlayback.current = new AudioPlayback();

      // Initialize MIDI if needed
      if (requiresMIDI(instrument as any)) {
        midiManager.current = new MidiManager();
        const success = await midiManager.current.init();
        setMidiConnected(success);

        if (success) {
          const devices = midiManager.current.getInputDevices();

          // Listen for events
          midiManager.current.on('noteOn', handleMidiNoteOn);
          midiManager.current.on('deviceChange', handleMidiDeviceChange);

          // eslint-disable-next-line no-console
          console.log('MIDI initialized, devices:', devices);
        } else {
          console.warn('MIDI initialization failed or no MIDI devices available');
        }
      }

      // Initialize Audio Manager for microphone instruments
      if (instrument === 'violin' || instrument === 'guitar') {
        // Get available audio devices
        const devices = await AudioManager.getAudioInputDevices();
        setAudioDevices(devices);

        // Use selected device or first available
        const deviceId = selectedAudioDevice || devices[0]?.deviceId;

        audioManager.current = new AudioManager();
        const success = await audioManager.current.init(deviceId);
        setMicrophoneActive(success);

        if (success) {
          // Listen for pitch detection events
          audioManager.current.on('pitchDetected', handlePitchDetected);
          audioManager.current.on('statusChange', (status) => {
            setMicrophoneActive(status.microphoneActive);
          });

          // Start listening immediately
          audioManager.current.startListening();

          // eslint-disable-next-line no-console
          console.log('Audio Manager initialized, microphone active');
        } else {
          console.warn('Microphone initialization failed');
        }
      }

      // Initialize renderers
      if (staffContainerRef.current) {
        staffRenderer.current = new StaffRenderer('staff-display');
      }
      if (fallingNotesContainerRef.current) {
        fallingNotesRenderer.current = new FallingNotesRenderer('falling-notes-display');
      }
    };

    initManagers();

    // Load saved settings
    const settings = Storage.getSettings();
    setClef(settings.clef);
    setFallingNotesMode(settings.fallingNotesMode);

    // Set difficulty from saved range
    const rangeToDifficulty: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
      'c4-c5': 'beginner',
      'c4-g5': 'intermediate',
      'a3-c6': 'advanced'
    };
    setDifficulty(rangeToDifficulty[settings.range] || 'beginner');

    // Cleanup
    return () => {
      midiManager.current?.disconnectDevice();
      audioManager.current?.disconnect();
      audioPlayback.current?.cleanup();
    };
  }, [handleMidiDeviceChange, handleMidiNoteOn, handlePitchDetected, instrument, selectedAudioDevice]);

  // Handle audio device change
  const handleAudioDeviceChange = async (deviceId: string) => {
    setSelectedAudioDevice(deviceId);

    // Reconnect with new device
    if (audioManager.current) {
      audioManager.current.disconnect();
    }

    audioManager.current = new AudioManager();
    const success = await audioManager.current.init(deviceId);
    setMicrophoneActive(success);

    if (success) {
      audioManager.current.on('pitchDetected', handlePitchDetected);
      audioManager.current.on('statusChange', (status) => {
        setMicrophoneActive(status.microphoneActive);
      });
      audioManager.current.startListening();
    }
  };

  // Start practice session
  const startSession = () => {
    // Generate first note using difficulty-based range
    const note = generateRandomNote(getNoteRange(), clef as 'treble' | 'bass');

    if (note) {
      setCurrentNote(note.midiNote);
      currentNoteRef.current = note.midiNote;

      // Render note
      if (staffRenderer.current && !fallingNotesMode) {
        const vexflowNote = midiToVexflow(note.midiNote, clef as 'treble' | 'bass');
        if (vexflowNote) {
          staffRenderer.current.renderNote(vexflowNote);
        }
      } else if (fallingNotesRenderer.current && fallingNotesMode) {
        const noteName = midiToNoteName(note.midiNote);
        fallingNotesRenderer.current.addNote(note.midiNote, noteName);
        fallingNotesRenderer.current.startAnimation();
      }

      setSessionActive(true);
      sessionActiveRef.current = true;
      setFeedback('Play the note shown above');
      setStats({ correct: 0, incorrect: 0, streak: 0, avgTime: '-' });
    }
  };

  // Stop practice session
  const stopSession = () => {
    setSessionActive(false);
    sessionActiveRef.current = false;
    setCurrentNote(null);
    currentNoteRef.current = null;
    setFeedback('Session stopped');
    if (fallingNotesRenderer.current) {
      fallingNotesRenderer.current.stopAnimation();
    }

    // Save session data
    if (stats.correct > 0 || stats.incorrect > 0) {
      Storage.saveSession({
        module: 'sightReading',
        instrument,
        clef,
        range: getNoteRange(),
        ...stats,
        timestamp: Date.now()
      });
    }
  };


  // Sync refs whenever state changes
  useEffect(() => {
    instrumentRef.current = instrument;
  }, [instrument]);

  useEffect(() => {
    clefRef.current = clef;
  }, [clef]);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sight Reading Practice</h1>
          <p className="text-muted-foreground mt-1">Practice reading music notation with instant feedback</p>
        </div>
        <div className="flex items-center gap-2">
          {midiConnected && <Badge variant="default">MIDI Connected</Badge>}
          {!midiConnected && instrument === 'piano' && <Badge variant="secondary">No MIDI Device</Badge>}
          {microphoneActive && (instrument === 'violin' || instrument === 'guitar') && (
            <Badge variant="default" className="bg-green-600">
              🎤 Microphone Active
            </Badge>
          )}
          {!microphoneActive && (instrument === 'violin' || instrument === 'guitar') && (
            <Badge variant="secondary">No Microphone</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showSettings ? 'Hide' : 'Show'} Settings
          </Button>
        </div>
      </div>

      {/* Settings Card */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Practice Settings</CardTitle>
            <CardDescription>Configure your instrument and practice parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Instrument Selection */}
              <div className="space-y-2">
                <Label htmlFor="instrument-select">Instrument</Label>
                <Select
                  value={instrument}
                  onValueChange={(value) => {
                    setInstrument(value);
                    Storage.saveSettings({ instrument: value });
                  }}
                >
                  <SelectTrigger id="instrument-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piano">🎹 Piano (MIDI)</SelectItem>
                    <SelectItem value="piano-virtual">🎹 Piano (Virtual)</SelectItem>
                    <SelectItem value="violin">🎻 Violin (Microphone)</SelectItem>
                    <SelectItem value="guitar">🎸 Guitar (Microphone)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clef Selection */}
              <div className="space-y-2">
                <Label htmlFor="clef-select">Clef</Label>
                <Select
                  value={clef}
                  onValueChange={(value: 'treble' | 'bass') => {
                    setClef(value);
                    Storage.saveSettings({ clef: value });
                  }}
                >
                  <SelectTrigger id="clef-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="treble">Treble</SelectItem>
                    <SelectItem value="bass">Bass</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-2">
                <Label htmlFor="difficulty-select">Difficulty</Label>
                <Select
                  value={difficulty}
                  onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => {
                    setDifficulty(value);
                    const difficultyToRange: Record<typeof difficulty, string> = {
                      'beginner': 'c4-c5',
                      'intermediate': 'c4-g5',
                      'advanced': 'a3-c6'
                    };
                    Storage.saveSettings({ range: difficultyToRange[value] });
                  }}
                >
                  <SelectTrigger id="difficulty-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (C4-C5)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (C4-G5)</SelectItem>
                    <SelectItem value="advanced">Advanced (A3-C6)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Settings Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Notation Scale */}
              <div className="space-y-2">
                <Label htmlFor="notation-scale-select">Notation Size</Label>
                <Select
                  value={notationScale}
                  onValueChange={(value: 'small' | 'medium' | 'large') => {
                    setNotationScale(value);
                  }}
                >
                  <SelectTrigger id="notation-scale-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (80%)</SelectItem>
                    <SelectItem value="medium">Medium (100%)</SelectItem>
                    <SelectItem value="large">Large (120%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Audio Device Selection (for microphone instruments) */}
              {(instrument === 'violin' || instrument === 'guitar') && audioDevices.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="audio-device-select">Microphone / Audio Input</Label>
                  <Select
                    value={selectedAudioDevice || audioDevices[0]?.deviceId || ''}
                    onValueChange={handleAudioDeviceChange}
                  >
                    <SelectTrigger id="audio-device-select">
                      <SelectValue placeholder="Select microphone..." />
                    </SelectTrigger>
                    <SelectContent>
                      {audioDevices.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.substring(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Practice Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Practice Area</CardTitle>
            <Badge variant={sessionActive ? "default" : "outline"}>
              {sessionActive ? "Session Active" : "Ready to Start"}
            </Badge>
          </div>
          <CardDescription className="text-base">{feedback}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* MIDI Input Indicator - Only show for piano without gauge */}
          {(instrument === 'piano' || instrument === 'piano-virtual') && lastDetectedNote && (
            <div className="flex items-center justify-center gap-4 p-4 border-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700">
              <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Detected: {lastDetectedNote.noteName}
                </span>
                {lastDetectedNote.centsOff !== undefined && (
                  <Badge variant={Math.abs(lastDetectedNote.centsOff) < 10 ? "default" : "secondary"}>
                    {lastDetectedNote.centsOff > 0 ? '+' : ''}{lastDetectedNote.centsOff.toFixed(0)} cents
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Combined Notation and Pitch Gauge Display */}
          <div className={`flex ${(instrument === 'violin' || instrument === 'guitar') ? 'flex-row gap-6 items-center' : 'flex-col'}`}>
            {/* Notation Display */}
            <div className={`flex-1 border-2 rounded-lg p-6 bg-card ${
              notationScale === 'small' ? 'min-h-[180px]' :
              notationScale === 'large' ? 'min-h-[280px]' :
              'min-h-[220px]'
            }`}>
              <div
                id="staff-display"
                ref={staffContainerRef}
                className={fallingNotesMode ? 'hidden' : 'block'}
                style={{
                  transform: notationScale === 'small' ? 'scale(0.8)' : notationScale === 'large' ? 'scale(1.2)' : 'scale(1)',
                  transformOrigin: 'top left'
                }}
              />
              <div id="falling-notes-display" ref={fallingNotesContainerRef} className={fallingNotesMode ? 'block' : 'hidden'} />
            </div>

            {/* Pitch Gauge for Microphone Instruments */}
            {(instrument === 'violin' || instrument === 'guitar') && detectedPitch && (
              <div className="flex-shrink-0 p-4 border-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-300 dark:border-blue-700">
                <PitchGauge
                  note={detectedPitch.note}
                  cents={detectedPitch.cents}
                  clarity={detectedPitch.clarity}
                />
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-2">
              <CardContent className="pt-6 pb-4 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.correct}</div>
                <div className="text-sm text-muted-foreground mt-1">Correct</div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6 pb-4 text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.incorrect}</div>
                <div className="text-sm text-muted-foreground mt-1">Incorrect</div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6 pb-4 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.streak}</div>
                <div className="text-sm text-muted-foreground mt-1">Streak</div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6 pb-4 text-center">
                <div className="text-3xl font-bold">{stats.avgTime}</div>
                <div className="text-sm text-muted-foreground mt-1">Avg Time</div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!sessionActive ? (
              <Button onClick={startSession} size="lg" className="flex-1">
                <Play className="mr-2 h-5 w-5" />
                Start Practice
              </Button>
            ) : (
              <>
                <Button onClick={stopSession} variant="destructive" size="lg" className="flex-1">
                  <Square className="mr-2 h-5 w-5" />
                  Stop
                </Button>
                <Button onClick={nextNote} variant="outline" size="lg" className="px-6">
                  <SkipForward className="mr-2 h-5 w-5" />
                  Next
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Virtual Keyboard */}
      {instrument === 'piano-virtual' && (
        <VirtualKeyboard
          onNotePlay={(midiNote, noteName) => {
            // Simulate MIDI note on event
            // Convert MIDI note to frequency: f = 440 * 2^((n-69)/12)
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
      )}
    </div>
  );
}

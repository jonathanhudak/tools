/**
 * InstrumentPractice Pro - React Application
 * Multi-instrument practice app with MIDI and microphone support
 */

import { useEffect, useState, useRef } from 'react';
import { Button } from '@hudak/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Badge } from '@hudak/ui/components/badge';
import { Separator } from '@hudak/ui/components/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@hudak/ui/components/sidebar';
import { Moon, Sun, Music, Play, Square, SkipForward, Volume2 } from 'lucide-react';
import { AppSidebar } from './components/app-sidebar';

// Import our ported libraries
import { MidiManager, type NoteOnEvent, type DeviceChangeEvent } from './lib/input/midi-manager';
import { AudioManager, type PitchDetectedEvent } from './lib/input/audio-manager';
import { StaffRenderer } from './lib/notation/staff-renderer';
import { FallingNotesRenderer } from './lib/notation/falling-notes';
import type { SightReadingModule } from './lib/modules/sight-reading';
import { getInstrument, requiresMIDI, requiresMicrophone } from './lib/utils/instrument-config';
import { generateRandomNote, midiToVexflow, validateNote } from './lib/utils/music-theory';
import { Storage } from './lib/utils/storage';
import { AudioPlayback } from './lib/utils/audio-playback';

function App() {
  // Theme state - initialize from system preference
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check for saved preference first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Instrument selection
  const [instrument, setInstrument] = useState('piano');

  // Input status
  const [midiConnected, setMidiConnected] = useState(false);
  const [micConnected, setMicConnected] = useState(false);
  const [midiDevices, setMidiDevices] = useState<any[]>([]);
  const [audioDevices, setAudioDevices] = useState<any[]>([]);

  // Settings
  const [clef, setClef] = useState('treble');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [fallingNotesMode, setFallingNotesMode] = useState(false);

  // Practice session state
  const [sessionActive, setSessionActive] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, streak: 0, avgTime: '-' });
  const [feedback, setFeedback] = useState('Ready to practice');
  const [currentNote, setCurrentNote] = useState<number | null>(null);
  const [lastDetectedNote, setLastDetectedNote] = useState<{ note: number; noteName: string; centsOff?: number } | null>(null);

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
  const sightReadingModule = useRef<SightReadingModule | null>(null);

  // Container refs for renderers
  const staffContainerRef = useRef<HTMLDivElement>(null);
  const fallingNotesContainerRef = useRef<HTMLDivElement>(null);

  // Apply theme on mount and listen for system preference changes
  useEffect(() => {
    // Apply initial theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Listen for system preference changes (only if user hasn't set a preference)
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

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
          setMidiDevices(devices);

          // Listen for events
          midiManager.current.on('noteOn', handleMidiNoteOn);
          midiManager.current.on('deviceChange', handleMidiDeviceChange);

          console.log('MIDI initialized, devices:', devices);
        } else {
          console.warn('MIDI initialization failed');
        }
      }

      // Initialize Audio if needed
      if (requiresMicrophone(instrument as any)) {
        const config = getInstrument(instrument as any);
        audioManager.current = new AudioManager({
          minClarity: config.validation.minClarity || 0.75,
          minFrequency: config.audio?.minFrequency || 70,
          maxFrequency: config.audio?.maxFrequency || 1600,
          bufferSize: config.audio?.bufferSize || 2048,
          smoothing: 0.8
        });

        // Get available devices
        const devices = await AudioManager.getAudioInputDevices();
        setAudioDevices(devices);

        audioManager.current.on('pitchDetected', handlePitchDetected);
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

    // Load saved settings (theme is handled separately via localStorage)
    const settings = Storage.getSettings();
    setClef(settings.clef);
    setFallingNotesMode(settings.fallingNotesMode);
    if (settings.instrument) {
      setInstrument(settings.instrument);
    }

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
  }, []);

  // Handle MIDI device changes
  const handleMidiDeviceChange = (event: DeviceChangeEvent) => {
    if (midiManager.current) {
      const devices = midiManager.current.getInputDevices();
      setMidiDevices(devices);
      setMidiConnected(devices.length > 0);
    }
  };

  // Handle MIDI note input
  const handleMidiNoteOn = (event: NoteOnEvent) => {
    console.log('MIDI Note received:', event.note, event.noteName, 'Session active:', sessionActiveRef.current, 'Current note:', currentNoteRef.current);

    // Play the note sound
    if (audioPlayback.current) {
      audioPlayback.current.playNote(event.note);
    }

    // Calculate cents deviation if we have a current note
    let centsOff: number | undefined;
    if (currentNoteRef.current !== null) {
      const instrumentConfig = getInstrument(instrumentRef.current as any);
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
      const instrumentConfig = getInstrument(instrumentRef.current as any);
      const result = validateNote(event.note, currentNoteRef.current, {
        allowOctaveError: instrumentConfig.validation.octaveFlexible,
      });

      console.log('Validation result:', result, 'Expected:', currentNoteRef.current, 'Played:', event.note);

      if (result.isCorrect) {
        // Correct note!
        setStats(prev => ({
          correct: prev.correct + 1,
          incorrect: prev.incorrect,
          streak: prev.streak + 1,
          avgTime: prev.avgTime
        }));
        setFeedback(result.message || 'Correct!');

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
        setFeedback('Try again');

        if (staffRenderer.current) {
          staffRenderer.current.showFeedback(false);
        }
      }
    }
  };

  // Handle microphone pitch detection
  const handlePitchDetected = (event: PitchDetectedEvent) => {
    if (sessionActive && sightReadingModule.current) {
      // Module handles validation
      console.log('Pitch detected:', event.midi, event.noteName);
    }
  };

  // Get note range based on difficulty
  const getNoteRange = (): string => {
    const difficultyToRange: Record<typeof difficulty, string> = {
      'beginner': 'c4-c5',
      'intermediate': 'c4-g5',
      'advanced': 'a3-c6'
    };
    return difficultyToRange[difficulty];
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Save to localStorage (this marks it as user preference)
    localStorage.setItem('theme', newTheme);
    Storage.saveSettings({ theme: newTheme });

    // Apply theme class
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Connect microphone
  const connectMicrophone = async () => {
    if (audioManager.current) {
      const success = await audioManager.current.init();
      if (success) {
        await audioManager.current.startListening();
        setMicConnected(true);
        setFeedback('Microphone connected');
      } else {
        setFeedback('Failed to connect microphone');
      }
    }
  };

  // Start practice session
  const startSession = () => {
    // Generate first note using difficulty-based range
    const note = generateRandomNote(getNoteRange(), clef as any);

    if (note) {
      setCurrentNote(note.midiNote);
      currentNoteRef.current = note.midiNote;

      // Render note
      if (staffRenderer.current && !fallingNotesMode) {
        const vexflowNote = midiToVexflow(note.midiNote, clef as any);
        if (vexflowNote) {
          staffRenderer.current.renderNote(vexflowNote);
        }
      } else if (fallingNotesRenderer.current && fallingNotesMode) {
        fallingNotesRenderer.current.addNote(note.midiNote);
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

  // Next note
  const nextNote = () => {
    const note = generateRandomNote(getNoteRange(), clef as any);

    if (note) {
      setCurrentNote(note.midiNote);
      currentNoteRef.current = note.midiNote;

      if (staffRenderer.current && !fallingNotesMode) {
        const vexflowNote = midiToVexflow(note.midiNote, clef as any);
        if (vexflowNote) {
          staffRenderer.current.renderNote(vexflowNote);
        }
      } else if (fallingNotesRenderer.current && fallingNotesMode) {
        fallingNotesRenderer.current.addNote(note.midiNote);
      }
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
    <SidebarProvider>
      <AppSidebar
        instrument={instrument}
        setInstrument={setInstrument}
        clef={clef}
        setClef={setClef}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        midiConnected={midiConnected}
        midiDevices={midiDevices}
        micConnected={micConnected}
        connectMicrophone={connectMicrophone}
        requiresMIDI={requiresMIDI(instrument as any)}
        requiresMicrophone={requiresMicrophone(instrument as any)}
        onSaveSettings={(settings) => Storage.saveSettings(settings)}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-3 flex-1">
            <Music className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">InstrumentPractice Pro</h1>
          </div>
          <div className="flex items-center gap-3">
            {midiConnected && <Badge variant="default">MIDI Connected</Badge>}
            {micConnected && <Badge variant="secondary">Mic Connected</Badge>}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Main Content */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Sight Reading Practice</CardTitle>
                <CardDescription className="text-base">{feedback}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* MIDI Input Indicator */}
                {lastDetectedNote && (
                  <div className="flex items-center justify-center gap-4 p-4 border-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800">
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

                {/* Notation Display */}
                <div className="min-h-[220px] border-2 rounded-lg p-6 bg-card">
                  <div id="staff-display" ref={staffContainerRef} className={fallingNotesMode ? 'hidden' : 'block'} />
                  <div id="falling-notes-display" ref={fallingNotesContainerRef} className={fallingNotesMode ? 'block' : 'hidden'} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-2">
                    <CardContent className="pt-6 pb-4 text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.correct}</div>
                      <div className="text-sm text-muted-foreground mt-1">Correct</div>
                    </CardContent>
                  </Card>
                  <Card className="border-2">
                    <CardContent className="pt-6 pb-4 text-center">
                      <div className="text-3xl font-bold text-red-600 dark:text-red-500">{stats.incorrect}</div>
                      <div className="text-sm text-muted-foreground mt-1">Incorrect</div>
                    </CardContent>
                  </Card>
                  <Card className="border-2">
                    <CardContent className="pt-6 pb-4 text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-500">{stats.streak}</div>
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

            {/* Coming Soon Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">Scales Quiz</CardTitle>
                  <CardDescription>Practice major and minor scales - Coming Soon</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">Chord Recognition</CardTitle>
                  <CardDescription>Identify chords by ear - Coming Soon</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;

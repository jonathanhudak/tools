import { useEffect, useState, useRef } from 'react';
import { Button } from '@hudak/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Badge } from '@hudak/ui/components/badge';
import { Separator } from '@hudak/ui/components/separator';
import {
  Moon,
  Sun,
  Music,
  Play,
  Square,
  SkipForward,
  Volume2,
  ArrowRight,
} from 'lucide-react';
import { AppSidebar } from './components/app-sidebar';
import { VirtualKeyboard } from './components/virtual-keyboard';
import { MidiManager, type NoteOnEvent, type DeviceChangeEvent } from './lib/input/midi-manager';
import { AudioManager, type PitchDetectedEvent } from './lib/input/audio-manager';
import { StaffRenderer } from './lib/notation/staff-renderer';
import { FallingNotesRenderer } from './lib/notation/falling-notes';
import type { SightReadingModule } from './lib/modules/sight-reading';
import { getInstrument, requiresMIDI, requiresMicrophone } from './lib/utils/instrument-config';
import { generateRandomNote, midiToVexflow, validateNote } from './lib/utils/music-theory';
import { Storage } from './lib/utils/storage';
import { AudioPlayback } from './lib/utils/audio-playback';
import { useNavigate } from '@tanstack/react-router';

export function App() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [selectedInstrument, setSelectedInstrument] = useState('guitar');
  const [midiDevices, setMidiDevices] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  const midiManagerRef = useRef<MidiManager | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const staffRendererRef = useRef<StaffRenderer | null>(null);
  const fallingNotesRef = useRef<FallingNotesRenderer | null>(null);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDark(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const staffCanvas = document.getElementById('staff-canvas') as HTMLCanvasElement;
        if (staffCanvas) {
          staffRendererRef.current = new StaffRenderer(staffCanvas);
        }

        const fallingNotesCanvas = document.getElementById('falling-notes-canvas') as HTMLCanvasElement;
        if (fallingNotesCanvas) {
          fallingNotesRef.current = new FallingNotesRenderer(fallingNotesCanvas);
        }

        if (requiresMIDI(selectedInstrument)) {
          midiManagerRef.current = new MidiManager();
          midiManagerRef.current.on('noteOn', handleMidiNote);
          midiManagerRef.current.on('deviceChange', handleDeviceChange);
          await midiManagerRef.current.initialize();
        }

        if (requiresMicrophone(selectedInstrument)) {
          audioManagerRef.current = new AudioManager();
          audioManagerRef.current.on('pitchDetected', handlePitchDetected);
          await audioManagerRef.current.initialize();
        }
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initializeAudio();

    return () => {
      midiManagerRef.current?.cleanup();
      audioManagerRef.current?.cleanup();
    };
  }, [selectedInstrument]);

  const handleMidiNote = (event: NoteOnEvent) => {
    const vexflowNote = midiToVexflow(event.note);
    setDetectedNote(vexflowNote);

    if (staffRendererRef.current) {
      staffRendererRef.current.highlightNote(vexflowNote);
    }

    validateGuessedNote(vexflowNote);
  };

  const handlePitchDetected = (event: PitchDetectedEvent) => {
    const note = event.note;
    setDetectedNote(note);

    if (staffRendererRef.current) {
      staffRendererRef.current.highlightNote(note);
    }

    validateGuessedNote(note);
  };

  const handleDeviceChange = (event: DeviceChangeEvent) => {
    setMidiDevices(event.devices);
  };

  const validateGuessedNote = (guessedNote: string) => {
    const currentNote = 'C4'; // This should come from the sight reading module

    if (validateNote(guessedNote, currentNote)) {
      setFeedbackMessage('Correct! 🎉');
      setCorrectCount((prev) => prev + 1);
    } else {
      setFeedbackMessage(`Try again! The correct note is ${currentNote}`);
    }

    setAttemptCount((prev) => prev + 1);
  };

  const startRecording = async () => {
    setIsRecording(true);
    if (audioManagerRef.current && !audioManagerRef.current.isListening) {
      await audioManagerRef.current.startListening();
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (audioManagerRef.current) {
      await audioManagerRef.current.stopListening();
    }
  };

  return (
    <div className={`flex h-screen ${isDark ? 'dark' : ''}`}>
      <AppSidebar selectedInstrument={selectedInstrument} />

      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto py-12 px-4">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Music Practice Suite</h1>
            <p className="text-slate-300">Master your music theory, scales, chords, and sight-reading</p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Scales Quiz Card */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 cursor-pointer transition-all" 
              onClick={() => navigate({ to: '/scales-quiz' })}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-white">Scales Quiz</CardTitle>
                    <CardDescription className="text-slate-400">Practice major and minor scales with guitar and piano</CardDescription>
                  </div>
                  <Music className="w-8 h-8 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 mb-4">
                  Learn scale theory through interactive identification practice. Toggle between guitar fretboard and piano keyboard.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Start Quiz
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Chord Quiz Card */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500 cursor-pointer transition-all"
              onClick={() => navigate({ to: '/chord-quiz' })}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-white">Chord Recognition</CardTitle>
                    <CardDescription className="text-slate-400">Learn and identify chords with visual reference</CardDescription>
                  </div>
                  <Music className="w-8 h-8 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 mb-4">
                  Master chord theory with interactive learning. Browse chord diagrams and audio, then test yourself with quizzes. Supports guitar and piano.
                </p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Start Quiz
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Rest of the existing content remains... */}
          <Separator className="my-12 border-slate-700" />

          {/* Existing sight reading section can go here */}
          <div className="text-center text-slate-400">
            <p>Additional modules coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { SettingsScreen } from './components/SettingsScreen';
import { GameScreen } from './components/GameScreen';

export type Instrument = 'piano' | 'guitar' | 'bass' | 'violin';
export type NotationType = 'staff' | 'tablature';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Note {
  name: string;
  octave: number;
  displayName: string;
  staffPosition?: number;
  tabString?: number;
  tabFret?: number;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [instrument, setInstrument] = useState<Instrument>('piano');
  const [notationType, setNotationType] = useState<NotationType>('staff');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameActive, setGameActive] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (gameActive && currentNote) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            handleTimeout();
            return getDifficultyTime();
          }
          return prev - 0.1;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [gameActive, currentNote]);

  const getDifficultyTime = () => {
    const times = { easy: 15, medium: 10, hard: 5 };
    return times[difficulty];
  };

  const generateNote = (): Note => {
    const noteRanges = {
      easy: { piano: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] },
      medium: { piano: ['A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4'] },
      hard: { piano: ['F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'] }
    };

    const guitarNotes = {
      easy: [
        { note: 'E2', string: 6, fret: 0 },
        { note: 'A2', string: 5, fret: 0 },
        { note: 'D3', string: 4, fret: 0 },
        { note: 'G3', string: 3, fret: 0 },
        { note: 'B3', string: 2, fret: 0 },
        { note: 'E4', string: 1, fret: 0 },
      ],
      medium: [
        { note: 'F2', string: 6, fret: 1 },
        { note: 'G2', string: 6, fret: 3 },
        { note: 'A2', string: 5, fret: 0 },
        { note: 'C3', string: 5, fret: 3 },
        { note: 'D3', string: 4, fret: 0 },
        { note: 'E3', string: 4, fret: 2 },
        { note: 'G3', string: 3, fret: 0 },
        { note: 'A3', string: 3, fret: 2 },
      ],
      hard: [
        { note: 'F2', string: 6, fret: 1 },
        { note: 'G2', string: 6, fret: 3 },
        { note: 'A2', string: 5, fret: 0 },
        { note: 'B2', string: 5, fret: 2 },
        { note: 'C3', string: 5, fret: 3 },
        { note: 'D3', string: 4, fret: 0 },
        { note: 'E3', string: 4, fret: 2 },
        { note: 'F3', string: 4, fret: 3 },
        { note: 'G3', string: 3, fret: 0 },
        { note: 'A3', string: 3, fret: 2 },
        { note: 'B3', string: 2, fret: 0 },
        { note: 'C4', string: 2, fret: 1 },
      ]
    };

    if (instrument === 'guitar' || instrument === 'bass') {
      const notes = guitarNotes[difficulty];
      const selected = notes[Math.floor(Math.random() * notes.length)];
      const [noteName, octave] = [selected.note.slice(0, -1), parseInt(selected.note.slice(-1))];
      return {
        name: noteName,
        octave,
        displayName: selected.note,
        tabString: selected.string,
        tabFret: selected.fret,
        staffPosition: getStaffPosition(noteName, octave)
      };
    }

    const notes = noteRanges[difficulty].piano;
    const selectedNote = notes[Math.floor(Math.random() * notes.length)];
    const noteName = selectedNote.slice(0, -1);
    const octave = parseInt(selectedNote.slice(-1));

    return {
      name: noteName,
      octave,
      displayName: selectedNote,
      staffPosition: getStaffPosition(noteName, octave)
    };
  };

  const getStaffPosition = (note: string, octave: number): number => {
    const notePositions: { [key: string]: number } = {
      'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6
    };
    const basePosition = notePositions[note];
    return basePosition + (octave * 7);
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setStreak(0);
    setTotalAttempts(0);
    setTimeLeft(getDifficultyTime());
    setCurrentNote(generateNote());
  };

  const handleTimeout = () => {
    setStreak(0);
    setTotalAttempts((prev) => prev + 1);
    nextNote();
  };

  const handleCorrectAnswer = () => {
    const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
    const bonusPoints = Math.floor(streak / 3) * 5;
    setScore((prev) => prev + points + bonusPoints);
    setStreak((prev) => prev + 1);
    setTotalAttempts((prev) => prev + 1);
    nextNote();
  };

  const handleWrongAnswer = () => {
    setStreak(0);
    setTotalAttempts((prev) => prev + 1);
    nextNote();
  };

  const nextNote = () => {
    setTimeLeft(getDifficultyTime());
    setCurrentNote(generateNote());
  };

  const stopGame = () => {
    setGameActive(false);
    setCurrentNote(null);
  };

  const simulateInput = (detectedNote: string) => {
    if (currentNote && detectedNote === currentNote.displayName) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {!gameActive ? (
        <SettingsScreen
          theme={theme}
          instrument={instrument}
          notationType={notationType}
          difficulty={difficulty}
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onInstrumentChange={setInstrument}
          onNotationTypeChange={setNotationType}
          onDifficultyChange={setDifficulty}
          onStartGame={startGame}
        />
      ) : (
        <GameScreen
          theme={theme}
          currentNote={currentNote}
          notationType={notationType}
          instrument={instrument}
          score={score}
          streak={streak}
          timeLeft={timeLeft}
          maxTime={getDifficultyTime()}
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onStopGame={stopGame}
          onSimulateInput={simulateInput}
        />
      )}
    </div>
  );
}

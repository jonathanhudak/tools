import { X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { NotationCard } from './NotationCard';
import { GameHUD } from './GameHUD';
import { Note, NotationType, Instrument } from '../App';

interface GameScreenProps {
  theme: 'light' | 'dark';
  currentNote: Note | null;
  notationType: NotationType;
  instrument: Instrument;
  score: number;
  streak: number;
  timeLeft: number;
  maxTime: number;
  onThemeToggle: () => void;
  onStopGame: () => void;
  onSimulateInput: (note: string) => void;
}

export function GameScreen({
  theme,
  currentNote,
  notationType,
  instrument,
  score,
  streak,
  timeLeft,
  maxTime,
  onThemeToggle,
  onStopGame,
  onSimulateInput,
}: GameScreenProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Controls */}
      <div className="fixed top-6 left-6 z-30">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>

      <div className="fixed top-6 right-6 z-30">
        <button
          onClick={onStopGame}
          className="w-10 h-10 flex items-center justify-center bg-card border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
          aria-label="Exit game"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        {currentNote && (
          <div className="w-full max-w-2xl space-y-12">
            {/* Game HUD */}
            <GameHUD
              score={score}
              streak={streak}
              timeLeft={timeLeft}
              maxTime={maxTime}
            />

            {/* Notation Flashcard */}
            <NotationCard
              note={currentNote}
              notationType={notationType}
              instrument={instrument}
              onSimulateInput={onSimulateInput}
            />
          </div>
        )}
      </div>
    </div>
  );
}

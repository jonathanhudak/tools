import { Play } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Instrument, NotationType, Difficulty } from '../App';

interface SettingsScreenProps {
  theme: 'light' | 'dark';
  instrument: Instrument;
  notationType: NotationType;
  difficulty: Difficulty;
  onThemeToggle: () => void;
  onInstrumentChange: (instrument: Instrument) => void;
  onNotationTypeChange: (notationType: NotationType) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onStartGame: () => void;
}

export function SettingsScreen({
  theme,
  instrument,
  notationType,
  difficulty,
  onThemeToggle,
  onInstrumentChange,
  onNotationTypeChange,
  onDifficultyChange,
  onStartGame,
}: SettingsScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      {/* Theme Toggle - Fixed top right */}
      <div className="fixed top-8 right-8">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>

      {/* Centered Settings Card */}
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent flex items-center justify-center">
              <span className="text-accent-foreground">♪</span>
            </div>
            <h1 className="tracking-tight uppercase text-sm">Sight Reader</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Configure your practice session
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-card border border-border p-12 space-y-12">
          {/* Instrument */}
          <div className="space-y-6">
            <label className="block text-sm text-muted-foreground">Instrument</label>
            <div className="grid grid-cols-4 gap-3">
              {(['piano', 'guitar', 'bass', 'violin'] as Instrument[]).map((instr) => (
                <button
                  key={instr}
                  onClick={() => onInstrumentChange(instr)}
                  className={`px-6 py-4 text-sm transition-all capitalize ${
                    instrument === instr
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-background border border-border text-foreground hover:border-accent'
                  }`}
                >
                  {instr}
                </button>
              ))}
            </div>
          </div>

          {/* Notation */}
          <div className="space-y-6">
            <label className="block text-sm text-muted-foreground">Notation</label>
            <div className="grid grid-cols-2 gap-3">
              {(['staff', 'tablature'] as NotationType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => onNotationTypeChange(type)}
                  disabled={type === 'tablature' && instrument !== 'guitar' && instrument !== 'bass'}
                  className={`px-6 py-4 text-sm transition-all capitalize ${
                    notationType === type
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-background border border-border text-foreground hover:border-accent'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-6">
            <label className="block text-sm text-muted-foreground">Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => onDifficultyChange(diff)}
                  className={`px-6 py-4 text-sm transition-all capitalize ${
                    difficulty === diff
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-background border border-border text-foreground hover:border-accent'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground space-y-2 pt-4">
              <p>Easy: 15 seconds per note</p>
              <p>Medium: 10 seconds per note</p>
              <p>Hard: 5 seconds per note</p>
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-6">
            <button
              onClick={onStartGame}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-5 text-sm flex items-center justify-center gap-3 transition-colors"
            >
              <Play className="size-5" />
              Start Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

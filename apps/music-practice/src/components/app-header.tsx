import { Link } from '@tanstack/react-router';
import { Music } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function AppHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Music className="h-6 w-6 text-[var(--accent-color)]" />
        <h1 className="text-xl font-bold font-display">Music Practice</h1>
      </div>
      <nav className="flex items-center gap-4">
        <Link to="/" className="[&.active]:font-bold [&.active]:text-[var(--accent-color)]">
          Practice
        </Link>
        <Link to="/scales-quiz" className="[&.active]:font-bold [&.active]:text-[var(--accent-color)]">
          Scales
        </Link>
        <Link to="/chord-quiz" className="[&.active]:font-bold [&.active]:text-[var(--accent-color)]">
          Chords
        </Link>
        <Link to="/chord-scale" className="[&.active]:font-bold [&.active]:text-[var(--accent-color)]">
          Chord Scale
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}

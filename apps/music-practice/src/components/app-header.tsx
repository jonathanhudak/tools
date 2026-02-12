import { Link } from '@tanstack/react-router';
import { Music } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function AppHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Music className="h-6 w-6" />
        <h1 className="text-xl font-bold">Music Practice</h1>
      </div>
      <nav className="flex items-center gap-4">
        <Link to="/" className="[&.active]:font-bold">
          Practice
        </Link>
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
        <Link to="/chord-scale" className="[&.active]:font-bold">
          Chord Scale
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}

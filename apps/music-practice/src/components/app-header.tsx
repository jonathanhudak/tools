import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Music, Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@hudak/ui/components/button';

const navLinks = [
  { to: '/' as const, label: 'Practice' },
  { to: '/scales-quiz' as const, label: 'Scales Quiz' },
  { to: '/chord-quiz' as const, label: 'Chord Quiz' },
  { to: '/chord-scale' as const, label: 'Chord-Scale Matrix' },
] as const;

export function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Music className="h-6 w-6 text-[var(--accent-color)]" />
          <h1 className="text-xl font-bold font-display whitespace-nowrap">Music Practice</h1>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-4">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-sm [&.active]:font-bold [&.active]:text-[var(--accent-color)]"
            >
              {label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav className="sm:hidden border-t px-4 py-3 space-y-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="block py-2 px-3 rounded-md text-sm [&.active]:font-bold [&.active]:text-[var(--accent-color)] [&.active]:bg-[var(--accent-light)]"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

/**
 * Bottom tab bar — primary one-thumb navigation on phones.
 * Hidden at sm+ where the header nav takes over.
 */

import { Link } from '@tanstack/react-router';
import { Home, Compass, BookOpen, Shuffle, Zap } from 'lucide-react';

const tabs = [
  { to: '/' as const, label: 'Home', icon: Home, exact: true },
  { to: '/scale-explorer' as const, label: 'Scales', icon: Compass, exact: false },
  { to: '/chord-quiz' as const, label: 'Chords', icon: BookOpen, exact: false },
  { to: '/practice' as const, label: 'Practice', icon: Shuffle, exact: false },
  { to: '/play' as const, label: 'Play', icon: Zap, exact: false },
] as const;

export function BottomTabBar(): JSX.Element {
  return (
    <nav
      aria-label="Primary"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--border-subtle)] bg-background/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5">
        {tabs.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            className="flex flex-col items-center gap-0.5 py-2 min-h-12 text-muted-foreground [&.active]:text-[var(--accent-color)]"
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] leading-none">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

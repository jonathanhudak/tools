/**
 * Chord-Scale Route
 *
 * Two modes accessible via tabs:
 *  - Matrix: interactive 7-column reference grid (ChordScaleMatrix)
 *  - Practice: quiz game (ChordScaleGame)
 *
 * The tab plus the matrix selection live in the URL so views are deep-linkable.
 * The route owns navigation; the components are controlled.
 */

import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@hudak/ui/components/button';
import { ArrowLeft, Grid3X3, Gamepad2 } from 'lucide-react';
import { ChordScaleGame } from '../components/ChordScaleGame';
import {
  ChordScaleMatrix,
  CHROMATIC_KEYS,
  SCALE_TYPES,
  type RootKey,
} from '../components/ChordScaleMatrix';
import type { ScaleType } from '../data/chord-scale-matrix';
import { oneOf, INSTRUMENTS, type Instrument } from '../lib/search-params';

type Tab = 'matrix' | 'practice';

export interface ChordScaleSearch {
  tab: Tab;
  key: RootKey;
  scale: ScaleType;
  instrument: Instrument;
}

const TABS: readonly Tab[] = ['matrix', 'practice'];

export function validateChordScaleSearch(search: Record<string, unknown>): ChordScaleSearch {
  return {
    tab: oneOf(TABS, search.tab, 'matrix'),
    key: oneOf(CHROMATIC_KEYS, search.key, 'C'),
    scale: oneOf(SCALE_TYPES, search.scale, 'major'),
    instrument: oneOf(INSTRUMENTS, search.instrument, 'guitar'),
  };
}

export const Route = createFileRoute('/chord-scale')({
  component: ChordScaleRoute,
  validateSearch: validateChordScaleSearch,
});

function ChordScaleRoute() {
  const { tab, key, scale, instrument } = Route.useSearch();
  const navigate = Route.useNavigate();

  const update = (next: Partial<ChordScaleSearch>) =>
    navigate({ search: { tab, key, scale, instrument, ...next }, replace: true });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Back nav */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/' })}
          className="mb-6 gap-2 text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Page header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold text-[var(--ink-primary)] mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Chord-Scale System
          </h1>
          <p className="text-[var(--ink-secondary)] text-sm">
            Jeff Schneider&apos;s chord-scale matrix — all 5 scale families, all 12 keys
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 border-b border-[var(--border-subtle)] pb-0">
          <TabButton
            active={tab === 'matrix'}
            onClick={() => update({ tab: 'matrix' })}
            icon={<Grid3X3 className="w-4 h-4" />}
            label="Matrix"
          />
          <TabButton
            active={tab === 'practice'}
            onClick={() => update({ tab: 'practice' })}
            icon={<Gamepad2 className="w-4 h-4" />}
            label="Practice"
          />
        </div>

        {/* Tab content */}
        {tab === 'matrix' && (
          <ChordScaleMatrix
            selectedKey={key}
            selectedScaleType={scale}
            instrument={instrument}
            onChange={update}
          />
        )}
        {tab === 'practice' && <ChordScaleGame />}
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all',
        active
          ? 'border-[var(--accent)] text-[var(--accent)]'
          : 'border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--border-medium)]',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}

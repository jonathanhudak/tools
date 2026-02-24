/**
 * Chord-Scale Route
 *
 * Two modes accessible via tabs:
 *  - Matrix: interactive 7-column reference grid (ChordScaleMatrix)
 *  - Practice: quiz game (ChordScaleGame)
 */

import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@hudak/ui/components/button';
import { ArrowLeft, Grid3X3, Gamepad2 } from 'lucide-react';
import { ChordScaleGame } from '../components/ChordScaleGame';
import { ChordScaleMatrix } from '../components/ChordScaleMatrix';

export const Route = createFileRoute('/chord-scale')({
  component: ChordScaleRoute,
});

type Tab = 'matrix' | 'practice';

function ChordScaleRoute() {
  const navigate = Route.useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('matrix');

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
            Jeff Schneider's chord-scale matrix — all 4 scale families, all 12 keys
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 border-b border-[var(--border-subtle)] pb-0">
          <TabButton
            active={activeTab === 'matrix'}
            onClick={() => setActiveTab('matrix')}
            icon={<Grid3X3 className="w-4 h-4" />}
            label="Matrix"
          />
          <TabButton
            active={activeTab === 'practice'}
            onClick={() => setActiveTab('practice')}
            icon={<Gamepad2 className="w-4 h-4" />}
            label="Practice"
          />
        </div>

        {/* Tab content */}
        {activeTab === 'matrix' && <ChordScaleMatrix />}
        {activeTab === 'practice' && <ChordScaleGame />}
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

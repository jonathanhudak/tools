/**
 * Scales & Modes Route
 *
 * Two tabs matching chord-scale matrix UX:
 *  - Reference: interactive scale/mode explorer with fretboard, piano, staff
 *  - Practice: quiz game
 */

import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@hudak/ui/components/button';
import { ArrowLeft, BookOpen, Zap } from 'lucide-react';
import { ScaleReference } from '../components/ScaleReference/ScaleReference';
import { ScalesModesQuiz } from '../components/ChordScaleGame/ScalesModesQuiz';

export const Route = createFileRoute('/scales-quiz')({
  component: ScalesQuizRoute,
});

type Tab = 'reference' | 'practice';

function ScalesQuizRoute() {
  const navigate = Route.useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('reference');

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
            Scales &amp; Modes
          </h1>
          <p className="text-[var(--ink-secondary)] text-sm">
            Explore scale families, modes, and their chord relationships — all 4 families, all 12 keys
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 border-b border-[var(--border-subtle)] pb-0">
          <TabButton
            active={activeTab === 'reference'}
            onClick={() => setActiveTab('reference')}
            icon={<BookOpen className="w-4 h-4" />}
            label="Reference"
          />
          <TabButton
            active={activeTab === 'practice'}
            onClick={() => setActiveTab('practice')}
            icon={<Zap className="w-4 h-4" />}
            label="Practice"
          />
        </div>

        {/* Tab content */}
        {activeTab === 'reference' && (
          <ScaleReference onBack={() => navigate({ to: '/' })} />
        )}
        {activeTab === 'practice' && <ScalesModesQuiz />}
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
          ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
          : 'border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--border-strong)]',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}

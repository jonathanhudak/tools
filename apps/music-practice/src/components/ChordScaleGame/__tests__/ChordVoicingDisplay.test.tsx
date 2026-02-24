/**
 * ChordVoicingDisplay tests
 * Covers: P0 Bug #1 - crash when chord has empty voicings array
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChordVoicingDisplay } from '../ChordVoicingDisplay';
import type { Chord } from '@/lib/chord-library';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    circle: (props: Record<string, unknown>) => <circle {...props} />,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock child components that have their own dependency chains
vi.mock('../../ChordReference/ChordDiagram', () => ({
  ChordDiagram: ({ chord }: { chord: Chord }) => <div data-testid="chord-diagram">{chord.name}</div>,
}));
vi.mock('../../ChordReference/PianoChordDiagram', () => ({
  PianoChordDiagram: () => <div data-testid="piano-diagram" />,
}));
vi.mock('../../ChordReference/ChordPlayer', () => ({
  ChordPlayer: () => <div data-testid="chord-player" />,
}));
vi.mock('../../Piano/InstrumentToggle', () => ({
  InstrumentToggle: () => <div data-testid="instrument-toggle" />,
}));

const makeChord = (overrides: Partial<Chord> = {}): Chord => ({
  id: 'test-chord',
  name: 'Test Chord',
  shortName: 'Tst',
  root: 'C',
  type: 'major',
  difficulty: 'beginner',
  description: 'A test chord',
  tags: [],
  theory: {
    intervals: ['R', 'M3', 'P5'],
    construction: 'Test',
    commonProgressions: [],
  },
  voicings: [
    {
      voicingName: 'Open Position',
      position: 1,
      guitar: {
        frets: [0, 3, 2, 0, 1, 0],
        fingers: ['x', '3', '2', 'x', '1', 'x'],
        muted: [],
        barred: false,
        description: 'Standard open voicing',
      },
    },
  ],
  ...overrides,
});

describe('ChordVoicingDisplay', () => {
  it('renders chord name for a valid chord with voicings', () => {
    render(<ChordVoicingDisplay chord={makeChord()} />);
    // chord.name appears in both the card title and the mocked ChordDiagram
    expect(screen.getAllByText('Test Chord').length).toBeGreaterThanOrEqual(1);
  });

  it('does not crash when chord has empty voicings array', () => {
    const chord = makeChord({ voicings: [] });
    expect(() => {
      render(<ChordVoicingDisplay chord={chord} />);
    }).not.toThrow();
  });

  it('shows fallback message when chord has empty voicings', () => {
    const chord = makeChord({ voicings: [] });
    render(<ChordVoicingDisplay chord={chord} />);
    expect(screen.getByText('No voicing data available for Test Chord.')).toBeInTheDocument();
  });
});

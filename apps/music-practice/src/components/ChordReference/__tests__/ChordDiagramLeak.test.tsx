/**
 * ChordDiagram answer leak tests
 * Covers: P0 Bug #2 - chord name shown before user guesses in quiz mode
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChordDiagram } from '../ChordDiagram';
import type { Chord } from '@/lib/chord-library';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    circle: (props: Record<string, unknown>) => <circle {...props} />,
  },
}));

const testChord: Chord = {
  id: 'g-major-7',
  name: 'G Major 7',
  shortName: 'Gmaj7',
  root: 'G',
  type: 'major',
  difficulty: 'intermediate',
  description: 'Bright and sophisticated',
  tags: ['jazz'],
  theory: {
    intervals: ['R', 'M3', 'P5', 'M7'],
    construction: 'Major triad + Major 7th',
    commonProgressions: ['IMaj7-vi7'],
  },
  voicings: [
    {
      voicingName: 'Open Position',
      position: 1,
      guitar: {
        frets: [3, 2, 0, 0, 0, 2],
        fingers: ['3', '2', 'x', 'x', 'x', '1'],
        muted: [],
        barred: false,
        description: 'Standard open voicing',
      },
    },
  ],
};

describe('ChordDiagram - Answer Leak (P0 Bug #2)', () => {
  it('shows chord name by default (reference mode)', () => {
    render(<ChordDiagram chord={testChord} />);
    expect(screen.getByText('G Major 7')).toBeInTheDocument();
    expect(screen.getByText('Bright and sophisticated')).toBeInTheDocument();
  });

  it('hides chord name and description when hideChordInfo is true (quiz mode)', () => {
    render(<ChordDiagram chord={testChord} hideChordInfo />);
    expect(screen.queryByText('G Major 7')).not.toBeInTheDocument();
    expect(screen.queryByText('Bright and sophisticated')).not.toBeInTheDocument();
  });
});

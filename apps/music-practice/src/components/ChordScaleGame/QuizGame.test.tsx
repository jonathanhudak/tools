/**
 * QuizGame Component Tests
 * Updated after removing the "Ready to Start?" confirmation screen (P0 #5)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuizGame } from './QuizGame';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('QuizGame', () => {
  const mockOnQuizComplete = vi.fn();
  const selectedScales: ('major' | 'naturalMinor' | 'melodicMinor' | 'harmonicMinor')[] = ['major'];

  beforeEach(() => {
    mockOnQuizComplete.mockClear();
  });

  it('should render quiz immediately without confirmation screen', () => {
    const { container } = render(<QuizGame selectedScales={selectedScales} onQuizComplete={mockOnQuizComplete} />);
    expect(container).toBeInTheDocument();
    // Should NOT have a "Ready to Start?" or "Let's Go!" screen
    expect(screen.queryByText(/ready to start/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/let's go/i)).not.toBeInTheDocument();
  });

  it('should display a question on mount', () => {
    render(<QuizGame selectedScales={selectedScales} onQuizComplete={mockOnQuizComplete} />);
    // Should show question 1 of N
    expect(screen.getByText(/question 1 of/i)).toBeInTheDocument();
  });

  it('should have answer buttons', () => {
    const { container } = render(<QuizGame selectedScales={selectedScales} onQuizComplete={mockOnQuizComplete} />);
    const buttons = container.querySelectorAll('button');
    // At least 4 answer option buttons
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('should accept multiple scale types', () => {
    const allScales: ('major' | 'naturalMinor' | 'melodicMinor' | 'harmonicMinor')[] = [
      'major',
      'naturalMinor',
      'melodicMinor',
      'harmonicMinor',
    ];
    const { container } = render(<QuizGame selectedScales={allScales} onQuizComplete={mockOnQuizComplete} />);
    expect(container).toBeInTheDocument();
  });
});

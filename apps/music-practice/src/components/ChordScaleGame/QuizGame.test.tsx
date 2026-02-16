/**
 * QuizGame Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuizGame } from './QuizGame';

describe('QuizGame', () => {
  const mockOnQuizComplete = vi.fn();
  const selectedScales: ('major' | 'naturalMinor' | 'melodicMinor' | 'harmonicMinor')[] = ['major'];

  beforeEach(() => {
    mockOnQuizComplete.mockClear();
  });

  it('should render start screen', () => {
    render(<QuizGame selectedScales={selectedScales} onQuizComplete={mockOnQuizComplete} />);

    expect(screen.getByText(/Ready to Start/i)).toBeInTheDocument();
  });

  it('should display quiz title', () => {
    render(<QuizGame selectedScales={selectedScales} onQuizComplete={mockOnQuizComplete} />);

    expect(screen.getByText(/Answer.*questions about scales and modes/i)).toBeInTheDocument();
  });

  it('should show selected scales info', () => {
    render(<QuizGame selectedScales={selectedScales} onQuizComplete={mockOnQuizComplete} />);

    expect(screen.getByText(/Selected Scales/i)).toBeInTheDocument();
  });

  it('should have question count options', () => {
    render(<QuizGame selectedScales={selectedScales} onQuizComplete={mockOnQuizComplete} />);

    const select = screen.getByDisplayValue('10');
    expect(select).toBeInTheDocument();
  });

  it('should have start button', () => {
    const { container } = render(<QuizGame selectedScales={selectedScales} onQuizComplete={mockOnQuizComplete} />);

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should accept multiple scale types', () => {
    const allScales: ('major' | 'naturalMinor' | 'melodicMinor' | 'harmonicMinor')[] = [
      'major',
      'naturalMinor',
      'melodicMinor',
      'harmonicMinor',
    ];
    render(<QuizGame selectedScales={allScales} onQuizComplete={mockOnQuizComplete} />);

    expect(screen.getByText(/Ready to Start/i)).toBeInTheDocument();
  });
});

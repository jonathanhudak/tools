/**
 * Tests for ChordQuiz component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChordQuiz } from '../ChordQuiz';

describe('ChordQuiz', () => {
  let mockOnBack: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnBack = vi.fn();
  });

  it('should render quiz interface', () => {
    render(<ChordQuiz mode="accuracy" difficulty="beginner" onBack={mockOnBack} />);
    expect(screen.getByText(/chord quiz/i)).toBeInTheDocument();
  });

  it('should display current question', () => {
    render(<ChordQuiz mode="speed" difficulty="intermediate" onBack={mockOnBack} />);
    expect(screen.getByText(/what chord is this/i)).toBeInTheDocument();
  });

  it('should show progress bar', () => {
    render(<ChordQuiz mode="accuracy" difficulty="advanced" onBack={mockOnBack} />);
    expect(screen.getByText(/question/i)).toBeInTheDocument();
  });

  it('should display mode and difficulty badges', () => {
    render(<ChordQuiz mode="progression" difficulty="intermediate" onBack={mockOnBack} />);
    expect(screen.getByText(/progression/i)).toBeInTheDocument();
    expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
  });

  it('should show answer options', () => {
    render(<ChordQuiz mode="accuracy" difficulty="beginner" onBack={mockOnBack} />);
    const buttons = screen.getAllByRole('button').filter(
      btn => !btn.textContent?.includes('Listen') && !btn.textContent?.includes('Back')
    );
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('should render chord diagram', () => {
    const { container } = render(<ChordQuiz mode="speed" difficulty="beginner" onBack={mockOnBack} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should handle answer selection', () => {
    render(<ChordQuiz mode="accuracy" difficulty="beginner" questionCount={2} onBack={mockOnBack} />);

    // Get answer buttons (excluding special buttons)
    const buttons = screen.getAllByRole('button');
    const answerButton = buttons.find(
      btn => !btn.textContent?.includes('Listen') && !btn.textContent?.includes('Back') &&
             !btn.textContent?.includes('Next') && btn.textContent?.trim().length === btn.textContent?.trim().match(/[A-Za-z]/)?.[0]?.length
    );

    if (answerButton) {
      fireEvent.click(answerButton);
      // After clicking, feedback should appear
      const feedback = screen.queryByText(/correct|incorrect/i);
      expect(feedback).toBeInTheDocument();
    }
  });

  it('should show timer in speed mode', () => {
    render(<ChordQuiz mode="speed" difficulty="beginner" onBack={mockOnBack} />);
    // Timer should be visible somewhere showing seconds
    const speedElements = screen.getAllByText(/\ds\b/);
    expect(speedElements.length).toBeGreaterThan(0);
  });

  it('should display score', () => {
    render(<ChordQuiz mode="accuracy" difficulty="intermediate" onBack={mockOnBack} />);
    expect(screen.getByText(/points/i)).toBeInTheDocument();
  });

  it('should handle back button', () => {
    render(<ChordQuiz mode="progression" difficulty="advanced" onBack={mockOnBack} />);
    const backButton = screen.getByText(/back to menu/i);
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalled();
  });
});

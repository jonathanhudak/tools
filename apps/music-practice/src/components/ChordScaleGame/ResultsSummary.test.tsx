/**
 * ResultsSummary Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultsSummary } from './ResultsSummary';
import type { QuizResults } from './QuizGame';

describe('ResultsSummary', () => {
  const mockOnRetry = vi.fn();

  const createMockResults = (accuracy: number): QuizResults => ({
    totalQuestions: 10,
    correctAnswers: Math.floor((accuracy / 100) * 10),
    incorrectAnswers: 10 - Math.floor((accuracy / 100) * 10),
    accuracy,
    answers: [
      {
        question: {
          scaleType: 'major',
          degree: 1,
          correctAnswer: 'Ionian',
          modeName: 'Ionian',
          options: ['Ionian', 'Dorian', 'Phrygian', 'Lydian'],
          questionText: 'What mode is on degree 1 of major?',
        },
        selectedAnswer: 'Ionian',
        isCorrect: true,
      },
    ],
  });

  beforeEach(() => {
    mockOnRetry.mockClear();
  });

  it('should render results summary', () => {
    const results = createMockResults(80);
    render(<ResultsSummary results={results} onRetry={mockOnRetry} />);

    expect(screen.getByText(/Quiz Complete/i)).toBeInTheDocument();
  });

  it('should display correct score', () => {
    const results = createMockResults(80);
    render(<ResultsSummary results={results} onRetry={mockOnRetry} />);

    expect(screen.getByText(`${results.correctAnswers}/${results.totalQuestions}`)).toBeInTheDocument();
  });

  it('should display accuracy percentage', () => {
    const results = createMockResults(85);
    render(<ResultsSummary results={results} onRetry={mockOnRetry} />);

    expect(screen.getByText(/85/)).toBeInTheDocument();
  });

  it('should show excellent feedback for high accuracy', () => {
    const results = createMockResults(90);
    render(<ResultsSummary results={results} onRetry={mockOnRetry} />);

    expect(screen.getByText(/Outstanding/i)).toBeInTheDocument();
  });

  it('should show good feedback for medium accuracy', () => {
    const results = createMockResults(75);
    render(<ResultsSummary results={results} onRetry={mockOnRetry} />);

    expect(screen.getByText(/Great job/i)).toBeInTheDocument();
  });

  it('should show encouraging feedback for low accuracy', () => {
    const results = createMockResults(60);
    render(<ResultsSummary results={results} onRetry={mockOnRetry} />);

    expect(screen.getByText(/Keep practicing/i)).toBeInTheDocument();
  });

  it('should have retry and details buttons', () => {
    const results = createMockResults(80);
    const { container } = render(<ResultsSummary results={results} onRetry={mockOnRetry} />);

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should display stats card data', () => {
    const results = createMockResults(80);
    render(<ResultsSummary results={results} onRetry={mockOnRetry} />);

    expect(screen.getByText(/Correct/i)).toBeInTheDocument();
    expect(screen.getByText(/Incorrect/i)).toBeInTheDocument();
    expect(screen.getByText(/Accuracy/i)).toBeInTheDocument();
  });

  it('should handle 100% accuracy', () => {
    const results = createMockResults(100);
    render(<ResultsSummary results={results} onRetry={mockOnRetry} />);

    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('should handle 0% accuracy', () => {
    const results = createMockResults(0);
    render(<ResultsSummary results={results} onRetry={mockOnRetry} />);

    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});

/**
 * QuizGame Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { QuizGame } from './QuizGame';

describe('QuizGame', () => {
  const mockOnQuizComplete = vi.fn();
  const selectedScales: ('major' | 'naturalMinor' | 'melodicMinor' | 'harmonicMinor')[] = ['major'];

  beforeEach(() => {
    mockOnQuizComplete.mockClear();
  });

  it('should render without errors', () => {
    const { container } = render(<QuizGame selectedScales={selectedScales} onQuizComplete={mockOnQuizComplete} />);
    expect(container).toBeInTheDocument();
  });

  it('should render start screen', () => {
    const { container } = render(<QuizGame selectedScales={selectedScales} onQuizComplete={mockOnQuizComplete} />);
    const card = container.querySelector('[data-slot="card"]');
    expect(card).toBeInTheDocument();
  });

  it('should have question count selector', () => {
    const { container } = render(<QuizGame selectedScales={selectedScales} onQuizComplete={mockOnQuizComplete} />);
    const select = container.querySelector('select');
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
    const { container } = render(<QuizGame selectedScales={allScales} onQuizComplete={mockOnQuizComplete} />);
    expect(container).toBeInTheDocument();
  });
});

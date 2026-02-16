/**
 * ScaleSelector Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScaleSelector } from './ScaleSelector';

describe('ScaleSelector', () => {
  let mockCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCallback = vi.fn();
  });

  it('should render the component', () => {
    render(<ScaleSelector onScalesSelected={mockCallback} />);

    expect(screen.getByText(/Scales & Modes Quiz/i)).toBeInTheDocument();
    expect(screen.getByText(/Select which scales to include/i)).toBeInTheDocument();
  });

  it('should display title and description', () => {
    render(<ScaleSelector onScalesSelected={mockCallback} />);

    expect(screen.getByText(/Select which scales to include in your quiz/i)).toBeInTheDocument();
  });

  it('should display selected scales label', () => {
    render(<ScaleSelector onScalesSelected={mockCallback} />);

    expect(screen.getByText(/Selected:/i)).toBeInTheDocument();
  });

  it('should display scale options', () => {
    render(<ScaleSelector onScalesSelected={mockCallback} />);

    expect(screen.queryByText(/Major/)).toBeInTheDocument();
    expect(screen.queryByText(/Natural Minor/)).toBeInTheDocument();
    expect(screen.queryByText(/Melodic Minor/)).toBeInTheDocument();
    expect(screen.queryByText(/Harmonic Minor/)).toBeInTheDocument();
  });

  it('should display difficulty controls', () => {
    const { container } = render(<ScaleSelector onScalesSelected={mockCallback} />);

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render buttons', () => {
    const { container } = render(<ScaleSelector onScalesSelected={mockCallback} />);

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(5);
  });
});

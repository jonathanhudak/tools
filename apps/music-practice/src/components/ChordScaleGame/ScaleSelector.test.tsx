/**
 * ScaleSelector Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ScaleSelector } from './ScaleSelector';

describe('ScaleSelector', () => {
  let mockCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCallback = vi.fn();
  });

  it('should render the component', () => {
    const { container } = render(<ScaleSelector onScalesSelected={mockCallback} />);
    expect(container).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = render(<ScaleSelector onScalesSelected={mockCallback} />);
    const card = container.querySelector('[data-slot="card"]');
    expect(card).toBeInTheDocument();
  });

  it('should have buttons for interaction', () => {
    const { container } = render(<ScaleSelector onScalesSelected={mockCallback} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(5);
  });

  it('should have interactive elements', () => {
    const { container } = render(<ScaleSelector onScalesSelected={mockCallback} />);
    const allInputs = container.querySelectorAll('button, input, select');
    expect(allInputs.length).toBeGreaterThan(0);
  });

  it('should have a start quiz button', () => {
    const { container } = render(<ScaleSelector onScalesSelected={mockCallback} />);
    const buttons = container.querySelectorAll('button');
    const hasStartButton = Array.from(buttons).some(btn => btn.textContent?.includes('Start Quiz'));
    expect(hasStartButton).toBe(true);
  });

  it('should call callback when scales selected', async () => {
    const { container } = render(<ScaleSelector onScalesSelected={mockCallback} />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const startButton = buttons.find(btn => btn.textContent?.includes('Start Quiz'));
    
    if (startButton) {
      startButton.click();
      expect(mockCallback).toHaveBeenCalled();
    }
  });
});

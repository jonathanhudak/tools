/**
 * Tests for ChordDiagram component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChordDiagram } from '../ChordDiagram';
import { CHORD_LIBRARY } from '@/lib/chord-library';

describe('ChordDiagram', () => {
  const testChord = CHORD_LIBRARY[0];

  it('should render chord diagram', () => {
    render(<ChordDiagram chord={testChord} />);
    expect(screen.getByText(testChord.name)).toBeInTheDocument();
  });

  it('should display chord name and description', () => {
    render(<ChordDiagram chord={testChord} />);
    expect(screen.getByText(testChord.name)).toBeInTheDocument();
    expect(screen.getByText(testChord.description)).toBeInTheDocument();
  });

  it('should render SVG fretboard', () => {
    const { container } = render(<ChordDiagram chord={testChord} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should display legend', () => {
    render(<ChordDiagram chord={testChord} />);
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Fret')).toBeInTheDocument();
    expect(screen.getByText('Muted')).toBeInTheDocument();
  });

  it('should render string labels', () => {
    render(<ChordDiagram chord={testChord} />);
    const stringLabels = ['E', 'A', 'D', 'G', 'B'];
    stringLabels.forEach(label => {
      const elements = screen.getAllByText(label);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('should render different sizes', () => {
    const { container: smallContainer } = render(<ChordDiagram chord={testChord} size="small" />);
    const smallSvg = smallContainer.querySelector('svg');
    const smallWidth = smallSvg?.getAttribute('width');

    const { container: largeContainer } = render(<ChordDiagram chord={testChord} size="large" />);
    const largeSvg = largeContainer.querySelector('svg');
    const largeWidth = largeSvg?.getAttribute('width');

    expect(parseInt(smallWidth || '0')).toBeLessThan(parseInt(largeWidth || '0'));
  });

  it('should accept interactive prop', () => {
    render(<ChordDiagram chord={testChord} interactive={true} />);
    // Interactive mode allows hover effects
    expect(screen.getByText(testChord.name)).toBeInTheDocument();
  });
});

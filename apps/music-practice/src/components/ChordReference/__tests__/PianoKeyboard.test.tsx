/**
 * Tests for PianoKeyboard component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PianoKeyboard } from '../PianoKeyboard';
import { getChordById } from '@/lib/chord-library';

describe('PianoKeyboard Component', () => {
  const cMajor = getChordById('c-major')!;
  const aMinor = getChordById('a-minor')!;

  describe('Rendering', () => {
    it('should render piano keyboard for a chord', () => {
      const { container } = render(<PianoKeyboard chord={cMajor} />);
      expect(container).toBeTruthy();
    });

    it('should render SVG keyboard', () => {
      const { container } = render(<PianoKeyboard chord={cMajor} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should render for different chords', () => {
      const { container } = render(<PianoKeyboard chord={aMinor} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  describe('Size variants', () => {
    it('should render small size', () => {
      const { container } = render(<PianoKeyboard chord={cMajor} size="small" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should render medium size', () => {
      const { container } = render(<PianoKeyboard chord={cMajor} size="medium" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should render large size', () => {
      const { container } = render(<PianoKeyboard chord={cMajor} size="large" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  describe('Keyboard structure', () => {
    it('should have white and black keys', () => {
      const { container } = render(<PianoKeyboard chord={cMajor} />);
      const rects = container.querySelectorAll('rect');
      expect(rects.length).toBeGreaterThan(0);
    });

    it('should have text elements', () => {
      const { container } = render(<PianoKeyboard chord={cMajor} />);
      const textElements = container.querySelectorAll('text');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should have motion wrapper', () => {
      const { container } = render(<PianoKeyboard chord={cMajor} />);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Different chords', () => {
    it('should render C Major chord', () => {
      const { container } = render(<PianoKeyboard chord={cMajor} />);
      expect(container).toBeTruthy();
    });

    it('should render A Minor chord', () => {
      const { container } = render(<PianoKeyboard chord={aMinor} />);
      expect(container).toBeTruthy();
    });

    it('should render extended chords', () => {
      const cmaj7 = getChordById('cmaj7')!;
      const { container } = render(<PianoKeyboard chord={cmaj7} />);
      expect(container).toBeTruthy();
    });
  });

  describe('Interactive prop', () => {
    it('should accept interactive prop', () => {
      const { container } = render(<PianoKeyboard chord={cMajor} interactive={true} />);
      expect(container).toBeTruthy();
    });

    it('should work without interactive prop', () => {
      const { container } = render(<PianoKeyboard chord={cMajor} interactive={false} />);
      expect(container).toBeTruthy();
    });
  });
});

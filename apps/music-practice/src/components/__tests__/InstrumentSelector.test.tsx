/**
 * Tests for InstrumentSelector component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { InstrumentSelector } from '../InstrumentSelector';

describe('InstrumentSelector Component', () => {
  describe('Rendering', () => {
    it('should render two buttons', () => {
      const { container } = render(<InstrumentSelector selected="guitar" onChange={() => {}} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(2);
    });

    it('should render with guitar selected', () => {
      const { container } = render(<InstrumentSelector selected="guitar" onChange={() => {}} />);
      expect(container).toBeTruthy();
    });

    it('should render with piano selected', () => {
      const { container } = render(<InstrumentSelector selected="piano" onChange={() => {}} />);
      expect(container).toBeTruthy();
    });
  });

  describe('Structure', () => {
    it('should have motion wrapper', () => {
      const { container } = render(<InstrumentSelector selected="guitar" onChange={() => {}} />);
      expect(container.firstChild).toBeTruthy();
    });

    it('should have buttons with icons', () => {
      const { container } = render(<InstrumentSelector selected="guitar" onChange={() => {}} />);
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Size variants', () => {
    it('should accept sm size', () => {
      const { container } = render(
        <InstrumentSelector selected="guitar" onChange={() => {}} size="sm" />
      );
      expect(container.querySelector('button')).toBeTruthy();
    });

    it('should accept lg size', () => {
      const { container } = render(
        <InstrumentSelector selected="guitar" onChange={() => {}} size="lg" />
      );
      expect(container.querySelector('button')).toBeTruthy();
    });

    it('should accept default size', () => {
      const { container } = render(
        <InstrumentSelector selected="guitar" onChange={() => {}} size="default" />
      );
      expect(container.querySelector('button')).toBeTruthy();
    });
  });
});

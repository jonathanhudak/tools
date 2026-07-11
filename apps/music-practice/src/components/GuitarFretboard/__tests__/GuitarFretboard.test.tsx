import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GuitarFretboard, BANJO_OPEN_G } from '../GuitarFretboard';

const G_MAJOR = ['G', 'A', 'B', 'C', 'D', 'E', 'F#'];

describe('GuitarFretboard', () => {
  it('renders 6 strings for default guitar tuning', () => {
    const { container } = render(<GuitarFretboard notes={G_MAJOR} root="G" />);
    expect(container.querySelectorAll('line[data-string]')).toHaveLength(6);
  });

  it('renders 5 strings for banjo tuning', () => {
    const { container } = render(
      <GuitarFretboard notes={G_MAJOR} root="G" {...BANJO_OPEN_G} />
    );
    expect(container.querySelectorAll('line[data-string]')).toHaveLength(5);
  });

  it('places no dots below the short string start fret', () => {
    const { container } = render(
      <GuitarFretboard notes={G_MAJOR} root="G" {...BANJO_OPEN_G} />
    );
    // The short g string is the last display row (bottom, index 4)
    const shortDots = container.querySelectorAll('[data-string-idx="4"]');
    expect(shortDots.length).toBeGreaterThan(0);
    for (const dot of shortDots) {
      const fret = Number(dot.getAttribute('data-fret'));
      expect(fret).toBeGreaterThanOrEqual(5);
    }
  });

  it('sounds the short string open pitch at its own nut (fret 5 = G)', () => {
    const { container } = render(
      <GuitarFretboard notes={G_MAJOR} root="G" {...BANJO_OPEN_G} showNoteNames />
    );
    const openDot = container.querySelector('[data-string-idx="4"][data-fret="5"]');
    expect(openDot).not.toBeNull();
    expect(openDot!.textContent).toBe('G');
    // Physical fret 7 on the 5th string = G4 + 2 = A
    const fret7 = container.querySelector('[data-string-idx="4"][data-fret="7"]');
    expect(fret7).not.toBeNull();
    expect(fret7!.textContent).toBe('A');
  });
});

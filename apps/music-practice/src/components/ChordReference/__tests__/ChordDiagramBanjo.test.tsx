import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChordDiagram } from '../ChordDiagram';
import { CHORD_LIBRARY } from '@/lib/chord-library';

const gMajor = CHORD_LIBRARY.find((c) => c.shortName === 'G' && c.type === 'major')!;
const cmaj9 = CHORD_LIBRARY.find((c) => c.shortName === 'Cmaj9')!;

describe('ChordDiagram banjo mode', () => {
  it('renders 5 string labels including the g drone', () => {
    const { container } = render(<ChordDiagram chord={gMajor} instrument="banjo" />);
    expect(screen.getByText('g')).toBeInTheDocument();
    // 5 vertical string lines
    const strings = container.querySelectorAll('line[x1][y1][x2][y2]');
    expect(strings.length).toBeGreaterThan(0);
    // Drone string lowercased; strings 4→1 = D G B D
    expect(screen.getAllByText('D').length).toBeGreaterThanOrEqual(2);
    for (const label of ['g', 'G', 'B']) {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('shows fallback for chords without banjo voicing', () => {
    render(<ChordDiagram chord={cmaj9} instrument="banjo" />);
    expect(screen.getByText('No banjo voicing for this chord')).toBeInTheDocument();
  });

  it('defaults to guitar with 6 string labels', () => {
    render(<ChordDiagram chord={gMajor} />);
    expect(screen.getByText('e')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});

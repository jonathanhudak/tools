/**
 * Tests for ChordSearch component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChordSearch } from '../ChordSearch';
import { CHORD_LIBRARY } from '@/lib/chord-library';

describe('ChordSearch', () => {
  let mockOnChordSelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChordSelect = vi.fn();
  });

  it('should render search input', () => {
    render(<ChordSearch onChordSelect={mockOnChordSelect} />);
    const input = screen.getByPlaceholderText(/search chords/i);
    expect(input).toBeInTheDocument();
  });

  it('should render difficulty filter', () => {
    render(<ChordSearch onChordSelect={mockOnChordSelect} />);
    const triggers = screen.getAllByRole('combobox');
    expect(triggers.length).toBeGreaterThanOrEqual(1);
  });

  it('should display chord results', () => {
    render(<ChordSearch onChordSelect={mockOnChordSelect} />);
    const chordElements = screen.getAllByRole('button');
    expect(chordElements.length).toBeGreaterThan(0);
  });

  it('should filter chords by search query', async () => {
    render(<ChordSearch onChordSelect={mockOnChordSelect} />);
    const input = screen.getByPlaceholderText(/search chords/i);

    fireEvent.change(input, { target: { value: 'C Major' } });

    // Should show C Major chord
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('should call onChordSelect when chord is selected', () => {
    render(<ChordSearch onChordSelect={mockOnChordSelect} />);
    const chordButtons = screen.getAllByRole('button').filter(
      btn => btn.textContent && CHORD_LIBRARY.some(c => c.shortName === btn.textContent?.split('\n')[0])
    );

    if (chordButtons.length > 0) {
      fireEvent.click(chordButtons[0]);
      expect(mockOnChordSelect).toHaveBeenCalled();
    }
  });

  it('should show result count', () => {
    render(<ChordSearch onChordSelect={mockOnChordSelect} />);
    expect(screen.getByText(/showing/i)).toBeInTheDocument();
  });

  it('should highlight selected chord', () => {
    const selectedChord = CHORD_LIBRARY[0];
    render(<ChordSearch onChordSelect={mockOnChordSelect} selectedChord={selectedChord} />);

    const chordButton = screen.getByText(selectedChord.shortName).closest('button');
    expect(chordButton).toHaveClass('border-primary');
  });
});

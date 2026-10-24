/**
 * ProgressionLibrary tests — the chord diagram grid renders one shared
 * ChordCard per step and follows the key + instrument controls.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressionLibrary } from '../ProgressionLibrary';

// Mock heavy leaf renderers — the grid wiring is what matters here.
vi.mock('../../ChordReference/ChordDiagram', () => ({
  ChordDiagram: ({ chord }: { chord: { name: string } }) => (
    <div data-testid="chord-diagram">{chord.name}</div>
  ),
}));
vi.mock('../../ChordReference/PianoChordDiagram', () => ({
  PianoChordDiagram: () => <div data-testid="piano-diagram" />,
}));
vi.mock('../../notation/StaffDisplay', () => ({
  StaffDisplay: () => <div data-testid="staff-display" />,
}));

// Expose a key-change button so the test can drive the shared musicKey state.
vi.mock('../../shared/ProgressionPlayer', () => ({
  ProgressionPlayer: ({
    musicKey,
    onKeyChange,
  }: {
    musicKey: string;
    onKeyChange: (key: string) => void;
  }) => (
    <button data-testid="key-change" onClick={() => onKeyChange('D')}>
      key:{musicKey}
    </button>
  ),
}));

describe('ProgressionLibrary chord diagram grid', () => {
  it('renders one shared ChordCard per step of the selected progression', () => {
    render(<ProgressionLibrary />);

    // Default selection is ii-V-I Major in C: Dm7 → G7 → Cmaj7
    expect(screen.getByText('ii7')).toBeInTheDocument();
    expect(screen.getByText('V7')).toBeInTheDocument();
    expect(screen.getByText('Imaj7')).toBeInTheDocument();
    expect(screen.getByText('Dm7')).toBeInTheDocument();
    expect(screen.getByText('G7')).toBeInTheDocument();
    expect(screen.getByText('Cmaj7')).toBeInTheDocument();
    expect(screen.getAllByTestId('chord-diagram')).toHaveLength(3);
  });

  it('transposes the grid when the key changes', () => {
    render(<ProgressionLibrary />);

    fireEvent.click(screen.getByTestId('key-change'));

    // ii-V-I in D: Em7 → A7 → Dmaj7
    expect(screen.getByText('Em7')).toBeInTheDocument();
    expect(screen.getByText('A7')).toBeInTheDocument();
    expect(screen.getByText('Dmaj7')).toBeInTheDocument();
    expect(screen.queryByText('Dm7')).not.toBeInTheDocument();
  });

  it('switches every card to the piano diagram via the shared instrument toggle', () => {
    render(<ProgressionLibrary />);

    expect(screen.queryByTestId('piano-diagram')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /piano/i }));

    expect(screen.getAllByTestId('piano-diagram').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('chord-diagram')).not.toBeInTheDocument();
  });
});

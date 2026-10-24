/**
 * ProgressionLibrary tests — the chord diagram grid renders one shared
 * ChordCard per step and follows the key + instrument controls.
 */
import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ProgressionFamily } from '@/data/progressions/progression-registry';
import type { Instrument } from '@/lib/search-params';
import { ProgressionLibrary } from '../ProgressionLibrary';

/** Controlled harness: the real app keeps this state in the URL. */
function Harness() {
  const [search, setSearch] = useState({
    family: 'jazz' as ProgressionFamily,
    progression: 'ii-V-I-major',
    key: 'C',
    bpm: 90,
    instrument: 'guitar' as Instrument,
  });
  return (
    <ProgressionLibrary
      family={search.family}
      progression={search.progression}
      musicKey={search.key}
      bpm={search.bpm}
      instrument={search.instrument}
      onChange={(next) => setSearch((prev) => ({ ...prev, ...next }))}
    />
  );
}

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
    render(<Harness />);

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
    render(<Harness />);

    fireEvent.click(screen.getByTestId('key-change'));

    // ii-V-I in D: Em7 → A7 → Dmaj7
    expect(screen.getByText('Em7')).toBeInTheDocument();
    expect(screen.getByText('A7')).toBeInTheDocument();
    expect(screen.getByText('Dmaj7')).toBeInTheDocument();
    expect(screen.queryByText('Dm7')).not.toBeInTheDocument();
  });

  it('lays the cards out in a single scrollable row with fixed-width cards', () => {
    const { container } = render(<Harness />);

    const cards = container.querySelectorAll('.snap-start');
    expect(cards.length).toBeGreaterThan(0);

    const row = cards[0].parentElement as HTMLElement;
    expect(row.className).toContain('overflow-x-auto');
    expect(row.className).not.toContain('lg:grid');
    expect(row.className).not.toContain('grid-cols');
    expect(row.className).not.toMatch(/\bgrid\b/);

    cards.forEach(card => {
      expect(card.className).toContain('w-[75vw]');
      expect(card.className).toContain('sm:w-[280px]');
      expect(card.className).not.toContain('lg:w-auto');
    });
  });

  it('switches every card to the piano diagram via the shared instrument toggle', () => {
    render(<Harness />);

    expect(screen.queryByTestId('piano-diagram')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /piano/i }));

    expect(screen.getAllByTestId('piano-diagram').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('chord-diagram')).not.toBeInTheDocument();
  });
});

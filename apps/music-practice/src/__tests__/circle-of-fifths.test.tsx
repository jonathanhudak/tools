/**
 * Circle of Fifths — route search validation and controlled component.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Route, validateCircleOfFifthsSearch } from '../routes/circle-of-fifths';
import { CircleOfFifths } from '../components/CircleOfFifths/CircleOfFifths';

vi.mock('../components/shared/ChordCard', () => ({
  ChordCard: ({ chordName, instrument }: { chordName: string; instrument: string }) => (
    <div data-testid="chord-card" data-instrument={instrument}>
      {chordName}
    </div>
  ),
}));

const BAD_VALUES: Array<string | number | null> = [
  'toString',
  'constructor',
  '__proto__',
  'hasOwnProperty',
  '',
  42,
  null,
];

describe('circle-of-fifths validateSearch', () => {
  it('passes valid values through', () => {
    expect(validateCircleOfFifthsSearch({ key: 'Eb', instrument: 'piano' })).toEqual({
      key: 'Eb',
      instrument: 'piano',
    });
  });

  it('returns all defaults for an empty search', () => {
    expect(validateCircleOfFifthsSearch({})).toEqual({ key: 'C', instrument: 'guitar' });
  });

  it.each(BAD_VALUES)('falls back to the default key for %p', (value) => {
    expect(validateCircleOfFifthsSearch({ key: value }).key).toBe('C');
  });

  it.each(BAD_VALUES)('falls back to the default instrument for %p', (value) => {
    expect(validateCircleOfFifthsSearch({ instrument: value }).instrument).toBe('guitar');
  });

  it('is the validator wired into the route', () => {
    expect(Route.options.validateSearch).toBe(validateCircleOfFifthsSearch);
  });
});

describe('CircleOfFifths component', () => {
  it('renders the key and instrument passed in as props', () => {
    render(<CircleOfFifths selectedKey="Eb" instrument="piano" onChange={() => {}} />);

    expect(screen.getByRole('heading', { name: /Eb Major/ })).toBeInTheDocument();
    const cards = screen.getAllByTestId('chord-card');
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((card) => expect(card).toHaveAttribute('data-instrument', 'piano'));
  });

  it('calls onChange with the new key when a key is clicked', () => {
    const onChange = vi.fn();
    render(<CircleOfFifths selectedKey="C" instrument="guitar" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Eb major' }));

    expect(onChange).toHaveBeenCalledWith({ key: 'Eb' });
  });

  it('calls onChange with the new instrument when the toggle changes', () => {
    const onChange = vi.fn();
    render(<CircleOfFifths selectedKey="C" instrument="guitar" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /piano/i }));

    expect(onChange).toHaveBeenCalledWith({ instrument: 'piano' });
  });
});

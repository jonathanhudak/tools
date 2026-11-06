/**
 * Circle of Fifths — route search validation and controlled component.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Route, validateCircleOfFifthsSearch } from '../routes/circle-of-fifths';
import { CircleOfFifths } from '../components/CircleOfFifths/CircleOfFifths';

vi.mock('../components/shared/ChordCard', () => ({
  ChordCard: ({
    chordName,
    label,
    instrument,
  }: {
    chordName: string;
    label: string;
    instrument: string;
  }) => (
    <div data-testid="chord-card" data-label={label} data-instrument={instrument}>
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
    expect(
      validateCircleOfFifthsSearch({ key: 'Eb', instrument: 'piano', view: 'borrowed' }),
    ).toEqual({ key: 'Eb', instrument: 'piano', view: 'borrowed' });
  });

  it('returns all defaults for an empty search', () => {
    expect(validateCircleOfFifthsSearch({})).toEqual({
      key: 'C',
      instrument: 'guitar',
      view: 'diatonic',
    });
  });

  it.each(BAD_VALUES)('falls back to the default key for %p', (value) => {
    expect(validateCircleOfFifthsSearch({ key: value }).key).toBe('C');
  });

  it.each(BAD_VALUES)('falls back to the default instrument for %p', (value) => {
    expect(validateCircleOfFifthsSearch({ instrument: value }).instrument).toBe('guitar');
  });

  it.each(BAD_VALUES)('falls back to the default view for %p', (value) => {
    expect(validateCircleOfFifthsSearch({ view: value }).view).toBe('diatonic');
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

  it('mixes borrowed chords into the triad and 7th rows by degree', () => {
    render(
      <CircleOfFifths selectedKey="C" instrument="guitar" view="borrowed" onChange={() => {}} />,
    );

    const row = (title: string): (string | null)[] =>
      [...(screen.getByText(title).closest('section')?.querySelectorAll('[data-row-slot]') ?? [])].map(
        (el) => el.getAttribute('data-numeral'),
      );

    expect(row('Triads — diatonic + borrowed')).toEqual([
      'I', 'i', 'bII', 'ii', 'II', 'bIII', 'iii', 'IV', 'iv', '#iv°',
      'V', 'v', 'bVI', 'vi', 'bVII', 'vii°',
    ]);
    expect(row('7th Chords — diatonic + borrowed')).toEqual([
      'Imaj7', 'ii7', 'iiø7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7',
    ]);
    expect(screen.getAllByTestId('borrowed-chord')).toHaveLength(10);
  });

  it('marks C\'s parallel minor (Cm, on the Eb spoke) only while borrowed is on', () => {
    const { container, rerender } = render(
      <CircleOfFifths selectedKey="C" instrument="guitar" view="borrowed" onChange={() => {}} />,
    );
    const spoke = container.querySelector('[data-testid="parallel-minor-spoke"]');
    expect(spoke?.closest('g')?.getAttribute('aria-label')).toBe('Eb major');

    rerender(<CircleOfFifths selectedKey="C" instrument="guitar" onChange={() => {}} />);
    expect(container.querySelector('[data-testid="parallel-minor-spoke"]')).toBeNull();
    expect(screen.getByText('Diatonic Triads')).toBeInTheDocument();
  });

  it('asks the route to switch borrowed chords on and off', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CircleOfFifths selectedKey="C" instrument="guitar" onChange={onChange} />,
    );

    const toggle = screen.getByRole('switch', { name: 'Show borrowed chords' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenLastCalledWith({ view: 'borrowed' });

    rerender(<CircleOfFifths selectedKey="C" instrument="guitar" view="borrowed" onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Show borrowed chords' }));
    expect(onChange).toHaveBeenLastCalledWith({ view: 'diatonic' });
  });
});

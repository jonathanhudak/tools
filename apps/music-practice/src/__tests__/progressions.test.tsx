/**
 * Progressions — route search validation, the dependent family/progression
 * rules, the controlled library, and a router round trip that proves a deep
 * link renders exactly the state it names.
 */
import { beforeAll, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import type * as ProgressionPlayerModule from '../components/shared/ProgressionPlayer';
import { Route, validateProgressionsSearch } from '../routes/progressions';
import { ProgressionLibrary } from '../components/Progressions/ProgressionLibrary';
import { routeTree } from '../routeTree.gen';

vi.mock('../components/shared/ProgressionPlayer', async (importOriginal) => {
  const actual = await importOriginal<typeof ProgressionPlayerModule>();
  return {
    ...actual,
    ProgressionPlayer: ({
      musicKey,
      bpm,
      onKeyChange,
      onBpmChange,
    }: {
      musicKey: string;
      bpm: number;
      onKeyChange: (key: string) => void;
      onBpmChange: (bpm: number) => void;
    }) => (
      <div>
        <span data-testid="player-key">{musicKey}</span>
        <span data-testid="player-bpm">{bpm}</span>
        <button onClick={() => onKeyChange('D')}>change-key</button>
        <button onClick={() => onBpmChange(140)}>change-bpm</button>
      </div>
    ),
  };
});

vi.mock('../components/shared/ChordCard', () => ({
  ChordCard: ({ chordName, instrument }: { chordName: string; instrument: string }) => (
    <div data-testid="chord-card" data-instrument={instrument}>
      {chordName}
    </div>
  ),
}));

const BAD_VALUES: Array<string | number> = ['toString', 'constructor', '__proto__', 'nope', 42];

const DEFAULTS = {
  family: 'jazz',
  progression: 'ii-V-I-major',
  key: 'C',
  bpm: 90,
  instrument: 'guitar',
};

describe('progressions validateSearch', () => {
  it('passes valid values through', () => {
    expect(
      validateProgressionsSearch({
        family: 'blues',
        progression: '12-bar-blues',
        key: 'Bb',
        bpm: 120,
        instrument: 'piano',
      }),
    ).toEqual({
      family: 'blues',
      progression: '12-bar-blues',
      key: 'Bb',
      bpm: 120,
      instrument: 'piano',
    });
  });

  it('returns all defaults for an empty search', () => {
    expect(validateProgressionsSearch({})).toEqual(DEFAULTS);
  });

  it.each(BAD_VALUES)('falls back to the default family for %p', (value) => {
    expect(validateProgressionsSearch({ family: value }).family).toBe('jazz');
  });

  it.each(BAD_VALUES)('falls back to the default progression for %p', (value) => {
    expect(validateProgressionsSearch({ progression: value }).progression).toBe('ii-V-I-major');
  });

  it.each(BAD_VALUES)('falls back to the default key for %p', (value) => {
    expect(validateProgressionsSearch({ key: value }).key).toBe('C');
  });

  it.each(BAD_VALUES)('falls back to the default instrument for %p', (value) => {
    expect(validateProgressionsSearch({ instrument: value }).instrument).toBe('guitar');
  });

  it.each([120, '120'])('accepts bpm %p', (value) => {
    expect(validateProgressionsSearch({ bpm: value }).bpm).toBe(120);
  });

  it.each(['abc', 12.5, 0, 9999])('falls back to the default bpm for %p', (value) => {
    expect(validateProgressionsSearch({ bpm: value }).bpm).toBe(90);
  });

  it('is the validator wired into the route', () => {
    expect(Route.options.validateSearch).toBe(validateProgressionsSearch);
  });
});

describe('progressions dependent settings', () => {
  it('lets a valid progression win over the family param', () => {
    expect(
      validateProgressionsSearch({ family: 'jazz', progression: '12-bar-blues' }),
    ).toMatchObject({ family: 'blues', progression: '12-bar-blues' });
  });

  it("rejects 'F#' because this page spells the key 'Gb'", () => {
    expect(validateProgressionsSearch({ key: 'F#' }).key).toBe('C');
  });

  it('picks the first progression of a valid family when none is given', () => {
    expect(validateProgressionsSearch({ family: 'pop' })).toMatchObject({
      family: 'pop',
      progression: 'I-V-vi-IV',
    });
  });

  it("uses the family's first progression when the progression is invalid", () => {
    expect(
      validateProgressionsSearch({ family: 'blues', progression: 'nope' }),
    ).toMatchObject({ family: 'blues', progression: '12-bar-blues' });
  });
});

describe('ProgressionLibrary component', () => {
  const baseProps = {
    family: 'jazz' as const,
    progression: 'ii-V-I-major',
    musicKey: 'C',
    bpm: 90,
    instrument: 'guitar' as const,
    onChange: () => {},
  };

  it('renders the family, progression, key, tempo and instrument passed in', () => {
    render(
      <ProgressionLibrary
        {...baseProps}
        family="blues"
        progression="12-bar-blues"
        musicKey="Bb"
        bpm={120}
        instrument="piano"
      />,
    );

    expect(screen.getByRole('heading', { name: '12-Bar Blues' })).toBeInTheDocument();
    expect(screen.getByTestId('player-key')).toHaveTextContent('Bb');
    expect(screen.getByTestId('player-bpm')).toHaveTextContent('120');
    const cards = screen.getAllByTestId('chord-card');
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((card) => expect(card).toHaveAttribute('data-instrument', 'piano'));
  });

  it('calls onChange with the new progression when one is picked', () => {
    const onChange = vi.fn();
    render(<ProgressionLibrary {...baseProps} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Tritone Substitution/ }));

    expect(onChange).toHaveBeenCalledWith({ progression: 'tritone-sub-ii-V' });
  });

  it('calls onChange with the new key when the key changes', () => {
    const onChange = vi.fn();
    render(<ProgressionLibrary {...baseProps} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'change-key' }));

    expect(onChange).toHaveBeenCalledWith({ key: 'D' });
  });

  it('calls onChange with the new instrument when the toggle changes', () => {
    const onChange = vi.fn();
    render(<ProgressionLibrary {...baseProps} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /piano/i }));

    expect(onChange).toHaveBeenCalledWith({ instrument: 'piano' });
  });

  it('clicking another family reports that family plus its first progression', () => {
    const onChange = vi.fn();
    render(<ProgressionLibrary {...baseProps} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'blues' }));

    expect(onChange).toHaveBeenCalledWith({ family: 'blues', progression: '12-bar-blues' });
  });
});

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

describe('progressions deep links', () => {
  it('renders ii-V-I in Bb at 120 bpm with piano diagrams from the URL', async () => {
    const history = createMemoryHistory({
      initialEntries: [
        '/progressions?family=jazz&progression=ii-V-I-major&key=Bb&bpm=120&instrument=piano',
      ],
    });
    const router = createRouter({ routeTree, history });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: 'ii-V-I Major' })).toBeInTheDocument();
    expect(screen.getByTestId('player-key')).toHaveTextContent('Bb');
    expect(screen.getByTestId('player-bpm')).toHaveTextContent('120');
    const cards = screen.getAllByTestId('chord-card');
    cards.forEach((card) => expect(card).toHaveAttribute('data-instrument', 'piano'));
  }, 20000);

  it('writes every param to the URL when a family is clicked', async () => {
    const history = createMemoryHistory({ initialEntries: ['/progressions'] });
    const router = createRouter({ routeTree, history });

    render(<RouterProvider router={router} />);

    await screen.findByRole('heading', { name: 'ii-V-I Major' });
    fireEvent.click(screen.getByRole('button', { name: 'blues' }));

    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        family: 'blues',
        progression: '12-bar-blues',
        key: 'C',
        bpm: 90,
        instrument: 'guitar',
      }),
    );
  }, 20000);
});

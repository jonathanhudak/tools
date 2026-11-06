/**
 * Chord-Scale — route search validation, the controlled matrix, and router
 * round trips that prove deep links and URL writes agree.
 */
import { beforeAll, describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import type * as RouterModule from '@tanstack/react-router';
import { Route, validateChordScaleSearch } from '../routes/chord-scale';
import { ChordScaleMatrix } from '../components/ChordScaleMatrix';
import { routeTree } from '../routeTree.gen';

// The matrix renders links to the Scale Explorer. A plain anchor keeps the
// component test router-free while the round trip below uses the real router.
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof RouterModule>();
  return {
    ...actual,
    Link: ({ children, className }: { children?: ReactNode; className?: string }) => (
      <a className={className}>{children}</a>
    ),
  };
});

vi.mock('../components/ChordScaleGame/ChordVoicingDisplay', () => ({
  ChordVoicingDisplay: ({ externalInstrument }: { externalInstrument?: string }) => (
    <div data-testid="voicing" data-instrument={externalInstrument} />
  ),
}));

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

describe('chord-scale validateSearch', () => {
  it('passes valid values through', () => {
    expect(
      validateChordScaleSearch({
        tab: 'practice',
        key: 'F#',
        scale: 'melodicMinor',
        instrument: 'banjo',
        view: 'diatonic',
      }),
    ).toEqual({
      tab: 'practice',
      key: 'F#',
      scale: 'melodicMinor',
      instrument: 'banjo',
      view: 'diatonic',
    });
  });

  it('keeps the borrowed view on the major scale', () => {
    expect(validateChordScaleSearch({ scale: 'major', view: 'borrowed' }).view).toBe('borrowed');
    expect(validateChordScaleSearch({ view: 'borrowed' }).view).toBe('borrowed');
  });

  it('drops the borrowed view for a non-major scale (borrowing is major-home only)', () => {
    expect(validateChordScaleSearch({ scale: 'harmonicMinor', view: 'borrowed' })).toMatchObject({
      scale: 'harmonicMinor',
      view: 'diatonic',
    });
  });

  it('returns all defaults for an empty search', () => {
    expect(validateChordScaleSearch({})).toEqual({
      tab: 'matrix',
      key: 'C',
      scale: 'major',
      instrument: 'guitar',
      view: 'diatonic',
    });
  });

  it.each(BAD_VALUES)('falls back to the default tab for %p', (value) => {
    expect(validateChordScaleSearch({ tab: value }).tab).toBe('matrix');
  });

  it.each(BAD_VALUES)('falls back to the default key for %p', (value) => {
    expect(validateChordScaleSearch({ key: value }).key).toBe('C');
  });

  it.each(BAD_VALUES)('falls back to the default scale for %p', (value) => {
    expect(validateChordScaleSearch({ scale: value }).scale).toBe('major');
  });

  it.each(BAD_VALUES)('falls back to the default instrument for %p', (value) => {
    expect(validateChordScaleSearch({ instrument: value }).instrument).toBe('guitar');
  });

  it.each(BAD_VALUES)('falls back to the default view for %p', (value) => {
    expect(validateChordScaleSearch({ view: value }).view).toBe('diatonic');
  });

  it("rejects 'Gb' because this page spells the key 'F#'", () => {
    expect(validateChordScaleSearch({ key: 'Gb' }).key).toBe('C');
  });

  it('is the validator wired into the route', () => {
    expect(Route.options.validateSearch).toBe(validateChordScaleSearch);
  });
});

describe('ChordScaleMatrix component', () => {
  it('renders the key, scale and instrument passed in as props', () => {
    render(
      <ChordScaleMatrix
        selectedKey="F#"
        selectedScaleType="melodicMinor"
        instrument="banjo"
        onChange={() => {}}
      />,
    );

    expect(screen.getAllByText('Lydian Dominant').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'F#' }).className).toContain('bg-[var(--accent)]');
    expect(screen.getByRole('button', { name: 'Melodic Minor' }).className).toContain(
      'bg-[var(--accent)]',
    );
  });

  it('calls onChange with the new key', () => {
    const onChange = vi.fn();
    render(
      <ChordScaleMatrix
        selectedKey="C"
        selectedScaleType="major"
        instrument="guitar"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'G' }));

    expect(onChange).toHaveBeenCalledWith({ key: 'G' });
  });

  it('calls onChange with the new scale', () => {
    const onChange = vi.fn();
    render(
      <ChordScaleMatrix
        selectedKey="C"
        selectedScaleType="major"
        instrument="guitar"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Harmonic Minor' }));

    expect(onChange).toHaveBeenCalledWith({ scale: 'harmonicMinor', view: 'diatonic' });
  });

  it('calls onChange with the new instrument', () => {
    const onChange = vi.fn();
    render(
      <ChordScaleMatrix
        selectedKey="C"
        selectedScaleType="major"
        instrument="guitar"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /piano/i }));

    expect(onChange).toHaveBeenCalledWith({ instrument: 'piano' });
  });

  it('mixes borrowed chords into the major degree row by degree', () => {
    const { container } = render(
      <ChordScaleMatrix
        selectedKey="C"
        selectedScaleType="major"
        instrument="guitar"
        view="borrowed"
        onChange={() => {}}
      />,
    );

    const slots = [...container.querySelectorAll('[data-row-slot]')];
    expect(slots.map((el) => el.getAttribute('data-numeral'))).toEqual([
      'IMaj7', 'i', 'bII', 'iim7', 'iiø7', 'II', 'bIII', 'iiim7', 'IVMaj7', 'iv', '#iv°',
      'V7', 'v', 'bVI', 'vim7', 'bVII', 'viim7b5',
    ]);
    expect(slots.filter((el) => el.getAttribute('data-row-slot') === 'borrowed')).toHaveLength(10);
    expect(screen.getAllByTestId('borrowed-chord')).toHaveLength(10);
    expect(screen.getByText('Fm')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Show borrowed chords' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('shows only the diatonic row when borrowed is off or the scale is not major', () => {
    const { container, rerender } = render(
      <ChordScaleMatrix selectedKey="C" selectedScaleType="major" instrument="guitar" onChange={() => {}} />,
    );
    expect(container.querySelectorAll('[data-row-slot="borrowed"]')).toHaveLength(0);

    rerender(
      <ChordScaleMatrix
        selectedKey="C"
        selectedScaleType="naturalMinor"
        instrument="guitar"
        view="borrowed"
        onChange={() => {}}
      />,
    );
    expect(container.querySelectorAll('[data-row-slot="borrowed"]')).toHaveLength(0);
    expect(screen.getByRole('switch', { name: 'Show borrowed chords' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('turning borrowed on also selects the major scale', () => {
    const onChange = vi.fn();
    render(
      <ChordScaleMatrix
        selectedKey="C"
        selectedScaleType="harmonicMinor"
        instrument="guitar"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('switch', { name: 'Show borrowed chords' }));

    expect(onChange).toHaveBeenCalledWith({ view: 'borrowed', scale: 'major' });
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

describe('deep links', () => {
  it('opens an F# melodic minor link and writes key changes back to the URL', async () => {
    const history = createMemoryHistory({
      initialEntries: ['/chord-scale?key=F%23&scale=melodicMinor'],
    });
    const router = createRouter({ routeTree, history });

    render(<RouterProvider router={router} />);

    expect((await screen.findAllByText('Lydian Dominant')).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'F#' }).className).toContain('bg-[var(--accent)]');

    fireEvent.click(screen.getByRole('button', { name: 'G' }));

    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({ key: 'G', scale: 'melodicMinor' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'F#' }));

    await waitFor(() => expect(router.state.location.href).toContain('key=F%23'));
  }, 20000);

  it('renders Eb with the piano selected from the circle-of-fifths URL', async () => {
    const history = createMemoryHistory({
      initialEntries: ['/circle-of-fifths?key=Eb&instrument=piano'],
    });
    const router = createRouter({ routeTree, history });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: /Eb Major/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /piano/i }).className).toContain(
      'bg-[var(--accent-color)]',
    );
  }, 20000);

  it('renders the practice quiz from the tab=practice URL', async () => {
    const history = createMemoryHistory({ initialEntries: ['/chord-scale?tab=practice'] });
    const router = createRouter({ routeTree, history });

    render(<RouterProvider router={router} />);

    expect(await screen.findByText('Chord-Scale Matrix Trainer')).toBeInTheDocument();
  }, 20000);

  it('restores the borrowed view from the URL', async () => {
    const history = createMemoryHistory({ initialEntries: ['/chord-scale?view=borrowed'] });
    const router = createRouter({ routeTree, history });

    render(<RouterProvider router={router} />);

    expect(
      (await screen.findAllByTestId('borrowed-chord')).length,
    ).toBe(10);
    expect(router.state.location.search).toMatchObject({ view: 'borrowed' });
  }, 20000);
});

/**
 * ChordScaleMatrix — Interactive Chord-Scale Reference
 *
 * All 7 degrees render as full cards with chord voicing + scale info.
 * Mobile: horizontal swipeable carousel
 * Desktop (lg+): 7-column grid
 */

import { useState, useMemo, useEffect } from 'react';
import { Badge } from '@hudak/ui/components/badge';
import { InstrumentToggle } from '../Piano/InstrumentToggle';
import { ScaleDisplay } from '../ScaleReference/ScaleDisplay';
import { ChordVoicingDisplay } from '../ChordScaleGame/ChordVoicingDisplay';
import type { Chord } from '@/lib/chord-library';
import {
  buildScaleChords,
  getModeNoteNames,
  getChordName,
  getChordForDegree,
  SCALE_TYPE_NAMES,
  type ScaleType,
  type Degree,
} from '@/data/chord-scale-matrix';

// ─── Constants ───────────────────────────────────────────────────────────────

const CHROMATIC_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
type RootKey = typeof CHROMATIC_KEYS[number];

const SCALE_TYPES: ScaleType[] = ['major', 'naturalMinor', 'melodicMinor', 'harmonicMinor'];

/** Modal character descriptions keyed by mode name */
const MODAL_CHARACTER: Record<string, { character: string; function: string; color: string }> = {
  Ionian:              { character: 'Bright, resolved, happy', function: 'Tonic — home, resolution', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  Dorian:              { character: 'Jazzy, sophisticated, minor with major feel', function: 'Supertonic — prep to IV or V', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  Phrygian:            { character: 'Dark, Spanish, exotic', function: 'Mediant — moody, rarely primary', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' },
  Lydian:              { character: 'Bright, lifted, dreamy', function: 'Subdominant — lift, transition', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  Mixolydian:          { character: 'Blues, funky, dominant feel', function: 'Dominant — tension, pulls to I', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  Aeolian:             { character: 'Minor, melancholic, introspective', function: 'Submediant — natural minor', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
  Locrian:             { character: 'Diminished, very tense', function: 'Leading tone — avoid (tritone)', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  'Melodic Minor':     { character: 'Jazz minor, ascending feel', function: 'Tonic minor with major 7', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
  'Dorian b2':         { character: 'Phrygian-like but softer', function: 'Supertonic minor', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  'Lydian Augmented':  { character: 'Bright with augmented 5th', function: 'Bright, chromatic mediant', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  'Lydian Dominant':   { character: 'Floating, dreamy — blues meets Lydian', function: 'Subdominant dominant 7', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  'Mixolydian b6':     { character: 'Bluesy with minor color', function: 'Dominant with dark coloring', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  'Locrian #2':        { character: 'Locrian but less tense', function: 'Half-diminished source', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  'Super Locrian (Altered)': { character: 'Maximally altered — jazz tension', function: 'Altered dominant source', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
  'Harmonic Minor':    { character: 'Classical, haunting gap between 6 and 7', function: 'Tonic minor with raised 7', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
  'Locrian #6':        { character: 'Locrian with natural 6 — slightly less bleak', function: 'Half-diminished flavor', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  'Ionian #5':         { character: 'Major with raised 5th — bright and unusual', function: 'Augmented mediant', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  'Dorian #4':         { character: 'Dorian with Lydian lift on the 4th', function: 'Minor subdominant', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  'Phrygian Dominant': { character: 'Flamenco, Middle Eastern sound', function: 'Major dominant in minor key', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' },
  'Lydian #2':         { character: 'Lydian with raised 2nd — exotic brightness', function: 'Major submediant', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  'Super Locrian bb7': { character: 'Fully diminished — maximum tension', function: 'Diminished leading tone', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
};

// ─── Chord library hook ───────────────────────────────────────────────────────

function useChordForDegree(
  scaleType: ScaleType,
  degree: Degree,
  rootKey: string,
): Chord | null {
  const [chord, setChord] = useState<Chord | null>(null);
  useEffect(() => {
    let cancelled = false;
    getChordForDegree(scaleType, degree, rootKey).then(c => {
      if (!cancelled) setChord(c ?? null);
    });
    return () => { cancelled = true; };
  }, [scaleType, degree, rootKey]);
  return chord;
}

// ─── Full degree card (replaces old DegreeCard + DegreeDetail) ───────────────

interface FullDegreeCardProps {
  entry: ReturnType<typeof buildScaleChords>[number];
  rootKey: RootKey;
  instrument: 'guitar' | 'piano';
  onInstrumentChange: (i: 'guitar' | 'piano') => void;
}

function FullDegreeCard({ entry, rootKey, instrument, onInstrumentChange }: FullDegreeCardProps) {
  const chordName = useMemo(
    () => getChordName(entry.scaleType, entry.degree, rootKey),
    [entry.scaleType, entry.degree, rootKey],
  );
  const noteNames = useMemo(
    () => getModeNoteNames(entry.scaleType, entry.degree, rootKey),
    [entry.scaleType, entry.degree, rootKey],
  );
  const modal = MODAL_CHARACTER[entry.modeName];
  const chord = useChordForDegree(entry.scaleType, entry.degree as Degree, rootKey);

  return (
    <div
      className="rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] overflow-hidden"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Header */}
      <div className="p-3 border-b border-[var(--border-medium)]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[10px] text-[var(--ink-tertiary)] uppercase tracking-widest">
              {entry.romanNumeral}
            </p>
            <h3
              className="text-lg font-semibold text-[var(--ink-primary)] leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {chordName}
            </h3>
            <p className="text-[11px] text-[var(--ink-secondary)]">{entry.modeName}</p>
          </div>
          {modal && (
            <Badge className={`text-[10px] shrink-0 ${modal.color}`}>{entry.chordQuality}</Badge>
          )}
        </div>

        {/* Note pills */}
        <div className="flex flex-wrap gap-0.5 mt-2">
          {noteNames.map((n, i) => (
            <span
              key={i}
              className={[
                'font-mono text-[10px] px-1.5 py-0.5 rounded',
                i === 0
                  ? 'bg-[var(--accent)] text-white font-semibold'
                  : 'bg-[var(--surface-subtle)] text-[var(--ink-secondary)]',
              ].join(' ')}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Chord voicing — renders immediately, no click needed */}
      <div className="p-3">
        {chord ? (
          <ChordVoicingDisplay
            chord={chord}
            voicingIndex={entry.voicingIndex ?? 0}
            externalInstrument={instrument}
            onInstrumentChange={onInstrumentChange}
          />
        ) : entry.chordId ? (
          <div className="py-6 text-center">
            <p className="text-xs text-[var(--ink-tertiary)] italic">Loading…</p>
          </div>
        ) : null}
      </div>

      {/* Modal character — compact */}
      {modal && (
        <div className="px-3 pb-3">
          <p className="text-[10px] text-[var(--ink-secondary)] leading-snug italic">
            {modal.character}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ChordScaleMatrixProps {
  initialKey?: RootKey;
  initialScaleType?: ScaleType;
}

export function ChordScaleMatrix({
  initialKey = 'C',
  initialScaleType = 'major',
}: ChordScaleMatrixProps) {
  const [selectedKey, setSelectedKey] = useState<RootKey>(initialKey);
  const [selectedScale, setSelectedScale] = useState<ScaleType>(initialScaleType);
  const [instrument, setInstrument] = useState<'guitar' | 'piano'>('guitar');

  const degrees = useMemo(() => buildScaleChords(selectedScale), [selectedScale]);

  return (
    <div className="space-y-5">
      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Key picker */}
        <div>
          <p className="text-[10px] font-medium text-[var(--ink-tertiary)] uppercase tracking-wide mb-1.5">
            Key
          </p>
          <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {CHROMATIC_KEYS.map(key => (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={[
                  'font-mono text-sm px-2.5 py-1 rounded-lg border transition-all flex-shrink-0',
                  selectedKey === key
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white font-semibold'
                    : 'border-[var(--border-medium)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:border-[var(--accent)] hover:text-[var(--ink-primary)]',
                ].join(' ')}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Scale type + Instrument toggle */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {SCALE_TYPES.map(scale => (
              <button
                key={scale}
                onClick={() => setSelectedScale(scale)}
                className={[
                  'text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all flex-shrink-0',
                  selectedScale === scale
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-[var(--border-medium)] text-[var(--ink-secondary)] hover:border-[var(--accent)]',
                ].join(' ')}
              >
                {SCALE_TYPE_NAMES[scale]}
              </button>
            ))}
          </div>
          <InstrumentToggle instrument={instrument} onChange={setInstrument} />
        </div>
      </div>

      {/* ── Degree cards — break out of max-w container on lg+ ────── */}
      <div className="lg:w-[100vw] lg:relative lg:left-1/2 lg:-translate-x-1/2">
        {/* Mobile: horizontal swipeable carousel */}
        <div
          className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory px-4 lg:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {degrees.map(entry => (
            <div
              key={`${entry.degree}-${selectedScale}-${selectedKey}`}
              className="snap-start flex-shrink-0 w-[75vw] sm:w-[280px]"
            >
              <FullDegreeCard
                entry={entry}
                rootKey={selectedKey}
                instrument={instrument}
                onInstrumentChange={setInstrument}
              />
            </div>
          ))}
        </div>

        {/* Desktop (lg+): all 7 visible in a grid */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-3 px-8">
          {degrees.map(entry => (
            <FullDegreeCard
              key={`${entry.degree}-${selectedScale}-${selectedKey}`}
              entry={entry}
              rootKey={selectedKey}
              instrument={instrument}
              onInstrumentChange={setInstrument}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

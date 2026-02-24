/**
 * ChordScaleMatrix — Interactive Chord-Scale Reference
 *
 * The visual 7-column grid from Jeff Schneider's system.
 * Pick any key and scale type to see all 7 degrees: chord name,
 * Roman numeral, mode, and notes. Click a column to expand details.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@hudak/ui/components/badge';
import { InstrumentToggle } from '../Piano/InstrumentToggle';
import { ScaleDisplay } from '../ScaleReference/ScaleDisplay';
import {
  buildScaleChords,
  getModeNoteNames,
  getChordName,
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
  // Melodic minor modes
  'Melodic Minor':     { character: 'Jazz minor, ascending feel', function: 'Tonic minor with major 7', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
  'Dorian b2':         { character: 'Phrygian-like but softer', function: 'Supertonic minor', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  'Lydian Augmented':  { character: 'Bright with augmented 5th', function: 'Bright, chromatic mediant', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  'Lydian Dominant':   { character: 'Floating, dreamy — blues meets Lydian', function: 'Subdominant dominant 7', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  'Mixolydian b6':     { character: 'Bluesy with minor color', function: 'Dominant with dark coloring', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  'Locrian #2':        { character: 'Locrian but less tense', function: 'Half-diminished source', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  'Super Locrian (Altered)': { character: 'Maximally altered — jazz tension', function: 'Altered dominant source', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
  // Harmonic minor modes
  'Harmonic Minor':    { character: 'Classical, haunting gap between 6 and 7', function: 'Tonic minor with raised 7', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
  'Locrian #6':        { character: 'Locrian with natural 6 — slightly less bleak', function: 'Half-diminished flavor', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  'Ionian #5':         { character: 'Major with raised 5th — bright and unusual', function: 'Augmented mediant', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  'Dorian #4':         { character: 'Dorian with Lydian lift on the 4th', function: 'Minor subdominant', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  'Phrygian Dominant': { character: 'Flamenco, Middle Eastern sound', function: 'Major dominant in minor key', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' },
  'Lydian #2':         { character: 'Lydian with raised 2nd — exotic brightness', function: 'Major submediant', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  'Super Locrian bb7': { character: 'Fully diminished — maximum tension', function: 'Diminished leading tone', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface DegreeColumnProps {
  entry: ReturnType<typeof buildScaleChords>[number];
  rootKey: RootKey;
  isSelected: boolean;
  onSelect: () => void;
  instrument: 'guitar' | 'piano';
}

function DegreeColumn({ entry, rootKey, isSelected, onSelect, instrument }: DegreeColumnProps) {
  const chordName = useMemo(
    () => getChordName(entry.scaleType, entry.degree, rootKey),
    [entry.scaleType, entry.degree, rootKey],
  );
  const noteNames = useMemo(
    () => getModeNoteNames(entry.scaleType, entry.degree, rootKey),
    [entry.scaleType, entry.degree, rootKey],
  );

  return (
    <div className="flex flex-col">
      {/* Column header card */}
      <button
        onClick={onSelect}
        className={[
          'flex flex-col gap-1 p-3 rounded-xl border-2 transition-all text-left w-full',
          'hover:border-[var(--accent)] hover:bg-[var(--surface-subtle)]',
          isSelected
            ? 'border-[var(--accent)] bg-[var(--accent-light)] shadow-md'
            : 'border-[var(--border-medium)] bg-[var(--surface-card)]',
        ].join(' ')}
      >
        {/* Roman numeral */}
        <span className="font-mono text-xs text-[var(--ink-tertiary)] uppercase tracking-widest">
          {entry.romanNumeral}
        </span>

        {/* Chord name */}
        <span
          className="font-display font-semibold text-base leading-tight text-[var(--ink-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {chordName}
        </span>

        {/* Mode name */}
        <span className="text-xs text-[var(--ink-secondary)]">{entry.modeName}</span>

        {/* Note names — compact pill row */}
        <div className="flex flex-wrap gap-0.5 mt-1">
          {noteNames.map((n, i) => (
            <span
              key={i}
              className="font-mono text-[10px] px-1 py-0.5 rounded bg-[var(--surface-subtle)] text-[var(--ink-secondary)]"
            >
              {n}
            </span>
          ))}
        </div>

        {/* Expand indicator */}
        <div className="flex justify-end mt-1">
          {isSelected ? (
            <ChevronUp className="w-3 h-3 text-[var(--accent)]" />
          ) : (
            <ChevronDown className="w-3 h-3 text-[var(--ink-tertiary)]" />
          )}
        </div>
      </button>

      {/* Expanded detail panel — only on mobile (below the column) */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden md:hidden"
          >
            <DegreeDetail entry={entry} rootKey={rootKey} chordName={chordName} noteNames={noteNames} instrument={instrument} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DegreeDetailProps {
  entry: ReturnType<typeof buildScaleChords>[number];
  rootKey: RootKey;
  chordName: string;
  noteNames: string[];
  instrument: 'guitar' | 'piano';
}

function DegreeDetail({ entry, rootKey, chordName, noteNames, instrument }: DegreeDetailProps) {
  const modal = MODAL_CHARACTER[entry.modeName];

  return (
    <div
      className="p-4 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] shadow-md space-y-4"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-[var(--ink-tertiary)] uppercase tracking-widest mb-0.5">
            Degree {entry.degree} · {entry.romanNumeral}
          </p>
          <h3
            className="text-xl font-semibold text-[var(--ink-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {chordName}
          </h3>
          <p className="text-sm text-[var(--ink-secondary)]">{entry.modeName}</p>
        </div>
        {modal && (
          <Badge className={`text-xs shrink-0 ${modal.color}`}>{entry.chordQuality}</Badge>
        )}
      </div>

      {/* Notes */}
      <div>
        <p className="text-xs font-medium text-[var(--ink-tertiary)] uppercase tracking-wide mb-1">Notes</p>
        <div className="flex flex-wrap gap-1">
          {noteNames.map((n, i) => (
            <span
              key={i}
              className={[
                'font-mono text-sm px-2 py-1 rounded-lg',
                i === 0
                  ? 'bg-[var(--accent)] text-white font-semibold'
                  : 'bg-[var(--surface-subtle)] text-[var(--ink-primary)]',
              ].join(' ')}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Modal character */}
      {modal && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--ink-tertiary)] uppercase tracking-wide">Character</p>
          <p className="text-sm text-[var(--ink-primary)]">{modal.character}</p>
          <p className="text-xs text-[var(--ink-secondary)]">{modal.function}</p>
        </div>
      )}

      {/* Scale diagram */}
      <div>
        <p className="text-xs font-medium text-[var(--ink-tertiary)] uppercase tracking-wide mb-2">Scale Diagram</p>
        <ScaleDisplay
          scaleType={entry.scaleType}
          degree={entry.degree as Degree}
          modeName={entry.modeName}
          instrument={instrument}
          rootKey={rootKey}
        />
      </div>
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
  const [selectedDegree, setSelectedDegree] = useState<number | null>(null);
  const [instrument, setInstrument] = useState<'guitar' | 'piano'>('piano');

  const degrees = useMemo(() => buildScaleChords(selectedScale), [selectedScale]);

  const selectedEntry = useMemo(
    () => selectedDegree !== null ? degrees.find(d => d.degree === selectedDegree) : null,
    [degrees, selectedDegree],
  );

  const selectedChordName = useMemo(
    () => selectedEntry ? getChordName(selectedEntry.scaleType, selectedEntry.degree, selectedKey) : '',
    [selectedEntry, selectedKey],
  );

  const selectedNoteNames = useMemo(
    () => selectedEntry ? getModeNoteNames(selectedEntry.scaleType, selectedEntry.degree, selectedKey) : [],
    [selectedEntry, selectedKey],
  );

  const handleDegreeSelect = (degree: number) => {
    setSelectedDegree(prev => prev === degree ? null : degree);
  };

  const handleScaleChange = (scale: ScaleType) => {
    setSelectedScale(scale);
    setSelectedDegree(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Controls bar ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Key picker */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--ink-tertiary)] uppercase tracking-wide">Key</p>
          <div className="flex flex-wrap gap-1">
            {CHROMATIC_KEYS.map(key => (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={[
                  'font-mono text-sm px-2.5 py-1 rounded-lg border transition-all',
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

        {/* Instrument toggle */}
        <InstrumentToggle
          instrument={instrument}
          onChange={setInstrument}
        />
      </div>

      {/* Scale type tabs */}
      <div className="flex flex-wrap gap-2">
        {SCALE_TYPES.map(scale => (
          <button
            key={scale}
            onClick={() => handleScaleChange(scale)}
            className={[
              'text-sm px-4 py-2 rounded-full border-2 font-medium transition-all',
              selectedScale === scale
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                : 'border-[var(--border-medium)] text-[var(--ink-secondary)] hover:border-[var(--accent)]',
            ].join(' ')}
          >
            {SCALE_TYPE_NAMES[scale]}
          </button>
        ))}
      </div>

      {/* ── Grid + Detail (desktop side-by-side) ─────────────── */}
      <div className="flex gap-6">
        {/* 7-column grid */}
        <div className="flex-1 min-w-0">
          {/* Column header row */}
          <div className="grid grid-cols-7 gap-2 mb-1 px-1">
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <div key={d} className="text-center text-[10px] font-mono text-[var(--ink-tertiary)] uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Degree columns */}
          <div className="grid grid-cols-7 gap-2">
            {degrees.map(entry => (
              <DegreeColumn
                key={entry.degree}
                entry={entry}
                rootKey={selectedKey}
                isSelected={selectedDegree === entry.degree}
                onSelect={() => handleDegreeSelect(entry.degree)}
                instrument={instrument}
              />
            ))}
          </div>
        </div>

        {/* Detail panel — desktop only (right side) */}
        <AnimatePresence mode="wait">
          {selectedEntry && (
            <motion.div
              key={`${selectedEntry.degree}-${selectedScale}-${selectedKey}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="hidden md:block w-72 shrink-0"
            >
              <DegreeDetail
                entry={selectedEntry}
                rootKey={selectedKey}
                chordName={selectedChordName}
                noteNames={selectedNoteNames}
                instrument={instrument}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {!selectedDegree && (
        <p className="text-center text-sm text-[var(--ink-tertiary)] mt-2">
          Click any degree column to see chord details
        </p>
      )}
    </div>
  );
}

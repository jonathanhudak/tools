/**
 * ChordScaleMatrix — Interactive Chord-Scale Reference
 *
 * The visual 7-column grid from Jeff Schneider's system.
 * Pick any key and scale type to see all 7 degrees: chord name,
 * Roman numeral, mode, and notes. Click a column to expand details.
 *
 * Mobile: horizontal scroll carousel (one card visible at a time, swipe through)
 * Desktop: 7-column grid with right-side detail panel
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@hudak/ui/components/badge';
import { InstrumentToggle } from '../Piano/InstrumentToggle';
import { ScaleDisplay } from '../ScaleReference/ScaleDisplay';
import { ChordVoicingDisplay } from '../ChordScaleGame/ChordVoicingDisplay';
import type { Chord } from '@/lib/chord-library';
import {
  buildScaleChords,
  getModeNoteNames,
  getChordName,
  getChordFromLibrary,
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

/** Async-loads a chord from the chord library by its chordId */
function useChordFromLibrary(chordId: string | undefined): Chord | null {
  const [chord, setChord] = useState<Chord | null>(null);
  useEffect(() => {
    if (!chordId) { setChord(null); return; }
    let cancelled = false;
    getChordFromLibrary(chordId).then(c => {
      if (!cancelled) setChord(c ?? null);
    });
    return () => { cancelled = true; };
  }, [chordId]);
  return chord;
}

// ─── Degree card (shared between mobile + desktop) ────────────────────────────

interface DegreeCardProps {
  entry: ReturnType<typeof buildScaleChords>[number];
  rootKey: RootKey;
  isSelected: boolean;
  onSelect: () => void;
  compact?: boolean; // mobile: hide note pills to save space
}

function DegreeCard({ entry, rootKey, isSelected, onSelect, compact }: DegreeCardProps) {
  const chordName = useMemo(
    () => getChordName(entry.scaleType, entry.degree, rootKey),
    [entry.scaleType, entry.degree, rootKey],
  );
  const noteNames = useMemo(
    () => getModeNoteNames(entry.scaleType, entry.degree, rootKey),
    [entry.scaleType, entry.degree, rootKey],
  );

  return (
    <button
      onClick={onSelect}
      className={[
        'flex flex-col gap-1 p-3 rounded-xl border-2 transition-all text-left w-full h-full',
        'hover:border-[var(--accent)] hover:bg-[var(--surface-subtle)]',
        isSelected
          ? 'border-[var(--accent)] bg-[var(--accent-light)] shadow-md'
          : 'border-[var(--border-medium)] bg-[var(--surface-card)]',
      ].join(' ')}
    >
      {/* Roman numeral */}
      <span className="font-mono text-[10px] text-[var(--ink-tertiary)] uppercase tracking-widest">
        {entry.romanNumeral}
      </span>

      {/* Chord name */}
      <span
        className="font-semibold text-sm leading-tight text-[var(--ink-primary)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {chordName}
      </span>

      {/* Mode name */}
      <span className="text-[10px] text-[var(--ink-secondary)] leading-snug">{entry.modeName}</span>

      {/* Note pills — hidden on compact/mobile */}
      {!compact && (
        <div className="flex flex-wrap gap-0.5 mt-1">
          {noteNames.map((n, i) => (
            <span
              key={i}
              className={[
                'font-mono text-[9px] px-1 py-0.5 rounded',
                i === 0
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--surface-subtle)] text-[var(--ink-secondary)]',
              ].join(' ')}
            >
              {n}
            </span>
          ))}
        </div>
      )}

      {/* Expand chevron */}
      <div className="flex justify-end mt-auto pt-1">
        {isSelected
          ? <ChevronUp className="w-3 h-3 text-[var(--accent)]" />
          : <ChevronDown className="w-3 h-3 text-[var(--ink-tertiary)]" />}
      </div>
    </button>
  );
}

// ─── Degree detail panel ──────────────────────────────────────────────────────

interface DegreeDetailProps {
  entry: ReturnType<typeof buildScaleChords>[number];
  rootKey: RootKey;
  instrument: 'guitar' | 'piano';
  onInstrumentChange: (i: 'guitar' | 'piano') => void;
}

function DegreeDetail({ entry, rootKey, instrument, onInstrumentChange }: DegreeDetailProps) {
  const chordName = useMemo(
    () => getChordName(entry.scaleType, entry.degree, rootKey),
    [entry.scaleType, entry.degree, rootKey],
  );
  const noteNames = useMemo(
    () => getModeNoteNames(entry.scaleType, entry.degree, rootKey),
    [entry.scaleType, entry.degree, rootKey],
  );
  const modal = MODAL_CHARACTER[entry.modeName];
  // Async-load chord voicing from library
  const chord = useChordFromLibrary(entry.chordId);

  return (
    <div
      className="p-4 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] space-y-4"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] text-[var(--ink-tertiary)] uppercase tracking-widest mb-0.5">
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
        <p className="text-[10px] font-medium text-[var(--ink-tertiary)] uppercase tracking-wide mb-1.5">
          Notes
        </p>
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
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium text-[var(--ink-tertiary)] uppercase tracking-wide">
            Character
          </p>
          <p className="text-sm text-[var(--ink-primary)]">{modal.character}</p>
          <p className="text-xs text-[var(--ink-secondary)]">{modal.function}</p>
        </div>
      )}

      {/* ── Instrument toggle (shared for both diagrams below) ── */}
      <InstrumentToggle instrument={instrument} onChange={onInstrumentChange} />

      {/* ── Chord voicing (tablature / piano chord) ────────────── */}
      {chord ? (
        <div>
          <p className="text-[10px] font-medium text-[var(--ink-tertiary)] uppercase tracking-wide mb-2">
            Chord Voicing
          </p>
          <ChordVoicingDisplay
            chord={chord}
            voicingIndex={entry.voicingIndex ?? 0}
            externalInstrument={instrument}
            onInstrumentChange={onInstrumentChange}
          />
        </div>
      ) : entry.chordId ? (
        <p className="text-xs text-[var(--ink-tertiary)] italic">Loading voicing…</p>
      ) : null}

      {/* ── Scale diagram (ascending scale on tab / piano) ─────── */}
      <div>
        <p className="text-[10px] font-medium text-[var(--ink-tertiary)] uppercase tracking-wide mb-2">
          Scale Run
        </p>
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

// ─── Mobile carousel ──────────────────────────────────────────────────────────

interface MobileCarouselProps {
  degrees: ReturnType<typeof buildScaleChords>;
  rootKey: RootKey;
  selectedDegree: number | null;
  onSelect: (degree: number) => void;
  instrument: 'guitar' | 'piano';
  onInstrumentChange: (i: 'guitar' | 'piano') => void;
}

function MobileCarousel({
  degrees, rootKey, selectedDegree, onSelect, instrument, onInstrumentChange,
}: MobileCarouselProps) {
  const [activePage, setActivePage] = useState(0);

  const goLeft = () => setActivePage(p => Math.max(0, p - 1));
  const goRight = () => setActivePage(p => Math.min(degrees.length - 1, p + 1));

  const entry = degrees[activePage];
  const isSelected = selectedDegree === entry.degree;

  // When scale type changes, reset to page 0
  useEffect(() => { setActivePage(0); }, [degrees]);

  return (
    <div className="space-y-3">
      {/* Navigation row */}
      <div className="flex items-center gap-2">
        <button
          onClick={goLeft}
          disabled={activePage === 0}
          className="p-2 rounded-lg border border-[var(--border-medium)] bg-[var(--surface-card)] disabled:opacity-30 transition-opacity"
          aria-label="Previous degree"
        >
          <ChevronLeft className="w-4 h-4 text-[var(--ink-secondary)]" />
        </button>

        {/* Degree dot indicators */}
        <div className="flex gap-1.5 flex-1 justify-center">
          {degrees.map((d, i) => (
            <button
              key={d.degree}
              onClick={() => setActivePage(i)}
              className={[
                'w-2 h-2 rounded-full transition-all',
                i === activePage
                  ? 'bg-[var(--accent)] scale-125'
                  : 'bg-[var(--border-medium)]',
              ].join(' ')}
              aria-label={`Degree ${d.degree}`}
            />
          ))}
        </div>

        <button
          onClick={goRight}
          disabled={activePage === degrees.length - 1}
          className="p-2 rounded-lg border border-[var(--border-medium)] bg-[var(--surface-card)] disabled:opacity-30 transition-opacity"
          aria-label="Next degree"
        >
          <ChevronRight className="w-4 h-4 text-[var(--ink-secondary)]" />
        </button>
      </div>

      {/* Active degree card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${entry.degree}-${entry.scaleType}-${rootKey}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.15 }}
        >
          <DegreeCard
            entry={entry}
            rootKey={rootKey}
            isSelected={isSelected}
            onSelect={() => onSelect(entry.degree)}
            compact
          />
        </motion.div>
      </AnimatePresence>

      {/* Expanded detail — always shown on mobile below the card */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <DegreeDetail
              entry={entry}
              rootKey={rootKey}
              instrument={instrument}
              onInstrumentChange={onInstrumentChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
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

  const handleDegreeSelect = (degree: number) => {
    setSelectedDegree(prev => prev === degree ? null : degree);
  };

  const handleScaleChange = (scale: ScaleType) => {
    setSelectedScale(scale);
    setSelectedDegree(null);
  };

  return (
    <div className="space-y-5">
      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Key picker — horizontal scroll on mobile */}
        <div>
          <p className="text-[10px] font-medium text-[var(--ink-tertiary)] uppercase tracking-wide mb-1.5">
            Key
          </p>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
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

        {/* Scale type tabs — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {SCALE_TYPES.map(scale => (
            <button
              key={scale}
              onClick={() => handleScaleChange(scale)}
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
      </div>

      {/* ── Mobile: Carousel (hidden on md+) ─────────────────────── */}
      <div className="md:hidden">
        <MobileCarousel
          degrees={degrees}
          rootKey={selectedKey}
          selectedDegree={selectedDegree}
          onSelect={handleDegreeSelect}
          instrument={instrument}
          onInstrumentChange={setInstrument}
        />
      </div>

      {/* ── Desktop: Grid + detail panel (hidden below md) ───────── */}
      <div className="hidden md:flex gap-6">
        {/* 7-column grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-7 gap-2 mb-1 px-0.5">
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <div key={d} className="text-center text-[9px] font-mono text-[var(--ink-tertiary)] uppercase">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {degrees.map(entry => (
              <DegreeCard
                key={entry.degree}
                entry={entry}
                rootKey={selectedKey}
                isSelected={selectedDegree === entry.degree}
                onSelect={() => handleDegreeSelect(entry.degree)}
              />
            ))}
          </div>
          {!selectedDegree && (
            <p className="text-center text-xs text-[var(--ink-tertiary)] mt-3">
              Click any degree to see chord voicing + scale run
            </p>
          )}
        </div>

        {/* Detail panel — right side */}
        <AnimatePresence mode="wait">
          {selectedEntry && (
            <motion.div
              key={`${selectedEntry.degree}-${selectedScale}-${selectedKey}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="w-80 shrink-0"
            >
              <DegreeDetail
                entry={selectedEntry}
                rootKey={selectedKey}
                instrument={instrument}
                onInstrumentChange={setInstrument}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

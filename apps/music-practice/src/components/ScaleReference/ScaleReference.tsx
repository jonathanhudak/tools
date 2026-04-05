/**
 * ScaleReference - Interactive scale family explorer
 *
 * Flat grid layout (no accordions). Click a degree to see its full
 * detail panel with fretboard, piano, and staff notation.
 * UX mirrors the chord-scale matrix and circle-of-fifths pages.
 */

import { useState, useMemo } from 'react';
import { Badge } from '@hudak/ui/components/badge';
import { Note } from 'tonal';
import { GuitarFretboard } from '../GuitarFretboard/GuitarFretboard';
import { PianoScaleDiagram } from './PianoScaleDiagram';
import { StaffDisplay } from '../notation/StaffDisplay';
import { ChordVoicingDisplay } from '../ChordScaleGame/ChordVoicingDisplay';
import { getChordById } from '@/lib/chord-library';
import {
  buildScaleChords,
  getModeNotes,
  getModeNoteNames,
  SCALE_TYPE_NAMES,
  type ScaleType,
  type Degree,
} from '../../data/chord-scale-matrix';

interface ScaleReferenceProps {
  onBack: () => void;
}

const SCALE_TYPES: ScaleType[] = ['major', 'naturalMinor', 'melodicMinor', 'harmonicMinor'];

const SCALE_DESCRIPTIONS: Record<ScaleType, string> = {
  major: 'The foundation of Western harmony. All 7 modes derive from this scale.',
  naturalMinor: 'The relative minor — same notes as major, starting from degree 6 (Aeolian mode).',
  melodicMinor: 'Minor scale with raised 6th and 7th. Source of Lydian Dominant and Altered scales.',
  harmonicMinor: 'Minor scale with raised 7th only. Creates the dominant V7 chord in minor keys.',
};

const ROOT_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export function ScaleReference({ onBack }: ScaleReferenceProps): JSX.Element {
  const [activeScale, setActiveScale] = useState<ScaleType>('major');
  const [selectedDegree, setSelectedDegree] = useState<Degree>(1);
  const [rootKey, setRootKey] = useState('C');
  const [showDegreeNumbers, setShowDegreeNumbers] = useState(false);

  const degrees = buildScaleChords(activeScale);
  const selectedEntry = degrees.find(d => d.degree === selectedDegree)!;

  // Compute notes for the selected degree/mode
  const modeNotes = useMemo(
    () => getModeNotes(activeScale, selectedDegree, rootKey, 3),
    [activeScale, selectedDegree, rootKey]
  );
  const modeNoteNames = useMemo(
    () => getModeNoteNames(activeScale, selectedDegree, rootKey),
    [activeScale, selectedDegree, rootKey]
  );
  const pitchClasses = useMemo(
    () => modeNotes.map(n => Note.get(n).pc),
    [modeNotes]
  );
  const modeRoot = pitchClasses[0] || rootKey;

  // Piano notes (octave 4 for better rendering)
  const pianoNotes = useMemo(
    () => getModeNotes(activeScale, selectedDegree, rootKey, 4),
    [activeScale, selectedDegree, rootKey]
  );

  // Chord for this degree
  const chord = selectedEntry.chordId ? getChordById(selectedEntry.chordId) : undefined;

  return (
    <div className="space-y-6">
      {/* ── Scale Family Tabs ──────────────────────────── */}
      <div className="flex gap-1 border-b border-[var(--border-subtle)] pb-0 overflow-x-auto">
        {SCALE_TYPES.map(scale => (
          <button
            key={scale}
            onClick={() => { setActiveScale(scale); setSelectedDegree(1); }}
            className={[
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap',
              activeScale === scale
                ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--border-strong)]',
            ].join(' ')}
          >
            {SCALE_TYPE_NAMES[scale]}
          </button>
        ))}
      </div>

      {/* ── Controls row ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[var(--ink-secondary)] uppercase tracking-wider">Key</label>
          <select
            value={rootKey}
            onChange={e => setRootKey(e.target.value)}
            className="text-sm px-2 py-1 bg-[hsl(var(--color-card))] border border-[var(--border-subtle)] text-[var(--ink-primary)] font-mono-app"
          >
            {ROOT_KEYS.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--ink-secondary)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDegreeNumbers}
            onChange={e => setShowDegreeNumbers(e.target.checked)}
            className="accent-[var(--accent-color)]"
          />
          Degree numbers on fretboard
        </label>
        <p className="text-xs text-[var(--ink-tertiary)] ml-auto hidden sm:block">
          {SCALE_DESCRIPTIONS[activeScale]}
        </p>
      </div>

      {/* ── Degree Grid ────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {degrees.map(entry => {
          const isActive = selectedDegree === entry.degree;
          return (
            <button
              key={entry.degree}
              onClick={() => setSelectedDegree(entry.degree as Degree)}
              className={[
                'flex flex-col items-center gap-1 p-2 sm:p-3 text-center transition-all border-2',
                isActive
                  ? 'border-[var(--accent-color)] bg-[var(--accent-light)]'
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[hsl(var(--color-card))]',
              ].join(' ')}
            >
              <span className={[
                'text-[10px] sm:text-xs font-mono-app',
                isActive ? 'text-[var(--accent-color)]' : 'text-[var(--ink-tertiary)]',
              ].join(' ')}>
                {entry.romanNumeral}
              </span>
              <span className={[
                'text-xs sm:text-sm font-semibold leading-tight',
                isActive ? 'text-[var(--ink-primary)]' : 'text-[var(--ink-secondary)]',
              ].join(' ')}>
                {entry.modeName}
              </span>
              <Badge
                variant="secondary"
                className="text-[9px] sm:text-[10px] px-1 py-0 h-4"
              >
                {entry.chordQuality}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* ── Detail Panel ───────────────────────────────── */}
      <div className="border-2 border-[var(--border-subtle)] bg-[hsl(var(--color-card))] p-4 sm:p-6 space-y-6">
        {/* Mode header */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3
            className="text-xl font-semibold text-[var(--ink-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {modeRoot} {selectedEntry.modeName}
          </h3>
          <span className="text-sm font-mono-app text-[var(--ink-tertiary)]">
            {pitchClasses.join(' – ')}
          </span>
          <Badge variant="outline" className="text-xs font-mono-app">
            {selectedEntry.romanNumeral} — {selectedEntry.chordQuality}
          </Badge>
        </div>

        {/* ── Guitar Fretboard ──────────────────────── */}
        <div>
          <h4 className="text-xs font-semibold text-[var(--ink-secondary)] uppercase tracking-wider mb-2">
            Guitar Fretboard
          </h4>
          <div className="overflow-x-auto bg-[hsl(var(--color-background))] border border-[var(--border-subtle)] p-3">
            <GuitarFretboard
              notes={modeNoteNames}
              root={modeRoot}
              fretCount={15}
              showNoteNames={!showDegreeNumbers}
              showDegrees={showDegreeNumbers}
            />
          </div>
        </div>

        {/* ── Piano + Staff side by side ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-semibold text-[var(--ink-secondary)] uppercase tracking-wider mb-2">
              Piano
            </h4>
            <div className="bg-[hsl(var(--color-background))] border border-[var(--border-subtle)] p-3 flex justify-center">
              <PianoScaleDiagram
                notes={pianoNotes}
                rootNote={pianoNotes[0]}
                size="large"
              />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[var(--ink-secondary)] uppercase tracking-wider mb-2">
              Staff Notation
            </h4>
            <div className="bg-[hsl(var(--color-background))] border border-[var(--border-subtle)] p-3 flex justify-center">
              {modeNotes.length > 0 && (
                <StaffDisplay notes={modeNotes} clef="treble" />
              )}
            </div>
          </div>
        </div>

        {/* ── Chord on this degree ──────────────────── */}
        {chord && (
          <div>
            <h4 className="text-xs font-semibold text-[var(--ink-secondary)] uppercase tracking-wider mb-2">
              Built on Degree {selectedEntry.degree}
            </h4>
            <ChordVoicingDisplay
              chord={chord}
              voicingIndex={selectedEntry.voicingIndex ?? 0}
            />
          </div>
        )}
      </div>
    </div>
  );
}

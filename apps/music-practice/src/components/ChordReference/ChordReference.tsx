/**
 * ChordReference — Chord library browser
 *
 * UX model (matches CircleOfFifths / ScaleReference):
 *   1. Chromatic root selector row (C, C#, D, …)
 *   2. Chord quality row (maj, m, 7, m7, …) — filtered to what exists for root
 *   3. Everything inline below: diagrams, theory, audio, progressions
 *
 * Style: zero border-radius, no shadows, dashed accents, --ink-* hierarchy,
 * font-display headings, font-mono-app for music data.
 */

import { useState, useMemo, useCallback } from 'react';
import type { Chord } from '@/lib/chord-library';
import { CHORD_LIBRARY } from '@/lib/chord-library';
import { ChordDiagram } from './ChordDiagram';
import { PianoChordDiagram } from './PianoChordDiagram';
import { ChordPlayer } from './ChordPlayer';
import { ChordProgressionBuilder } from './ChordProgressionBuilder';
import { InstrumentToggle } from '../Piano/InstrumentToggle';
import { StaffDisplay } from '../notation/StaffDisplay';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHROMATIC_ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

/** Normalize enharmonic roots so we can group chords consistently */
const ROOT_NORMALIZE: Record<string, string> = {
  'Db': 'C#', 'D#': 'Eb', 'Gb': 'F#', 'G#': 'Ab', 'A#': 'Bb',
};

function normalizeRoot(root: string): string {
  return ROOT_NORMALIZE[root] || root;
}

/** Extract root from a chord shortName (e.g. "C#m7" → "C#") */
function extractRoot(shortName: string): string {
  const m = shortName.match(/^([A-G][#b]?)/);
  return m ? m[1] : shortName;
}

/** Extract quality from a chord shortName (e.g. "C#m7" → "m7") */
function extractQuality(shortName: string): string {
  const m = shortName.match(/^[A-G][#b]?(.*)/);
  return m ? (m[1] || 'maj') : '';
}

// ─── Quality display config ─────────────────────────────────────────────────

/** Ordered quality groups for the selector row */
const QUALITY_ORDER = [
  'maj', 'm', '7', 'm7', 'maj7', 'dim', 'aug',
  'sus2', 'sus4', '7sus4',
  'add9', '6', '6/9',
  '9', '11', '13',
  'maj9', 'maj13',
  'm9', 'm11', 'm13',
  'dim7', 'm7b5',
  'aug7', '7#9', '7#5', '7b9', '7b5', '7alt',
  'm(maj7)', 'm(maj9)', 'maj7#11', 'maj7b5', 'maj7alt',
  'm7add9', 'add11',
] as const;

const QUALITY_LABELS: Record<string, string> = {
  'maj': 'Major', 'm': 'Minor', '7': '7', 'm7': 'm7', 'maj7': 'Maj7',
  'dim': 'dim', 'aug': 'aug', 'sus2': 'sus2', 'sus4': 'sus4', '7sus4': '7sus4',
  'add9': 'add9', '6': '6', '6/9': '6/9',
  '9': '9', '11': '11', '13': '13',
  'maj9': 'Maj9', 'maj13': 'Maj13',
  'm9': 'm9', 'm11': 'm11', 'm13': 'm13',
  'dim7': 'dim7', 'm7b5': 'm7♭5',
  'aug7': 'aug7', '7#9': '7♯9', '7#5': '7♯5', '7b9': '7♭9', '7b5': '7♭5', '7alt': '7alt',
  'm(maj7)': 'm(Maj7)', 'm(maj9)': 'm(Maj9)', 'maj7#11': 'Maj7♯11',
  'maj7b5': 'Maj7♭5', 'maj7alt': 'Maj7alt', 'm7add9': 'm7add9', 'add11': 'add11',
};

// Difficulty badge colors
const DIFF_COLORS: Record<string, string> = {
  beginner: 'var(--success-color)',
  intermediate: 'var(--accent-color)',
  advanced: 'var(--warning-color)',
  jazz: 'var(--error-color)',
};

// ─── Build lookup index ─────────────────────────────────────────────────────

type ChordIndex = Map<string, Map<string, Chord[]>>;

function buildChordIndex(): ChordIndex {
  const index: ChordIndex = new Map();
  for (const chord of CHORD_LIBRARY) {
    const root = normalizeRoot(extractRoot(chord.shortName));
    const quality = extractQuality(chord.shortName);
    if (!index.has(root)) index.set(root, new Map());
    const rootMap = index.get(root)!;
    if (!rootMap.has(quality)) rootMap.set(quality, []);
    rootMap.get(quality)!.push(chord);
  }
  return index;
}

const CHORD_INDEX = buildChordIndex();

// ─── Component ──────────────────────────────────────────────────────────────

interface ChordReferenceProps {
  onStartQuiz?: () => void;
}

type Instrument = 'guitar' | 'piano';

export function ChordReference({ onStartQuiz }: ChordReferenceProps): JSX.Element {
  const [selectedRoot, setSelectedRoot] = useState<string>('C');
  const [selectedQuality, setSelectedQuality] = useState<string>('maj');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('guitar');
  const [selectedVoicing, setSelectedVoicing] = useState(0);

  // Qualities available for the selected root, in canonical order
  const availableQualities = useMemo(() => {
    const rootMap = CHORD_INDEX.get(selectedRoot);
    if (!rootMap) return [];
    const available = new Set(rootMap.keys());
    // Also include slash chords and other qualities not in the ordered list
    const ordered = QUALITY_ORDER.filter(q => available.has(q));
    const extras = [...available].filter(q => !QUALITY_ORDER.includes(q as any)).sort();
    return [...ordered, ...extras];
  }, [selectedRoot]);

  // Auto-select first available quality when root changes
  const activeQuality = useMemo(() => {
    if (availableQualities.includes(selectedQuality)) return selectedQuality;
    return availableQualities[0] || 'maj';
  }, [availableQualities, selectedQuality]);

  // All chords matching root + quality (may be multiple voicings/variants)
  const matchingChords = useMemo(() => {
    return CHORD_INDEX.get(selectedRoot)?.get(activeQuality) || [];
  }, [selectedRoot, activeQuality]);

  const selectedChord = matchingChords[0] || null;
  const currentVoicing = selectedChord?.voicings[selectedVoicing];

  const handleRootChange = useCallback((root: string) => {
    setSelectedRoot(root);
    setSelectedVoicing(0);
  }, []);

  const handleQualityChange = useCallback((quality: string) => {
    setSelectedQuality(quality);
    setSelectedVoicing(0);
  }, []);

  const handleInstrumentChange = useCallback((instrument: Instrument) => {
    setSelectedInstrument(instrument);
    setSelectedVoicing(0);
  }, []);

  // Count chords per root for the indicator
  const rootCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const root of CHROMATIC_ROOTS) {
      counts[root] = CHORD_INDEX.get(root)?.size || 0;
    }
    return counts;
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* ── Header ─────────────────────────────── */}
      <header>
        <h1 className="text-3xl font-display font-bold text-foreground">Chord Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {CHORD_LIBRARY.length} chords — select root, then quality
        </p>
      </header>

      {/* ── Root selector — 12 chromatic buttons ────── */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono-app">
          Root
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {CHROMATIC_ROOTS.map(root => {
            const isSelected = root === selectedRoot;
            return (
              <button
                key={root}
                onClick={() => handleRootChange(root)}
                className={`
                  px-4 py-2 text-sm font-semibold font-mono-app border-2 transition-colors
                  ${isSelected
                    ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
                    : 'bg-card text-foreground border-border hover:border-[var(--accent-color)] hover:bg-muted'
                  }
                `}
              >
                {root}
                <span className="ml-1.5 text-[10px] opacity-50">{rootCounts[root]}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Quality selector — filtered to available ────── */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono-app">
          Quality
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {availableQualities.map(quality => {
            const isActive = quality === activeQuality;
            const label = QUALITY_LABELS[quality] || quality;
            return (
              <button
                key={quality}
                onClick={() => handleQualityChange(quality)}
                className={`
                  px-3 py-1.5 text-xs font-medium font-mono-app border transition-colors
                  ${isActive
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-foreground border-border hover:border-foreground/50'
                  }
                `}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Chord display ────── */}
      {selectedChord && currentVoicing ? (
        <div className="space-y-6">
          {/* Chord name + meta */}
          <section className="border-2 border-dashed border-border p-4 space-y-3">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  {selectedChord.shortName}
                </h2>
                <p className="text-sm text-muted-foreground">{selectedChord.name}</p>
              </div>
              <span
                className="text-[10px] font-mono-app font-semibold uppercase tracking-widest px-2 py-0.5 border"
                style={{ borderColor: DIFF_COLORS[selectedChord.difficulty], color: DIFF_COLORS[selectedChord.difficulty] }}
              >
                {selectedChord.difficulty}
              </span>
            </div>
            {selectedChord.description && (
              <p className="text-sm text-muted-foreground">{selectedChord.description}</p>
            )}
          </section>

          {/* Instrument toggle */}
          <div className="flex justify-center">
            <InstrumentToggle
              instrument={selectedInstrument}
              onChange={handleInstrumentChange}
            />
          </div>

          {/* Voicing selector (if multiple) */}
          {selectedChord.voicings.length > 1 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-semibold text-muted-foreground font-mono-app mr-1">
                Voicing:
              </span>
              {selectedChord.voicings.map((voicing, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedVoicing(idx)}
                  className={`
                    px-3 py-1 text-xs font-mono-app border transition-colors
                    ${selectedVoicing === idx
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-card text-foreground border-border hover:border-foreground/50'
                    }
                  `}
                >
                  {voicing.voicingName}
                </button>
              ))}
            </div>
          )}

          {/* Diagram + Staff — side by side on desktop */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: instrument diagram */}
            <div className="border border-border p-4 space-y-4">
              {selectedInstrument === 'guitar' && currentVoicing?.guitar ? (
                <>
                  <div className="flex justify-center py-2">
                    <ChordDiagram chord={selectedChord} voicing={currentVoicing} size="large" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {currentVoicing.guitar.description}
                  </p>
                </>
              ) : selectedInstrument === 'piano' && currentVoicing?.piano ? (
                <>
                  <PianoChordDiagram voicing={currentVoicing} size="large" />
                  <p className="text-xs text-muted-foreground text-center">
                    {currentVoicing.piano.description}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No {selectedInstrument} voicing for this chord
                </p>
              )}

              {/* Audio player */}
              <div className="flex justify-center pt-3 border-t border-border">
                <ChordPlayer chord={selectedChord} size="lg" />
              </div>
            </div>

            {/* Right: staff + theory */}
            <div className="space-y-4">
              {/* Staff notation */}
              {currentVoicing?.piano?.notes && currentVoicing.piano.notes.length > 0 && (
                <div className="border border-border p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono-app mb-3">
                    Notation
                  </h3>
                  <StaffDisplay notes={currentVoicing.piano.notes} clef="treble" asChord />
                </div>
              )}

              {/* Theory */}
              <div className="border border-border p-4 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono-app">
                  Theory
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Construction: </span>
                    <span className="text-foreground font-mono-app">{selectedChord.theory.construction}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Intervals: </span>
                    <span className="text-foreground font-mono-app">{selectedChord.theory.intervals.join(' – ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Progressions: </span>
                    <span className="flex flex-wrap gap-1 mt-1">
                      {selectedChord.theory.commonProgressions.map(prog => (
                        <span
                          key={prog}
                          className="text-xs font-mono-app px-2 py-0.5 border border-border bg-muted text-foreground"
                        >
                          {prog}
                        </span>
                      ))}
                    </span>
                  </div>
                  {selectedChord.tags.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Tags: </span>
                      <span className="flex flex-wrap gap-1 mt-1">
                        {selectedChord.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 border border-[var(--accent-color)]/30 bg-[var(--accent-light)] text-[var(--accent-color)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── Progression Builder (inline, always visible) ────── */}
          <section className="border-t-2 border-dashed border-border pt-6 space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono-app">
              Progressions
            </h2>
            <ChordProgressionBuilder rootChord={selectedChord} />
          </section>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">
            No chord found for {selectedRoot} {activeQuality}
          </p>
        </div>
      )}

      {/* ── Quick actions ────── */}
      {onStartQuiz && (
        <section className="flex justify-center pt-4">
          <button
            onClick={onStartQuiz}
            className="px-6 py-2 bg-[var(--accent-color)] text-white text-sm font-semibold border-2 border-[var(--accent-color)] hover:opacity-90 transition-opacity"
          >
            Start Quiz →
          </button>
        </section>
      )}
    </div>
  );
}

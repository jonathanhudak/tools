/**
 * Progression Library — browse, transpose, and play every progression
 * in the registry. Includes guide-tone display and "all 12 keys" cycling.
 */

import { useMemo, useState } from 'react';
import { Badge } from '@hudak/ui/components/badge';
import {
  PROGRESSION_REGISTRY,
  type ProgressionDefinition,
  type ProgressionFamily,
} from '@/data/progressions/progression-registry';
import { HARMONIC_SEQUENCES } from '@/data/progressions/harmonic-sequences';
import { resolveProgression } from '@/lib/theory/roman';
import { ProgressionPlayer } from '../shared/ProgressionPlayer';
import { ChordCard } from '../shared/ChordCard';
import { InstrumentToggle } from '../Piano/InstrumentToggle';

const SEQUENCE_TYPE_LABELS: Record<string, string> = {
  diatonic: 'Diatonic',
  chromatic: 'Chromatic',
  modulation: 'Modulation',
};

const FAMILIES: ProgressionFamily[] = ['jazz', 'blues', 'pop', 'classical', 'modal'];

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  advanced: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

export function ProgressionLibrary(): JSX.Element {
  const [family, setFamily] = useState<ProgressionFamily>('jazz');
  const [selectedId, setSelectedId] = useState<string>('ii-V-I-major');
  const [musicKey, setMusicKey] = useState('C');
  const [bpm, setBpm] = useState(90);
  const [instrument, setInstrument] = useState<'guitar' | 'banjo' | 'piano'>('guitar');

  const progressions = useMemo(
    () => PROGRESSION_REGISTRY.filter(p => p.family === family),
    [family],
  );
  const selected: ProgressionDefinition | undefined = useMemo(
    () =>
      PROGRESSION_REGISTRY.find(p => p.id === selectedId) ?? progressions[0],
    [selectedId, progressions],
  );
  const resolved = useMemo(
    () =>
      selected
        ? resolveProgression(musicKey, selected.steps.map(s => s.romanNumeral))
        : [],
    [selected, musicKey],
  );

  return (
    <div className="space-y-6">
      {/* Family filter */}
      <div className="flex flex-wrap gap-1.5">
        {FAMILIES.map(f => (
          <button
            key={f}
            onClick={() => setFamily(f)}
            className={`min-h-11 px-4 py-1.5 text-xs font-medium capitalize rounded-full border-2 transition-colors ${
              family === f
                ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-white'
                : 'border-[var(--border-subtle)] bg-card hover:border-[var(--accent-color)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Progression list */}
        <div className="space-y-1.5 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-2">
          {progressions.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full min-h-11 text-left p-3 rounded-lg border transition-colors ${
                selected?.id === p.id
                  ? 'border-[var(--accent-color)] bg-[var(--accent-light)]'
                  : 'border-[var(--border-subtle)] bg-card hover:border-[var(--accent-color)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{p.name}</span>
                <Badge className={`text-[9px] shrink-0 ${DIFFICULTY_COLOR[p.difficulty]}`}>
                  {p.difficulty}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {p.steps.map(s => s.romanNumeral).join(' → ')}
              </p>
            </button>
          ))}
        </div>

        {/* Detail + player */}
        {selected && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                {selected.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
            </div>

            <ProgressionPlayer
              progression={selected}
              musicKey={musicKey}
              onKeyChange={setMusicKey}
              bpm={bpm}
              onBpmChange={setBpm}
            />

            {/* Chord diagrams — one card per step, in the current key */}
            <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                  Chord diagrams — {musicKey}
                </h3>
                <InstrumentToggle instrument={instrument} onChange={setInstrument} />
              </div>
              <div
                className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none' }}
              >
                {resolved.map((c, i) => (
                  <div
                    key={i}
                    className="snap-start flex-shrink-0 w-[75vw] sm:w-[280px]"
                  >
                    <ChordCard chordName={c.symbol} label={c.numeral} instrument={instrument} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Harmonic sequences reference */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Harmonic sequences
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Patterns of sequential harmonic motion — the engines that move progressions through keys.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {HARMONIC_SEQUENCES.map(seq => (
            <div
              key={seq.id}
              className="rounded-lg border border-[var(--border-subtle)] bg-card p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{seq.name}</span>
                <Badge variant="outline" className="text-[9px] shrink-0">
                  {SEQUENCE_TYPE_LABELS[seq.type] ?? seq.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{seq.description}</p>
              <p className="text-[11px] font-mono text-muted-foreground">{seq.example}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

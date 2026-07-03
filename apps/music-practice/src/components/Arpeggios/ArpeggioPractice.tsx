/**
 * Arpeggio Practice — 33 arpeggios from the registry, playable through
 * 10 practice patterns (1-3-5-7, broken thirds, etc.) in any key,
 * with piano and fretboard visualization.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@hudak/ui/components/badge';
import { Button } from '@hudak/ui/components/button';
import { Play, Square } from 'lucide-react';
import { Note } from 'tonal';
import {
  ARPEGGIO_REGISTRY,
  type ArpeggioDefinition,
  type ArpeggioFamily,
} from '@/data/arpeggios/arpeggio-registry';
import { ARPEGGIO_PATTERNS, type ArpeggioPattern } from '@/data/arpeggios/arpeggio-patterns';
import { getChordType } from '@/data/chords/chord-types';
import { getPreferredSpelling } from '@/data/enharmonics';
import { playMelody, type PlaybackHandle } from '@/lib/audio/player';
import { PianoScaleDiagram } from '../ScaleReference/PianoScaleDiagram';
import { GuitarFretboard } from '../GuitarFretboard';
import { StaffDisplay } from '../notation/StaffDisplay';

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const FAMILIES: ArpeggioFamily[] = ['triadic', 'seventh', 'sixth', 'extended', 'altered'];

/** Map registry families onto the pattern applicability buckets. */
function patternBucket(family: ArpeggioFamily): 'triadic' | 'seventh' | 'extended' {
  if (family === 'triadic') return 'triadic';
  if (family === 'extended') return 'extended';
  return 'seventh';
}

/** Spell the arpeggio's pitch classes in a key, preferring the chord-type symbol. */
function arpeggioNotes(arp: ArpeggioDefinition, root: string): string[] {
  const flats = root.includes('b') || root === 'F';
  const rootSemitone = (Note.midi(`${root}4`) ?? 60) % 12;
  return arp.semitones.map(s => getPreferredSpelling((rootSemitone + s) % 12, flats));
}

export function ArpeggioPractice(): JSX.Element {
  const [family, setFamily] = useState<ArpeggioFamily>('seventh');
  const [selectedId, setSelectedId] = useState('maj7');
  const [patternId, setPatternId] = useState('ascending');
  const [root, setRoot] = useState('C');
  const [bpm, setBpm] = useState(140);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const handle = useRef<PlaybackHandle | null>(null);

  const arps = useMemo(() => ARPEGGIO_REGISTRY.filter(a => a.family === family), [family]);
  const arp = useMemo(
    () => ARPEGGIO_REGISTRY.find(a => a.id === selectedId) ?? arps[0],
    [selectedId, arps],
  );
  const patterns = useMemo(
    () => (arp ? ARPEGGIO_PATTERNS.filter(p => p.applicableTo.includes(patternBucket(arp.family))) : []),
    [arp],
  );
  const pattern: ArpeggioPattern | undefined = useMemo(
    () => patterns.find(p => p.id === patternId) ?? patterns[0],
    [patterns, patternId],
  );

  const notes = useMemo(() => (arp ? arpeggioNotes(arp, root) : []), [arp, root]);
  const chordType = arp ? getChordType(arp.chordTypeId) : undefined;

  /** MIDI sequence: the pattern indices applied to the arpeggio tones. */
  const sequence = useMemo(() => {
    if (!arp || !pattern) return [];
    const base = Note.midi(`${root}4`) ?? 60;
    const tones = arp.semitones.map(s => base + s);
    // Patterns address up to 4 tones; clamp into range for triads (octave = last tone)
    return pattern.pattern.map(i => tones[Math.min(i, tones.length - 1)]);
  }, [arp, pattern, root]);

  /** Pattern sequence spelled for the staff, matching the key's flat/sharp lean. */
  const staffNotes = useMemo(() => {
    const flats = root.includes('b') || root === 'F';
    return sequence.map(midi => (flats ? Note.fromMidi(midi) : Note.fromMidiSharps(midi)));
  }, [sequence, root]);

  const stop = () => {
    handle.current?.stop();
    handle.current = null;
    setActiveIdx(null);
  };
  useEffect(() => stop, []);

  const play = () => {
    stop();
    handle.current = playMelody(sequence, bpm, i => setActiveIdx(i), () => setActiveIdx(null));
  };

  return (
    <div className="space-y-6">
      {/* Family filter */}
      <div className="flex flex-wrap gap-1.5">
        {FAMILIES.map(f => (
          <button
            key={f}
            onClick={() => { setFamily(f); }}
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

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Arpeggio list */}
        <div className="space-y-1.5 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-2">
          {arps.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedId(a.id)}
              className={`w-full min-h-11 text-left px-3 py-2 rounded-lg border transition-colors ${
                arp?.id === a.id
                  ? 'border-[var(--accent-color)] bg-[var(--accent-light)]'
                  : 'border-[var(--border-subtle)] bg-card hover:border-[var(--accent-color)]'
              }`}
            >
              <span className="text-sm font-semibold">{a.name}</span>
              <span className="block text-[10px] font-mono text-muted-foreground">
                {a.intervals.join(' · ')}
              </span>
            </button>
          ))}
        </div>

        {/* Detail */}
        {arp && pattern && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                {root}{chordType?.primarySymbol ?? ''} arpeggio
              </h2>
              {chordType && (
                <p className="text-sm text-muted-foreground mt-1">{chordType.description}</p>
              )}
            </div>

            {/* Key selector */}
            <div className="flex flex-wrap gap-1">
              {KEYS.map(k => (
                <button
                  key={k}
                  onClick={() => setRoot(k)}
                  className={`min-h-11 min-w-11 px-2 font-mono text-sm rounded-lg border transition-colors ${
                    root === k
                      ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-white font-semibold'
                      : 'border-[var(--border-subtle)] bg-card hover:border-[var(--accent-color)]'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Pattern selector */}
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                Practice pattern
              </p>
              <div className="flex flex-wrap gap-1.5">
                {patterns.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPatternId(p.id)}
                    title={p.description}
                    className={`min-h-11 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      pattern.id === p.id
                        ? 'border-[var(--accent-color)] bg-[var(--accent-light)] font-semibold'
                        : 'border-[var(--border-subtle)] bg-card hover:border-[var(--accent-color)]'
                    }`}
                  >
                    {p.name}
                    <span className="block text-[9px] font-mono text-muted-foreground">{p.patternName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sequence display */}
            <div className="flex flex-wrap gap-1">
              {sequence.map((midi, i) => (
                <span
                  key={i}
                  className={`font-mono text-sm px-2 py-1 rounded transition-colors ${
                    activeIdx === i
                      ? 'bg-[var(--accent-color)] text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {Note.fromMidi(midi)}
                </span>
              ))}
            </div>

            {/* Staff notation of the pattern */}
            {staffNotes.length > 0 && (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-card p-2 overflow-x-auto">
                <StaffDisplay notes={staffNotes} clef="treble" />
              </div>
            )}

            {/* Transport */}
            <div className="flex flex-wrap items-center gap-3">
              {activeIdx === null ? (
                <Button onClick={play} size="lg" className="gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white">
                  <Play className="w-4 h-4" /> Play pattern
                </Button>
              ) : (
                <Button onClick={stop} size="lg" variant="outline" className="gap-2">
                  <Square className="w-4 h-4" /> Stop
                </Button>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={60}
                  max={240}
                  value={bpm}
                  onChange={e => setBpm(Number(e.target.value))}
                  className="accent-[var(--accent-color)] w-28"
                />
                <span className="text-xs font-mono w-14">{bpm} bpm</span>
              </div>
              <Badge variant="secondary" className="text-[10px] capitalize">{pattern.difficulty}</Badge>
            </div>

            {/* Diagrams */}
            <div className="space-y-4">
              <PianoScaleDiagram notes={notes} rootNote={root} size="medium" />
              <GuitarFretboard notes={notes} root={root} compact label={`${root}${chordType?.primarySymbol ?? ''} arpeggio tones`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

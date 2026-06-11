/**
 * Scale Explorer — the full 62-scale registry across 9 families:
 * diatonic modes, melodic/harmonic minor, harmonic major, symmetric,
 * pentatonic, blues, bebop, and world scales.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Badge } from '@hudak/ui/components/badge';
import { Button } from '@hudak/ui/components/button';
import { Input } from '@hudak/ui/components/input';
import { Play, Music2, Waves } from 'lucide-react';
import {
  SCALE_REGISTRY,
  getAllScaleFamilies,
  searchScales,
  type ScaleDefinition,
  type ScaleFamily,
} from '@/data/scales/scale-registry';
import { resolveForScale } from '@/data/enharmonics';
import { Note } from 'tonal';
import { playMelody, Drone, type PlaybackHandle } from '@/lib/audio/player';
import { PianoScaleDiagram } from '../ScaleReference/PianoScaleDiagram';
import { GuitarFretboard } from '../GuitarFretboard';

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

const FAMILY_LABELS: Record<ScaleFamily, string> = {
  diatonic: 'Diatonic Modes',
  'melodic-minor': 'Melodic Minor',
  'harmonic-minor': 'Harmonic Minor',
  'harmonic-major': 'Harmonic Major',
  symmetric: 'Symmetric',
  pentatonic: 'Pentatonic',
  blues: 'Blues',
  bebop: 'Bebop',
  world: 'World',
};

export function ScaleExplorer(): JSX.Element {
  const [family, setFamily] = useState<ScaleFamily | 'all'>('diatonic');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('ionian');
  const [root, setRoot] = useState('C');
  const [droneOn, setDroneOn] = useState(false);
  const playHandle = useRef<PlaybackHandle | null>(null);
  const drone = useRef<Drone | null>(null);

  const families = useMemo(() => getAllScaleFamilies(), []);
  const scales = useMemo(() => {
    if (query.trim()) return searchScales(query.trim());
    return family === 'all' ? SCALE_REGISTRY : SCALE_REGISTRY.filter(s => s.family === family);
  }, [family, query]);

  const scale: ScaleDefinition | undefined = useMemo(
    () => SCALE_REGISTRY.find(s => s.id === selectedId) ?? scales[0],
    [selectedId, scales],
  );

  const notes = useMemo(
    () => (scale ? resolveForScale(scale.semitones, scale.name, root) : []),
    [scale, root],
  );

  const rootMidi = useMemo(() => Note.midi(`${root}3`) ?? 48, [root]);

  // Stop audio on unmount / root change
  useEffect(() => {
    return () => {
      playHandle.current?.stop();
      drone.current?.stop();
    };
  }, []);
  useEffect(() => {
    if (droneOn) {
      if (!drone.current) drone.current = new Drone();
      drone.current.start(rootMidi);
    } else {
      drone.current?.stop();
    }
  }, [droneOn, rootMidi]);

  const playScale = () => {
    if (!scale) return;
    playHandle.current?.stop();
    const base = Note.midi(`${root}4`) ?? 60;
    const ascending = [...scale.semitones.map(s => base + s), base + 12];
    playHandle.current = playMelody(ascending, 180);
  };

  return (
    <div className="space-y-6">
      {/* Search + family filter */}
      <div className="space-y-3">
        <Input
          placeholder="Search scales (e.g. lydian, hirajoshi, bebop)…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="max-w-md min-h-11"
        />
        {!query && (
          <div className="flex flex-wrap gap-1.5">
            {(['all', ...families] as const).map(f => (
              <button
                key={f}
                onClick={() => setFamily(f)}
                className={`min-h-11 px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-colors ${
                  family === f
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-white'
                    : 'border-[var(--border-subtle)] bg-card hover:border-[var(--accent-color)]'
                }`}
              >
                {f === 'all' ? `All (${SCALE_REGISTRY.length})` : FAMILY_LABELS[f]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Scale list */}
        <div className="space-y-1.5 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-2">
          {scales.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`w-full min-h-11 text-left px-3 py-2 rounded-lg border transition-colors ${
                scale?.id === s.id
                  ? 'border-[var(--accent-color)] bg-[var(--accent-light)]'
                  : 'border-[var(--border-subtle)] bg-card hover:border-[var(--accent-color)]'
              }`}
            >
              <span className="text-sm font-semibold">{s.name}</span>
              {s.aliases.length > 0 && (
                <span className="block text-[10px] text-muted-foreground truncate">
                  {s.aliases.join(' · ')}
                </span>
              )}
            </button>
          ))}
          {scales.length === 0 && (
            <p className="text-sm text-muted-foreground p-3">No scales match “{query}”.</p>
          )}
        </div>

        {/* Detail */}
        {scale && (
          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                  {root} {scale.name}
                </h2>
                <Badge variant="secondary" className="text-[10px]">{FAMILY_LABELS[scale.family]}</Badge>
                {scale.characteristicNote && (
                  <Badge className="text-[10px] bg-[var(--accent-light)] text-[var(--accent-color)]">
                    character: {scale.characteristicNote}
                  </Badge>
                )}
              </div>
              {scale.aliases.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Also known as: {scale.aliases.join(', ')}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">{scale.description}</p>
            </div>

            {/* Notes + step pattern */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex gap-1">
                {notes.map((n, i) => (
                  <span
                    key={i}
                    className={`font-mono text-sm px-2 py-1 rounded ${
                      i === 0
                        ? 'bg-[var(--accent-color)] text-white font-semibold'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {n}
                  </span>
                ))}
              </div>
              <span className="font-mono text-xs text-muted-foreground">{scale.stepPattern}</span>
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

            {/* Audio + practice actions */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={playScale} size="lg" className="gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white">
                <Play className="w-4 h-4" /> Play scale
              </Button>
              <Button
                variant={droneOn ? 'default' : 'outline'}
                size="lg"
                className="gap-2"
                onClick={() => setDroneOn(!droneOn)}
                title="Sustained tonic drone — improvise over it to hear the scale's color"
              >
                <Waves className="w-4 h-4" /> {droneOn ? 'Stop drone' : 'Drone'}
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/play" search={{ scaleRoot: root, scaleId: scale.id } as never}>
                  <Music2 className="w-4 h-4" /> Sight-read this scale
                </Link>
              </Button>
            </div>

            {/* Diagrams */}
            <div className="space-y-4">
              <PianoScaleDiagram notes={notes} rootNote={root} size="medium" />
              <GuitarFretboard notes={notes} root={root} compact label={`${root} ${scale.name}`} />
            </div>

            {scale.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {scale.tags.map(t => (
                  <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

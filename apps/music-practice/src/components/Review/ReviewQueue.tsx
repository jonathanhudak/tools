/**
 * Review — spaced-repetition flashcards over three decks:
 * chord spellings, key signatures, and intervals.
 */

import { useMemo, useState } from 'react';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';
import { Volume2 } from 'lucide-react';
import { Note } from 'tonal';
import { CHORD_LIBRARY } from '@/lib/chord-library';
import { CIRCLE_OF_FIFTHS } from '@/data/circle-of-fifths';
import { INTERVALS } from '@/data/intervals';
import {
  buildQueue,
  gradeCard,
  loadSrs,
  queueCounts,
  saveSrs,
  NEW_CARD,
  type Grade,
} from '@/lib/srs';
import { playChordMidis, playMelody } from '@/lib/audio/player';

type DeckId = 'chords' | 'keys' | 'intervals';

interface Card {
  id: string;
  front: React.ReactNode;
  back: React.ReactNode;
  play?: () => void;
}

// ─── Deck builders ───────────────────────────────────────────────────────────

function chordIds(): string[] {
  return CHORD_LIBRARY.filter(c => c.difficulty === 'beginner' || c.difficulty === 'intermediate')
    .map(c => `chord:${c.id}`);
}

function chordCard(id: string): Card | null {
  const chord = CHORD_LIBRARY.find(c => `chord:${c.id}` === id);
  if (!chord) return null;
  const piano = chord.voicings[0]?.piano?.notes ?? [];
  const midis = piano.map(n => Note.midi(n)).filter((m): m is number => m !== null);
  return {
    id,
    front: (
      <div className="text-center">
        <p className="text-4xl font-bold font-mono">{chord.shortName}</p>
        <p className="text-sm text-muted-foreground mt-1">Spell the chord</p>
      </div>
    ),
    back: (
      <div className="text-center space-y-1">
        <p className="text-2xl font-mono">{piano.map(n => n.replace(/\d/g, '')).join(' – ')}</p>
        <p className="text-xs text-muted-foreground">{chord.theory.intervals.join(' · ')}</p>
        <p className="text-xs text-muted-foreground">{chord.theory.construction}</p>
      </div>
    ),
    play: midis.length ? () => playChordMidis(midis) : undefined,
  };
}

function keyIds(): string[] {
  return CIRCLE_OF_FIFTHS.map(e => `key:${e.majorKey}`);
}

function keyCard(id: string): Card | null {
  const entry = CIRCLE_OF_FIFTHS.find(e => `key:${e.majorKey}` === id);
  if (!entry) return null;
  const n = entry.accidentals;
  return {
    id,
    front: (
      <div className="text-center">
        <p className="text-4xl font-bold font-mono">{entry.majorKey} major</p>
        <p className="text-sm text-muted-foreground mt-1">Key signature and relative minor?</p>
      </div>
    ),
    back: (
      <div className="text-center space-y-1">
        <p className="text-xl font-mono">
          {n === 0 ? 'No accidentals' : `${Math.abs(n)} ${n > 0 ? 'sharp' : 'flat'}${Math.abs(n) > 1 ? 's' : ''}`}
        </p>
        {entry.accidentalNotes.length > 0 && (
          <p className="text-sm font-mono text-muted-foreground">{entry.accidentalNotes.join(' ')}</p>
        )}
        <p className="text-sm">
          Relative minor: <strong>{entry.relativeMinor}</strong>
        </p>
      </div>
    ),
  };
}

/** Deterministic root per interval so each card is stable across sessions. */
const INTERVAL_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Eb'];

function intervalIds(): string[] {
  return INTERVALS.filter(i => i.semitones > 0).map(i => `interval:${i.shortName}`);
}

function intervalCard(id: string): Card | null {
  const short = id.split(':')[1];
  const ivl = INTERVALS.find(i => i.shortName === short);
  if (!ivl) return null;
  const root = INTERVAL_ROOTS[ivl.semitones % INTERVAL_ROOTS.length];
  const answer = Note.transpose(root, `${ivl.number}${ivl.quality === 'perfect' ? 'P' : ivl.quality === 'major' ? 'M' : ivl.quality === 'minor' ? 'm' : ivl.quality === 'augmented' ? 'A' : 'd'}`);
  const rootMidi = Note.midi(`${root}4`) ?? 60;
  return {
    id,
    front: (
      <div className="text-center">
        <p className="text-3xl font-bold font-mono">
          {ivl.shortName} above {root}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{ivl.fullName} — name the note</p>
      </div>
    ),
    back: (
      <div className="text-center space-y-1">
        <p className="text-3xl font-mono">{answer}</p>
        <p className="text-xs text-muted-foreground">
          {ivl.semitones} semitones · inverts to {ivl.inversion}
        </p>
      </div>
    ),
    play: () => playMelody([rootMidi, rootMidi + ivl.semitones], 110),
  };
}

const DECKS: Record<DeckId, { label: string; ids: () => string[]; card: (id: string) => Card | null }> = {
  chords: { label: 'Chord spellings', ids: chordIds, card: chordCard },
  keys: { label: 'Key signatures', ids: keyIds, card: keyCard },
  intervals: { label: 'Intervals', ids: intervalIds, card: intervalCard },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function ReviewQueue(): JSX.Element {
  const [deck, setDeck] = useState<DeckId | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const counts = useMemo(() => {
    const store = loadSrs();
    return Object.fromEntries(
      (Object.keys(DECKS) as DeckId[]).map(d => [d, queueCounts(DECKS[d].ids(), store)]),
    ) as Record<DeckId, { due: number; fresh: number }>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, reviewed]);

  const startDeck = (d: DeckId) => {
    setDeck(d);
    setQueue(buildQueue(DECKS[d].ids(), loadSrs()));
    setRevealed(false);
    setReviewed(0);
  };

  const grade = (g: Grade) => {
    if (!deck || queue.length === 0) return;
    const id = queue[0];
    const store = loadSrs();
    const next = gradeCard(store[id] ?? NEW_CARD, g);
    store[id] = next;
    saveSrs(store);
    // 'again' cards return to the back of today's queue
    setQueue(q => (g === 'again' ? [...q.slice(1), id] : q.slice(1)));
    setRevealed(false);
    setReviewed(r => r + 1);
  };

  if (!deck) {
    return (
      <div className="max-w-xl space-y-3">
        {(Object.keys(DECKS) as DeckId[]).map(d => (
          <button
            key={d}
            onClick={() => startDeck(d)}
            className="w-full min-h-11 flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-card p-4 hover:border-[var(--accent-color)] transition-colors"
          >
            <span className="font-semibold">{DECKS[d].label}</span>
            <span className="flex gap-2">
              <Badge variant="secondary" className="text-[10px]">{counts[d].due} due</Badge>
              <Badge variant="outline" className="text-[10px]">{counts[d].fresh} new</Badge>
            </span>
          </button>
        ))}
        <p className="text-xs text-muted-foreground">
          Grade yourself honestly — intervals between reviews grow when you remember and shrink
          when you don't. A few minutes a day beats an hour once a week.
        </p>
      </div>
    );
  }

  const card = queue.length > 0 ? DECKS[deck].card(queue[0]) : null;

  if (!card) {
    return (
      <div className="max-w-xl rounded-xl border border-[var(--border-subtle)] bg-card p-8 text-center space-y-3">
        <p className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          Deck clear 🎉
        </p>
        <p className="text-sm text-muted-foreground">
          {reviewed} card{reviewed === 1 ? '' : 's'} reviewed. Come back when more are due.
        </p>
        <Button variant="outline" onClick={() => setDeck(null)}>Back to decks</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <button className="underline-offset-2 hover:underline" onClick={() => setDeck(null)}>
          ← Decks
        </button>
        <span>{queue.length} left · {reviewed} reviewed</span>
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] bg-card p-8 min-h-[180px] flex flex-col items-center justify-center gap-4">
        {card.front}
        {revealed && (
          <div className="pt-4 border-t border-[var(--border-subtle)] w-full flex flex-col items-center gap-2">
            {card.back}
            {card.play && (
              <Button variant="outline" size="sm" className="gap-1" onClick={card.play}>
                <Volume2 className="w-3.5 h-3.5" /> Hear it
              </Button>
            )}
          </div>
        )}
      </div>

      {!revealed ? (
        <Button
          size="lg"
          className="w-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white"
          onClick={() => setRevealed(true)}
        >
          Reveal
        </Button>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" size="lg" className="border-rose-300 dark:border-rose-800" onClick={() => grade('again')}>
            Again
          </Button>
          <Button variant="outline" size="lg" className="border-amber-300 dark:border-amber-800" onClick={() => grade('hard')}>
            Hard
          </Button>
          <Button variant="outline" size="lg" className="border-emerald-300 dark:border-emerald-800" onClick={() => grade('good')}>
            Good
          </Button>
          <Button variant="outline" size="lg" className="border-sky-300 dark:border-sky-800" onClick={() => grade('easy')}>
            Easy
          </Button>
        </div>
      )}
    </div>
  );
}

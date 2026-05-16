import { useRef, useCallback, useEffect, useState } from 'react';

interface PianoKeyboardProps {
  onNoteOn: (midiNote: number) => void;
  onNoteOff: (midiNote: number) => void;
  activeNotes: Set<number>;
  visible: boolean;
  midiConnected: boolean;
}

/** 25 keys: C3 (48) to C5 (72) */
const LOW_NOTE = 48;
const HIGH_NOTE = 72;
const NOTE_COUNT = HIGH_NOTE - LOW_NOTE + 1;

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function isBlackKey(midiNote: number): boolean {
  const n = midiNote % 12;
  return [1, 3, 6, 8, 10].includes(n);
}

function noteLabel(midiNote: number): string {
  const octave = Math.floor(midiNote / 12) - 1;
  return `${NOTE_NAMES[midiNote % 12]}${octave}`;
}

/** Compact: white keys only (no black key gaps shown) */
function WhiteKeyOnly({ midiNote, active, onPress, onRelease }: {
  midiNote: number;
  active: boolean;
  onPress: (n: number) => void;
  onRelease: (n: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onPress(midiNote);
  }, [midiNote, onPress]);

  const handleUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    onRelease(midiNote);
  }, [midiNote, onRelease]);

  const handleEnter = useCallback((e: React.PointerEvent) => {
    if (e.buttons > 0) {
      onPress(midiNote);
    }
  }, [midiNote, onPress]);

  const handleLeave = useCallback(() => {
    if (active) onRelease(midiNote);
  }, [midiNote, active, onRelease]);

  return (
    <div
      ref={ref}
      className={`pk-white ${active ? 'active' : ''}`}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      <span className="pk-label">{noteLabel(midiNote)}</span>
    </div>
  );
}

export function PianoKeyboard({ onNoteOn, onNoteOff, activeNotes, visible, midiConnected }: PianoKeyboardProps) {
  const whiteKeys = Array.from({ length: NOTE_COUNT }, (_, i) => LOW_NOTE + i).filter((n) => !isBlackKey(n));

  // Track pressed notes for the active set (using local state for pointer tracking)
  const pressedRef = useRef<Set<number>>(new Set());

  const handlePress = useCallback((midiNote: number) => {
    if (pressedRef.current.has(midiNote)) return;
    pressedRef.current.add(midiNote);
    onNoteOn(midiNote);
  }, [onNoteOn]);

  const handleRelease = useCallback((midiNote: number) => {
    pressedRef.current.delete(midiNote);
    onNoteOff(midiNote);
  }, [onNoteOff]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      pressedRef.current.forEach((n) => onNoteOff(n));
      pressedRef.current.clear();
    };
  }, [onNoteOff]);

  if (!visible || midiConnected) return null;

  return (
    <div className="piano-keyboard-slide">
      <div className="pk-scroll">
        {whiteKeys.map((midiNote) => (
          <WhiteKeyOnly
            key={midiNote}
            midiNote={midiNote}
            active={activeNotes.has(midiNote)}
            onPress={handlePress}
            onRelease={handleRelease}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Virtual Keyboard Component
 * Simulates MIDI input for testing sight reading practice
 * Uses Tone.js for audio synthesis
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import * as Tone from 'tone';
import { Button } from '@hudak/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Badge } from '@hudak/ui/components/badge';
import { Piano } from 'lucide-react';

interface VirtualKeyboardProps {
  onNotePlay: (midiNote: number, noteName: string) => void;
  enabled?: boolean;
  startOctave?: number;
  octaveCount?: number;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Keyboard mapping for computer keys to piano keys
const KEY_TO_NOTE_OFFSET: Record<string, number> = {
  // White keys (lower row)
  'z': 0,  // C
  'x': 2,  // D
  'c': 4,  // E
  'v': 5,  // F
  'b': 7,  // G
  'n': 9,  // A
  'm': 11, // B
  // Black keys (upper row)
  's': 1,  // C#
  'd': 3,  // D#
  'g': 6,  // F#
  'h': 8,  // G#
  'j': 10, // A#
};

export function VirtualKeyboard({
  onNotePlay,
  enabled = true,
  startOctave = 4,
  octaveCount = 2
}: VirtualKeyboardProps) {
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

  // Initialize Tone.js synth with a piano-like sound
  const synthRef = useRef<Tone.PolySynth | null>(null);

  // Initialize audio context and synth
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create a polyphonic synth for multiple simultaneous notes
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: 'triangle'
          },
          envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 1
          }
        }).toDestination();

        setIsAudioReady(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    void initAudio();

    return () => {
      // Cleanup synth on unmount
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, []);

  const getMidiNote = (octave: number, noteOffset: number): number => {
    // MIDI note number: (octave + 1) * 12 + noteOffset
    // Middle C (C4) is MIDI 60
    return (octave + 1) * 12 + noteOffset;
  };

  const getNoteName = (midiNote: number): string => {
    const noteIndex = midiNote % 12;
    const octave = Math.floor(midiNote / 12) - 1;
    return `${NOTE_NAMES[noteIndex]}${octave}`;
  };

  const playNote = useCallback(async (midiNote: number) => {
    if (!enabled || !synthRef.current) return;

    // Start audio context on first user interaction
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }

    const noteName = getNoteName(midiNote);

    // Convert MIDI note to frequency and play
    const frequency = Tone.Frequency(midiNote, 'midi').toFrequency();
    synthRef.current.triggerAttackRelease(frequency, '8n');

    // Visual feedback
    setActiveNotes(prev => new Set(prev).add(midiNote));
    setTimeout(() => {
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(midiNote);
        return next;
      });
    }, 200);

    // Notify parent component
    onNotePlay(midiNote, noteName);
  }, [enabled, onNotePlay]);

  // Handle computer keyboard input
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent repeat events
      if (e.repeat) return;

      const key = e.key.toLowerCase();
      const noteOffset = KEY_TO_NOTE_OFFSET[key];

      if (noteOffset !== undefined) {
        // Use the middle octave of the displayed range
        const octave = startOctave + Math.floor(octaveCount / 2);
        const midiNote = getMidiNote(octave, noteOffset);
        playNote(midiNote);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, startOctave, octaveCount, playNote]);

  const isBlackKey = (noteOffset: number): boolean => {
    return [1, 3, 6, 8, 10].includes(noteOffset);
  };

  const renderOctave = (octave: number) => {
    // Define white key notes and their positions
    const whiteKeyNotes = [
      { note: 0, name: 'C' },   // C
      { note: 2, name: 'D' },   // D
      { note: 4, name: 'E' },   // E
      { note: 5, name: 'F' },   // F
      { note: 7, name: 'G' },   // G
      { note: 9, name: 'A' },   // A
      { note: 11, name: 'B' }   // B
    ];

    // Define black key notes and their positions (relative to white keys)
    const blackKeyNotes = [
      { note: 1, name: 'C#', position: 0 },   // Between C and D
      { note: 3, name: 'D#', position: 1 },   // Between D and E
      { note: 6, name: 'F#', position: 3 },   // Between F and G
      { note: 8, name: 'G#', position: 4 },   // Between G and A
      { note: 10, name: 'A#', position: 5 }   // Between A and B
    ];

    const whiteKeyWidth = 48; // px
    const blackKeyWidth = 32; // px

    return (
      <div key={octave} className="relative inline-block">
        {/* White keys container */}
        <div className="flex">
          {whiteKeyNotes.map(({ note, name }) => {
            const midiNote = getMidiNote(octave, note);
            const displayName = `${name}${octave}`;
            const isActive = activeNotes.has(midiNote);

            return (
              <button
                key={`${octave}-${note}`}
                onClick={() => void playNote(midiNote)}
                disabled={!enabled}
                className={`h-40 border border-gray-400 flex flex-col items-center justify-end pb-2 disabled:opacity-50 transition-colors ${
                  isActive
                    ? 'bg-blue-200'
                    : 'bg-white hover:bg-gray-50'
                }`}
                style={{ width: `${whiteKeyWidth}px` }}
              >
                <span className="text-xs font-medium text-gray-700">
                  {displayName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Black keys container - positioned absolutely over white keys */}
        <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none">
          {blackKeyNotes.map(({ note, name, position }) => {
            const midiNote = getMidiNote(octave, note);
            const displayName = `${name}${octave}`;
            const isActive = activeNotes.has(midiNote);

            // Position black key between white keys
            const leftOffset = position * whiteKeyWidth + whiteKeyWidth - (blackKeyWidth / 2);

            return (
              <button
                key={`${octave}-${note}`}
                onClick={() => void playNote(midiNote)}
                disabled={!enabled}
                className={`absolute h-24 border border-gray-800 pointer-events-auto disabled:opacity-50 transition-colors ${
                  isActive
                    ? 'bg-gray-600'
                    : 'bg-black hover:bg-gray-800'
                }`}
                style={{
                  width: `${blackKeyWidth}px`,
                  left: `${leftOffset}px`
                }}
              >
                <span className="text-[10px] font-medium text-gray-300 block mt-auto mb-1">
                  {displayName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const octaves = Array.from({ length: octaveCount }, (_, i) => startOctave + i);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Piano className="h-5 w-5" />
            <CardTitle className="text-lg">Virtual Keyboard</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant={isAudioReady ? "default" : "secondary"}>
              {isAudioReady ? "Audio Ready" : "Loading Audio"}
            </Badge>
            <Badge variant={enabled ? "default" : "secondary"}>
              {enabled ? "Active" : "Disabled"}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Click keys or use computer keyboard: Z-M for white keys, S-D-G-H-J for black keys
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto pb-2">
          {octaves.map(octave => renderOctave(octave))}
        </div>
      </CardContent>
    </Card>
  );
}

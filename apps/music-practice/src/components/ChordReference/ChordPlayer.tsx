/**
 * ChordPlayer - Audio playback for chords using Web Audio API
 */

import { useState, useRef } from 'react';
import type { Chord } from '@/lib/chord-library';
import { Button } from '@hudak/ui/components/button';
import { Volume2, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChordPlayerProps {
  chord: Chord;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

// Simple frequency mapping for notes
const NOTE_FREQUENCIES: Record<string, number> = {
  'C4': 261.63,
  'C#4': 277.18,
  'D4': 293.66,
  'D#4': 311.13,
  'E4': 329.63,
  'F4': 349.23,
  'F#4': 369.99,
  'G4': 392.0,
  'G#4': 415.3,
  'A3': 220.0,
  'A4': 440.0,
  'A#4': 466.16,
  'B3': 246.94,
  'B4': 493.88,
  'C5': 523.25,
  'C#5': 554.37,
  'D5': 587.33,
  'D#5': 622.25,
  'E5': 659.25,
  'F5': 698.46,
  'F#5': 739.99,
  'G5': 783.99,
  'G#5': 830.61,
  'B♭4': 466.16,
};

export function ChordPlayer({ chord, variant = 'primary', size = 'md' }: ChordPlayerProps): JSX.Element {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainsRef = useRef<GainNode[]>([]);

  const createAudioContext = (): AudioContext => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  };

  const playChord = async () => {
    if (isPlaying) {
      stopChord();
      return;
    }

    setIsPlaying(true);
    const audioContext = createAudioContext();

    // Stop any existing oscillators
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    oscillatorsRef.current = [];
    gainsRef.current = [];

    const pianoNotes = chord.fingerings.piano || [];
    const duration = 3; // seconds

    pianoNotes.forEach((note, index) => {
      const frequency = NOTE_FREQUENCIES[note];
      if (!frequency) return;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      // Stagger the start time slightly for a more natural sound
      const startTime = audioContext.currentTime + index * 0.05;
      const endTime = startTime + duration;

      // ADSR envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, endTime);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(startTime);
      oscillator.stop(endTime);

      oscillatorsRef.current.push(oscillator);
      gainsRef.current.push(gain);
    });

    // Stop playing after duration
    setTimeout(() => {
      setIsPlaying(false);
    }, duration * 1000);
  };

  const stopChord = () => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    oscillatorsRef.current = [];
    setIsPlaying(false);
  };

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3',
    lg: 'h-12 px-4',
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        onClick={playChord}
        variant={variant === 'primary' ? 'default' : 'secondary'}
        className={`${sizeClasses[size]} gap-2 transition-colors`}
        disabled={!chord.fingerings.piano}
      >
        {isPlaying ? (
          <>
            <Pause className="w-4 h-4" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4" />
            <span>Play</span>
          </>
        )}
      </Button>
    </motion.div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';

interface ToneStartOptions {
  durationMs?: number;
  key?: string;
  stringNumber?: number;
}

interface SequenceNote {
  frequency: number;
  key: string;
  string: number;
}

interface SequenceOptions {
  gapMs?: number;
  key: string;
  noteDurationMs?: number;
}

export function useReferenceTonePlayer() {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [playingString, setPlayingString] = useState<number | null>(null);
  const [sequenceKey, setSequenceKey] = useState<string | null>(null);

  const toneContextRef = useRef<AudioContext | null>(null);
  const toneOscRef = useRef<OscillatorNode | null>(null);
  const toneGainRef = useRef<GainNode | null>(null);
  const toneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackTokenRef = useRef(0);
  const sequenceKeyRef = useRef<string | null>(null);

  useEffect(() => {
    sequenceKeyRef.current = sequenceKey;
  }, [sequenceKey]);

  const clearToneTimeout = useCallback(() => {
    if (toneTimeoutRef.current) {
      clearTimeout(toneTimeoutRef.current);
      toneTimeoutRef.current = null;
    }
  }, []);

  const clearSequenceTimeout = useCallback(() => {
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
  }, []);

  const releaseTone = useCallback(() => {
    const gain = toneGainRef.current;
    const osc = toneOscRef.current;
    const ctx = toneContextRef.current;
    if (!gain || !osc || !ctx) return;

    toneGainRef.current = null;
    toneOscRef.current = null;

    try {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);
      osc.stop(now + 0.2);
    } catch {
      // Tone was already released.
    }
  }, []);

  const ensureAudioContext = useCallback(async () => {
    if (!toneContextRef.current || toneContextRef.current.state === 'closed') {
      toneContextRef.current = new AudioContext();
    }

    const ctx = toneContextRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    return ctx;
  }, []);

  const stopTone = useCallback(() => {
    clearToneTimeout();
    setPlayingKey(null);
    setPlayingString(null);
    releaseTone();
  }, [clearToneTimeout, releaseTone]);

  const stopSequence = useCallback(() => {
    playbackTokenRef.current += 1;
    clearSequenceTimeout();
    setSequenceKey(null);
    stopTone();
  }, [clearSequenceTimeout, stopTone]);

  const playTone = useCallback(async (frequency: number, options: ToneStartOptions = {}) => {
    clearToneTimeout();
    releaseTone();

    const ctx = await ensureAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    setPlayingKey(options.key ?? null);
    setPlayingString(options.stringNumber ?? null);

    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.05);

    osc.start(now);
    toneOscRef.current = osc;
    toneGainRef.current = gain;

    toneTimeoutRef.current = setTimeout(() => {
      setPlayingKey(null);
      setPlayingString(null);
      releaseTone();
      toneTimeoutRef.current = null;
    }, options.durationMs ?? 5000);
  }, [clearToneTimeout, ensureAudioContext, releaseTone]);

  const startTone = useCallback(async (frequency: number, options: ToneStartOptions = {}) => {
    playbackTokenRef.current += 1;
    clearSequenceTimeout();
    setSequenceKey(null);
    await playTone(frequency, options);
  }, [clearSequenceTimeout, playTone]);

  const playSequence = useCallback((notes: SequenceNote[], options: SequenceOptions) => {
    if (sequenceKeyRef.current === options.key) {
      stopSequence();
      return;
    }

    playbackTokenRef.current += 1;
    const token = playbackTokenRef.current;
    const orderedNotes = [...notes].sort((a, b) => a.frequency - b.frequency);
    const noteDurationMs = options.noteDurationMs ?? 420;
    const gapMs = options.gapMs ?? 100;

    clearSequenceTimeout();
    setSequenceKey(options.key);

    const playNext = async (index: number) => {
      if (token !== playbackTokenRef.current) return;

      if (index >= orderedNotes.length) {
        setSequenceKey(null);
        stopTone();
        return;
      }

      const note = orderedNotes[index];
      await playTone(note.frequency, {
        durationMs: noteDurationMs,
        key: note.key,
        stringNumber: note.string,
      });

      if (token !== playbackTokenRef.current) return;

      sequenceTimeoutRef.current = setTimeout(() => {
        void playNext(index + 1);
      }, noteDurationMs + gapMs);
    };

    void playNext(0);
  }, [clearSequenceTimeout, playTone, stopSequence, stopTone]);

  useEffect(() => {
    const handleGlobalRelease = () => {
      if (!sequenceKeyRef.current && toneOscRef.current) {
        stopTone();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopSequence();
      }
    };

    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('pointercancel', handleGlobalRelease);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('pointercancel', handleGlobalRelease);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stopSequence, stopTone]);

  useEffect(() => {
    return () => {
      clearToneTimeout();
      clearSequenceTimeout();
      releaseTone();
      void toneContextRef.current?.close();
      toneContextRef.current = null;
    };
  }, [clearSequenceTimeout, clearToneTimeout, releaseTone]);

  return {
    playSequence,
    playingKey,
    playingString,
    sequenceKey,
    startTone,
    stopSequence,
    stopTone,
  };
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { RSVPEngine } from '@hudak/rsvp-core';
import type { RSVPConfig } from '@hudak/rsvp-core';

interface UseRSVPEngineOptions {
  text: string;
  initialConfig?: Partial<RSVPConfig>;
}

export function useRSVPEngine({ text, initialConfig }: UseRSVPEngineOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const engineRef = useRef<RSVPEngine | null>(null);

  // Initialize engine
  useEffect(() => {
    const engine = new RSVPEngine(text, initialConfig);
    engineRef.current = engine;

    setWordCount(engine.getWordCount());
    setCurrentWord(engine.getCurrentWord());

    // Set up callbacks
    engine.setOnWordChange((index, word) => {
      setCurrentIndex(index);
      setCurrentWord(word);
    });

    engine.setOnPlaybackChange((playing) => {
      setIsPlaying(playing);
    });

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [text, initialConfig]);

  const play = useCallback(() => {
    engineRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const togglePlayPause = useCallback(() => {
    engineRef.current?.togglePlayPause();
  }, []);

  const jumpTo = useCallback((index: number) => {
    engineRef.current?.jumpTo(index);
  }, []);

  const skipForward = useCallback((count: number = 10) => {
    engineRef.current?.skipForward(count);
  }, []);

  const skipBackward = useCallback((count: number = 10) => {
    engineRef.current?.skipBackward(count);
  }, []);

  const restart = useCallback(() => {
    engineRef.current?.restart();
  }, []);

  const updateConfig = useCallback((config: Partial<RSVPConfig>) => {
    engineRef.current?.updateConfig(config);
  }, []);

  return {
    currentIndex,
    currentWord,
    isPlaying,
    wordCount,
    play,
    pause,
    togglePlayPause,
    jumpTo,
    skipForward,
    skipBackward,
    restart,
    updateConfig,
  };
}

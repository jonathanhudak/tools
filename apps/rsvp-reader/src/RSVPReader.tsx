import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface RSVPReaderProps {
  text: string;
  onClose: () => void;
}

export default function RSVPReader({ text, onClose }: RSVPReaderProps) {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(400);
  const intervalRef = useRef<number | null>(null);

  // Split text into words on component mount
  useEffect(() => {
    const wordArray = text
      .split(/\s+/)
      .filter(word => word.length > 0);
    setWords(wordArray);
    setCurrentIndex(0);
  }, [text]);

  // Calculate ORP (Optimal Recognition Point) index for a word
  // Returns both the ORP index and the clean word for proper alignment
  const getORPInfo = (word: string): { orpIndex: number; leadingPunctCount: number } => {
    // Find leading punctuation
    const leadingMatch = word.match(/^[^\w]+/);
    const leadingPunctCount = leadingMatch ? leadingMatch[0].length : 0;

    // Remove leading/trailing punctuation for ORP calculation
    const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, '');
    if (cleanWord.length === 0) {
      return { orpIndex: 0, leadingPunctCount: 0 };
    }

    // ORP is typically at 1/3 of the word length (floored)
    // For "example" (7 letters), ORP is at index 2 (the 'a')
    const cleanOrpIndex = Math.floor(cleanWord.length / 3);

    // Adjust for leading punctuation to get the correct index in the original word
    const actualOrpIndex = cleanOrpIndex + leadingPunctCount;

    return { orpIndex: actualOrpIndex, leadingPunctCount };
  };

  // Calculate delay based on word characteristics
  const getWordDelay = useCallback((word: string): number => {
    const baseDelay = 60000 / wpm; // milliseconds per word

    // Check for punctuation at the end
    const hasPeriod = /[.!?]$/.test(word);
    const hasComma = /[,;:]$/.test(word);

    // Longer pause for sentence endings
    if (hasPeriod) return baseDelay * 2.5;
    // Medium pause for commas
    if (hasComma) return baseDelay * 1.5;

    // Default delay
    return baseDelay;
  }, [wpm]);

  // Playback effect
  useEffect(() => {
    if (!isPlaying || currentIndex >= words.length) {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      if (currentIndex >= words.length && isPlaying) {
        setIsPlaying(false);
      }
      return;
    }

    const currentWord = words[currentIndex];
    const delay = getWordDelay(currentWord);

    intervalRef.current = window.setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, delay);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentIndex, words, getWordDelay]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(words.length - 1, prev + 1));
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [words.length, onClose]);

  const togglePlayPause = () => {
    if (currentIndex >= words.length) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const skipBackward = () => {
    setCurrentIndex(prev => Math.max(0, prev - 10));
  };

  const skipForward = () => {
    setCurrentIndex(prev => Math.min(words.length - 1, prev + 10));
  };

  const currentWord = words[currentIndex] || '';
  const { orpIndex } = getORPInfo(currentWord);

  // Split word into three parts: before ORP, ORP letter, after ORP
  const beforeORP = currentWord.slice(0, orpIndex);
  const orpLetter = currentWord[orpIndex] || '';
  const afterORP = currentWord.slice(orpIndex + 1);

  // Calculate transform to center the ORP letter
  // Formula: shift = (wordLength / 2) - orpIndex - 0.5
  // The -0.5 accounts for character center positioning
  const transformShift = (currentWord.length / 2) - orpIndex - 0.5;

  const progress = words.length > 0 ? (currentIndex / words.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-secondary hover:bg-accent transition-colors text-sm font-medium"
            >
              ← Back
            </button>
            <div>
              <h2 className="text-lg font-semibold text-foreground">RSVP Reader</h2>
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} / {words.length} words
              </p>
            </div>
          </div>

          {/* WPM Control */}
          <div className="flex items-center gap-3">
            <label htmlFor="wpm-slider" className="text-sm font-medium text-foreground">
              {wpm} WPM
            </label>
            <input
              id="wpm-slider"
              type="range"
              min="100"
              max="1000"
              step="50"
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              className="w-32 accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Word Display - The critical zero-jiggle implementation */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Fixed viewport for word display */}
          <div className="relative h-32 flex items-center justify-center">
            {currentWord ? (
              <div
                className="text-6xl sm:text-7xl md:text-8xl font-mono font-bold tracking-tight"
                style={{
                  display: 'inline-block',
                  position: 'relative',
                }}
              >
                {/* The key to zero-jiggle: align the ORP letter at the exact center */}
                <span className="inline-block" style={{
                  transform: `translateX(calc(${transformShift} * 1ch))`,
                  transition: 'none', // No transitions to prevent jiggle
                  willChange: 'transform', // Optimize for transform changes
                }}>
                  <span className="text-foreground">{beforeORP}</span>
                  <span className="text-red-600 dark:text-red-500">{orpLetter}</span>
                  <span className="text-foreground">{afterORP}</span>
                </span>
              </div>
            ) : (
              <div className="text-2xl text-muted-foreground">
                Ready to read...
              </div>
            )}
          </div>

          {/* Guides - subtle vertical line to show center */}
          <div className="flex justify-center">
            <div className="w-px h-8 bg-muted-foreground/20" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={restart}
              className="p-3 rounded-xl bg-secondary hover:bg-accent transition-colors"
              aria-label="Restart"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              onClick={skipBackward}
              className="p-3 rounded-xl bg-secondary hover:bg-accent transition-colors"
              aria-label="Skip backward 10 words"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-6 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </button>

            <button
              onClick={skipForward}
              className="p-3 rounded-xl bg-secondary hover:bg-accent transition-colors"
              aria-label="Skip forward 10 words"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Press <kbd className="px-2 py-1 bg-muted rounded">Space</kbd> to play/pause • <kbd className="px-2 py-1 bg-muted rounded">←</kbd> <kbd className="px-2 py-1 bg-muted rounded">→</kbd> to navigate • <kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> to exit</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Type } from 'lucide-react';
import { AVAILABLE_FONTS, getDefaultFont, getFontById } from './fonts/fontConfig';
import { loadFont } from './fonts/fontLoader';
import type { FontConfig } from './fonts/fontConfig';

interface RSVPReaderProps {
  text: string;
  onClose: () => void;
}

export default function RSVPReader({ text, onClose }: RSVPReaderProps) {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(400);
  const [selectedFont, setSelectedFont] = useState<FontConfig>(getDefaultFont());
  const [isFontLoading, setIsFontLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Split text into words on component mount
  useEffect(() => {
    const wordArray = text
      .split(/\s+/)
      .filter(word => word.length > 0);
    setWords(wordArray);
    setCurrentIndex(0);
  }, [text]);

  // Load saved font preference and initialize font
  useEffect(() => {
    const savedFontId = localStorage.getItem('rsvp-font');
    if (savedFontId) {
      const font = getFontById(savedFontId);
      if (font) {
        setSelectedFont(font);
        // Load font asynchronously
        loadFont(font).catch(error => {
          console.error('Failed to load saved font:', error);
        });
      }
    }
  }, []);

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

  const handleFontChange = async (fontId: string) => {
    const font = getFontById(fontId);
    if (!font) return;

    setIsFontLoading(true);
    try {
      await loadFont(font);
      setSelectedFont(font);
      localStorage.setItem('rsvp-font', fontId);
    } catch (error) {
      console.error('Failed to load font:', error);
    } finally {
      setIsFontLoading(false);
    }
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
      <div className="border-b border-border bg-card/50 backdrop-blur-sm px-6 sm:px-8 lg:px-12 py-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-secondary hover:bg-accent transition-colors text-sm font-medium"
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

          {/* Font and WPM Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Font Selector */}
            <div className="flex items-center gap-3">
              <Type className="w-4 h-4 text-muted-foreground" />
              <select
                id="font-selector"
                value={selectedFont.id}
                onChange={(e) => handleFontChange(e.target.value)}
                disabled={isFontLoading}
                className="min-h-[40px] px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50"
                aria-label="Select font"
              >
                {AVAILABLE_FONTS.map(font => (
                  <option key={font.id} value={font.id}>
                    {font.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* WPM Control */}
            <div className="flex items-center gap-4">
              <label htmlFor="wpm-slider" className="text-sm font-medium text-foreground whitespace-nowrap">
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
                className="w-40 accent-primary"
              />
            </div>
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
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-16">
        <div className="w-full max-w-4xl">
          {/* Fixed viewport for word display */}
          <div className="relative h-40 sm:h-48 flex items-center justify-center">
            {currentWord ? (
              <div
                className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl ${selectedFont.cssClass} font-bold tracking-tight`}
                style={{
                  display: 'inline-block',
                  position: 'relative',
                }}
              >
                {/* The key to zero-jiggle: align the ORP letter at the exact center */}
                {/* Note: Monospace font is essential for RSVP - the 'ch' unit calculation relies on consistent character width */}
                {/* Font can be changed via selector - all available fonts are monospace for consistent rendering */}
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
            <div className="w-px h-10 bg-muted-foreground/20" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm px-6 sm:px-8 lg:px-12 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Control buttons - perfectly aligned with consistent tap targets */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={restart}
              className="min-h-[56px] min-w-[56px] p-4 rounded-2xl bg-secondary hover:bg-accent transition-colors flex items-center justify-center"
              aria-label="Restart"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              onClick={skipBackward}
              className="min-h-[56px] min-w-[56px] p-4 rounded-2xl bg-secondary hover:bg-accent transition-colors flex items-center justify-center"
              aria-label="Skip backward 10 words"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlayPause}
              className="min-h-[72px] min-w-[72px] p-6 rounded-3xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-9 h-9" />
              ) : (
                <Play className="w-9 h-9" />
              )}
            </button>

            <button
              onClick={skipForward}
              className="min-h-[56px] min-w-[56px] p-4 rounded-2xl bg-secondary hover:bg-accent transition-colors flex items-center justify-center"
              aria-label="Skip forward 10 words"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p className="leading-relaxed">
              Press <kbd className="px-2.5 py-1.5 bg-muted rounded-lg font-mono text-xs">Space</kbd> to play/pause •
              <kbd className="px-2.5 py-1.5 bg-muted rounded-lg font-mono text-xs ml-1">←</kbd>
              <kbd className="px-2.5 py-1.5 bg-muted rounded-lg font-mono text-xs ml-1">→</kbd> to navigate •
              <kbd className="px-2.5 py-1.5 bg-muted rounded-lg font-mono text-xs ml-1">Esc</kbd> to exit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

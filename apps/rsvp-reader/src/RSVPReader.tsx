import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Type } from 'lucide-react';
import { splitWordByORP, calculateORPShift } from '@hudak/rsvp-core';
import { useRSVPEngine } from './hooks/useRSVPEngine';
import { AVAILABLE_FONTS, getDefaultFont, getFontById } from './fonts/fontConfig';
import { loadFont } from './fonts/fontLoader';
import type { FontConfig } from './fonts/fontConfig';

interface RSVPReaderProps {
  text: string;
  onClose: () => void;
}

export default function RSVPReader({ text, onClose }: RSVPReaderProps) {
  const [wpm, setWpm] = useState(400);
  const [fontSize, setFontSize] = useState(100); // Font size percentage (100 = default)
  const [selectedFont, setSelectedFont] = useState<FontConfig>(getDefaultFont());
  const [isFontLoading, setIsFontLoading] = useState(false);

  // Use the RSVP engine hook
  const {
    currentIndex,
    currentWord,
    isPlaying,
    wordCount,
    togglePlayPause,
    skipForward,
    skipBackward,
    restart,
    updateConfig,
  } = useRSVPEngine({
    text,
    initialConfig: { wpm },
  });

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

  // Update engine config when WPM changes
  useEffect(() => {
    updateConfig({ wpm });
  }, [wpm, updateConfig]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skipBackward(1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skipForward(1);
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose, togglePlayPause, skipBackward, skipForward]);

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

  // Use core library functions for ORP calculation
  const wordParts = splitWordByORP(currentWord);
  const transformShift = calculateORPShift(currentWord, wordParts.beforeORP.length);
  const progress = wordCount > 0 ? (currentIndex / wordCount) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm px-6 sm:px-8 lg:px-12 py-5">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
          {/* Top row: Back button and title */}
          <div className="w-full flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-secondary hover:bg-accent transition-colors text-sm font-medium"
            >
              ← Back
            </button>
            <div className="text-center flex-1">
              <h2 className="text-lg font-semibold text-foreground">RSVP Reader</h2>
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} / {wordCount} words
              </p>
            </div>
            {/* Spacer for symmetry */}
            <div className="min-w-[80px]" />
          </div>

          {/* Font, WPM, and Font Size Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full flex-wrap">
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
            <div className="flex items-center gap-3">
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
                className="w-32 sm:w-40 accent-primary"
              />
            </div>

            {/* Font Size Control */}
            <div className="flex items-center gap-3">
              <label htmlFor="font-slider" className="text-sm font-medium text-foreground whitespace-nowrap">
                Font {fontSize}%
              </label>
              <input
                id="font-slider"
                type="range"
                min="50"
                max="150"
                step="5"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-32 sm:w-40 accent-primary"
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
          {/* Fixed viewport for word display - with overflow containment */}
          <div className="relative min-h-[120px] sm:min-h-[140px] flex items-center justify-center overflow-hidden">
            {currentWord ? (
              <div
                className={`${selectedFont.cssClass} font-bold tracking-tight`}
                style={{
                  display: 'inline-block',
                  position: 'relative',
                  // More conservative mobile sizing: 8vw instead of 12vw, with min/max bounds
                  // Scale based on fontSize slider (50-150%)
                  fontSize: `clamp(${2.0 * (fontSize / 100)}rem, ${8 * (fontSize / 100)}vw, ${6 * (fontSize / 100)}rem)`,
                  lineHeight: '1.2',
                  maxWidth: '100%', // Ensure word doesn't exceed container
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
                  <span className="text-foreground">{wordParts.beforeORP}</span>
                  <span className="text-red-600 dark:text-red-500">{wordParts.orpLetter}</span>
                  <span className="text-foreground">{wordParts.afterORP}</span>
                </span>
              </div>
            ) : (
              <div className="text-xl sm:text-2xl text-muted-foreground text-center px-4">
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
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
          {/* Control buttons - perfectly aligned with consistent tap targets */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
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
          <div className="text-center text-xs sm:text-sm text-muted-foreground max-w-lg">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 leading-relaxed">
              <span className="whitespace-nowrap">
                Press <kbd className="px-2 py-1 bg-muted rounded-lg font-mono text-xs">Space</kbd> to play/pause
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">
                <kbd className="px-2 py-1 bg-muted rounded-lg font-mono text-xs">←</kbd>
                <kbd className="px-2 py-1 bg-muted rounded-lg font-mono text-xs ml-1">→</kbd> to navigate
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">
                <kbd className="px-2 py-1 bg-muted rounded-lg font-mono text-xs">Esc</kbd> to exit
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

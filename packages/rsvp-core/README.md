# @hudak/rsvp-core

Core RSVP (Rapid Serial Visual Presentation) reading engine. Framework-agnostic TypeScript library for building speed reading applications.

## Features

- **ORP (Optimal Recognition Point) calculation** - Automatically finds the ideal focal point in each word
- **Smart timing** - Adjusts delays based on punctuation for natural reading rhythm
- **Zero-jiggle display support** - Provides calculations for stable word positioning
- **Framework-agnostic** - Works with React, Vue, vanilla JS, browser extensions, etc.
- **Fully typed** - Complete TypeScript definitions

## Installation

```bash
pnpm add @hudak/rsvp-core
```

## Usage

### Basic Example

```typescript
import { RSVPEngine, splitWordByORP } from '@hudak/rsvp-core';

// Create engine with text and configuration
const engine = new RSVPEngine("Hello world! This is a test.", {
  wpm: 400,
  sentenceDelayMultiplier: 2.5,
  clauseDelayMultiplier: 1.5,
});

// Listen for word changes
engine.setOnWordChange((index, word) => {
  const parts = splitWordByORP(word);
  console.log(`[${parts.beforeORP}][${parts.orpLetter}][${parts.afterORP}]`);
});

// Start reading
engine.play();
```

### React Integration Example

```tsx
import { useEffect, useState } from 'react';
import { RSVPEngine, splitWordByORP, calculateORPShift } from '@hudak/rsvp-core';

function RSVPReader({ text }: { text: string }) {
  const [engine] = useState(() => new RSVPEngine(text, { wpm: 400 }));
  const [currentWord, setCurrentWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    engine.setOnWordChange((_, word) => setCurrentWord(word));
    engine.setOnPlaybackChange(setIsPlaying);
    return () => engine.destroy();
  }, [engine]);

  const parts = splitWordByORP(currentWord);
  const shift = calculateORPShift(currentWord, parts.beforeORP.length);

  return (
    <div>
      <div style={{ transform: `translateX(calc(${shift} * 1ch))` }}>
        <span>{parts.beforeORP}</span>
        <span style={{ color: 'red' }}>{parts.orpLetter}</span>
        <span>{parts.afterORP}</span>
      </div>
      <button onClick={() => engine.togglePlayPause()}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
```

## API Reference

### RSVPEngine

Core engine class for managing RSVP playback.

#### Constructor

```typescript
new RSVPEngine(text: string, config?: Partial<RSVPConfig>)
```

#### Methods

- `play()` - Start or resume playback
- `pause()` - Pause playback
- `togglePlayPause()` - Toggle between play and pause
- `jumpTo(index: number)` - Jump to specific word
- `skipForward(count?: number)` - Skip forward by count words (default: 1)
- `skipBackward(count?: number)` - Skip backward by count words (default: 1)
- `restart()` - Restart from beginning
- `updateConfig(config: Partial<RSVPConfig>)` - Update configuration
- `loadText(text: string)` - Load new text
- `getCurrentWord()` - Get current word
- `getWordCount()` - Get total word count
- `getState()` - Get current engine state
- `destroy()` - Clean up engine

#### Event Callbacks

- `setOnWordChange(callback: (index: number, word: string) => void)`
- `setOnPlaybackChange(callback: (isPlaying: boolean) => void)`
- `setOnComplete(callback: () => void)`

### ORP Utilities

```typescript
// Get ORP information for a word
getORPInfo(word: string): { orpIndex: number; leadingPunctCount: number }

// Split word into parts for rendering
splitWordByORP(word: string): {
  beforeORP: string;
  orpLetter: string;
  afterORP: string;
  fullWord: string;
}

// Calculate shift for zero-jiggle display
calculateORPShift(word: string, orpIndex: number): number
```

### Timing Utilities

```typescript
// Calculate delay for a word (in milliseconds)
calculateWordDelay(word: string, config: RSVPConfig): number

// Calculate reading progress (0-100)
calculateProgress(currentIndex: number, totalWords: number): number

// Estimate total reading time
estimateReadingTime(words: string[], config: RSVPConfig): number
```

### Text Utilities

```typescript
// Split text into words
splitTextIntoWords(text: string): string[]

// Validate text
validateText(text: string): { valid: boolean; error?: string }

// Extract text from HTML
extractTextFromHTML(html: string): string
```

## Configuration

```typescript
interface RSVPConfig {
  wpm: number;                        // Words per minute (default: 400)
  sentenceDelayMultiplier?: number;   // Delay multiplier for .!? (default: 2.5)
  clauseDelayMultiplier?: number;     // Delay multiplier for ,;: (default: 1.5)
}
```

## License

ISC

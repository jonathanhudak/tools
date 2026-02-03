/**
 * Configuration for RSVP reading session
 */
export interface RSVPConfig {
  /** Words per minute reading speed */
  wpm: number;
  /** Multiplier for delay after sentence-ending punctuation (.!?) */
  sentenceDelayMultiplier?: number;
  /** Multiplier for delay after clause-ending punctuation (,;:) */
  clauseDelayMultiplier?: number;
}

/**
 * Information about a word's Optimal Recognition Point (ORP)
 */
export interface ORPInfo {
  /** Index of the ORP character in the original word */
  orpIndex: number;
  /** Number of leading punctuation characters */
  leadingPunctCount: number;
}

/**
 * Split word parts for rendering
 */
export interface WordParts {
  /** Text before the ORP character */
  beforeORP: string;
  /** The ORP character itself */
  orpLetter: string;
  /** Text after the ORP character */
  afterORP: string;
  /** The complete original word */
  fullWord: string;
}

/**
 * State of the RSVP reader
 */
export interface RSVPState {
  /** Array of words to display */
  words: string[];
  /** Current word index (0-based) */
  currentIndex: number;
  /** Whether playback is active */
  isPlaying: boolean;
  /** Configuration settings */
  config: RSVPConfig;
}

/**
 * Callback for when the current word changes
 */
export type OnWordChangeCallback = (index: number, word: string) => void;

/**
 * Callback for when playback state changes
 */
export type OnPlaybackChangeCallback = (isPlaying: boolean) => void;

/**
 * Callback for when playback completes
 */
export type OnCompleteCallback = () => void;

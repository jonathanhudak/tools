import type { RSVPConfig } from './types';

/**
 * Default configuration for RSVP timing
 */
export const DEFAULT_CONFIG: RSVPConfig = {
  wpm: 400,
  sentenceDelayMultiplier: 2.5,
  clauseDelayMultiplier: 1.5,
};

/**
 * Calculate the delay (in milliseconds) for displaying a word.
 * Adjusts timing based on punctuation to allow natural reading rhythm.
 *
 * @param word - The word to calculate delay for
 * @param config - RSVP configuration
 * @returns Delay in milliseconds
 *
 * @example
 * ```ts
 * calculateWordDelay("hello", { wpm: 400 })  // ~150ms
 * calculateWordDelay("hello.", { wpm: 400 }) // ~375ms (longer pause for period)
 * calculateWordDelay("hello,", { wpm: 400 }) // ~225ms (medium pause for comma)
 * ```
 */
export function calculateWordDelay(word: string, config: RSVPConfig): number {
  const baseDelay = 60000 / config.wpm; // milliseconds per word

  // Check for punctuation at the end
  const hasSentenceEnd = /[.!?]$/.test(word);
  const hasClauseEnd = /[,;:]$/.test(word);

  const sentenceMult = config.sentenceDelayMultiplier ?? DEFAULT_CONFIG.sentenceDelayMultiplier!;
  const clauseMult = config.clauseDelayMultiplier ?? DEFAULT_CONFIG.clauseDelayMultiplier!;

  // Longer pause for sentence endings
  if (hasSentenceEnd) {
    return baseDelay * sentenceMult;
  }

  // Medium pause for commas and other clause delimiters
  if (hasClauseEnd) {
    return baseDelay * clauseMult;
  }

  // Default delay
  return baseDelay;
}

/**
 * Calculate reading progress as a percentage.
 *
 * @param currentIndex - Current word index (0-based)
 * @param totalWords - Total number of words
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(currentIndex: number, totalWords: number): number {
  if (totalWords === 0) return 0;
  return (currentIndex / totalWords) * 100;
}

/**
 * Estimate total reading time for a text.
 *
 * @param words - Array of words
 * @param config - RSVP configuration
 * @returns Estimated time in milliseconds
 */
export function estimateReadingTime(words: string[], config: RSVPConfig): number {
  return words.reduce((total, word) => {
    return total + calculateWordDelay(word, config);
  }, 0);
}

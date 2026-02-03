/**
 * @hudak/rsvp-core
 *
 * Core RSVP (Rapid Serial Visual Presentation) reading engine.
 * Framework-agnostic TypeScript library for building speed reading applications.
 *
 * @example
 * ```ts
 * import { RSVPEngine, getORPInfo, splitWordByORP } from '@hudak/rsvp-core';
 *
 * const engine = new RSVPEngine("Hello world! This is a test.", { wpm: 400 });
 *
 * engine.setOnWordChange((index, word) => {
 *   const parts = splitWordByORP(word);
 *   console.log(`Word ${index}: ${parts.beforeORP}[${parts.orpLetter}]${parts.afterORP}`);
 * });
 *
 * engine.play();
 * ```
 */

// Core engine
export { RSVPEngine } from './engine';

// ORP utilities
export { getORPInfo, splitWordByORP, calculateORPShift } from './orp';

// Timing utilities
export {
  calculateWordDelay,
  calculateProgress,
  estimateReadingTime,
  DEFAULT_CONFIG,
} from './timing';

// Text processing utilities
export { splitTextIntoWords, validateText, extractTextFromHTML } from './text';

// Types
export type {
  RSVPConfig,
  RSVPState,
  ORPInfo,
  WordParts,
  OnWordChangeCallback,
  OnPlaybackChangeCallback,
  OnCompleteCallback,
} from './types';

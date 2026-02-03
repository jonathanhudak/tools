import type {
  RSVPConfig,
  RSVPState,
  OnWordChangeCallback,
  OnPlaybackChangeCallback,
  OnCompleteCallback,
} from './types';
import { calculateWordDelay, DEFAULT_CONFIG } from './timing';
import { splitTextIntoWords } from './text';

/**
 * Core RSVP reading engine.
 * Manages playback state, timing, and word progression.
 * Framework-agnostic - can be used in any JavaScript environment.
 */
export class RSVPEngine {
  private state: RSVPState;
  private timerId: number | null = null;
  private onWordChange?: OnWordChangeCallback;
  private onPlaybackChange?: OnPlaybackChangeCallback;
  private onComplete?: OnCompleteCallback;

  constructor(text: string, config: Partial<RSVPConfig> = {}) {
    this.state = {
      words: splitTextIntoWords(text),
      currentIndex: 0,
      isPlaying: false,
      config: { ...DEFAULT_CONFIG, ...config },
    };
  }

  /**
   * Get the current state of the engine.
   */
  getState(): Readonly<RSVPState> {
    return { ...this.state };
  }

  /**
   * Get the current word being displayed.
   */
  getCurrentWord(): string {
    return this.state.words[this.state.currentIndex] || '';
  }

  /**
   * Get the total number of words.
   */
  getWordCount(): number {
    return this.state.words.length;
  }

  /**
   * Start or resume playback.
   */
  play(): void {
    if (this.state.isPlaying) return;

    // If at the end, restart from beginning
    if (this.state.currentIndex >= this.state.words.length) {
      this.state.currentIndex = 0;
    }

    this.state.isPlaying = true;
    this.onPlaybackChange?.(true);
    this.scheduleNextWord();
  }

  /**
   * Pause playback.
   */
  pause(): void {
    if (!this.state.isPlaying) return;

    this.state.isPlaying = false;
    this.clearTimer();
    this.onPlaybackChange?.(false);
  }

  /**
   * Toggle between play and pause.
   */
  togglePlayPause(): void {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Jump to a specific word index.
   */
  jumpTo(index: number): void {
    const newIndex = Math.max(0, Math.min(index, this.state.words.length - 1));
    const wasPlaying = this.state.isPlaying;

    this.pause();
    this.state.currentIndex = newIndex;
    this.onWordChange?.(newIndex, this.getCurrentWord());

    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Move forward by a number of words.
   */
  skipForward(count: number = 1): void {
    this.jumpTo(this.state.currentIndex + count);
  }

  /**
   * Move backward by a number of words.
   */
  skipBackward(count: number = 1): void {
    this.jumpTo(this.state.currentIndex - count);
  }

  /**
   * Restart from the beginning.
   */
  restart(): void {
    this.pause();
    this.state.currentIndex = 0;
    this.onWordChange?.(0, this.getCurrentWord());
  }

  /**
   * Update the configuration (e.g., WPM).
   */
  updateConfig(config: Partial<RSVPConfig>): void {
    this.state.config = { ...this.state.config, ...config };
  }

  /**
   * Load new text for reading.
   */
  loadText(text: string): void {
    const wasPlaying = this.state.isPlaying;
    this.pause();
    this.state.words = splitTextIntoWords(text);
    this.state.currentIndex = 0;
    this.onWordChange?.(0, this.getCurrentWord());

    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Register callback for word changes.
   */
  setOnWordChange(callback: OnWordChangeCallback): void {
    this.onWordChange = callback;
  }

  /**
   * Register callback for playback state changes.
   */
  setOnPlaybackChange(callback: OnPlaybackChangeCallback): void {
    this.onPlaybackChange = callback;
  }

  /**
   * Register callback for when reading completes.
   */
  setOnComplete(callback: OnCompleteCallback): void {
    this.onComplete = callback;
  }

  /**
   * Clean up and stop the engine.
   */
  destroy(): void {
    this.pause();
    this.onWordChange = undefined;
    this.onPlaybackChange = undefined;
    this.onComplete = undefined;
  }

  private scheduleNextWord(): void {
    if (!this.state.isPlaying) return;

    const currentWord = this.getCurrentWord();
    const delay = calculateWordDelay(currentWord, this.state.config);

    this.timerId = window.setTimeout(() => {
      this.advanceWord();
    }, delay);
  }

  private advanceWord(): void {
    this.state.currentIndex++;

    if (this.state.currentIndex >= this.state.words.length) {
      // Reached the end
      this.state.isPlaying = false;
      this.onPlaybackChange?.(false);
      this.onComplete?.();
      return;
    }

    this.onWordChange?.(this.state.currentIndex, this.getCurrentWord());
    this.scheduleNextWord();
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

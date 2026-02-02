/**
 * Core types for audio visualization
 */

export interface WaveformOptions {
  /** Number of data points to extract */
  sampleCount?: number;
  /** Channel to analyze (0 for left, 1 for right, -1 for average) */
  channel?: number;
  /** Whether to normalize amplitude to 0-1 range */
  normalize?: boolean;
}

export interface WaveformData {
  /** Amplitude values */
  amplitudes: number[];
  /** Peak amplitude value */
  peak: number;
  /** RMS (root mean square) value */
  rms: number;
  /** Duration in seconds */
  duration: number;
  /** Sample rate */
  sampleRate: number;
}

export interface ColorPaletteOptions {
  /** Base hue (0-360) to start from */
  baseHue?: number;
  /** Chroma (saturation) value (0-100) */
  chroma?: number;
  /** Lightness value (0-100) */
  lightness?: number;
  /** Strategy for generating colors */
  strategy?: 'complementary' | 'analogous' | 'triadic' | 'split-complementary';
}

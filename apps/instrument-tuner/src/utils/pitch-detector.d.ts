/**
 * Pitch Detector
 * Wraps the pitchy library for real-time monophonic pitch detection
 * Uses McLeod Pitch Method (MPM) for accurate fundamental frequency detection
 */
export interface PitchResult {
    frequency: number;
    midi: number;
    cents: number;
    clarity: number;
    detected: boolean;
}
export interface DetectorConfig {
    bufferSize: number;
    sampleRate: number;
    minClarity: number;
    minFrequency: number;
    maxFrequency: number;
}
export declare class PitchDetector {
    private detector;
    private config;
    constructor(config?: Partial<DetectorConfig>);
    /**
     * Detect pitch from audio buffer
     * @param buffer - Float32Array of audio samples
     * @param sampleRate - Sample rate of the audio (optional, uses config default)
     * @returns PitchResult with frequency, MIDI note, and clarity
     */
    detectPitch(buffer: Float32Array, sampleRate?: number): PitchResult;
    /**
     * Check if detected pitch is valid based on clarity and frequency range
     */
    private isValidDetection;
    /**
     * Update detector configuration
     */
    updateConfig(config: Partial<DetectorConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): DetectorConfig;
    /**
     * Set minimum clarity threshold
     */
    setMinClarity(clarity: number): void;
    /**
     * Set frequency range for detection
     */
    setFrequencyRange(min: number, max: number): void;
    /**
     * Create detector optimized for specific instrument
     */
    static forInstrument(instrument: 'guitar' | 'violin' | 'voice'): PitchDetector;
}
/**
 * Helper function to create a pitch detector with default settings
 */
export declare function createPitchDetector(config?: Partial<DetectorConfig>): PitchDetector;
/**
 * Simplified pitch detection function for quick use
 * @param buffer - Audio buffer
 * @param sampleRate - Sample rate
 * @param minClarity - Minimum clarity threshold (0-1)
 * @returns Detected frequency or null if no pitch detected
 */
export declare function detectFrequency(buffer: Float32Array, sampleRate?: number, minClarity?: number): number | null;
//# sourceMappingURL=pitch-detector.d.ts.map
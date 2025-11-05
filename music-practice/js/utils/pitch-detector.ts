/**
 * Pitch Detector
 * Wraps the pitchy library for real-time monophonic pitch detection
 * Uses McLeod Pitch Method (MPM) for accurate fundamental frequency detection
 */

import { PitchDetector as PitchyDetector } from 'pitchy';
import { frequencyToMidi, getCentsFromMidi } from './music-theory.js';

// Type definitions
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

export class PitchDetector {
    private detector: PitchyDetector<Float32Array>;
    private config: DetectorConfig;

    constructor(config: Partial<DetectorConfig> = {}) {
        // Default configuration optimized for musical instruments
        this.config = {
            bufferSize: config.bufferSize || 2048,
            sampleRate: config.sampleRate || 44100,
            minClarity: config.minClarity || 0.75,
            minFrequency: config.minFrequency || 70,  // Below E2 (guitar low E)
            maxFrequency: config.maxFrequency || 1600 // Above G6 (violin high range)
        };

        // Initialize pitchy detector
        this.detector = PitchyDetector.forFloat32Array(this.config.bufferSize);
        this.detector.minVolumeDecibels = -40; // Noise gate
    }

    /**
     * Detect pitch from audio buffer
     * @param buffer - Float32Array of audio samples
     * @param sampleRate - Sample rate of the audio (optional, uses config default)
     * @returns PitchResult with frequency, MIDI note, and clarity
     */
    detectPitch(buffer: Float32Array, sampleRate?: number): PitchResult {
        const rate = sampleRate || this.config.sampleRate;

        // Use pitchy's findPitch method (returns [frequency, clarity])
        const [frequency, clarity] = this.detector.findPitch(buffer, rate);

        // Check if detection is valid
        const isValid = this.isValidDetection(frequency, clarity);

        if (!isValid) {
            return {
                frequency: 0,
                midi: 0,
                cents: 0,
                clarity: clarity || 0,
                detected: false
            };
        }

        // Convert frequency to MIDI note
        const midi = frequencyToMidi(frequency);

        // Calculate cents deviation from the MIDI note
        const cents = getCentsFromMidi(frequency, midi);

        return {
            frequency,
            midi,
            cents,
            clarity: clarity || 0,
            detected: true
        };
    }

    /**
     * Check if detected pitch is valid based on clarity and frequency range
     */
    private isValidDetection(frequency: number, clarity: number): boolean {
        if (!frequency || frequency <= 0) return false;
        if (!clarity || clarity < this.config.minClarity) return false;
        if (frequency < this.config.minFrequency) return false;
        if (frequency > this.config.maxFrequency) return false;
        return true;
    }

    /**
     * Update detector configuration
     */
    updateConfig(config: Partial<DetectorConfig>): void {
        this.config = { ...this.config, ...config };

        // Recreate detector if buffer size changed
        if (config.bufferSize && config.bufferSize !== this.config.bufferSize) {
            this.detector = PitchyDetector.forFloat32Array(this.config.bufferSize);
            this.detector.minVolumeDecibels = -40;
        }
    }

    /**
     * Get current configuration
     */
    getConfig(): DetectorConfig {
        return { ...this.config };
    }

    /**
     * Set minimum clarity threshold
     */
    setMinClarity(clarity: number): void {
        this.config.minClarity = Math.max(0, Math.min(1, clarity));
    }

    /**
     * Set frequency range for detection
     */
    setFrequencyRange(min: number, max: number): void {
        this.config.minFrequency = min;
        this.config.maxFrequency = max;
    }

    /**
     * Create detector optimized for specific instrument
     */
    static forInstrument(instrument: 'guitar' | 'violin' | 'voice'): PitchDetector {
        const configs = {
            guitar: {
                bufferSize: 2048,
                minClarity: 0.75,
                minFrequency: 70,   // E2
                maxFrequency: 1400  // E6
            },
            violin: {
                bufferSize: 2048,
                minClarity: 0.80,
                minFrequency: 180,  // Below G3
                maxFrequency: 1600  // Above G6
            },
            voice: {
                bufferSize: 2048,
                minClarity: 0.85,
                minFrequency: 80,   // E2
                maxFrequency: 1200  // D6
            }
        };

        return new PitchDetector(configs[instrument]);
    }
}

/**
 * Helper function to create a pitch detector with default settings
 */
export function createPitchDetector(config?: Partial<DetectorConfig>): PitchDetector {
    return new PitchDetector(config);
}

/**
 * Simplified pitch detection function for quick use
 * @param buffer - Audio buffer
 * @param sampleRate - Sample rate
 * @param minClarity - Minimum clarity threshold (0-1)
 * @returns Detected frequency or null if no pitch detected
 */
export function detectFrequency(
    buffer: Float32Array,
    sampleRate: number = 44100,
    minClarity: number = 0.75
): number | null {
    const detector = new PitchDetector({ sampleRate, minClarity });
    const result = detector.detectPitch(buffer);
    return result.detected ? result.frequency : null;
}

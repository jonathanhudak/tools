/**
 * Audio Tone Generator
 * Generates sine wave reference tones for practice
 */

export class AudioToneGenerator {
    private audioContext: AudioContext | null = null;
    private currentOscillator: OscillatorNode | null = null;
    private currentGain: GainNode | null = null;

    constructor() {
        // Lazy initialization - create on first use
    }

    /**
     * Initialize audio context if not already initialized
     */
    private initAudioContext(): void {
        if (!this.audioContext || this.audioContext.state === 'closed') {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        // Resume if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => {
                console.error('Failed to resume tone generator AudioContext:', err);
            });
        }
    }

    /**
     * Play a sine wave tone at the specified frequency
     * @param frequency - Frequency in Hz
     * @param duration - Duration in milliseconds (default: 1000ms)
     * @param volume - Volume level 0-1 (default: 0.3)
     */
    playTone(frequency: number, duration: number = 1000, volume: number = 0.3): void {
        try {
            // Stop any currently playing tone
            this.stopTone();

            // Initialize audio context
            this.initAudioContext();

            if (!this.audioContext || this.audioContext.state === 'closed') {
                console.error('Failed to create audio context');
                return;
            }

            // Create oscillator and gain nodes
            this.currentOscillator = this.audioContext.createOscillator();
            this.currentGain = this.audioContext.createGain();

            // Configure oscillator
            this.currentOscillator.type = 'sine';
            this.currentOscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            // Configure gain (volume) with fade in/out
            const now = this.audioContext.currentTime;
            const fadeTime = 0.02; // 20ms fade in/out to prevent clicks

            this.currentGain.gain.setValueAtTime(0, now);
            this.currentGain.gain.linearRampToValueAtTime(volume, now + fadeTime);
            this.currentGain.gain.setValueAtTime(volume, now + (duration / 1000) - fadeTime);
            this.currentGain.gain.linearRampToValueAtTime(0, now + (duration / 1000));

            // Connect nodes: oscillator -> gain -> destination
            this.currentOscillator.connect(this.currentGain);
            this.currentGain.connect(this.audioContext.destination);

            // Start and stop oscillator
            this.currentOscillator.start(now);
            this.currentOscillator.stop(now + (duration / 1000));

            // Clean up after tone finishes
            this.currentOscillator.onended = () => {
                this.cleanup();
            };
        } catch (error) {
            console.error('Error playing tone:', error);
            this.cleanup();
        }
    }

    /**
     * Stop the currently playing tone
     */
    stopTone(): void {
        if (this.currentOscillator) {
            try {
                this.currentOscillator.stop();
            } catch (e) {
                // Already stopped or not started
            }
            this.cleanup();
        }
    }

    /**
     * Clean up oscillator and gain nodes
     */
    private cleanup(): void {
        if (this.currentOscillator) {
            this.currentOscillator.disconnect();
            this.currentOscillator = null;
        }
        if (this.currentGain) {
            this.currentGain.disconnect();
            this.currentGain = null;
        }
    }

    /**
     * Check if audio context is supported
     */
    static isSupported(): boolean {
        return !!(window.AudioContext || (window as any).webkitAudioContext);
    }

    /**
     * Close the audio context and release resources
     */
    dispose(): void {
        this.stopTone();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

/**
 * Helper function to play a tone from MIDI note number
 * @param midiNote - MIDI note number (0-127)
 * @param duration - Duration in milliseconds
 * @param volume - Volume level 0-1
 */
export function playMidiNote(midiNote: number, duration: number = 1000, volume: number = 0.3): void {
    const frequency = midiToFrequency(midiNote);
    const generator = new AudioToneGenerator();
    generator.playTone(frequency, duration, volume);
}

/**
 * Convert MIDI note number to frequency in Hz
 * Uses A4 = 440 Hz as reference
 */
export function midiToFrequency(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
}

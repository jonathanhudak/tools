/**
 * Audio Manager
 * Manages microphone access and real-time pitch detection for stringed/bowed instruments
 */

import { PitchDetector, PitchResult } from '../utils/pitch-detector';
import { midiToNoteName } from '../utils/music-theory';

// Type definitions
export interface AudioConfig {
    bufferSize: number;
    smoothing: number;
    minClarity: number;
    minFrequency: number;
    maxFrequency: number;
}

export interface PitchDetectedEvent {
    frequency: number;
    midi: number;
    cents: number;
    clarity: number;
    noteName: string;
    timestamp: number;
}

export interface AudioLevelEvent {
    level: number; // 0-1
    timestamp: number;
}

export interface ErrorEvent {
    message: string;
    error?: Error;
}

export interface StatusChangeEvent {
    listening: boolean;
    microphoneActive: boolean;
}

type EventCallback<T> = (event: T) => void;

interface Listeners {
    pitchDetected: EventCallback<PitchDetectedEvent>[];
    audioLevel: EventCallback<AudioLevelEvent>[];
    error: EventCallback<ErrorEvent>[];
    statusChange: EventCallback<StatusChangeEvent>[];
}

export type EventType = keyof Listeners;

export class AudioManager {
    private audioContext: AudioContext | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;
    private analyser: AnalyserNode | null = null;
    private pitchDetector: PitchDetector | null = null;
    private animationFrameId: number | null = null;
    private stream: MediaStream | null = null;

    private config: AudioConfig;
    private listeners: Listeners;
    private isListening: boolean = false;
    private buffer: Float32Array<ArrayBuffer> | null = null;

    // Debouncing for note detection
    private lastDetectedMidi: number | null = null;
    private lastDetectedTime: number = 0;
    private noteDebounceMs: number = 100; // Min time between note detections

    constructor(config: Partial<AudioConfig> = {}) {
        this.config = {
            bufferSize: config.bufferSize || 2048,
            smoothing: config.smoothing || 0.8,
            minClarity: config.minClarity || 0.75,
            minFrequency: config.minFrequency || 70,
            maxFrequency: config.maxFrequency || 1600
        };

        this.listeners = {
            pitchDetected: [],
            audioLevel: [],
            error: [],
            statusChange: []
        };
    }

    /**
     * Initialize audio context and request microphone access
     * @param deviceId - Optional specific device ID to use
     */
    async init(deviceId?: string): Promise<boolean> {
        try {
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.emitError('Microphone access is not supported in this browser. Try Chrome or Edge.');
                return false;
            }

            // Create audio context
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Set up error handler for audio context
            this.setupAudioContextErrorHandlers();

            // Resume audio context if it's suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Request microphone access
            const audioConstraints: MediaTrackConstraints = {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                sampleRate: 44100
            };

            // Add device ID if specified
            if (deviceId) {
                audioConstraints.deviceId = { exact: deviceId };
            }

            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: audioConstraints
            });

            // Create audio nodes
            this.microphone = this.audioContext.createMediaStreamSource(this.stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.config.bufferSize * 2;
            this.analyser.smoothingTimeConstant = this.config.smoothing;

            // Connect nodes
            this.microphone.connect(this.analyser);

            // Create buffer for time-domain data
            this.buffer = new Float32Array(this.config.bufferSize) as Float32Array<ArrayBuffer>;

            // Initialize pitch detector
            this.pitchDetector = new PitchDetector({
                bufferSize: this.config.bufferSize,
                sampleRate: this.audioContext.sampleRate,
                minClarity: this.config.minClarity,
                minFrequency: this.config.minFrequency,
                maxFrequency: this.config.maxFrequency
            });

            console.log('Audio Manager initialized successfully');
            console.log('Sample rate:', this.audioContext.sampleRate);
            console.log('Buffer size:', this.config.bufferSize);
            console.log('Audio context state:', this.audioContext.state);

            this.emitStatusChange({ listening: false, microphoneActive: true });
            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            this.emitError('Failed to access microphone. Please check your browser permissions.', error as Error);
            return false;
        }
    }

    /**
     * Setup error handlers for AudioContext
     */
    private setupAudioContextErrorHandlers(): void {
        if (!this.audioContext) return;

        // Handle state changes
        this.audioContext.addEventListener('statechange', () => {
            console.log('AudioContext state changed to:', this.audioContext?.state);

            if (this.audioContext?.state === 'suspended') {
                console.warn('AudioContext suspended, attempting to resume...');
                this.audioContext.resume().catch(err => {
                    console.error('Failed to resume AudioContext:', err);
                });
            } else if (this.audioContext?.state === 'closed') {
                console.error('AudioContext closed unexpectedly');
                this.emitError('Audio system closed unexpectedly. Please reconnect your microphone.');
            }
        });
    }

    /**
     * Start listening for pitch
     */
    startListening(): void {
        if (!this.audioContext || !this.analyser || !this.pitchDetector || !this.buffer) {
            console.error('Audio Manager not initialized');
            return;
        }

        if (this.isListening) {
            console.warn('Already listening');
            return;
        }

        this.isListening = true;
        this.emitStatusChange({ listening: true, microphoneActive: true });
        this.detectPitchLoop();
        console.log('Started listening for pitch');
    }

    /**
     * Stop listening for pitch
     */
    stopListening(): void {
        if (!this.isListening) return;

        this.isListening = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        this.emitStatusChange({ listening: false, microphoneActive: this.stream !== null });
        console.log('Stopped listening for pitch');
    }

    /**
     * Main pitch detection loop
     */
    private detectPitchLoop(): void {
        if (!this.isListening || !this.analyser || !this.pitchDetector || !this.buffer || !this.audioContext) {
            return;
        }

        // Check if audio context is in a valid state
        if (this.audioContext.state === 'suspended') {
            console.warn('AudioContext suspended during pitch detection, attempting resume...');
            this.audioContext.resume().then(() => {
                console.log('AudioContext resumed successfully');
            }).catch(err => {
                console.error('Failed to resume AudioContext:', err);
                this.stopListening();
                this.emitError('Audio system paused. Please restart your practice session.');
            });
            return;
        }

        if (this.audioContext.state === 'closed') {
            console.error('AudioContext closed during pitch detection');
            this.stopListening();
            this.emitError('Audio system closed. Please reconnect your microphone.');
            return;
        }

        try {
            // Get time-domain data from analyser
            this.analyser.getFloatTimeDomainData(this.buffer);

            // Calculate audio level (RMS)
            const level = this.calculateRMS(this.buffer);
            this.emitAudioLevel(level);

            // Detect pitch
            const result: PitchResult = this.pitchDetector.detectPitch(this.buffer, this.audioContext.sampleRate);

            // Emit pitch detected event if valid
            if (result.detected) {
                // Debounce rapid detections of the same note
                const now = Date.now();
                if (
                    result.midi !== this.lastDetectedMidi ||
                    now - this.lastDetectedTime > this.noteDebounceMs
                ) {
                    this.emitPitchDetected({
                        frequency: result.frequency,
                        midi: result.midi,
                        cents: result.cents,
                        clarity: result.clarity,
                        noteName: midiToNoteName(result.midi),
                        timestamp: now
                    });

                    this.lastDetectedMidi = result.midi;
                    this.lastDetectedTime = now;
                }
            }
        } catch (error) {
            console.error('Error in pitch detection loop:', error);
            // Don't stop the loop on error, just log and continue
        }

        // Continue loop
        if (this.isListening) {
            this.animationFrameId = requestAnimationFrame(() => this.detectPitchLoop());
        }
    }

    /**
     * Calculate RMS (Root Mean Square) for audio level
     */
    private calculateRMS(buffer: Float32Array<ArrayBuffer>): number {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }

    /**
     * Disconnect microphone and clean up resources
     */
    disconnect(): void {
        this.stopListening();

        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.analyser = null;
        this.pitchDetector = null;
        this.buffer = null;

        this.emitStatusChange({ listening: false, microphoneActive: false });
        console.log('Audio Manager disconnected');
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<AudioConfig>): void {
        this.config = { ...this.config, ...config };

        if (this.pitchDetector) {
            this.pitchDetector.updateConfig({
                minClarity: this.config.minClarity,
                minFrequency: this.config.minFrequency,
                maxFrequency: this.config.maxFrequency
            });
        }

        if (this.analyser) {
            this.analyser.smoothingTimeConstant = this.config.smoothing;
        }
    }

    /**
     * Set note debounce time
     */
    setDebounceTime(ms: number): void {
        this.noteDebounceMs = Math.max(0, ms);
    }

    /**
     * Register an event listener
     */
    on<T extends EventType>(event: T, callback: Listeners[T][number]): void {
        if (this.listeners[event]) {
            this.listeners[event].push(callback as any);
        } else {
            console.warn('Unknown event type:', event);
        }
    }

    /**
     * Remove an event listener
     */
    off<T extends EventType>(event: T, callback: Listeners[T][number]): void {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback as any);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }

    /**
     * Emit pitch detected event
     */
    private emitPitchDetected(data: PitchDetectedEvent): void {
        this.listeners.pitchDetected.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in pitchDetected listener:', error);
            }
        });
    }

    /**
     * Emit audio level event
     */
    private emitAudioLevel(level: number): void {
        this.listeners.audioLevel.forEach(callback => {
            try {
                callback({ level, timestamp: Date.now() });
            } catch (error) {
                console.error('Error in audioLevel listener:', error);
            }
        });
    }

    /**
     * Emit error event
     */
    private emitError(message: string, error?: Error): void {
        this.listeners.error.forEach(callback => {
            try {
                callback({ message, error });
            } catch (err) {
                console.error('Error in error listener:', err);
            }
        });
    }

    /**
     * Emit status change event
     */
    private emitStatusChange(status: StatusChangeEvent): void {
        this.listeners.statusChange.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                console.error('Error in statusChange listener:', error);
            }
        });
    }

    /**
     * Get current audio level (0-1)
     */
    getCurrentLevel(): number {
        if (!this.buffer) return 0;
        return this.calculateRMS(this.buffer);
    }

    /**
     * Check if microphone is active
     */
    isMicrophoneActive(): boolean {
        return this.stream !== null && this.audioContext !== null;
    }

    /**
     * Check if currently listening
     */
    isCurrentlyListening(): boolean {
        return this.isListening;
    }

    /**
     * Get audio context sample rate
     */
    getSampleRate(): number {
        return this.audioContext?.sampleRate || 44100;
    }

    /**
     * Simulate frequency detection (for testing without microphone)
     */
    simulateFrequency(frequency: number): void {
        const midi = Math.round(12 * Math.log2(frequency / 440) + 69);
        this.emitPitchDetected({
            frequency,
            midi,
            cents: 0,
            clarity: 1.0,
            noteName: midiToNoteName(midi),
            timestamp: Date.now()
        });
    }

    /**
     * Get available audio input devices
     */
    static async getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
        try {
            // First request permission to enumerate devices
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // Then enumerate all devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'audioinput');
        } catch (error) {
            console.error('Failed to enumerate audio devices:', error);
            return [];
        }
    }

    /**
     * Get the currently active audio input device
     */
    getActiveDevice(): MediaDeviceInfo | null {
        if (!this.stream) return null;

        const audioTrack = this.stream.getAudioTracks()[0];
        if (!audioTrack) return null;

        // Return basic device info from the track
        return {
            deviceId: audioTrack.getSettings().deviceId || '',
            groupId: audioTrack.getSettings().groupId || '',
            kind: 'audioinput',
            label: audioTrack.label,
            toJSON: () => ({})
        } as MediaDeviceInfo;
    }

    /**
     * Check if microphone access is supported
     */
    static isSupported(): boolean {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
}

// Make available globally for legacy code
if (typeof window !== 'undefined') {
    (window as any).AudioManager = AudioManager;
}

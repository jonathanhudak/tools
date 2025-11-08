/**
 * Audio Manager
 * Manages microphone access and real-time pitch detection for stringed/bowed instruments
 */
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
    level: number;
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
export declare class AudioManager {
    private audioContext;
    private microphone;
    private analyser;
    private pitchDetector;
    private animationFrameId;
    private stream;
    private config;
    private listeners;
    private isListening;
    private buffer;
    private lastDetectedMidi;
    private lastDetectedTime;
    private noteDebounceMs;
    constructor(config?: Partial<AudioConfig>);
    /**
     * Initialize audio context and request microphone access
     * @param deviceId - Optional specific device ID to use
     */
    init(deviceId?: string): Promise<boolean>;
    /**
     * Setup error handlers for AudioContext
     */
    private stateChangeHandler;
    private setupAudioContextErrorHandlers;
    /**
     * Start listening for pitch
     */
    startListening(): void;
    /**
     * Stop listening for pitch
     */
    stopListening(): void;
    /**
     * Main pitch detection loop
     */
    private detectPitchLoop;
    /**
     * Calculate RMS (Root Mean Square) for audio level
     */
    private calculateRMS;
    /**
     * Disconnect microphone and clean up resources
     */
    disconnect(): void;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<AudioConfig>): void;
    /**
     * Set note debounce time
     */
    setDebounceTime(ms: number): void;
    /**
     * Register an event listener
     */
    on<T extends EventType>(event: T, callback: Listeners[T][number]): void;
    /**
     * Remove an event listener
     */
    off<T extends EventType>(event: T, callback: Listeners[T][number]): void;
    /**
     * Emit pitch detected event
     */
    private emitPitchDetected;
    /**
     * Emit audio level event
     */
    private emitAudioLevel;
    /**
     * Emit error event
     */
    private emitError;
    /**
     * Emit status change event
     */
    private emitStatusChange;
    /**
     * Get current audio level (0-1)
     */
    getCurrentLevel(): number;
    /**
     * Check if microphone is active
     */
    isMicrophoneActive(): boolean;
    /**
     * Check if currently listening
     */
    isCurrentlyListening(): boolean;
    /**
     * Get audio context sample rate
     */
    getSampleRate(): number;
    /**
     * Simulate frequency detection (for testing without microphone)
     */
    simulateFrequency(frequency: number): void;
    /**
     * Get available audio input devices
     */
    static getAudioInputDevices(): Promise<MediaDeviceInfo[]>;
    /**
     * Get the currently active audio input device
     */
    getActiveDevice(): MediaDeviceInfo | null;
    /**
     * Check if microphone access is supported
     */
    static isSupported(): boolean;
}
export {};
//# sourceMappingURL=audio-manager.d.ts.map
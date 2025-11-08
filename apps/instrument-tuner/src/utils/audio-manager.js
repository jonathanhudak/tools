/**
 * Audio Manager
 * Manages microphone access and real-time pitch detection for stringed/bowed instruments
 */
import { PitchDetector } from './pitch-detector';
import { midiToNoteName } from './music-theory';
export class AudioManager {
    constructor(config = {}) {
        this.audioContext = null;
        this.microphone = null;
        this.analyser = null;
        this.pitchDetector = null;
        this.animationFrameId = null;
        this.stream = null;
        this.isListening = false;
        this.buffer = null;
        // Debouncing for note detection
        this.lastDetectedMidi = null;
        this.lastDetectedTime = 0;
        this.noteDebounceMs = 100; // Min time between note detections
        /**
         * Setup error handlers for AudioContext
         */
        this.stateChangeHandler = () => {
            if (!this.audioContext)
                return;
            console.log('AudioContext state changed to:', this.audioContext.state);
            if (this.audioContext.state === 'suspended') {
                console.warn('AudioContext suspended, attempting to resume...');
                this.audioContext.resume().catch(err => {
                    console.error('Failed to resume AudioContext:', err);
                });
            }
            else if (this.audioContext.state === 'closed') {
                console.error('AudioContext closed');
                // Don't emit error for intentional disconnects
            }
        };
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
    async init(deviceId) {
        try {
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error('Microphone access is not supported in this browser');
                return false;
            }
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (!this.audioContext) {
                console.error('Failed to create audio context');
                return false;
            }
            // Set up error handler for audio context
            this.setupAudioContextErrorHandlers();
            // Resume audio context if it's suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            // Request microphone access
            const audioConstraints = {
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
            // Verify audio context is still valid
            if (!this.audioContext) {
                console.error('Audio context was lost during initialization');
                return false;
            }
            // Create audio nodes
            this.microphone = this.audioContext.createMediaStreamSource(this.stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.config.bufferSize * 2;
            this.analyser.smoothingTimeConstant = this.config.smoothing;
            // Connect nodes
            this.microphone.connect(this.analyser);
            // Create buffer for time-domain data
            this.buffer = new Float32Array(this.config.bufferSize);
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
        }
        catch (error) {
            console.error('Failed to initialize audio:', error);
            // Don't emit error event during init - let the caller handle it
            // Clean up audio context if it was created
            if (this.audioContext) {
                this.audioContext.close().catch(() => { });
                this.audioContext = null;
            }
            return false;
        }
    }
    setupAudioContextErrorHandlers() {
        if (!this.audioContext)
            return;
        // Handle state changes
        this.audioContext.addEventListener('statechange', this.stateChangeHandler);
    }
    /**
     * Start listening for pitch
     */
    startListening() {
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
    stopListening() {
        if (!this.isListening)
            return;
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
    detectPitchLoop() {
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
            const result = this.pitchDetector.detectPitch(this.buffer, this.audioContext.sampleRate);
            // Emit pitch detected event if valid
            if (result.detected) {
                // Debounce rapid detections of the same note
                const now = Date.now();
                if (result.midi !== this.lastDetectedMidi ||
                    now - this.lastDetectedTime > this.noteDebounceMs) {
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
        }
        catch (error) {
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
    calculateRMS(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }
    /**
     * Disconnect microphone and clean up resources
     */
    disconnect() {
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
            // Remove event listener before closing to prevent statechange events
            this.audioContext.removeEventListener('statechange', this.stateChangeHandler);
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
    updateConfig(config) {
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
    setDebounceTime(ms) {
        this.noteDebounceMs = Math.max(0, ms);
    }
    /**
     * Register an event listener
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
        else {
            console.warn('Unknown event type:', event);
        }
    }
    /**
     * Remove an event listener
     */
    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }
    /**
     * Emit pitch detected event
     */
    emitPitchDetected(data) {
        this.listeners.pitchDetected.forEach(callback => {
            try {
                callback(data);
            }
            catch (error) {
                console.error('Error in pitchDetected listener:', error);
            }
        });
    }
    /**
     * Emit audio level event
     */
    emitAudioLevel(level) {
        this.listeners.audioLevel.forEach(callback => {
            try {
                callback({ level, timestamp: Date.now() });
            }
            catch (error) {
                console.error('Error in audioLevel listener:', error);
            }
        });
    }
    /**
     * Emit error event
     */
    emitError(message, error) {
        this.listeners.error.forEach(callback => {
            try {
                callback({ message, error });
            }
            catch (err) {
                console.error('Error in error listener:', err);
            }
        });
    }
    /**
     * Emit status change event
     */
    emitStatusChange(status) {
        this.listeners.statusChange.forEach(callback => {
            try {
                callback(status);
            }
            catch (error) {
                console.error('Error in statusChange listener:', error);
            }
        });
    }
    /**
     * Get current audio level (0-1)
     */
    getCurrentLevel() {
        if (!this.buffer)
            return 0;
        return this.calculateRMS(this.buffer);
    }
    /**
     * Check if microphone is active
     */
    isMicrophoneActive() {
        return this.stream !== null && this.audioContext !== null;
    }
    /**
     * Check if currently listening
     */
    isCurrentlyListening() {
        return this.isListening;
    }
    /**
     * Get audio context sample rate
     */
    getSampleRate() {
        return this.audioContext?.sampleRate || 44100;
    }
    /**
     * Simulate frequency detection (for testing without microphone)
     */
    simulateFrequency(frequency) {
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
    static async getAudioInputDevices() {
        try {
            // First request permission to enumerate devices
            await navigator.mediaDevices.getUserMedia({ audio: true });
            // Then enumerate all devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'audioinput');
        }
        catch (error) {
            console.error('Failed to enumerate audio devices:', error);
            return [];
        }
    }
    /**
     * Get the currently active audio input device
     */
    getActiveDevice() {
        if (!this.stream)
            return null;
        const audioTrack = this.stream.getAudioTracks()[0];
        if (!audioTrack)
            return null;
        // Return basic device info from the track
        return {
            deviceId: audioTrack.getSettings().deviceId || '',
            groupId: audioTrack.getSettings().groupId || '',
            kind: 'audioinput',
            label: audioTrack.label,
            toJSON: () => ({})
        };
    }
    /**
     * Check if microphone access is supported
     */
    static isSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
}
// Make available globally for legacy code
if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}
//# sourceMappingURL=audio-manager.js.map
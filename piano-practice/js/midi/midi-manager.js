/**
 * MIDI Manager
 * Handles MIDI device connection, input detection, and note events
 */

class MidiManager {
    constructor() {
        this.midiAccess = null;
        this.selectedInput = null;
        this.listeners = {
            noteOn: [],
            noteOff: [],
            deviceChange: [],
            error: []
        };
        this.activeNotes = new Set();
    }

    /**
     * Initialize MIDI access
     * @returns {Promise<boolean>} Success status
     */
    async init() {
        try {
            // Check for Web MIDI API support
            if (!navigator.requestMIDIAccess) {
                this.emitError('Web MIDI API is not supported in this browser. Try Chrome or Edge.');
                return false;
            }

            // Request MIDI access
            this.midiAccess = await navigator.requestMIDIAccess();

            // Listen for device connections/disconnections
            this.midiAccess.addEventListener('statechange', (e) => {
                this.handleStateChange(e);
            });

            // Initialize available devices
            this.updateDeviceList();

            console.log('MIDI initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize MIDI:', error);
            this.emitError('Failed to access MIDI devices. Please check your browser permissions.');
            return false;
        }
    }

    /**
     * Get list of available MIDI input devices
     * @returns {Array} Array of device objects
     */
    getInputDevices() {
        if (!this.midiAccess) return [];

        const devices = [];
        for (const input of this.midiAccess.inputs.values()) {
            devices.push({
                id: input.id,
                name: input.name,
                manufacturer: input.manufacturer,
                state: input.state,
                connection: input.connection
            });
        }

        return devices;
    }

    /**
     * Connect to a specific MIDI input device
     * @param {string} deviceId - Device ID to connect to
     * @returns {boolean} Success status
     */
    connectDevice(deviceId) {
        if (!this.midiAccess) {
            console.error('MIDI not initialized');
            return false;
        }

        // Disconnect current device
        this.disconnectDevice();

        // Get the input device
        const input = this.midiAccess.inputs.get(deviceId);

        if (!input) {
            console.error('Device not found:', deviceId);
            return false;
        }

        // Attach event listener
        input.onmidimessage = (message) => this.handleMidiMessage(message);

        this.selectedInput = input;
        this.emitDeviceChange({ connected: true, device: input });

        console.log('Connected to MIDI device:', input.name);
        return true;
    }

    /**
     * Disconnect current MIDI device
     */
    disconnectDevice() {
        if (this.selectedInput) {
            this.selectedInput.onmidimessage = null;
            this.selectedInput = null;
            this.activeNotes.clear();
            this.emitDeviceChange({ connected: false, device: null });
            console.log('Disconnected MIDI device');
        }
    }

    /**
     * Handle incoming MIDI messages
     * @param {MIDIMessageEvent} message - MIDI message event
     */
    handleMidiMessage(message) {
        const [status, note, velocity] = message.data;

        // Extract message type from status byte
        const messageType = status & 0xf0;

        switch (messageType) {
            case 0x90: // Note On
                if (velocity > 0) {
                    this.handleNoteOn(note, velocity);
                } else {
                    // Note on with velocity 0 is treated as note off
                    this.handleNoteOff(note);
                }
                break;

            case 0x80: // Note Off
                this.handleNoteOff(note);
                break;

            default:
                // Ignore other MIDI messages (control change, pitch bend, etc.)
                break;
        }
    }

    /**
     * Handle note on event
     * @param {number} note - MIDI note number
     * @param {number} velocity - Note velocity (0-127)
     */
    handleNoteOn(note, velocity) {
        this.activeNotes.add(note);

        // Emit to all registered listeners
        this.listeners.noteOn.forEach(callback => {
            try {
                callback({
                    note,
                    velocity,
                    noteName: MusicTheory.midiToNoteName(note),
                    frequency: MusicTheory.midiToFrequency(note),
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Error in noteOn listener:', error);
            }
        });
    }

    /**
     * Handle note off event
     * @param {number} note - MIDI note number
     */
    handleNoteOff(note) {
        this.activeNotes.delete(note);

        // Emit to all registered listeners
        this.listeners.noteOff.forEach(callback => {
            try {
                callback({
                    note,
                    noteName: MusicTheory.midiToNoteName(note),
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Error in noteOff listener:', error);
            }
        });
    }

    /**
     * Handle device state changes (connection/disconnection)
     * @param {MIDIConnectionEvent} event - State change event
     */
    handleStateChange(event) {
        console.log('MIDI device state changed:', event.port.name, event.port.state);
        this.updateDeviceList();

        // If the currently selected device was disconnected
        if (this.selectedInput && event.port.id === this.selectedInput.id && event.port.state === 'disconnected') {
            this.disconnectDevice();
        }

        this.emitDeviceChange({
            type: 'statechange',
            port: event.port
        });
    }

    /**
     * Update the device list (called on state changes)
     */
    updateDeviceList() {
        const devices = this.getInputDevices();
        console.log('Available MIDI devices:', devices);

        // Auto-connect to first device if none selected
        if (!this.selectedInput && devices.length > 0) {
            this.connectDevice(devices[0].id);
        }
    }

    /**
     * Register an event listener
     * @param {string} event - Event type ('noteOn', 'noteOff', 'deviceChange', 'error')
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        } else {
            console.warn('Unknown event type:', event);
        }
    }

    /**
     * Remove an event listener
     * @param {string} event - Event type
     * @param {Function} callback - Callback function to remove
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
     * Emit device change event
     * @param {Object} data - Event data
     */
    emitDeviceChange(data) {
        this.listeners.deviceChange.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in deviceChange listener:', error);
            }
        });
    }

    /**
     * Emit error event
     * @param {string} message - Error message
     */
    emitError(message) {
        this.listeners.error.forEach(callback => {
            try {
                callback({ message });
            } catch (error) {
                console.error('Error in error listener:', error);
            }
        });
    }

    /**
     * Check if a note is currently being played
     * @param {number} note - MIDI note number
     * @returns {boolean} True if note is active
     */
    isNoteActive(note) {
        return this.activeNotes.has(note);
    }

    /**
     * Get all currently active notes
     * @returns {Array} Array of active MIDI note numbers
     */
    getActiveNotes() {
        return Array.from(this.activeNotes);
    }

    /**
     * Simulate a note (for testing without MIDI device)
     * @param {number} note - MIDI note number
     * @param {number} velocity - Note velocity
     * @param {number} duration - Duration in milliseconds
     */
    simulateNote(note, velocity = 64, duration = 500) {
        this.handleNoteOn(note, velocity);

        setTimeout(() => {
            this.handleNoteOff(note);
        }, duration);
    }

    /**
     * Check if MIDI is supported
     * @returns {boolean} True if Web MIDI API is supported
     */
    static isSupported() {
        return !!navigator.requestMIDIAccess;
    }
}

// Make available globally
window.MidiManager = MidiManager;

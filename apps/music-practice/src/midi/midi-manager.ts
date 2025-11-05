/**
 * MIDI Manager
 * Handles MIDI device connection, input detection, and note events
 */

import { midiToNoteName, midiToFrequency } from '../utils/music-theory.js';

// Type definitions
export interface MIDIDevice {
    id: string;
    name: string;
    manufacturer: string;
    state: MIDIPortDeviceState;
    connection: MIDIPortConnectionState;
}

export interface NoteOnEvent {
    note: number;
    velocity: number;
    noteName: string;
    frequency: number;
    timestamp: number;
}

export interface NoteOffEvent {
    note: number;
    noteName: string;
    timestamp: number;
}

export interface DeviceChangeEvent {
    connected?: boolean;
    device?: MIDIInput | null;
    type?: string;
    port?: MIDIPort;
}

export interface ErrorEvent {
    message: string;
}

type EventCallback<T> = (event: T) => void;

interface Listeners {
    noteOn: EventCallback<NoteOnEvent>[];
    noteOff: EventCallback<NoteOffEvent>[];
    deviceChange: EventCallback<DeviceChangeEvent>[];
    error: EventCallback<ErrorEvent>[];
}

export type EventType = keyof Listeners;

export class MidiManager {
    private midiAccess: MIDIAccess | null = null;
    private selectedInput: MIDIInput | null = null;
    private listeners: Listeners;
    private activeNotes: Set<number>;

    constructor() {
        this.listeners = {
            noteOn: [],
            noteOff: [],
            deviceChange: [],
            error: []
        };
        this.activeNotes = new Set<number>();
    }

    /**
     * Initialize MIDI access
     */
    async init(): Promise<boolean> {
        try {
            // Check for Web MIDI API support
            if (!navigator.requestMIDIAccess) {
                this.emitError('Web MIDI API is not supported in this browser. Try Chrome or Edge.');
                return false;
            }

            // Request MIDI access
            this.midiAccess = await navigator.requestMIDIAccess();

            // Listen for device connections/disconnections
            this.midiAccess.addEventListener('statechange', (e: Event) => {
                this.handleStateChange(e as MIDIConnectionEvent);
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
     */
    getInputDevices(): MIDIDevice[] {
        if (!this.midiAccess) return [];

        const devices: MIDIDevice[] = [];
        for (const input of this.midiAccess.inputs.values()) {
            devices.push({
                id: input.id,
                name: input.name || 'Unknown Device',
                manufacturer: input.manufacturer || 'Unknown',
                state: input.state,
                connection: input.connection
            });
        }

        return devices;
    }

    /**
     * Connect to a specific MIDI input device
     */
    connectDevice(deviceId: string): boolean {
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
        input.onmidimessage = (message: MIDIMessageEvent) => this.handleMidiMessage(message);

        this.selectedInput = input;
        this.emitDeviceChange({ connected: true, device: input });

        console.log('Connected to MIDI device:', input.name);
        return true;
    }

    /**
     * Disconnect current MIDI device
     */
    disconnectDevice(): void {
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
     */
    private handleMidiMessage(message: MIDIMessageEvent): void {
        if (!message.data || message.data.length < 3) return;

        const status = message.data[0];
        const note = message.data[1];
        const velocity = message.data[2];

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
     */
    private handleNoteOn(note: number, velocity: number): void {
        this.activeNotes.add(note);

        // Emit to all registered listeners
        this.listeners.noteOn.forEach(callback => {
            try {
                callback({
                    note,
                    velocity,
                    noteName: midiToNoteName(note),
                    frequency: midiToFrequency(note),
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Error in noteOn listener:', error);
            }
        });
    }

    /**
     * Handle note off event
     */
    private handleNoteOff(note: number): void {
        this.activeNotes.delete(note);

        // Emit to all registered listeners
        this.listeners.noteOff.forEach(callback => {
            try {
                callback({
                    note,
                    noteName: midiToNoteName(note),
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Error in noteOff listener:', error);
            }
        });
    }

    /**
     * Handle device state changes (connection/disconnection)
     */
    private handleStateChange(event: MIDIConnectionEvent): void {
        if (!event.port) return;

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
    private updateDeviceList(): void {
        const devices = this.getInputDevices();
        console.log('Available MIDI devices:', devices);

        // Auto-connect to first device if none selected
        if (!this.selectedInput && devices.length > 0) {
            this.connectDevice(devices[0].id);
        }
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
     * Emit device change event
     */
    private emitDeviceChange(data: DeviceChangeEvent): void {
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
     */
    private emitError(message: string): void {
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
     */
    isNoteActive(note: number): boolean {
        return this.activeNotes.has(note);
    }

    /**
     * Get all currently active notes
     */
    getActiveNotes(): number[] {
        return Array.from(this.activeNotes);
    }

    /**
     * Simulate a note (for testing without MIDI device)
     */
    simulateNote(note: number, velocity: number = 64, duration: number = 500): void {
        this.handleNoteOn(note, velocity);

        setTimeout(() => {
            this.handleNoteOff(note);
        }, duration);
    }

    /**
     * Check if MIDI is supported
     */
    static isSupported(): boolean {
        return typeof navigator !== 'undefined' && !!navigator.requestMIDIAccess;
    }

    /**
     * Get current connected device
     */
    getConnectedDevice(): MIDIDevice | null {
        if (!this.selectedInput) return null;

        return {
            id: this.selectedInput.id,
            name: this.selectedInput.name || 'Unknown Device',
            manufacturer: this.selectedInput.manufacturer || 'Unknown',
            state: this.selectedInput.state,
            connection: this.selectedInput.connection
        };
    }
}

// Make available globally for legacy code
if (typeof window !== 'undefined') {
    (window as any).MidiManager = MidiManager;
}

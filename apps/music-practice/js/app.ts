/**
 * Main Application Controller
 * Initializes and coordinates all modules
 */

import { MidiManager, DeviceChangeEvent, ErrorEvent as MidiErrorEvent } from './midi/midi-manager.js';
import { AudioManager, PitchDetectedEvent, StatusChangeEvent, ErrorEvent as AudioErrorEvent } from './input/audio-manager.js';
import { StaffRenderer } from './notation/staff-renderer.js';
import { FallingNotesRenderer } from './notation/falling-notes.js';
import { SightReadingModule } from './modules/sight-reading.js';
import { MusicTheory } from './utils/music-theory.js';
import { Storage } from './utils/storage.js';
import {
    InstrumentType,
    InstrumentTypeValue,
    getInstrument,
    requiresMicrophone,
    requiresMIDI
} from './utils/instrument-config.js';

// Type definitions
interface UIElements {
    instrumentSelect: HTMLSelectElement | null;
    midiStatus: HTMLElement | null;
    microphoneStatus: HTMLElement | null;
    midiDeviceSelect: HTMLSelectElement | null;
    audioDeviceSelect: HTMLSelectElement | null;
    connectMidiBtn: HTMLElement | null;
    connectMicrophoneBtn: HTMLElement | null;
    virtualKeyboardToggle: HTMLInputElement | null;
    virtualKeyboard: HTMLElement | null;
    themeToggle: HTMLElement | null;
    moduleButtons: NodeListOf<HTMLElement>;
}

type ModuleName = 'sightReading';

export class MusicPracticeApp {
    private midiManager: MidiManager | null = null;
    private audioManager: AudioManager | null = null;
    private staffRenderer: StaffRenderer | null = null;
    private fallingNotesRenderer: FallingNotesRenderer | null = null;
    private sightReadingModule: SightReadingModule | null = null;
    private currentModule: ModuleName = 'sightReading';
    private currentInstrument: InstrumentTypeValue = InstrumentType.PIANO;

    // UI elements
    private ui: UIElements;

    constructor() {
        // Initialize UI elements
        this.ui = {
            instrumentSelect: document.getElementById('instrumentSelect') as HTMLSelectElement | null,
            midiStatus: document.getElementById('midiStatus'),
            microphoneStatus: document.getElementById('microphoneStatus'),
            midiDeviceSelect: document.getElementById('midiDeviceSelect') as HTMLSelectElement | null,
            audioDeviceSelect: document.getElementById('audioDeviceSelect') as HTMLSelectElement | null,
            connectMidiBtn: document.getElementById('connectMidiBtn'),
            connectMicrophoneBtn: document.getElementById('connectMicrophoneBtn'),
            virtualKeyboardToggle: document.getElementById('virtualKeyboardToggle') as HTMLInputElement | null,
            virtualKeyboard: document.getElementById('virtualKeyboard'),
            themeToggle: document.getElementById('themeToggle'),
            moduleButtons: document.querySelectorAll('.nav-btn')
        };

        this.init();
    }

    /**
     * Initialize the application
     */
    async init(): Promise<void> {
        console.log('Initializing InstrumentPractice Pro...');

        // Load settings (includes instrument selection)
        this.loadSettings();

        // Initialize input methods based on instrument
        await this.initInputMethods();

        // Initialize renderers
        this.initRenderers();

        // Initialize modules
        this.initModules();

        // Setup UI event listeners
        this.setupEventListeners();

        // Show welcome screen
        this.showWelcome();

        console.log('InstrumentPractice Pro initialized successfully');
    }

    /**
     * Initialize input methods (MIDI and/or Microphone) based on instrument
     */
    async initInputMethods(): Promise<void> {
        const instrument = getInstrument(this.currentInstrument);

        // Initialize MIDI if needed
        if (requiresMIDI(this.currentInstrument)) {
            await this.initMidi();
        }

        // Initialize microphone if needed
        if (requiresMicrophone(this.currentInstrument)) {
            await this.initAudio();
        }

        // Update UI to show/hide relevant sections
        this.updateInputUIVisibility();
    }

    /**
     * Initialize MIDI manager
     */
    async initMidi(): Promise<void> {
        this.midiManager = new MidiManager();

        // Register event listeners
        this.midiManager.on('deviceChange', (data: DeviceChangeEvent) => {
            this.handleMidiDeviceChange(data);
        });

        this.midiManager.on('error', (data: MidiErrorEvent) => {
            this.showError(data.message);
        });

        // Initialize
        const success = await this.midiManager.init();

        if (success) {
            this.updateMidiStatus(true);
            this.updateDeviceList();
        } else {
            this.updateMidiStatus(false);
            this.showMidiWarning();
        }
    }

    /**
     * Initialize Audio manager (microphone)
     * Note: Does not automatically request permission - user must click "Connect Microphone"
     */
    async initAudio(): Promise<void> {
        const instrument = getInstrument(this.currentInstrument);

        this.audioManager = new AudioManager({
            minClarity: instrument.validation.minClarity || 0.75,
            minFrequency: instrument.audio?.minFrequency || 70,
            maxFrequency: instrument.audio?.maxFrequency || 1600,
            bufferSize: instrument.audio?.bufferSize || 2048
        });

        // Register event listeners
        this.audioManager.on('pitchDetected', (data: PitchDetectedEvent) => {
            // Update pitch display in UI
            this.updatePitchDisplay(data);
        });

        this.audioManager.on('audioLevel', (data) => {
            // Update audio level bar
            this.updateAudioLevel(data.level);
        });

        this.audioManager.on('statusChange', (data: StatusChangeEvent) => {
            this.handleAudioStatusChange(data);
        });

        this.audioManager.on('error', (data: AudioErrorEvent) => {
            this.showError(data.message);
        });

        // Populate audio device list
        await this.updateAudioDeviceList();

        console.log('Audio Manager ready (waiting for user to connect microphone)');
    }

    /**
     * Initialize notation renderers
     */
    initRenderers(): void {
        this.staffRenderer = new StaffRenderer('staffDisplay');
        this.fallingNotesRenderer = new FallingNotesRenderer('fallingNotesDisplay');
    }

    /**
     * Initialize practice modules
     */
    initModules(): void {
        if (!this.staffRenderer || !this.fallingNotesRenderer) {
            console.error('Cannot initialize modules: renderers not ready');
            return;
        }

        // Pass both MIDI and Audio managers to modules
        this.sightReadingModule = new SightReadingModule(
            this.midiManager,
            this.staffRenderer,
            this.fallingNotesRenderer,
            this.audioManager,
            this.currentInstrument
        );
    }

    /**
     * Setup UI event listeners
     */
    setupEventListeners(): void {
        // Instrument selection
        if (this.ui.instrumentSelect) {
            this.ui.instrumentSelect.addEventListener('change', async (e) => {
                const target = e.target as HTMLSelectElement;
                await this.switchInstrument(target.value as InstrumentTypeValue);
            });
        }

        // Theme toggle
        if (this.ui.themeToggle) {
            this.ui.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Microphone connect button - triggers fresh permission request
        if (this.ui.connectMicrophoneBtn) {
            this.ui.connectMicrophoneBtn.addEventListener('click', async () => {
                // Clear the device selection to trigger browser's device picker
                if (this.ui.audioDeviceSelect) {
                    this.ui.audioDeviceSelect.value = '';
                }
                // Request microphone without specific device ID
                await this.reconnectMicrophone();
            });
        }

        // Audio device selection - use specific device when selected from dropdown
        if (this.ui.audioDeviceSelect) {
            this.ui.audioDeviceSelect.addEventListener('change', async (e) => {
                const target = e.target as HTMLSelectElement;
                if (target.value && this.audioManager) {
                    // Reconnect with selected device
                    await this.reconnectMicrophone(target.value);
                }
            });
        }

        // MIDI device selection
        if (this.ui.midiDeviceSelect) {
            this.ui.midiDeviceSelect.addEventListener('change', (e) => {
                const target = e.target as HTMLSelectElement;
                if (target.value && this.midiManager) {
                    this.midiManager.connectDevice(target.value);
                }
            });
        }

        // MIDI connect button
        if (this.ui.connectMidiBtn) {
            this.ui.connectMidiBtn.addEventListener('click', () => {
                this.reconnectMidi();
            });
        }

        // Virtual keyboard toggle
        if (this.ui.virtualKeyboardToggle) {
            this.ui.virtualKeyboardToggle.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                this.toggleVirtualKeyboard(target.checked);
            });
        }

        // Module navigation
        this.ui.moduleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const module = target.dataset.module as ModuleName | undefined;
                if (module) {
                    this.switchModule(module);
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcut(e);
        });
    }

    /**
     * Handle MIDI device connection changes
     */
    handleMidiDeviceChange(data: DeviceChangeEvent): void {
        console.log('MIDI device change:', data);

        if (data.connected && data.device) {
            this.updateMidiStatus(true, data.device.name || 'Unknown Device');
        } else {
            this.updateMidiStatus(false);
        }

        this.updateDeviceList();
    }

    /**
     * Handle audio status changes (microphone)
     */
    handleAudioStatusChange(data: StatusChangeEvent): void {
        console.log('Audio status change:', data);
        this.updateMicrophoneStatus(data.microphoneActive, data.listening);
    }

    /**
     * Update UI visibility based on selected instrument
     */
    updateInputUIVisibility(): void {
        const usesMidi = requiresMIDI(this.currentInstrument);
        const usesMic = requiresMicrophone(this.currentInstrument);

        // Show/hide MIDI controls
        const midiSection = document.getElementById('midiSection');
        if (midiSection) {
            midiSection.style.display = usesMidi ? 'block' : 'none';
        }

        // Show/hide microphone controls
        const microphoneSection = document.getElementById('microphoneSection');
        if (microphoneSection) {
            microphoneSection.style.display = usesMic ? 'block' : 'none';
        }
    }

    /**
     * Update MIDI status indicator
     */
    updateMidiStatus(connected: boolean, deviceName: string | null = null): void {
        if (!this.ui.midiStatus) return;

        const statusText = this.ui.midiStatus.querySelector('.status-text');

        if (connected) {
            this.ui.midiStatus.classList.add('connected');
            if (statusText) {
                statusText.textContent = deviceName || 'MIDI Connected';
            }
        } else {
            this.ui.midiStatus.classList.remove('connected');
            if (statusText) {
                statusText.textContent = 'No MIDI';
            }
        }
    }

    /**
     * Update microphone status indicator
     */
    updateMicrophoneStatus(active: boolean, listening: boolean = false): void {
        if (!this.ui.microphoneStatus) return;

        const statusText = this.ui.microphoneStatus.querySelector('.status-text');

        if (active) {
            this.ui.microphoneStatus.classList.add('connected');
            if (statusText) {
                statusText.textContent = listening ? 'Listening...' : 'Microphone Ready';
            }
        } else {
            this.ui.microphoneStatus.classList.remove('connected');
            if (statusText) {
                statusText.textContent = 'No Microphone';
            }
        }
    }

    /**
     * Update pitch display in UI
     */
    updatePitchDisplay(data: PitchDetectedEvent): void {
        const pitchValue = document.getElementById('detectedPitch');
        const pitchCents = document.getElementById('detectedCents');

        if (pitchValue) {
            pitchValue.textContent = data.noteName;
        }

        if (pitchCents) {
            const centsOff = Math.round(data.cents);
            const sign = centsOff >= 0 ? '+' : '';
            pitchCents.textContent = `${sign}${centsOff}¢`;

            // Color code based on how close to pitch
            if (Math.abs(centsOff) <= 5) {
                pitchCents.style.color = '#4caf50'; // Green - perfect
            } else if (Math.abs(centsOff) <= 20) {
                pitchCents.style.color = '#ff9800'; // Orange - close
            } else {
                pitchCents.style.color = '#f44336'; // Red - off pitch
            }
        }
    }

    /**
     * Update audio level bar
     */
    updateAudioLevel(level: number): void {
        const levelBar = document.getElementById('audioLevelBar');
        if (levelBar) {
            // Convert RMS to percentage (0-1 range, boosted for visibility)
            const percentage = Math.min(100, level * 500);
            levelBar.style.width = `${percentage}%`;

            // Color code based on level
            if (percentage < 10) {
                levelBar.style.backgroundColor = '#f44336'; // Red - too quiet
            } else if (percentage < 30) {
                levelBar.style.backgroundColor = '#ff9800'; // Orange - okay
            } else {
                levelBar.style.backgroundColor = '#4caf50'; // Green - good level
            }
        }
    }

    /**
     * Update MIDI device dropdown list
     */
    updateDeviceList(): void {
        if (!this.ui.midiDeviceSelect || !this.midiManager) return;

        const devices = this.midiManager.getInputDevices();
        this.ui.midiDeviceSelect.innerHTML = '';

        if (devices.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No device connected';
            this.ui.midiDeviceSelect.appendChild(option);
        } else {
            devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.id;
                option.textContent = device.name;

                const connectedDevice = this.midiManager!.getConnectedDevice();
                if (connectedDevice && connectedDevice.id === device.id) {
                    option.selected = true;
                }

                this.ui.midiDeviceSelect!.appendChild(option);
            });
        }
    }

    /**
     * Reconnect MIDI
     */
    async reconnectMidi(): Promise<void> {
        if (!this.midiManager) return;
        await this.midiManager.init();
        this.updateDeviceList();
    }

    /**
     * Reconnect microphone
     * @param deviceId - Optional specific device ID to use
     */
    async reconnectMicrophone(deviceId?: string): Promise<void> {
        if (!this.audioManager) {
            console.error('Audio manager not initialized');
            return;
        }

        // Disconnect existing
        this.audioManager.disconnect();

        // Connect with selected device
        console.log('Connecting to microphone:', deviceId || 'default');
        const success = await this.audioManager.init(deviceId);

        if (success) {
            this.updateMicrophoneStatus(true);
            console.log('Microphone connected successfully');

            // Save device preference to localStorage
            Storage.saveSettings({ audioDeviceId: deviceId || null });

            // Update device list to show current selection
            await this.updateAudioDeviceList();
        } else {
            this.updateMicrophoneStatus(false);
            this.showMicrophoneWarning();
        }
    }

    /**
     * Update audio device dropdown list
     */
    async updateAudioDeviceList(): Promise<void> {
        if (!this.ui.audioDeviceSelect) return;

        try {
            // Get available audio input devices
            const devices = await AudioManager.getAudioInputDevices();

            // Get saved device preference
            const settings = Storage.getSettings();
            const savedDeviceId = settings.audioDeviceId;

            this.ui.audioDeviceSelect.innerHTML = '';

            if (devices.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No microphones found';
                this.ui.audioDeviceSelect.appendChild(option);
            } else {
                // Add default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select microphone...';
                this.ui.audioDeviceSelect.appendChild(defaultOption);

                // Add each device
                devices.forEach(device => {
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    option.textContent = device.label || `Microphone ${device.deviceId.substring(0, 8)}`;

                    // Check if this is the currently active device OR the saved preference
                    if (this.audioManager) {
                        const activeDevice = this.audioManager.getActiveDevice();
                        if (activeDevice && activeDevice.deviceId === device.deviceId) {
                            option.selected = true;
                        }
                    } else if (savedDeviceId && savedDeviceId === device.deviceId) {
                        // If no active device yet, but we have a saved preference, select it
                        option.selected = true;
                    }

                    this.ui.audioDeviceSelect!.appendChild(option);
                });
            }

            console.log('Audio device list updated:', devices.length, 'devices found');
        } catch (error) {
            console.error('Failed to update audio device list:', error);
        }
    }

    /**
     * Switch instrument
     */
    async switchInstrument(instrumentId: InstrumentTypeValue): Promise<void> {
        console.log('Switching to instrument:', instrumentId);

        // Stop current session if active
        if (this.sightReadingModule && this.sightReadingModule.active) {
            this.sightReadingModule.stopSession();
        }

        // Update current instrument
        this.currentInstrument = instrumentId;

        // Disconnect current input methods
        if (this.midiManager) {
            this.midiManager.disconnectDevice();
        }
        if (this.audioManager) {
            this.audioManager.disconnect();
            this.audioManager = null;
        }

        // Initialize new input methods
        await this.initInputMethods();

        // Reinitialize modules with new instrument
        this.initModules();

        // Save preference
        Storage.saveSettings({ instrument: instrumentId });

        console.log('Switched to instrument:', instrumentId);
    }

    /**
     * Show MIDI warning
     */
    showMidiWarning(): void {
        console.warn('MIDI not available. Virtual keyboard or manual testing required.');
    }

    /**
     * Show microphone warning
     */
    showMicrophoneWarning(): void {
        console.warn('Microphone not available. Please check browser permissions.');
        this.showError('Microphone access denied. Please allow microphone access in your browser settings.');
    }

    /**
     * Show microphone connected message
     */
    showMicrophoneConnected(): void {
        console.log('Microphone connected and ready!');
        // Could show a success message to the user if desired
    }

    /**
     * Toggle theme (light/dark)
     */
    toggleTheme(): void {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);

        // Update icon
        const themeIcon = this.ui.themeToggle?.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }

        // Save preference
        Storage.saveSettings({ theme: newTheme });
    }

    /**
     * Toggle virtual keyboard
     * @param show - Whether to show keyboard
     */
    toggleVirtualKeyboard(show: boolean): void {
        if (!this.ui.virtualKeyboard) return;

        if (show) {
            this.ui.virtualKeyboard.classList.remove('hidden');
            this.createVirtualKeyboard();
        } else {
            this.ui.virtualKeyboard.classList.add('hidden');
        }

        Storage.saveSettings({ virtualKeyboard: show });
    }

    /**
     * Create virtual keyboard
     */
    createVirtualKeyboard(): void {
        if (!this.ui.virtualKeyboard) return;

        const container = this.ui.virtualKeyboard.querySelector('.keyboard-container');
        if (!container || container.children.length > 0) return;

        // Create one octave of keys (C4 to C5)
        const whiteKeys = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
        const blackKeys: (string | null)[] = ['C#4', 'D#4', null, 'F#4', 'G#4', 'A#4', null];

        whiteKeys.forEach((note, index) => {
            // White key
            const whiteKey = document.createElement('div');
            whiteKey.className = 'key white';
            whiteKey.dataset.note = note;

            const label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = note;
            whiteKey.appendChild(label);

            whiteKey.addEventListener('mousedown', () => {
                this.playVirtualNote(note);
                whiteKey.classList.add('active');
            });

            whiteKey.addEventListener('mouseup', () => {
                whiteKey.classList.remove('active');
            });

            container.appendChild(whiteKey);

            // Black key (if exists)
            if (index < blackKeys.length && blackKeys[index]) {
                const blackKeyNote = blackKeys[index]!;
                const blackKey = document.createElement('div');
                blackKey.className = 'key black';
                blackKey.dataset.note = blackKeyNote;

                blackKey.addEventListener('mousedown', () => {
                    this.playVirtualNote(blackKeyNote);
                    blackKey.classList.add('active');
                });

                blackKey.addEventListener('mouseup', () => {
                    blackKey.classList.remove('active');
                });

                container.appendChild(blackKey);
            }
        });
    }

    /**
     * Play a virtual note (simulate MIDI input)
     * @param noteName - Note name (e.g., "C4")
     */
    playVirtualNote(noteName: string): void {
        if (!this.midiManager) return;

        const midiNote = MusicTheory.noteNameToMidi(noteName);
        if (midiNote !== -1) {
            this.midiManager.simulateNote(midiNote);
        }
    }

    /**
     * Switch between modules
     * @param moduleName - Module to switch to
     */
    switchModule(moduleName: ModuleName): void {
        // Update navigation
        this.ui.moduleButtons.forEach(btn => {
            if (btn.dataset.module === moduleName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Show/hide modules
        const modules = document.querySelectorAll('.module');
        modules.forEach(module => {
            if (module.id === `${moduleName}Module`) {
                module.classList.add('active');
            } else {
                module.classList.remove('active');
            }
        });

        this.currentModule = moduleName;
    }

    /**
     * Handle keyboard shortcuts
     * @param e - Keyboard event
     */
    handleKeyboardShortcut(e: KeyboardEvent): void {
        // Space: Start/stop or next note
        if (e.code === 'Space') {
            e.preventDefault();
            if (this.currentModule === 'sightReading' && this.sightReadingModule) {
                if (this.sightReadingModule.active) {
                    this.sightReadingModule.nextNote();
                } else {
                    this.sightReadingModule.startSession();
                }
            }
        }

        // Escape: Stop session
        if (e.code === 'Escape') {
            if (this.currentModule === 'sightReading' && this.sightReadingModule && this.sightReadingModule.active) {
                this.sightReadingModule.stopSession();
            }
        }
    }

    /**
     * Show welcome screen
     */
    showWelcome(): void {
        if (this.staffRenderer) {
            this.staffRenderer.showWelcome();
        }
    }

    /**
     * Show error message
     * @param message - Error message
     */
    showError(message: string): void {
        console.error(message);
        // Could show a toast notification here
    }

    /**
     * Load saved settings
     */
    loadSettings(): void {
        const settings = Storage.getSettings();

        // Load instrument preference
        if (settings.instrument) {
            this.currentInstrument = settings.instrument as InstrumentTypeValue;
            if (this.ui.instrumentSelect) {
                this.ui.instrumentSelect.value = this.currentInstrument;
            }
        }

        // Apply theme
        if (settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
            const themeIcon = this.ui.themeToggle?.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = settings.theme === 'dark' ? '☀️' : '🌙';
            }
        }

        // Apply virtual keyboard setting
        if (settings.virtualKeyboard && this.ui.virtualKeyboardToggle) {
            this.ui.virtualKeyboardToggle.checked = true;
            this.toggleVirtualKeyboard(true);
        }

        // Auto-connect to saved audio device if using microphone instrument
        if (settings.audioDeviceId && requiresMicrophone(this.currentInstrument) && this.audioManager) {
            // Delay to ensure UI is ready
            setTimeout(() => {
                this.reconnectMicrophone(settings.audioDeviceId || undefined);
            }, 500);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    (window as any).app = new MusicPracticeApp();
});

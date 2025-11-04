interface DeviceChangeEvent {
    connected?: boolean;
    device?: MIDIInput | null;
    type?: string;
    port?: MIDIPort;
}

interface PitchDetectedEvent {
    frequency: number;
    midi: number;
    cents: number;
    clarity: number;
    noteName: string;
    timestamp: number;
}
interface StatusChangeEvent {
    listening: boolean;
    microphoneActive: boolean;
}

/**
 * Instrument Configuration System
 * Defines profiles for different instruments with input methods, ranges, and settings
 */
declare const InstrumentType: {
    readonly PIANO: "piano";
    readonly VIOLIN: "violin";
    readonly GUITAR: "guitar";
};
type InstrumentTypeValue = typeof InstrumentType[keyof typeof InstrumentType];

/**
 * Main Application Controller
 * Initializes and coordinates all modules
 */

type ModuleName = 'sightReading';
declare class MusicPracticeApp {
    private midiManager;
    private audioManager;
    private staffRenderer;
    private fallingNotesRenderer;
    private sightReadingModule;
    private currentModule;
    private currentInstrument;
    private ui;
    constructor();
    /**
     * Initialize the application
     */
    init(): Promise<void>;
    /**
     * Initialize input methods (MIDI and/or Microphone) based on instrument
     */
    initInputMethods(): Promise<void>;
    /**
     * Initialize MIDI manager
     */
    initMidi(): Promise<void>;
    /**
     * Initialize Audio manager (microphone)
     * Note: Does not automatically request permission - user must click "Connect Microphone"
     */
    initAudio(): Promise<void>;
    /**
     * Initialize notation renderers
     */
    initRenderers(): void;
    /**
     * Initialize practice modules
     */
    initModules(): void;
    /**
     * Setup UI event listeners
     */
    setupEventListeners(): void;
    /**
     * Handle MIDI device connection changes
     */
    handleMidiDeviceChange(data: DeviceChangeEvent): void;
    /**
     * Handle audio status changes (microphone)
     */
    handleAudioStatusChange(data: StatusChangeEvent): void;
    /**
     * Update UI visibility based on selected instrument
     */
    updateInputUIVisibility(): void;
    /**
     * Update MIDI status indicator
     */
    updateMidiStatus(connected: boolean, deviceName?: string | null): void;
    /**
     * Update microphone status indicator
     */
    updateMicrophoneStatus(active: boolean, listening?: boolean): void;
    /**
     * Update pitch display in UI
     */
    updatePitchDisplay(data: PitchDetectedEvent): void;
    /**
     * Update audio level bar
     */
    updateAudioLevel(level: number): void;
    /**
     * Update MIDI device dropdown list
     */
    updateDeviceList(): void;
    /**
     * Reconnect MIDI
     */
    reconnectMidi(): Promise<void>;
    /**
     * Reconnect microphone
     * @param deviceId - Optional specific device ID to use
     */
    reconnectMicrophone(deviceId?: string): Promise<void>;
    /**
     * Update audio device dropdown list
     */
    updateAudioDeviceList(): Promise<void>;
    /**
     * Switch instrument
     */
    switchInstrument(instrumentId: InstrumentTypeValue): Promise<void>;
    /**
     * Show MIDI warning
     */
    showMidiWarning(): void;
    /**
     * Show microphone warning
     */
    showMicrophoneWarning(): void;
    /**
     * Show microphone connected message
     */
    showMicrophoneConnected(): void;
    /**
     * Toggle theme (light/dark)
     */
    toggleTheme(): void;
    /**
     * Toggle virtual keyboard
     * @param show - Whether to show keyboard
     */
    toggleVirtualKeyboard(show: boolean): void;
    /**
     * Create virtual keyboard
     */
    createVirtualKeyboard(): void;
    /**
     * Play a virtual note (simulate MIDI input)
     * @param noteName - Note name (e.g., "C4")
     */
    playVirtualNote(noteName: string): void;
    /**
     * Switch between modules
     * @param moduleName - Module to switch to
     */
    switchModule(moduleName: ModuleName): void;
    /**
     * Handle keyboard shortcuts
     * @param e - Keyboard event
     */
    handleKeyboardShortcut(e: KeyboardEvent): void;
    /**
     * Show welcome screen
     */
    showWelcome(): void;
    /**
     * Show error message
     * @param message - Error message
     */
    showError(message: string): void;
    /**
     * Load saved settings
     */
    loadSettings(): void;
}

export { MusicPracticeApp };

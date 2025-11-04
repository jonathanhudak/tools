/**
 * Main Application Controller
 * Initializes and coordinates all modules
 */

class PianoPracticeApp {
    constructor() {
        this.midiManager = null;
        this.staffRenderer = null;
        this.fallingNotesRenderer = null;
        this.sightReadingModule = null;
        this.currentModule = 'sightReading';

        // UI elements
        this.ui = {
            midiStatus: document.getElementById('midiStatus'),
            midiDeviceSelect: document.getElementById('midiDeviceSelect'),
            connectMidiBtn: document.getElementById('connectMidiBtn'),
            virtualKeyboardToggle: document.getElementById('virtualKeyboardToggle'),
            virtualKeyboard: document.getElementById('virtualKeyboard'),
            themeToggle: document.getElementById('themeToggle'),
            moduleButtons: document.querySelectorAll('.nav-btn')
        };

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing PianoPractice Pro...');

        // Load settings
        this.loadSettings();

        // Initialize MIDI
        await this.initMidi();

        // Initialize renderers
        this.initRenderers();

        // Initialize modules
        this.initModules();

        // Setup UI event listeners
        this.setupEventListeners();

        // Show welcome screen
        this.showWelcome();

        console.log('PianoPractice Pro initialized successfully');
    }

    /**
     * Initialize MIDI manager
     */
    async initMidi() {
        this.midiManager = new MidiManager();

        // Register event listeners
        this.midiManager.on('deviceChange', (data) => {
            this.handleDeviceChange(data);
        });

        this.midiManager.on('error', (data) => {
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
     * Initialize notation renderers
     */
    initRenderers() {
        this.staffRenderer = new StaffRenderer('staffDisplay');
        this.fallingNotesRenderer = new FallingNotesRenderer('fallingNotesDisplay');
    }

    /**
     * Initialize practice modules
     */
    initModules() {
        this.sightReadingModule = new SightReadingModule(
            this.midiManager,
            this.staffRenderer,
            this.fallingNotesRenderer
        );
    }

    /**
     * Setup UI event listeners
     */
    setupEventListeners() {
        // Theme toggle
        if (this.ui.themeToggle) {
            this.ui.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // MIDI device selection
        if (this.ui.midiDeviceSelect) {
            this.ui.midiDeviceSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.midiManager.connectDevice(e.target.value);
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
                this.toggleVirtualKeyboard(e.target.checked);
            });
        }

        // Module navigation
        this.ui.moduleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const module = e.currentTarget.dataset.module;
                this.switchModule(module);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcut(e);
        });
    }

    /**
     * Handle device connection changes
     * @param {Object} data - Device change data
     */
    handleDeviceChange(data) {
        console.log('Device change:', data);

        if (data.connected) {
            this.updateMidiStatus(true, data.device.name);
        } else {
            this.updateMidiStatus(false);
        }

        this.updateDeviceList();
    }

    /**
     * Update MIDI status indicator
     * @param {boolean} connected - Whether MIDI is connected
     * @param {string} deviceName - Name of connected device
     */
    updateMidiStatus(connected, deviceName = null) {
        if (!this.ui.midiStatus) return;

        const statusDot = this.ui.midiStatus.querySelector('.status-dot');
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
     * Update MIDI device dropdown list
     */
    updateDeviceList() {
        if (!this.ui.midiDeviceSelect) return;

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

                if (this.midiManager.selectedInput && this.midiManager.selectedInput.id === device.id) {
                    option.selected = true;
                }

                this.ui.midiDeviceSelect.appendChild(option);
            });
        }
    }

    /**
     * Reconnect MIDI
     */
    async reconnectMidi() {
        await this.midiManager.init();
        this.updateDeviceList();
    }

    /**
     * Show MIDI warning
     */
    showMidiWarning() {
        console.warn('MIDI not available. Virtual keyboard or manual testing required.');
    }

    /**
     * Toggle theme (light/dark)
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);

        // Update icon
        const themeIcon = this.ui.themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }

        // Save preference
        Storage.saveSettings({ theme: newTheme });
    }

    /**
     * Toggle virtual keyboard
     * @param {boolean} show - Whether to show keyboard
     */
    toggleVirtualKeyboard(show) {
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
    createVirtualKeyboard() {
        const container = this.ui.virtualKeyboard.querySelector('.keyboard-container');
        if (!container || container.children.length > 0) return;

        // Create one octave of keys (C4 to C5)
        const whiteKeys = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
        const blackKeys = ['C#4', 'D#4', null, 'F#4', 'G#4', 'A#4', null];

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
                const blackKey = document.createElement('div');
                blackKey.className = 'key black';
                blackKey.dataset.note = blackKeys[index];

                blackKey.addEventListener('mousedown', () => {
                    this.playVirtualNote(blackKeys[index]);
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
     * @param {string} noteName - Note name (e.g., "C4")
     */
    playVirtualNote(noteName) {
        const midiNote = MusicTheory.noteNameToMidi(noteName);
        this.midiManager.simulateNote(midiNote);
    }

    /**
     * Switch between modules
     * @param {string} moduleName - Module to switch to
     */
    switchModule(moduleName) {
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
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcut(e) {
        // Space: Start/stop or next note
        if (e.code === 'Space') {
            e.preventDefault();
            if (this.currentModule === 'sightReading') {
                if (this.sightReadingModule.isActive) {
                    this.sightReadingModule.nextNote();
                } else {
                    this.sightReadingModule.startSession();
                }
            }
        }

        // Escape: Stop session
        if (e.code === 'Escape') {
            if (this.currentModule === 'sightReading' && this.sightReadingModule.isActive) {
                this.sightReadingModule.stopSession();
            }
        }
    }

    /**
     * Show welcome screen
     */
    showWelcome() {
        this.staffRenderer.showWelcome();
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        console.error(message);
        // Could show a toast notification here
    }

    /**
     * Load saved settings
     */
    loadSettings() {
        const settings = Storage.getSettings();

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
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PianoPracticeApp();
});

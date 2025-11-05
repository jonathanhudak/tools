/**
 * Sight Reading Module
 * Manages the sight reading practice session
 */

import { MidiManager, NoteOnEvent } from '../midi/midi-manager.js';
import { AudioManager, PitchDetectedEvent } from '../input/audio-manager.js';
import { StaffRenderer } from '../notation/staff-renderer.js';
import { FallingNotesRenderer } from '../notation/falling-notes.js';
import { MusicTheory, NoteInfo, ClefType, validatePitchWithCents } from '../utils/music-theory.js';
import { Storage, SessionData } from '../utils/storage.js';
import { InstrumentTypeValue, getInstrument, requiresMicrophone, requiresMIDI, getPitchTolerance, getNoteRange } from '../utils/instrument-config.js';
import { AudioToneGenerator } from '../utils/audio-tone.js';

// Type definitions
interface SessionStats {
    correct: number;
    incorrect: number;
    streak: number;
    bestStreak: number;
    totalTime: number;
    attempts: Attempt[];
}

interface Attempt {
    targetNote: number;
    playedNote: number | null;
    correct: boolean;
    skipped?: boolean;
    responseTime: number;
    timestamp: number;
}

interface ModuleSettings {
    clef: ClefType;
    range: string;
    fallingNotesMode: boolean;
    allowOctaveError: boolean;
}

interface UIElements {
    correctCount: HTMLElement | null;
    incorrectCount: HTMLElement | null;
    streakCount: HTMLElement | null;
    avgTime: HTMLElement | null;
    feedbackMessage: HTMLElement | null;
    startBtn: HTMLElement | null;
    stopBtn: HTMLElement | null;
    nextBtn: HTMLElement | null;
    playReferenceBtn: HTMLElement | null;
}

type FeedbackType = 'correct' | 'incorrect' | 'info';

export class SightReadingModule {
    private midiManager: MidiManager | null;
    private audioManager: AudioManager | null;
    private staffRenderer: StaffRenderer;
    private fallingNotesRenderer: FallingNotesRenderer;
    private currentInstrument: InstrumentTypeValue;
    private toneGenerator: AudioToneGenerator;

    // Session state
    private isActive: boolean = false;
    private currentNote: NoteInfo | null = null;
    private currentTargetMidi: number | null = null;
    private startTime: number | null = null;
    private responseTimes: number[] = [];

    // Session stats
    private stats: SessionStats;

    // Settings
    private settings: ModuleSettings;

    // UI elements
    private ui: UIElements;

    // Event handler references for cleanup
    private midiNoteOnHandler: ((event: NoteOnEvent) => void) | null = null;
    private audioPitchHandler: ((event: PitchDetectedEvent) => void) | null = null;

    constructor(
        midiManager: MidiManager | null,
        staffRenderer: StaffRenderer,
        fallingNotesRenderer: FallingNotesRenderer,
        audioManager: AudioManager | null = null,
        instrument: InstrumentTypeValue = 'piano'
    ) {
        this.midiManager = midiManager;
        this.audioManager = audioManager;
        this.staffRenderer = staffRenderer;
        this.fallingNotesRenderer = fallingNotesRenderer;
        this.currentInstrument = instrument;
        this.toneGenerator = new AudioToneGenerator();

        // Initialize stats
        this.stats = {
            correct: 0,
            incorrect: 0,
            streak: 0,
            bestStreak: 0,
            totalTime: 0,
            attempts: []
        };

        // Get instrument configuration
        const instrumentConfig = getInstrument(this.currentInstrument);

        // Initialize settings with instrument-specific defaults
        this.settings = {
            clef: instrumentConfig.defaultClef,
            range: 'c4-c5', // Will be overridden by instrument range in generateNewNote()
            fallingNotesMode: false,
            allowOctaveError: instrumentConfig.validation.octaveFlexible
        };

        // Initialize UI elements
        this.ui = {
            correctCount: document.getElementById('correctCount'),
            incorrectCount: document.getElementById('incorrectCount'),
            streakCount: document.getElementById('streakCount'),
            avgTime: document.getElementById('avgTime'),
            feedbackMessage: document.getElementById('feedbackMessage'),
            startBtn: document.getElementById('startSessionBtn'),
            stopBtn: document.getElementById('stopSessionBtn'),
            nextBtn: document.getElementById('nextNoteBtn'),
            playReferenceBtn: document.getElementById('playReferenceBtn')
        };

        this.initEventListeners();
    }

    /**
     * Initialize event listeners
     */
    private initEventListeners(): void {
        // MIDI note input (if MIDI instrument)
        if (this.midiManager && requiresMIDI(this.currentInstrument)) {
            this.midiNoteOnHandler = (data: NoteOnEvent) => {
                if (this.isActive && this.currentTargetMidi !== null) {
                    this.handleMidiInput(data.note);
                }
            };
            this.midiManager.on('noteOn', this.midiNoteOnHandler);
        }

        // Microphone pitch detection (if microphone instrument)
        if (this.audioManager && requiresMicrophone(this.currentInstrument)) {
            this.audioPitchHandler = (data: PitchDetectedEvent) => {
                if (this.isActive && this.currentTargetMidi !== null) {
                    this.handleMicrophoneInput(data);
                }
            };
            this.audioManager.on('pitchDetected', this.audioPitchHandler);
        }

        // UI controls
        if (this.ui.startBtn) {
            this.ui.startBtn.addEventListener('click', () => this.startSession());
        }

        if (this.ui.stopBtn) {
            this.ui.stopBtn.addEventListener('click', () => this.stopSession());
        }

        if (this.ui.nextBtn) {
            this.ui.nextBtn.addEventListener('click', () => this.nextNote());
        }

        if (this.ui.playReferenceBtn) {
            this.ui.playReferenceBtn.addEventListener('click', () => this.playReferenceTone());
        }

        // Settings
        const clefSelect = document.getElementById('clefSelect') as HTMLSelectElement | null;
        if (clefSelect) {
            clefSelect.addEventListener('change', (e) => {
                const target = e.target as HTMLSelectElement;
                this.settings.clef = target.value as ClefType;
                this.staffRenderer.setClef(target.value as ClefType);
                if (this.isActive) {
                    this.generateNewNote();
                }
            });
        }

        const rangeSelect = document.getElementById('rangeSelect') as HTMLSelectElement | null;
        if (rangeSelect) {
            rangeSelect.addEventListener('change', (e) => {
                const target = e.target as HTMLSelectElement;
                this.settings.range = target.value;
                if (this.isActive) {
                    this.generateNewNote();
                }
            });
        }

        const fallingNotesToggle = document.getElementById('fallingNotesToggle') as HTMLInputElement | null;
        if (fallingNotesToggle) {
            fallingNotesToggle.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                this.settings.fallingNotesMode = target.checked;
                this.toggleRenderMode();
            });
        }
    }

    /**
     * Start practice session
     */
    startSession(): void {
        this.isActive = true;
        this.resetStats();
        this.updateUI();

        // Show/hide buttons
        if (this.ui.startBtn) this.ui.startBtn.classList.add('hidden');
        if (this.ui.stopBtn) this.ui.stopBtn.classList.remove('hidden');

        // Start microphone listening if using microphone input
        if (this.audioManager && requiresMicrophone(this.currentInstrument)) {
            this.audioManager.startListening();
        }

        // Generate first note
        this.generateNewNote();

        // Update feedback
        const instrument = getInstrument(this.currentInstrument);
        const inputHint = requiresMicrophone(this.currentInstrument)
            ? 'Play the note on your instrument'
            : 'Play the note shown above';
        this.showFeedback(inputHint, 'info');
    }

    /**
     * Stop practice session
     */
    stopSession(): void {
        this.isActive = false;

        // Stop microphone listening if using microphone input
        if (this.audioManager && requiresMicrophone(this.currentInstrument)) {
            this.audioManager.stopListening();
        }

        // Show/hide buttons
        if (this.ui.startBtn) this.ui.startBtn.classList.remove('hidden');
        if (this.ui.stopBtn) this.ui.stopBtn.classList.add('hidden');

        // Save session
        this.saveSession();

        // Show summary
        this.showSessionSummary();

        // Clear displays
        if (this.settings.fallingNotesMode) {
            this.fallingNotesRenderer.clear();
            this.fallingNotesRenderer.stopAnimation();
        } else {
            this.staffRenderer.clear();
        }
    }

    /**
     * Generate a new note
     */
    private generateNewNote(): void {
        // Get instrument-specific note range
        const instrumentRange = getNoteRange(this.currentInstrument);
        const rangeString = `${MusicTheory.midiToNoteName(instrumentRange.min).toLowerCase()}-${MusicTheory.midiToNoteName(instrumentRange.max).toLowerCase()}`;

        // Generate random note using instrument's range
        const noteData = MusicTheory.generateRandomNote(
            rangeString,
            this.settings.clef,
            true // naturals only
        );

        if (!noteData) {
            console.error('Failed to generate note for instrument:', this.currentInstrument);
            return;
        }

        this.currentNote = noteData;
        this.currentTargetMidi = noteData.midiNote;
        this.startTime = Date.now();

        // Render based on mode
        if (this.settings.fallingNotesMode) {
            this.fallingNotesRenderer.addNote(
                noteData.midiNote,
                MusicTheory.midiToNoteName(noteData.midiNote)
            );
        } else {
            this.staffRenderer.renderNote(noteData.vexflowNote);
        }
    }

    /**
     * Handle note input from MIDI
     */
    private handleMidiInput(midiNote: number): void {
        if (this.currentTargetMidi === null || this.startTime === null) return;

        // Validate note
        const validation = MusicTheory.validateNote(
            midiNote,
            this.currentTargetMidi,
            {
                allowOctaveError: this.settings.allowOctaveError
            }
        );

        // Calculate response time
        const responseTime = Date.now() - this.startTime;
        this.responseTimes.push(responseTime);

        // Record attempt
        this.stats.attempts.push({
            targetNote: this.currentTargetMidi,
            playedNote: midiNote,
            correct: validation.isCorrect,
            responseTime: responseTime,
            timestamp: Date.now()
        });

        if (validation.isCorrect) {
            this.handleCorrectNote(validation.message, responseTime);
        } else {
            this.handleIncorrectNote(validation.message);
        }
    }

    /**
     * Handle pitch input from microphone
     */
    private handleMicrophoneInput(data: PitchDetectedEvent): void {
        if (this.currentTargetMidi === null || this.startTime === null) return;

        // Get pitch tolerance for this instrument
        const toleranceCents = getPitchTolerance(this.currentInstrument);

        // Validate pitch with cents tolerance
        const validation = validatePitchWithCents(
            data.frequency,
            this.currentTargetMidi,
            toleranceCents
        );

        // Only process if correct (ignore incorrect detections to avoid false negatives)
        if (validation.isCorrect) {
            // Calculate response time
            const responseTime = Date.now() - this.startTime;
            this.responseTimes.push(responseTime);

            // Record attempt
            this.stats.attempts.push({
                targetNote: this.currentTargetMidi,
                playedNote: data.midi,
                correct: true,
                responseTime: responseTime,
                timestamp: Date.now()
            });

            // Show feedback with pitch accuracy
            const feedbackMessage = validation.centsOff !== undefined && Math.abs(validation.centsOff) > 5
                ? `✓ Correct! ${validation.message}`
                : '✓ Perfect pitch!';

            this.handleCorrectNote(feedbackMessage, responseTime);
        }
    }

    /**
     * Handle correct note
     * @param message - Feedback message
     * @param responseTime - Response time in ms
     */
    private handleCorrectNote(message: string, responseTime: number): void {
        // Update stats
        this.stats.correct++;
        this.stats.streak++;
        if (this.stats.streak > this.stats.bestStreak) {
            this.stats.bestStreak = this.stats.streak;
        }

        // Show feedback
        this.showFeedback(
            `✓ ${message} (${(responseTime / 1000).toFixed(2)}s)`,
            'correct'
        );

        // Visual feedback
        if (this.settings.fallingNotesMode) {
            // Falling notes handles its own feedback
        } else {
            this.staffRenderer.showFeedback(true);
        }

        // Play success sound (optional - could use Web Audio API)
        this.playFeedbackSound(true);

        // Update UI
        this.updateUI();

        // Auto-advance to next note after delay
        setTimeout(() => {
            if (this.isActive) {
                this.generateNewNote();
            }
        }, 1000);
    }

    /**
     * Handle incorrect note
     * @param message - Feedback message
     */
    private handleIncorrectNote(message: string): void {
        // Update stats
        this.stats.incorrect++;
        this.stats.streak = 0;

        // Show feedback
        this.showFeedback(`✗ ${message}`, 'incorrect');

        // Visual feedback
        if (this.settings.fallingNotesMode) {
            // Falling notes handles its own feedback
        } else {
            this.staffRenderer.showFeedback(false);
        }

        // Play error sound
        this.playFeedbackSound(false);

        // Update UI
        this.updateUI();

        // Don't auto-advance - let user try again or click next
    }

    /**
     * Move to next note (manual)
     */
    nextNote(): void {
        if (this.isActive) {
            // Record as skipped if not attempted
            if (this.currentNote && this.startTime !== null) {
                this.stats.attempts.push({
                    targetNote: this.currentNote.midiNote,
                    playedNote: null,
                    correct: false,
                    skipped: true,
                    responseTime: Date.now() - this.startTime,
                    timestamp: Date.now()
                });
            }

            this.generateNewNote();
            this.showFeedback('Play the note shown above', 'info');
        }
    }

    /**
     * Play reference tone for the current note
     */
    private playReferenceTone(): void {
        if (this.currentTargetMidi === null) {
            // If no active note, show a message
            this.showFeedback('Start practice session first to hear note references', 'info');
            console.warn('No current note to play');
            return;
        }

        // Temporarily stop microphone listening to prevent it from detecting the reference tone
        const wasListening = this.audioManager?.isCurrentlyListening() || false;
        if (wasListening && this.audioManager) {
            this.audioManager.stopListening();
        }

        // Convert MIDI note to frequency
        const frequency = 440 * Math.pow(2, (this.currentTargetMidi - 69) / 12);

        // Play tone for 1 second at moderate volume
        this.toneGenerator.playTone(frequency, 1000, 0.3);

        // Show brief feedback
        this.showFeedback('🔊 Playing reference tone...', 'info');

        // Reset feedback and restart listening after tone plays
        setTimeout(() => {
            // Resume microphone listening if it was active
            if (wasListening && this.audioManager && this.isActive) {
                this.audioManager.startListening();
            }

            if (this.isActive) {
                const inputHint = requiresMicrophone(this.currentInstrument)
                    ? 'Play the note on your instrument'
                    : 'Play the note shown above';
                this.showFeedback(inputHint, 'info');
            }
        }, 1200);
    }

    /**
     * Toggle between staff and falling notes rendering
     */
    private toggleRenderMode(): void {
        const staffDisplay = document.getElementById('staffDisplay');
        const fallingDisplay = document.getElementById('fallingNotesDisplay');

        if (this.settings.fallingNotesMode) {
            // Switch to falling notes
            if (staffDisplay) staffDisplay.classList.add('hidden');
            if (fallingDisplay) fallingDisplay.classList.remove('hidden');
            this.fallingNotesRenderer.showWelcome();
        } else {
            // Switch to staff
            if (fallingDisplay) fallingDisplay.classList.add('hidden');
            if (staffDisplay) staffDisplay.classList.remove('hidden');
            this.staffRenderer.showWelcome();
        }

        // Regenerate current note if session is active
        if (this.isActive && this.currentNote) {
            this.generateNewNote();
        }
    }

    /**
     * Show feedback message
     * @param message - Message to display
     * @param type - 'correct', 'incorrect', or 'info'
     */
    private showFeedback(message: string, type: FeedbackType = 'info'): void {
        if (this.ui.feedbackMessage) {
            this.ui.feedbackMessage.textContent = message;
            this.ui.feedbackMessage.className = 'feedback-message';

            if (type === 'correct') {
                this.ui.feedbackMessage.classList.add('correct');
            } else if (type === 'incorrect') {
                this.ui.feedbackMessage.classList.add('incorrect');
            }
        }
    }

    /**
     * Update UI elements with current stats
     */
    private updateUI(): void {
        if (this.ui.correctCount) {
            this.ui.correctCount.textContent = this.stats.correct.toString();
        }

        if (this.ui.incorrectCount) {
            this.ui.incorrectCount.textContent = this.stats.incorrect.toString();
        }

        if (this.ui.streakCount) {
            this.ui.streakCount.textContent = this.stats.streak.toString();
        }

        if (this.ui.avgTime && this.responseTimes.length > 0) {
            const avgTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
            this.ui.avgTime.textContent = (avgTime / 1000).toFixed(2) + 's';
        }
    }

    /**
     * Reset session stats
     */
    private resetStats(): void {
        this.stats = {
            correct: 0,
            incorrect: 0,
            streak: 0,
            bestStreak: 0,
            totalTime: 0,
            attempts: []
        };
        this.responseTimes = [];
        this.updateUI();
    }

    /**
     * Save session to storage
     */
    private saveSession(): void {
        const sessionData: SessionData = {
            module: 'sightReading',
            correct: this.stats.correct,
            incorrect: this.stats.incorrect,
            bestStreak: this.stats.bestStreak,
            avgResponseTime: this.responseTimes.length > 0
                ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
                : 0,
            attempts: this.stats.attempts,
            settings: { ...this.settings }
        };

        Storage.saveSession(sessionData);
    }

    /**
     * Show session summary
     */
    private showSessionSummary(): void {
        const total = this.stats.correct + this.stats.incorrect;
        const accuracy = total > 0 ? ((this.stats.correct / total) * 100).toFixed(1) : '0';
        const avgTime = this.responseTimes.length > 0
            ? (this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length / 1000).toFixed(2)
            : '0';

        this.showFeedback(
            `Session Complete! Accuracy: ${accuracy}% | Avg Time: ${avgTime}s | Best Streak: ${this.stats.bestStreak}`,
            'info'
        );
    }

    /**
     * Play feedback sound
     * @param isCorrect - Whether the note was correct
     */
    private playFeedbackSound(isCorrect: boolean): void {
        // Simple beep using Web Audio API
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = isCorrect ? 800 : 400;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silently fail if audio is not available
        }
    }

    /**
     * Get whether session is active
     */
    get active(): boolean {
        return this.isActive;
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    (window as any).SightReadingModule = SightReadingModule;
}

/**
 * Sight Reading Module
 * Manages the sight reading practice session
 */

class SightReadingModule {
    constructor(midiManager, staffRenderer, fallingNotesRenderer) {
        this.midiManager = midiManager;
        this.staffRenderer = staffRenderer;
        this.fallingNotesRenderer = fallingNotesRenderer;

        // Session state
        this.isActive = false;
        this.currentNote = null;
        this.startTime = null;
        this.responseTimes = [];

        // Session stats
        this.stats = {
            correct: 0,
            incorrect: 0,
            streak: 0,
            bestStreak: 0,
            totalTime: 0,
            attempts: []
        };

        // Settings
        this.settings = {
            clef: 'treble',
            range: 'c4-c5',
            fallingNotesMode: false,
            allowOctaveError: true
        };

        // UI elements
        this.ui = {
            correctCount: document.getElementById('correctCount'),
            incorrectCount: document.getElementById('incorrectCount'),
            streakCount: document.getElementById('streakCount'),
            avgTime: document.getElementById('avgTime'),
            feedbackMessage: document.getElementById('feedbackMessage'),
            startBtn: document.getElementById('startSessionBtn'),
            stopBtn: document.getElementById('stopSessionBtn'),
            nextBtn: document.getElementById('nextNoteBtn')
        };

        this.initEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // MIDI note input
        this.midiManager.on('noteOn', (data) => {
            if (this.isActive && this.currentNote) {
                this.handleNoteInput(data.note);
            }
        });

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

        // Settings
        const clefSelect = document.getElementById('clefSelect');
        if (clefSelect) {
            clefSelect.addEventListener('change', (e) => {
                this.settings.clef = e.target.value;
                this.staffRenderer.setClef(e.target.value);
                if (this.isActive) {
                    this.generateNewNote();
                }
            });
        }

        const rangeSelect = document.getElementById('rangeSelect');
        if (rangeSelect) {
            rangeSelect.addEventListener('change', (e) => {
                this.settings.range = e.target.value;
                if (this.isActive) {
                    this.generateNewNote();
                }
            });
        }

        const fallingNotesToggle = document.getElementById('fallingNotesToggle');
        if (fallingNotesToggle) {
            fallingNotesToggle.addEventListener('change', (e) => {
                this.settings.fallingNotesMode = e.target.checked;
                this.toggleRenderMode();
            });
        }
    }

    /**
     * Start practice session
     */
    startSession() {
        this.isActive = true;
        this.resetStats();
        this.updateUI();

        // Show/hide buttons
        if (this.ui.startBtn) this.ui.startBtn.classList.add('hidden');
        if (this.ui.stopBtn) this.ui.stopBtn.classList.remove('hidden');

        // Generate first note
        this.generateNewNote();

        // Update feedback
        this.showFeedback('Play the note shown above', 'info');
    }

    /**
     * Stop practice session
     */
    stopSession() {
        this.isActive = false;

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
    generateNewNote() {
        // Generate random note
        const noteData = MusicTheory.generateRandomNote(
            this.settings.range,
            this.settings.clef,
            true // naturals only
        );

        if (!noteData) {
            console.error('Failed to generate note');
            return;
        }

        this.currentNote = noteData;
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
     * @param {number} midiNote - MIDI note number played
     */
    handleNoteInput(midiNote) {
        if (!this.currentNote) return;

        // Validate note
        const validation = MusicTheory.validateNote(
            midiNote,
            this.currentNote.midiNote,
            {
                allowOctaveError: this.settings.allowOctaveError
            }
        );

        // Calculate response time
        const responseTime = Date.now() - this.startTime;
        this.responseTimes.push(responseTime);

        // Record attempt
        this.stats.attempts.push({
            targetNote: this.currentNote.midiNote,
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
     * Handle correct note
     * @param {string} message - Feedback message
     * @param {number} responseTime - Response time in ms
     */
    handleCorrectNote(message, responseTime) {
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
     * @param {string} message - Feedback message
     */
    handleIncorrectNote(message) {
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
    nextNote() {
        if (this.isActive) {
            // Record as skipped if not attempted
            if (this.currentNote && this.startTime) {
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
     * Toggle between staff and falling notes rendering
     */
    toggleRenderMode() {
        const staffDisplay = document.getElementById('staffDisplay');
        const fallingDisplay = document.getElementById('fallingNotesDisplay');

        if (this.settings.fallingNotesMode) {
            // Switch to falling notes
            staffDisplay.classList.add('hidden');
            fallingDisplay.classList.remove('hidden');
            this.fallingNotesRenderer.showWelcome();
        } else {
            // Switch to staff
            fallingDisplay.classList.add('hidden');
            staffDisplay.classList.remove('hidden');
            this.staffRenderer.showWelcome();
        }

        // Regenerate current note if session is active
        if (this.isActive && this.currentNote) {
            this.generateNewNote();
        }
    }

    /**
     * Show feedback message
     * @param {string} message - Message to display
     * @param {string} type - 'correct', 'incorrect', or 'info'
     */
    showFeedback(message, type = 'info') {
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
    updateUI() {
        if (this.ui.correctCount) {
            this.ui.correctCount.textContent = this.stats.correct;
        }

        if (this.ui.incorrectCount) {
            this.ui.incorrectCount.textContent = this.stats.incorrect;
        }

        if (this.ui.streakCount) {
            this.ui.streakCount.textContent = this.stats.streak;
        }

        if (this.ui.avgTime && this.responseTimes.length > 0) {
            const avgTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
            this.ui.avgTime.textContent = (avgTime / 1000).toFixed(2) + 's';
        }
    }

    /**
     * Reset session stats
     */
    resetStats() {
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
    saveSession() {
        const sessionData = {
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
    showSessionSummary() {
        const total = this.stats.correct + this.stats.incorrect;
        const accuracy = total > 0 ? ((this.stats.correct / total) * 100).toFixed(1) : 0;
        const avgTime = this.responseTimes.length > 0
            ? (this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length / 1000).toFixed(2)
            : 0;

        this.showFeedback(
            `Session Complete! Accuracy: ${accuracy}% | Avg Time: ${avgTime}s | Best Streak: ${this.stats.bestStreak}`,
            'info'
        );
    }

    /**
     * Play feedback sound
     * @param {boolean} isCorrect - Whether the note was correct
     */
    playFeedbackSound(isCorrect) {
        // Simple beep using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
}

// Make available globally
window.SightReadingModule = SightReadingModule;

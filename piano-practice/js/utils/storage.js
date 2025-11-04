/**
 * Storage Utilities
 * Handles local storage for progress tracking and session data
 */

const Storage = {
    // Storage keys
    KEYS: {
        SESSIONS: 'piano_practice_sessions',
        SETTINGS: 'piano_practice_settings',
        STATS: 'piano_practice_stats'
    },

    /**
     * Save a practice session
     * @param {Object} sessionData - Session data to save
     */
    saveSession(sessionData) {
        try {
            const sessions = this.getSessions();
            sessions.push({
                ...sessionData,
                timestamp: Date.now(),
                id: this.generateId()
            });

            // Keep only last 100 sessions
            if (sessions.length > 100) {
                sessions.shift();
            }

            localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(sessions));
            this.updateStats(sessionData);
        } catch (error) {
            console.error('Error saving session:', error);
        }
    },

    /**
     * Get all saved sessions
     * @returns {Array} Array of session objects
     */
    getSessions() {
        try {
            const data = localStorage.getItem(this.KEYS.SESSIONS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading sessions:', error);
            return [];
        }
    },

    /**
     * Update overall statistics
     * @param {Object} sessionData - Session data to update stats with
     */
    updateStats(sessionData) {
        try {
            const stats = this.getStats();

            // Update counts
            stats.totalSessions++;
            stats.totalCorrect += sessionData.correct || 0;
            stats.totalIncorrect += sessionData.incorrect || 0;
            stats.totalNotes += (sessionData.correct || 0) + (sessionData.incorrect || 0);

            // Update averages
            if (sessionData.avgResponseTime) {
                const totalTime = stats.avgResponseTime * (stats.totalSessions - 1) + sessionData.avgResponseTime;
                stats.avgResponseTime = totalTime / stats.totalSessions;
            }

            // Track best streak
            if (sessionData.bestStreak > stats.bestStreak) {
                stats.bestStreak = sessionData.bestStreak;
            }

            // Track by module
            const module = sessionData.module || 'sightReading';
            if (!stats.byModule[module]) {
                stats.byModule[module] = {
                    sessions: 0,
                    correct: 0,
                    incorrect: 0
                };
            }

            stats.byModule[module].sessions++;
            stats.byModule[module].correct += sessionData.correct || 0;
            stats.byModule[module].incorrect += sessionData.incorrect || 0;

            // Save last practice date
            stats.lastPracticeDate = Date.now();

            localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    },

    /**
     * Get overall statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        try {
            const data = localStorage.getItem(this.KEYS.STATS);
            return data ? JSON.parse(data) : this.getDefaultStats();
        } catch (error) {
            console.error('Error loading stats:', error);
            return this.getDefaultStats();
        }
    },

    /**
     * Get default statistics object
     * @returns {Object} Default stats
     */
    getDefaultStats() {
        return {
            totalSessions: 0,
            totalCorrect: 0,
            totalIncorrect: 0,
            totalNotes: 0,
            avgResponseTime: 0,
            bestStreak: 0,
            lastPracticeDate: null,
            byModule: {}
        };
    },

    /**
     * Save user settings
     * @param {Object} settings - Settings object
     */
    saveSettings(settings) {
        try {
            const currentSettings = this.getSettings();
            const updatedSettings = { ...currentSettings, ...settings };
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(updatedSettings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    },

    /**
     * Get user settings
     * @returns {Object} Settings object
     */
    getSettings() {
        try {
            const data = localStorage.getItem(this.KEYS.SETTINGS);
            return data ? JSON.parse(data) : this.getDefaultSettings();
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.getDefaultSettings();
        }
    },

    /**
     * Get default settings
     * @returns {Object} Default settings
     */
    getDefaultSettings() {
        return {
            theme: 'light',
            clef: 'treble',
            range: 'c4-c5',
            fallingNotesMode: false,
            allowOctaveError: true,
            midiDeviceId: null,
            virtualKeyboard: false
        };
    },

    /**
     * Clear all data
     */
    clearAll() {
        try {
            localStorage.removeItem(this.KEYS.SESSIONS);
            localStorage.removeItem(this.KEYS.STATS);
            // Keep settings
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    },

    /**
     * Export data as JSON
     * @returns {string} JSON string of all data
     */
    exportData() {
        return JSON.stringify({
            sessions: this.getSessions(),
            stats: this.getStats(),
            settings: this.getSettings(),
            exportDate: Date.now()
        }, null, 2);
    },

    /**
     * Import data from JSON
     * @param {string} jsonData - JSON string to import
     * @returns {boolean} Success status
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            if (data.sessions) {
                localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(data.sessions));
            }
            if (data.stats) {
                localStorage.setItem(this.KEYS.STATS, JSON.stringify(data.stats));
            }
            if (data.settings) {
                localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data.settings));
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },

    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Make available globally
window.Storage = Storage;

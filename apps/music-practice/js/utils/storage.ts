/**
 * Storage Utilities
 * Handles local storage for progress tracking and session data
 */

// Type definitions
export interface ModuleStats {
    sessions: number;
    correct: number;
    incorrect: number;
}

export interface Stats {
    totalSessions: number;
    totalCorrect: number;
    totalIncorrect: number;
    totalNotes: number;
    avgResponseTime: number;
    bestStreak: number;
    lastPracticeDate: number | null;
    byModule: Record<string, ModuleStats>;
}

export interface SessionData {
    module?: string;
    correct?: number;
    incorrect?: number;
    avgResponseTime?: number;
    bestStreak?: number;
    instrument?: string;
    clef?: string;
    range?: string;
    timestamp?: number;
    id?: string;
    [key: string]: any; // Allow additional properties
}

export interface Session extends SessionData {
    timestamp: number;
    id: string;
}

export interface Settings {
    theme: 'light' | 'dark';
    clef: 'treble' | 'bass';
    range: string;
    fallingNotesMode: boolean;
    allowOctaveError: boolean;
    midiDeviceId: string | null;
    audioDeviceId: string | null;
    virtualKeyboard: boolean;
    instrument?: string;
    pitchTolerance?: number;
    [key: string]: any; // Allow additional settings
}

export interface ExportData {
    sessions: Session[];
    stats: Stats;
    settings: Settings;
    exportDate: number;
}

// Storage keys
const KEYS = {
    SESSIONS: 'music_practice_sessions',
    SETTINGS: 'music_practice_settings',
    STATS: 'music_practice_stats'
} as const;

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
    try {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    } catch {
        return false;
    }
}

/**
 * Save a practice session
 */
export function saveSession(sessionData: SessionData): void {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage not available');
        return;
    }

    try {
        const sessions = getSessions();
        const newSession: Session = {
            ...sessionData,
            timestamp: Date.now(),
            id: generateId()
        };
        sessions.push(newSession);

        // Keep only last 100 sessions
        if (sessions.length > 100) {
            sessions.shift();
        }

        localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
        updateStats(sessionData);
    } catch (error) {
        console.error('Error saving session:', error);
    }
}

/**
 * Get all saved sessions
 */
export function getSessions(): Session[] {
    if (!isLocalStorageAvailable()) {
        return [];
    }

    try {
        const data = localStorage.getItem(KEYS.SESSIONS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading sessions:', error);
        return [];
    }
}

/**
 * Get sessions by instrument
 */
export function getSessionsByInstrument(instrumentId: string): Session[] {
    return getSessions().filter(session => session.instrument === instrumentId);
}

/**
 * Update overall statistics
 */
export function updateStats(sessionData: SessionData): void {
    if (!isLocalStorageAvailable()) {
        return;
    }

    try {
        const stats = getStats();

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
        if ((sessionData.bestStreak || 0) > stats.bestStreak) {
            stats.bestStreak = sessionData.bestStreak || 0;
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

        localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

/**
 * Get overall statistics
 */
export function getStats(): Stats {
    if (!isLocalStorageAvailable()) {
        return getDefaultStats();
    }

    try {
        const data = localStorage.getItem(KEYS.STATS);
        return data ? JSON.parse(data) : getDefaultStats();
    } catch (error) {
        console.error('Error loading stats:', error);
        return getDefaultStats();
    }
}

/**
 * Get default statistics object
 */
export function getDefaultStats(): Stats {
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
}

/**
 * Save user settings
 */
export function saveSettings(settings: Partial<Settings>): void {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage not available');
        return;
    }

    try {
        const currentSettings = getSettings();
        const updatedSettings = { ...currentSettings, ...settings };
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updatedSettings));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

/**
 * Get user settings
 */
export function getSettings(): Settings {
    if (!isLocalStorageAvailable()) {
        return getDefaultSettings();
    }

    try {
        const data = localStorage.getItem(KEYS.SETTINGS);
        return data ? JSON.parse(data) : getDefaultSettings();
    } catch (error) {
        console.error('Error loading settings:', error);
        return getDefaultSettings();
    }
}

/**
 * Get default settings
 */
export function getDefaultSettings(): Settings {
    return {
        theme: 'light',
        clef: 'treble',
        range: 'c4-c5',
        fallingNotesMode: false,
        allowOctaveError: true,
        midiDeviceId: null,
        virtualKeyboard: false,
        instrument: 'piano',
        pitchTolerance: 50
    };
}

/**
 * Clear all data (keep settings)
 */
export function clearAll(): void {
    if (!isLocalStorageAvailable()) {
        return;
    }

    try {
        localStorage.removeItem(KEYS.SESSIONS);
        localStorage.removeItem(KEYS.STATS);
        // Keep settings
    } catch (error) {
        console.error('Error clearing data:', error);
    }
}

/**
 * Clear all data including settings
 */
export function clearAllIncludingSettings(): void {
    if (!isLocalStorageAvailable()) {
        return;
    }

    try {
        localStorage.removeItem(KEYS.SESSIONS);
        localStorage.removeItem(KEYS.STATS);
        localStorage.removeItem(KEYS.SETTINGS);
    } catch (error) {
        console.error('Error clearing data:', error);
    }
}

/**
 * Export data as JSON
 */
export function exportData(): string {
    return JSON.stringify({
        sessions: getSessions(),
        stats: getStats(),
        settings: getSettings(),
        exportDate: Date.now()
    }, null, 2);
}

/**
 * Import data from JSON
 */
export function importData(jsonData: string): boolean {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage not available');
        return false;
    }

    try {
        const data: Partial<ExportData> = JSON.parse(jsonData);

        if (data.sessions) {
            localStorage.setItem(KEYS.SESSIONS, JSON.stringify(data.sessions));
        }
        if (data.stats) {
            localStorage.setItem(KEYS.STATS, JSON.stringify(data.stats));
        }
        if (data.settings) {
            localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
        }

        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Export as namespace for backward compatibility
export const Storage = {
    KEYS,
    saveSession,
    getSessions,
    getSessionsByInstrument,
    updateStats,
    getStats,
    getDefaultStats,
    saveSettings,
    getSettings,
    getDefaultSettings,
    clearAll,
    clearAllIncludingSettings,
    exportData,
    importData,
    generateId
};

// Make available globally for legacy code
if (typeof window !== 'undefined') {
    (window as any).Storage = Storage;
}

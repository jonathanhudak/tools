/**
 * Falling Notes Renderer
 * Alternative visualization mode with notes falling from top to hit zone
 * Inspired by rhythm games and Synthesia
 */

// Type definitions
interface NoteConfig {
    noteWidth: number;
    noteHeight: number;
    fallSpeed: number;
    hitZoneY: number;
    hitZoneHeight: number;
    colors: {
        note: string;
        hitZone: string;
        hitZoneBorder: string;
        correct: string;
        incorrect: string;
    };
}

interface FallingNote {
    midiNote: number;
    noteName: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    hit: boolean;
    missed: boolean;
}

export class FallingNotesRenderer {
    private container: HTMLElement | null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private animationId: number | null = null;
    private notes: FallingNote[] = [];
    private currentTargetNote: FallingNote | null = null;
    private isAnimating: boolean = false;

    // Configuration
    private config: NoteConfig = {
        noteWidth: 80,
        noteHeight: 20,
        fallSpeed: 2, // pixels per frame
        hitZoneY: 350, // Y position of hit zone
        hitZoneHeight: 40,
        colors: {
            note: '#3b82f6',
            hitZone: 'rgba(59, 130, 246, 0.2)',
            hitZoneBorder: '#3b82f6',
            correct: '#10b981',
            incorrect: '#ef4444'
        }
    };

    constructor(containerId: string) {
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }

        this.init();
    }

    /**
     * Initialize canvas
     */
    private init(): void {
        try {
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = 600;
            this.canvas.height = 400;
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';

            if (!this.container) return;

            this.container.innerHTML = '';
            this.container.appendChild(this.canvas);

            this.ctx = this.canvas.getContext('2d');

            console.log('FallingNotesRenderer initialized');
        } catch (error) {
            console.error('Failed to initialize FallingNotesRenderer:', error);
        }
    }

    /**
     * Add a new falling note
     * @param midiNote - MIDI note number
     * @param noteName - Note name for display
     */
    addNote(midiNote: number, noteName: string): void {
        if (!this.canvas) return;

        const note: FallingNote = {
            midiNote,
            noteName,
            x: (this.canvas.width - this.config.noteWidth) / 2,
            y: 0,
            width: this.config.noteWidth,
            height: this.config.noteHeight,
            color: this.config.colors.note,
            hit: false,
            missed: false
        };

        this.notes.push(note);
        this.currentTargetNote = note;

        // Start animation if not running
        if (!this.isAnimating) {
            this.startAnimation();
        }
    }

    /**
     * Start the animation loop
     */
    startAnimation(): void {
        this.isAnimating = true;
        this.animate();
    }

    /**
     * Stop the animation loop
     */
    stopAnimation(): void {
        this.isAnimating = false;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Animation loop
     */
    private animate(): void {
        if (!this.isAnimating || !this.ctx || !this.canvas) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw hit zone
        this.drawHitZone();

        // Update and draw notes
        this.notes = this.notes.filter(note => {
            // Move note down
            note.y += this.config.fallSpeed;

            // Check if note passed the hit zone (missed)
            if (note.y > this.config.hitZoneY + this.config.hitZoneHeight && !note.hit) {
                note.missed = true;
                note.color = this.config.colors.incorrect;
            }

            // Draw note
            this.drawNote(note);

            // Remove notes that have fallen off screen
            return note.y < this.canvas!.height + 50;
        });

        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Draw the hit zone
     */
    private drawHitZone(): void {
        if (!this.ctx || !this.canvas) return;

        const ctx = this.ctx;
        const y = this.config.hitZoneY;
        const height = this.config.hitZoneHeight;

        // Fill
        ctx.fillStyle = this.config.colors.hitZone;
        ctx.fillRect(0, y, this.canvas.width, height);

        // Border
        ctx.strokeStyle = this.config.colors.hitZoneBorder;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, y, this.canvas.width, height);

        // Hit zone label
        ctx.fillStyle = this.config.colors.hitZoneBorder;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Play here', this.canvas.width / 2, y + height / 2 + 5);
    }

    /**
     * Draw a note
     * @param note - Note object
     */
    private drawNote(note: FallingNote): void {
        if (!this.ctx) return;

        const ctx = this.ctx;

        // Note rectangle
        ctx.fillStyle = note.color;
        ctx.fillRect(note.x, note.y, note.width, note.height);

        // Note border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(note.x, note.y, note.width, note.height);

        // Note label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(note.noteName, note.x + note.width / 2, note.y + note.height / 2);
    }

    /**
     * Check if a played note matches the target
     * @param playedMidi - MIDI note that was played
     * @returns True if correct
     */
    checkNote(playedMidi: number): boolean {
        if (!this.currentTargetNote || this.currentTargetNote.hit) {
            return false;
        }

        // Check if note is in hit zone
        const note = this.currentTargetNote;
        const inHitZone = note.y >= this.config.hitZoneY - 20 &&
                         note.y <= this.config.hitZoneY + this.config.hitZoneHeight + 20;

        if (inHitZone && note.midiNote === playedMidi) {
            // Correct note!
            note.hit = true;
            note.color = this.config.colors.correct;
            this.currentTargetNote = null;
            return true;
        } else if (inHitZone) {
            // Wrong note
            note.color = this.config.colors.incorrect;
            return false;
        }

        return false;
    }

    /**
     * Set the falling speed
     * @param speed - Pixels per frame
     */
    setSpeed(speed: number): void {
        this.config.fallSpeed = speed;
    }

    /**
     * Clear all notes
     */
    clear(): void {
        this.notes = [];
        this.currentTargetNote = null;
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Show welcome message
     */
    showWelcome(): void {
        if (!this.ctx || !this.canvas) return;

        this.clear();
        this.stopAnimation();

        const ctx = this.ctx;
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎹', this.canvas.width / 2, this.canvas.height / 2 - 40);

        ctx.font = '18px sans-serif';
        ctx.fillText('Falling Notes Mode', this.canvas.width / 2, this.canvas.height / 2 + 20);

        ctx.font = '14px sans-serif';
        ctx.fillText('Notes will fall from top - play them when they reach the hit zone',
                    this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    /**
     * Destroy the renderer
     */
    destroy(): void {
        this.stopAnimation();
        this.notes = [];
        this.currentTargetNote = null;
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    (window as any).FallingNotesRenderer = FallingNotesRenderer;
}

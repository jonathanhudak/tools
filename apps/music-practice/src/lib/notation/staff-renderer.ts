/**
 * Staff Renderer
 * Uses VexFlow to render musical notation on staff
 */

import { MusicTheory } from '../utils/music-theory';

// VexFlow types (declare global types for VexFlow library)
declare global {
    interface Window {
        Vex: any;
    }
    const Vex: any;
}

// Type definitions
export type ClefType = 'treble' | 'bass';

interface RenderOptions {
    highlight?: boolean;
}

export class StaffRenderer {
    private containerId: string;
    private container: HTMLElement | null;
    private renderer: any = null;
    private context: any = null;
    private currentNote: string | null = null;
    private clef: ClefType = 'treble';

    constructor(containerId: string) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }

        this.init();
    }

    /**
     * Check if dark mode is active
     */
    private isDarkMode(): boolean {
        return document.documentElement.classList.contains('dark');
    }

    /**
     * Get the appropriate stroke color based on theme
     */
    private getStrokeColor(): string {
        return getComputedStyle(document.documentElement).getPropertyValue('--ink-primary').trim()
            || (this.isDarkMode() ? '#f0ead9' : '#1a1714');
    }

    /**
     * Apply theme-aware styling to SVG
     */
    private applyThemeToSVG(svg: SVGElement): void {
        const strokeColor = this.getStrokeColor();

        // Style all staff lines and note elements
        svg.style.color = strokeColor;

        // Apply stroke color to all paths and lines
        const elements = svg.querySelectorAll('path, line, rect, circle, ellipse');
        elements.forEach(el => {
            const element = el as SVGElement;
            if (!element.style.fill || element.style.fill === 'black' || element.style.fill === 'rgb(0, 0, 0)') {
                element.style.stroke = strokeColor;
                element.style.fill = strokeColor;
            }
        });
    }

    /**
     * Initialize VexFlow renderer
     */
    private init(): void {
        try {
            // Check if VexFlow is loaded
            if (typeof Vex === 'undefined' || typeof window.Vex === 'undefined') {
                console.error('VexFlow not loaded - waiting...');
                // Try again after a short delay
                setTimeout(() => this.init(), 500);
                return;
            }

            if (!this.container) {
                console.error('Container not found, cannot initialize');
                return;
            }

            // Clear container
            this.container.innerHTML = '';

            // Create VexFlow renderer
            const VF = Vex.Flow;

            if (!VF || !VF.Renderer) {
                console.error('VexFlow.Renderer not available');
                return;
            }

            this.renderer = new VF.Renderer(
                this.container,
                VF.Renderer.Backends.SVG
            );

            // Size the canvas
            this.renderer.resize(500, 200);

            // Get drawing context
            this.context = this.renderer.getContext();

            console.log('StaffRenderer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize StaffRenderer:', error);
            this.showError('Unable to initialize music notation renderer');
        }
    }

    /**
     * Set the clef type
     * @param clef - 'treble' or 'bass'
     */
    setClef(clef: ClefType): void {
        this.clef = clef;
    }

    /**
     * Render a single note on the staff
     * @param vexflowNote - Note in VexFlow format (e.g., "c/4")
     * @param options - Rendering options
     */
    renderNote(vexflowNote: string, options: RenderOptions = {}): void {
        if (!this.context) {
            console.warn('Renderer not initialized, attempting to initialize...');
            this.init();
            if (!this.context) {
                console.error('Failed to initialize renderer');
                this.showError('Unable to display notation - please refresh');
                return;
            }
        }

        try {
            const VF = Vex.Flow;

            if (!this.container) return;

            // Clear previous content
            this.context.clear();
            this.container.innerHTML = '';

            // Recreate context after clear
            this.renderer = new VF.Renderer(
                this.container,
                VF.Renderer.Backends.SVG
            );
            this.renderer.resize(500, 200);
            this.context = this.renderer.getContext();

            // Create a stave
            const stave = new VF.Stave(10, 20, 400);

            // Add clef
            stave.addClef(this.clef);

            // Draw the stave
            stave.setContext(this.context).draw();

            // Create note
            const note = new VF.StaveNote({
                keys: [vexflowNote],
                duration: 'w', // Whole note
                clef: this.clef
            });

            // Create a voice and add the note
            const voice = new VF.Voice({
                num_beats: 4,
                beat_value: 4
            });
            voice.addTickable(note);

            // Format and draw
            new VF.Formatter()
                .joinVoices([voice])
                .format([voice], 350);

            voice.draw(this.context, stave);

            this.currentNote = vexflowNote;

            // Apply theme styling
            const svg = this.container?.querySelector('svg');
            if (svg) {
                this.applyThemeToSVG(svg);
            }

            // Apply highlight if specified
            if (options.highlight) {
                this.highlightNote();
            }

        } catch (error) {
            console.error('Failed to render note:', error);
            this.showError('Unable to display note');
        }
    }

    /**
     * Render multiple notes on the staff
     * @param notes - Array of VexFlow notes
     */
    renderNotes(notes: string[]): void {
        if (!this.context) {
            console.error('Renderer not initialized');
            return;
        }

        try {
            const VF = Vex.Flow;

            if (!this.container) return;

            // Clear previous content
            this.context.clear();
            this.container.innerHTML = '';

            // Recreate context
            this.renderer = new VF.Renderer(
                this.container,
                VF.Renderer.Backends.SVG
            );
            this.renderer.resize(700, 200);
            this.context = this.renderer.getContext();

            // Create a stave
            const stave = new VF.Stave(10, 20, 650);
            stave.addClef(this.clef);
            stave.setContext(this.context).draw();

            // Create notes
            const staveNotes = notes.map(note => {
                return new VF.StaveNote({
                    keys: [note],
                    duration: 'q', // Quarter note
                    clef: this.clef
                });
            });

            // Create a voice
            const voice = new VF.Voice({
                num_beats: staveNotes.length,
                beat_value: 4
            });
            voice.addTickables(staveNotes);

            // Format and draw
            new VF.Formatter()
                .joinVoices([voice])
                .format([voice], 600);

            voice.draw(this.context, stave);

            // Apply theme styling
            const svg = this.container?.querySelector('svg');
            if (svg) {
                this.applyThemeToSVG(svg);
            }

        } catch (error) {
            console.error('Failed to render notes:', error);
            this.showError('Unable to display notes');
        }
    }

    /**
     * Render a scale on the staff
     * @param midiNotes - Array of MIDI note numbers
     */
    renderScale(midiNotes: number[]): void {
        const vexflowNotes = midiNotes
            .map(midi => MusicTheory.midiToVexflow(midi, this.clef))
            .filter((note): note is string => note !== null);

        if (vexflowNotes.length > 0) {
            this.renderNotes(vexflowNotes);
        }
    }

    /**
     * Highlight the current note (visual feedback)
     */
    private highlightNote(): void {
        if (!this.container) return;

        // Add a visual highlight to the SVG
        const svg = this.container.querySelector('svg');
        if (svg) {
            const noteheads = svg.querySelectorAll('.vf-notehead');
            noteheads.forEach(notehead => {
                (notehead as HTMLElement).style.fill = '#3b82f6';
            });
        }
    }

    /**
     * Show feedback for correct/incorrect note
     * @param isCorrect - Whether the note was correct
     */
    showFeedback(isCorrect: boolean): void {
        if (!this.container) return;

        const svg = this.container.querySelector('svg');
        if (!svg) return;

        const noteheads = svg.querySelectorAll('.vf-notehead');
        const color = isCorrect ? '#10b981' : '#ef4444';

        noteheads.forEach(notehead => {
            const element = notehead as HTMLElement;
            element.style.fill = color;
            element.style.transition = 'fill 0.3s ease';
        });

        // Reset after animation
        setTimeout(() => {
            noteheads.forEach(notehead => {
                (notehead as HTMLElement).style.fill = '';
            });
        }, 500);
    }

    /**
     * Show error message
     * @param message - Error message to display
     */
    private showError(message: string): void {
        if (!this.container) return;

        this.container.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 200px;
                color: var(--text-secondary);
                font-size: 1rem;
            ">
                ${message}
            </div>
        `;
    }

    /**
     * Show welcome message
     */
    showWelcome(): void {
        if (!this.container) return;

        this.container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 200px;
                color: var(--text-secondary);
                text-align: center;
                padding: 2rem;
            ">
                <p style="font-size: 3rem; margin-bottom: 0.5rem;">🎹</p>
                <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">
                    Ready to Practice
                </p>
                <p style="font-size: 0.95rem;">
                    Click "Start Practice" to begin
                </p>
            </div>
        `;
    }

    /**
     * Clear the staff
     */
    clear(): void {
        if (this.context) {
            this.context.clear();
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.currentNote = null;
    }

    /**
     * Get the current note
     * @returns Current VexFlow note
     */
    getCurrentNote(): string | null {
        return this.currentNote;
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    (window as any).StaffRenderer = StaffRenderer;
}

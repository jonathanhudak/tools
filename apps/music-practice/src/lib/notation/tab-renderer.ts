/**
 * Guitar Tab Renderer
 * Uses VexFlow to render guitar tablature notation
 */

import { midiToTabPosition } from '../utils/music-theory';

// Use the Vex global from window
declare const Vex: any;

// Type definitions
export interface TabPosition {
    string: number;
    fret: number;
}

interface RenderOptions {
    highlight?: boolean;
    showStaff?: boolean; // Show staff notation above tab
}

export class TabRenderer {
    private container: HTMLElement | null;
    private renderer: any = null;
    private context: any = null;
    private currentNote: number | null = null;
    private instrumentId: string = 'guitar';

    constructor(containerId: string, instrumentId: string = 'guitar') {
        this.instrumentId = instrumentId;
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
        return this.isDarkMode() ? '#e5e5e5' : '#000000';
    }

    /**
     * Apply theme-aware styling to SVG
     */
    private applyThemeToSVG(svg: SVGElement): void {
        const strokeColor = this.getStrokeColor();

        // Style all staff lines and note elements
        svg.style.color = strokeColor;

        // Apply stroke color to paths, lines, and other elements (but NOT rects with white fill)
        const elements = svg.querySelectorAll('path, line, circle, ellipse');
        elements.forEach(el => {
            const element = el as SVGElement;
            if (!element.style.fill || element.style.fill === 'black' || element.style.fill === 'rgb(0, 0, 0)') {
                element.style.stroke = strokeColor;
                element.style.fill = strokeColor;
            }
        });

        // Handle rectangles separately - only style staff lines, not white backgrounds
        const rects = svg.querySelectorAll('rect');
        rects.forEach(el => {
            const element = el as SVGElement;
            const fill = element.getAttribute('fill');
            // Only style rectangles that are NOT white backgrounds (those are for tab numbers)
            if (fill !== 'white') {
                element.style.stroke = strokeColor;
                element.style.fill = strokeColor;
            }
        });

        // Style text elements
        const texts = svg.querySelectorAll('text');
        texts.forEach(el => {
            const element = el as SVGElement;
            element.style.stroke = strokeColor;
            element.style.fill = strokeColor;
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

            // Size the canvas (tabs are typically shorter than staff)
            this.renderer.resize(500, 180);

            // Get drawing context
            this.context = this.renderer.getContext();

            console.log('TabRenderer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize TabRenderer:', error);
            this.showError('Unable to initialize tablature renderer');
        }
    }

    /**
     * Render a single note on the tab staff
     * @param midiNote - MIDI note number
     * @param options - Rendering options
     */
    renderNote(midiNote: number, options: RenderOptions = {}): void {
        if (!this.context) {
            console.warn('Renderer not initialized, attempting to initialize...');
            this.init();
            if (!this.context) {
                console.error('Failed to initialize renderer');
                this.showError('Unable to display tablature - please refresh');
                return;
            }
        }

        try {
            const VF = Vex.Flow;

            if (!this.container) return;

            // Convert MIDI to tab position
            const tabPosition = midiToTabPosition(midiNote, this.instrumentId);
            if (!tabPosition) {
                console.error('Unable to convert MIDI note to tab position:', midiNote);
                this.showError('Note out of range for tablature');
                return;
            }

            // Clear previous content
            this.context.clear();
            this.container.innerHTML = '';

            // Recreate context after clear
            this.renderer = new VF.Renderer(
                this.container,
                VF.Renderer.Backends.SVG
            );
            this.renderer.resize(500, 180);
            this.context = this.renderer.getContext();

            // Create a tab stave (6 strings for guitar)
            const tabStave = new VF.TabStave(10, 20, 400);

            // Add clef (tab clef shows "TAB")
            tabStave.addTabGlyph();

            // Draw the stave
            tabStave.setContext(this.context).draw();

            // Create tab note
            // TabNote format: positions array where each element is {str: string_number, fret: fret_number}
            // String 1 is the highest (thinnest), string 6 is the lowest (thickest)
            const tabNote = new VF.TabNote({
                positions: [{ str: tabPosition.string, fret: tabPosition.fret }],
                duration: 'w' // Whole note
            });

            // Create a voice and add the note
            const voice = new VF.Voice({
                num_beats: 4,
                beat_value: 4
            });
            voice.addTickable(tabNote);

            // Format and draw
            new VF.Formatter()
                .joinVoices([voice])
                .format([voice], 350);

            voice.draw(this.context, tabStave);

            this.currentNote = midiNote;

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
            console.error('Failed to render tab note:', error);
            this.showError('Unable to display tab note');
        }
    }

    /**
     * Render multiple notes on the tab staff
     * @param midiNotes - Array of MIDI note numbers
     */
    renderNotes(midiNotes: number[]): void {
        if (!this.context) {
            console.error('Renderer not initialized');
            return;
        }

        try {
            const VF = Vex.Flow;

            if (!this.container) return;

            // Convert MIDI notes to tab positions
            const tabPositions = midiNotes
                .map(midi => midiToTabPosition(midi, this.instrumentId))
                .filter((pos): pos is TabPosition => pos !== null);

            if (tabPositions.length === 0) {
                console.error('No valid tab positions found');
                return;
            }

            // Clear previous content
            this.context.clear();
            this.container.innerHTML = '';

            // Recreate context
            this.renderer = new VF.Renderer(
                this.container,
                VF.Renderer.Backends.SVG
            );
            this.renderer.resize(700, 180);
            this.context = this.renderer.getContext();

            // Create a tab stave
            const tabStave = new VF.TabStave(10, 20, 650);
            tabStave.addTabGlyph();
            tabStave.setContext(this.context).draw();

            // Create tab notes
            const tabNotes = tabPositions.map(pos => {
                return new VF.TabNote({
                    positions: [{ str: pos.string, fret: pos.fret }],
                    duration: 'q' // Quarter note
                });
            });

            // Create a voice
            const voice = new VF.Voice({
                num_beats: tabNotes.length,
                beat_value: 4
            });
            voice.addTickables(tabNotes);

            // Format and draw
            new VF.Formatter()
                .joinVoices([voice])
                .format([voice], 600);

            voice.draw(this.context, tabStave);

            // Apply theme styling
            const svg = this.container?.querySelector('svg');
            if (svg) {
                this.applyThemeToSVG(svg);
            }

        } catch (error) {
            console.error('Failed to render tab notes:', error);
            this.showError('Unable to display tab notes');
        }
    }

    /**
     * Render both staff and tab together (combined view)
     * @param midiNote - MIDI note number
     */
    renderStaffAndTab(midiNote: number): void {
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

            // Convert MIDI to tab position
            const tabPosition = midiToTabPosition(midiNote, this.instrumentId);
            if (!tabPosition) {
                console.error('Unable to convert MIDI note to tab position:', midiNote);
                this.showError('Note out of range for tablature');
                return;
            }

            // Clear previous content
            this.context.clear();
            this.container.innerHTML = '';

            // Recreate context with taller height for staff + tab
            this.renderer = new VF.Renderer(
                this.container,
                VF.Renderer.Backends.SVG
            );
            this.renderer.resize(500, 300);
            this.context = this.renderer.getContext();

            // Create staff stave (treble clef)
            const staffStave = new VF.Stave(10, 20, 400);
            staffStave.addClef('treble');
            staffStave.setContext(this.context).draw();

            // Create tab stave below staff
            const tabStave = new VF.TabStave(10, 140, 400);
            tabStave.addTabGlyph();
            tabStave.setContext(this.context).draw();

            // Connect staff and tab with connector
            const connector = new VF.StaveConnector(staffStave, tabStave);
            connector.setType(VF.StaveConnector.type.BRACKET);
            connector.setContext(this.context).draw();

            // Create staff note (using VexFlow notation)
            const octave = Math.floor(midiNote / 12) - 1;
            const noteIndex = midiNote % 12;
            const noteNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
            const vexflowNote = `${noteNames[noteIndex]}/${octave}`;

            const staffNote = new VF.StaveNote({
                keys: [vexflowNote],
                duration: 'w',
                clef: 'treble'
            });

            // Add accidental if needed
            if (noteNames[noteIndex].includes('#')) {
                staffNote.addModifier(new VF.Accidental('#'), 0);
            }

            // Create tab note
            const tabNote = new VF.TabNote({
                positions: [{ str: tabPosition.string, fret: tabPosition.fret }],
                duration: 'w'
            });

            // Create voices for staff and tab
            const staffVoice = new VF.Voice({ num_beats: 4, beat_value: 4 });
            staffVoice.addTickable(staffNote);

            const tabVoice = new VF.Voice({ num_beats: 4, beat_value: 4 });
            tabVoice.addTickable(tabNote);

            // Format and draw both
            new VF.Formatter()
                .joinVoices([staffVoice])
                .format([staffVoice], 350);

            new VF.Formatter()
                .joinVoices([tabVoice])
                .format([tabVoice], 350);

            staffVoice.draw(this.context, staffStave);
            tabVoice.draw(this.context, tabStave);

            this.currentNote = midiNote;

            // Apply theme styling
            const svg = this.container?.querySelector('svg');
            if (svg) {
                this.applyThemeToSVG(svg);
            }

        } catch (error) {
            console.error('Failed to render staff and tab:', error);
            this.showError('Unable to display notation');
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
            const noteText = svg.querySelectorAll('text');
            noteText.forEach(text => {
                (text as SVGTextElement).style.fill = '#3b82f6';
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

        const noteText = svg.querySelectorAll('text');
        const color = isCorrect ? '#10b981' : '#ef4444';

        noteText.forEach(text => {
            const element = text as SVGTextElement;
            element.style.fill = color;
            element.style.transition = 'fill 0.3s ease';
        });

        // Reset after animation
        setTimeout(() => {
            noteText.forEach(text => {
                (text as SVGTextElement).style.fill = '';
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
                height: 180px;
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
                height: 180px;
                color: var(--text-secondary);
                text-align: center;
                padding: 2rem;
            ">
                <p style="font-size: 3rem; margin-bottom: 0.5rem;">🎸</p>
                <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">
                    Ready to Practice Guitar
                </p>
                <p style="font-size: 0.95rem;">
                    Click "Start Practice" to begin
                </p>
            </div>
        `;
    }

    /**
     * Clear the tab
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
     * @returns Current MIDI note
     */
    getCurrentNote(): number | null {
        return this.currentNote;
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    (window as any).TabRenderer = TabRenderer;
}

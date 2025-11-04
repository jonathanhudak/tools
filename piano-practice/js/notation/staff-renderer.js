/**
 * Staff Renderer
 * Uses VexFlow to render musical notation on staff
 */

class StaffRenderer {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.renderer = null;
        this.context = null;
        this.currentNote = null;
        this.clef = 'treble';

        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }

        this.init();
    }

    /**
     * Initialize VexFlow renderer
     */
    init() {
        try {
            // Check if VexFlow is loaded
            if (typeof Vex === 'undefined') {
                console.error('VexFlow not loaded');
                return;
            }

            // Clear container
            this.container.innerHTML = '';

            // Create VexFlow renderer
            const VF = Vex.Flow;
            this.renderer = new VF.Renderer(
                this.container,
                VF.Renderer.Backends.SVG
            );

            // Size the canvas
            this.renderer.resize(500, 200);

            // Get drawing context
            this.context = this.renderer.getContext();

            console.log('StaffRenderer initialized');
        } catch (error) {
            console.error('Failed to initialize StaffRenderer:', error);
        }
    }

    /**
     * Set the clef type
     * @param {string} clef - 'treble' or 'bass'
     */
    setClef(clef) {
        this.clef = clef;
    }

    /**
     * Render a single note on the staff
     * @param {string} vexflowNote - Note in VexFlow format (e.g., "c/4")
     * @param {Object} options - Rendering options
     */
    renderNote(vexflowNote, options = {}) {
        if (!this.context) {
            console.error('Renderer not initialized');
            return;
        }

        try {
            const VF = Vex.Flow;

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
     * @param {Array} notes - Array of VexFlow notes
     */
    renderNotes(notes) {
        if (!this.context) {
            console.error('Renderer not initialized');
            return;
        }

        try {
            const VF = Vex.Flow;

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

        } catch (error) {
            console.error('Failed to render notes:', error);
            this.showError('Unable to display notes');
        }
    }

    /**
     * Render a scale on the staff
     * @param {Array} midiNotes - Array of MIDI note numbers
     */
    renderScale(midiNotes) {
        const vexflowNotes = midiNotes
            .map(midi => MusicTheory.midiToVexflow(midi, this.clef))
            .filter(note => note !== null);

        if (vexflowNotes.length > 0) {
            this.renderNotes(vexflowNotes);
        }
    }

    /**
     * Highlight the current note (visual feedback)
     */
    highlightNote() {
        // Add a visual highlight to the SVG
        const svg = this.container.querySelector('svg');
        if (svg) {
            const noteheads = svg.querySelectorAll('.vf-notehead');
            noteheads.forEach(notehead => {
                notehead.style.fill = '#3b82f6';
            });
        }
    }

    /**
     * Show feedback for correct/incorrect note
     * @param {boolean} isCorrect - Whether the note was correct
     */
    showFeedback(isCorrect) {
        const svg = this.container.querySelector('svg');
        if (!svg) return;

        const noteheads = svg.querySelectorAll('.vf-notehead');
        const color = isCorrect ? '#10b981' : '#ef4444';

        noteheads.forEach(notehead => {
            notehead.style.fill = color;
            notehead.style.transition = 'fill 0.3s ease';
        });

        // Reset after animation
        setTimeout(() => {
            noteheads.forEach(notehead => {
                notehead.style.fill = '';
            });
        }, 500);
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
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
    showWelcome() {
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
    clear() {
        if (this.context) {
            this.context.clear();
        }
        this.container.innerHTML = '';
        this.currentNote = null;
    }

    /**
     * Get the current note
     * @returns {string} Current VexFlow note
     */
    getCurrentNote() {
        return this.currentNote;
    }
}

// Make available globally
window.StaffRenderer = StaffRenderer;

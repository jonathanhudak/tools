import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StaffRenderer } from '../staff-renderer';

interface FakeVex {
    draws: string[][];
    Vex: VexFlowAPI;
}

/**
 * Minimal VexFlow stand-in. `draws` records the note keys of every voice that
 * is drawn, so a test can tell whether a render reached the staff.
 */
function createFakeVex(): FakeVex {
    const draws: string[][] = [];

    class Renderer {
        static Backends = { SVG: 1 };
        resize(): void {}
        getContext(): VexFlowAPI {
            return { clear: () => {} };
        }
    }

    class Stave {
        addClef(): Stave {
            return this;
        }
        setContext(): Stave {
            return this;
        }
        draw(): Stave {
            return this;
        }
    }

    class StaveNote {
        keys: string[];
        constructor(options: { keys: string[] }) {
            this.keys = options.keys;
        }
        addModifier(): StaveNote {
            return this;
        }
    }

    class Voice {
        private tickables: StaveNote[] = [];
        addTickable(note: StaveNote): Voice {
            this.tickables.push(note);
            return this;
        }
        addTickables(notes: StaveNote[]): Voice {
            this.tickables.push(...notes);
            return this;
        }
        draw(): void {
            draws.push(this.tickables.flatMap(note => note.keys));
        }
    }

    class Formatter {
        joinVoices(): Formatter {
            return this;
        }
        format(): Formatter {
            return this;
        }
    }

    class Accidental {}

    return {
        draws,
        Vex: { Flow: { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } },
    };
}

function makeContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'staff';
    document.body.appendChild(container);
    return container;
}

describe('StaffRenderer when VexFlow loads late', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        Reflect.deleteProperty(window, 'Vex');
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
        Reflect.deleteProperty(window, 'Vex');
    });

    it('draws a note requested before VexFlow is ready', () => {
        makeContainer();
        const renderer = new StaffRenderer('staff');

        renderer.renderNote('c/4');

        const fake = createFakeVex();
        window.Vex = fake.Vex;

        vi.advanceTimersByTime(500);

        expect(fake.draws).toEqual([['c/4']]);
    });

    it('keeps only the latest draw requested before VexFlow is ready', () => {
        makeContainer();
        const renderer = new StaffRenderer('staff');

        renderer.renderNote('c/4');
        renderer.renderNote('d/4');

        const fake = createFakeVex();
        window.Vex = fake.Vex;

        vi.advanceTimersByTime(500);

        expect(fake.draws).toEqual([['d/4']]);
    });

    it('stops retrying after 20 attempts and shows the load error', () => {
        const container = makeContainer();
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        new StaffRenderer('staff');

        vi.advanceTimersByTime(10_000);

        expect(container.textContent).toContain('Unable to load music notation');
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);

        errorSpy.mockRestore();
    });
});

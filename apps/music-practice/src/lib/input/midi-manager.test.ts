import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MidiManager } from './midi-manager';

describe('MidiManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits note on/off for simulated notes', () => {
    const manager = new MidiManager();
    const events: string[] = [];

    manager.on('noteOn', () => events.push('on'));
    manager.on('noteOff', () => events.push('off'));

    manager.simulateNote(60, 100, 200);

    expect(events).toEqual(['on']);
    expect(manager.isNoteActive(60)).toBe(true);

    vi.advanceTimersByTime(200);

    expect(events).toEqual(['on', 'off']);
    expect(manager.isNoteActive(60)).toBe(false);
  });

  it('returns active notes list', () => {
    const manager = new MidiManager();
    manager.simulateNote(64, 100, 1000);
    expect(manager.getActiveNotes()).toContain(64);
  });
});

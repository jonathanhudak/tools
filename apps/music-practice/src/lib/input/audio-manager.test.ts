import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AudioManager } from './audio-manager';

describe('AudioManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('emits pitchDetected on simulateFrequency', () => {
    const manager = new AudioManager();
    const handler = vi.fn();
    manager.on('pitchDetected', handler);

    manager.simulateFrequency(440);

    expect(handler).toHaveBeenCalledTimes(1);
    const payload = handler.mock.calls[0][0];
    expect(payload.midi).toBe(69);
    expect(payload.noteName).toBe('A4');
  });

  it('enumerates audio input devices when supported', async () => {
    const getUserMedia = vi.fn().mockResolvedValue({});
    const enumerateDevices = vi.fn().mockResolvedValue([
      { kind: 'audioinput', deviceId: 'mic-1' },
      { kind: 'videoinput', deviceId: 'cam-1' },
    ]);

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        mediaDevices: {
          getUserMedia,
          enumerateDevices,
        },
      },
      configurable: true,
    });

    const devices = await AudioManager.getAudioInputDevices();

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(enumerateDevices).toHaveBeenCalled();
    expect(devices).toEqual([{ kind: 'audioinput', deviceId: 'mic-1' }]);
  });
});

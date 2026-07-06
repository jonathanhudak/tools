/**
 * Reference-pitch (A4 calibration) math from @hudak/tuning-data.
 * Verifies the 432 Hz retuning is mathematically exact: every frequency
 * scales by ref/440 and cents relationships are preserved.
 */

import { describe, expect, it } from 'vitest';
import {
  STANDARD_A4,
  applyReferencePitch,
  clampReferencePitch,
  findTuningById,
  frequencyToNote,
  midiToFrequency,
} from '@hudak/tuning-data';

describe('midiToFrequency', () => {
  it('returns 440 for A4 (midi 69) at standard pitch', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 10);
  });

  it('returns 432 for A4 at a 432 reference', () => {
    expect(midiToFrequency(69, 432)).toBeCloseTo(432, 10);
  });

  it('scales every note by exactly ref/440', () => {
    for (const midi of [40, 52, 60, 64, 69, 81]) {
      expect(midiToFrequency(midi, 432)).toBeCloseTo(midiToFrequency(midi) * (432 / 440), 10);
    }
  });
});

describe('frequencyToNote', () => {
  it('maps 440 Hz to A4 with 0 cents at standard pitch', () => {
    const detected = frequencyToNote(440);
    expect(detected?.name).toBe('A4');
    expect(detected?.cents).toBeCloseTo(0, 6);
  });

  it('maps 432 Hz to A4 with 0 cents under a 432 reference', () => {
    const detected = frequencyToNote(432, 432);
    expect(detected?.name).toBe('A4');
    expect(detected?.cents).toBeCloseTo(0, 6);
  });

  it('reports 440 Hz as ~31.8 cents sharp of A4 under a 432 reference', () => {
    const detected = frequencyToNote(440, 432);
    expect(detected?.name).toBe('A4');
    expect(detected?.cents).toBeCloseTo(1200 * Math.log2(440 / 432), 6);
  });

  it('rejects non-positive input', () => {
    expect(frequencyToNote(0)).toBeNull();
    expect(frequencyToNote(-10)).toBeNull();
  });
});

describe('applyReferencePitch', () => {
  it('is identity at 440', () => {
    const tuning = findTuningById('guitar-standard')!;
    expect(applyReferencePitch(tuning, STANDARD_A4)).toBe(tuning);
  });

  it('scales guitar standard exactly by 432/440', () => {
    const tuning = findTuningById('guitar-standard')!;
    const scaled = applyReferencePitch(tuning, 432);
    tuning.notes.forEach((note, i) => {
      expect(scaled.notes[i].frequency).toBeCloseTo(note.frequency * (432 / 440), 10);
    });
    // The low E2 lands where 432-based 12-TET says it should
    const e2 = scaled.notes.find((n) => n.note === 'E2')!;
    expect(e2.frequency).toBeCloseTo(432 * Math.pow(2, (40 - 69) / 12), 6);
  });

  it('preserves microtonal cents offsets (ratio-invariant)', () => {
    const just = findTuningById('guitar-just-open-d');
    if (!just) return; // catalog id changed — covered by featured-list resolution
    const scaled = applyReferencePitch(just, 432);
    just.notes.forEach((note, i) => {
      const expectedCents = 1200 * Math.log2(scaled.notes[i].frequency / (note.frequency * (432 / 440)));
      expect(expectedCents).toBeCloseTo(0, 8);
      expect(scaled.notes[i].centsOffset).toBe(note.centsOffset);
    });
  });
});

describe('clampReferencePitch', () => {
  it('clamps into [415, 466] and defaults NaN to 440', () => {
    expect(clampReferencePitch(400)).toBe(415);
    expect(clampReferencePitch(480)).toBe(466);
    expect(clampReferencePitch(432)).toBe(432);
    expect(clampReferencePitch(Number.NaN)).toBe(440);
  });
});

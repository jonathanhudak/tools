/**
 * Banjo instrument profile — Open G with short 5th string.
 */
import { describe, it, expect } from 'vitest';
import { getInstrument, getTuning, InstrumentType, InputMethod } from '../utils/instrument-config';

describe('banjo instrument config', () => {
  it('exists with mic input and treble clef', () => {
    const banjo = getInstrument(InstrumentType.BANJO);
    expect(banjo.id).toBe('banjo');
    expect(banjo.inputType).toBe(InputMethod.MICROPHONE);
    expect(banjo.polyphonic).toBe(false);
    expect(banjo.defaultClef).toBe('treble');
  });

  it('has Open G tuning with short 5th string', () => {
    const tuning = getTuning('banjo')!;
    expect(tuning).toHaveLength(5);
    const byString = Object.fromEntries(tuning.map((t) => [t.string, t]));
    expect(byString[1].midi).toBe(62); // D4
    expect(byString[2].midi).toBe(59); // B3
    expect(byString[3].midi).toBe(55); // G3
    expect(byString[4].midi).toBe(50); // D3
    expect(byString[5].midi).toBe(67); // G4 drone
    expect(byString[5].startFret).toBe(5);
    expect(byString[1].startFret).toBeUndefined();
  });

  it('has range D3–C6', () => {
    const banjo = getInstrument('banjo');
    expect(banjo.range.min).toBe(50);
    expect(banjo.range.max).toBe(84);
  });
});

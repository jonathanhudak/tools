import { describe, it, expect } from 'vitest';
import { resolveRomanInKey, resolveProgression, guideTones, voiceChord } from '../roman';
import { PROGRESSION_REGISTRY } from '@/data/progressions/progression-registry';

describe('resolveRomanInKey', () => {
  const cases: Array<[string, string, string, string[]]> = [
    ['C', 'ii7', 'Dm7', ['D', 'F', 'A', 'C']],
    ['C', 'V7', 'G7', ['G', 'B', 'D', 'F']],
    ['C', 'Imaj7', 'Cmaj7', ['C', 'E', 'G', 'B']],
    ['C', 'bII7', 'Db7', ['Db', 'F', 'Ab', 'Cb']],
    ['C', 'iiø7', 'Dm7b5', ['D', 'F', 'Ab', 'C']],
    ['C', 'V7b9', 'G7b9', ['G', 'B', 'D', 'F', 'Ab']],
    ['C', 'i(maj7)', 'CmMaj7', ['C', 'Eb', 'G', 'B']],
    ['C', 'bVII7', 'Bb7', ['Bb', 'D', 'F', 'Ab']],
    ['C', 'vi', 'Am', ['A', 'C', 'E']],
    ['C', 'bVI', 'Ab', ['Ab', 'C', 'Eb']],
    ['F', 'V7', 'C7', ['C', 'E', 'G', 'Bb']],
    ['G', 'ii7', 'Am7', ['A', 'C', 'E', 'G']],
    ['Eb', 'Imaj7', 'Ebmaj7', ['Eb', 'G', 'Bb', 'D']],
  ];
  it.each(cases)('%s: %s -> %s', (key, numeral, symbol, notes) => {
    const r = resolveRomanInKey(key, numeral);
    expect(r).not.toBeNull();
    expect(r!.symbol).toBe(symbol);
    expect(r!.notes).toEqual(notes);
  });

  it('returns null for garbage', () => {
    expect(resolveRomanInKey('C', 'XYZ')).toBeNull();
  });
});

describe('registry coverage', () => {
  it('resolves every step of every registry progression in C', () => {
    const failures: string[] = [];
    for (const prog of PROGRESSION_REGISTRY) {
      for (const step of prog.steps) {
        if (!resolveRomanInKey('C', step.romanNumeral)) {
          failures.push(`${prog.id}: ${step.romanNumeral}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('resolveProgression keeps step order', () => {
    const r = resolveProgression('C', ['ii7', 'V7', 'Imaj7']);
    expect(r.map(c => c.symbol)).toEqual(['Dm7', 'G7', 'Cmaj7']);
  });
});

describe('voiceChord', () => {
  it('voices ascending with a bass root', () => {
    const midis = voiceChord(['C', 'E', 'G', 'B']);
    expect(midis[0]).toBe(48); // C3
    expect(midis.slice(1)).toEqual([60, 64, 67, 71]);
    for (let i = 1; i < midis.length; i++) expect(midis[i]).toBeGreaterThan(midis[i - 1]);
  });
});

describe('guideTones', () => {
  it('extracts 3rd and 7th', () => {
    expect(guideTones('Dm7')).toEqual({ third: 'F', seventh: 'C' });
    expect(guideTones('G7')).toEqual({ third: 'B', seventh: 'F' });
    expect(guideTones('Cmaj7')).toEqual({ third: 'E', seventh: 'B' });
  });
  it('handles triads (no 7th)', () => {
    expect(guideTones('C')).toEqual({ third: 'E' });
  });
});

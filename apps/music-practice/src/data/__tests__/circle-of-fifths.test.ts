import { describe, it, expect } from 'vitest';
import {
  CIRCLE_OF_FIFTHS,
  ORDER_OF_SHARPS,
  ORDER_OF_FLATS,
  getKeyInfo,
  getKeyInfoByMinor,
  getChordsInKey,
  getRelativeMinor,
  getRelativeMajor,
  getClockwiseOrder,
  getFifthAbove,
  getFifthBelow,
} from '../circle-of-fifths';

describe('Circle of Fifths', () => {
  describe('Registry completeness', () => {
    it('has 15 entries (all major keys including enharmonics)', () => {
      expect(CIRCLE_OF_FIFTHS).toHaveLength(15);
    });

    it('covers all 15 major key names', () => {
      const keys = CIRCLE_OF_FIFTHS.map(e => e.majorKey);
      expect(keys).toContain('C');
      expect(keys).toContain('G');
      expect(keys).toContain('D');
      expect(keys).toContain('A');
      expect(keys).toContain('E');
      expect(keys).toContain('B');
      expect(keys).toContain('F#');
      expect(keys).toContain('C#');
      expect(keys).toContain('F');
      expect(keys).toContain('Bb');
      expect(keys).toContain('Eb');
      expect(keys).toContain('Ab');
      expect(keys).toContain('Db');
      expect(keys).toContain('Gb');
      expect(keys).toContain('Cb');
    });

    it('all major keys are unique', () => {
      const keys = CIRCLE_OF_FIFTHS.map(e => e.majorKey);
      expect(new Set(keys).size).toBe(15);
    });
  });

  describe('Key signatures', () => {
    it('C major has 0 accidentals', () => {
      const c = getKeyInfo('C');
      expect(c?.accidentals).toBe(0);
      expect(c?.accidentalNotes).toHaveLength(0);
    });

    it('G major has 1 sharp (F#)', () => {
      const g = getKeyInfo('G');
      expect(g?.accidentals).toBe(1);
      expect(g?.accidentalNotes).toEqual(['F#']);
    });

    it('D major has 2 sharps (F#, C#)', () => {
      const d = getKeyInfo('D');
      expect(d?.accidentals).toBe(2);
      expect(d?.accidentalNotes).toEqual(['F#', 'C#']);
    });

    it('F major has 1 flat (Bb)', () => {
      const f = getKeyInfo('F');
      expect(f?.accidentals).toBe(-1);
      expect(f?.accidentalNotes).toEqual(['Bb']);
    });

    it('Bb major has 2 flats (Bb, Eb)', () => {
      const bb = getKeyInfo('Bb');
      expect(bb?.accidentals).toBe(-2);
      expect(bb?.accidentalNotes).toEqual(['Bb', 'Eb']);
    });

    it('sharp keys add sharps in correct order', () => {
      for (let i = 1; i <= 7; i++) {
        const entry = CIRCLE_OF_FIFTHS.find(e => e.accidentals === i);
        expect(entry).toBeDefined();
        expect(entry!.accidentalNotes).toHaveLength(i);
        // Each sharp key's accidentals should be a prefix of ORDER_OF_SHARPS
        for (let j = 0; j < i; j++) {
          expect(entry!.accidentalNotes[j]).toBe(ORDER_OF_SHARPS[j]);
        }
      }
    });

    it('flat keys add flats in correct order', () => {
      for (let i = 1; i <= 7; i++) {
        const entry = CIRCLE_OF_FIFTHS.find(e => e.accidentals === -i);
        expect(entry).toBeDefined();
        expect(entry!.accidentalNotes).toHaveLength(i);
        for (let j = 0; j < i; j++) {
          expect(entry!.accidentalNotes[j]).toBe(ORDER_OF_FLATS[j]);
        }
      }
    });
  });

  describe('Relative minors', () => {
    it.each([
      ['C', 'Am'], ['G', 'Em'], ['D', 'Bm'], ['A', 'F#m'],
      ['E', 'C#m'], ['B', 'G#m'], ['F', 'Dm'], ['Bb', 'Gm'],
      ['Eb', 'Cm'], ['Ab', 'Fm'], ['Db', 'Bbm'],
    ])('%s major → %s relative minor', (major, minor) => {
      expect(getRelativeMinor(major)).toBe(minor);
    });

    it.each([
      ['Am', 'C'], ['Em', 'G'], ['Dm', 'F'], ['Gm', 'Bb'], ['Cm', 'Eb'],
    ])('%s minor → %s relative major', (minor, major) => {
      expect(getRelativeMajor(minor)).toBe(major);
    });
  });

  describe('Diatonic chords', () => {
    it('C major diatonic triads are correct', () => {
      const chords = getChordsInKey('C');
      expect(chords?.triads).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']);
    });

    it('C major diatonic 7ths are correct', () => {
      const chords = getChordsInKey('C');
      expect(chords?.sevenths).toEqual(['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5']);
    });

    it('G major diatonic triads are correct', () => {
      const chords = getChordsInKey('G');
      expect(chords?.triads).toEqual(['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim']);
    });

    it('Bb major diatonic 7ths are correct', () => {
      const chords = getChordsInKey('Bb');
      expect(chords?.sevenths).toEqual(['Bbmaj7', 'Cm7', 'Dm7', 'Ebmaj7', 'F7', 'Gm7', 'Am7b5']);
    });

    it('every key has exactly 7 triads and 7 sevenths', () => {
      for (const entry of CIRCLE_OF_FIFTHS) {
        expect(entry.chords.triads).toHaveLength(7);
        expect(entry.chords.sevenths).toHaveLength(7);
      }
    });

    it('triad qualities follow I ii iii IV V vi vii° pattern', () => {
      for (const entry of CIRCLE_OF_FIFTHS) {
        const [I, ii, iii, IV, V, vi, viio] = entry.chords.triads;
        // I, IV, V should not contain 'm' or 'dim'
        expect(I).not.toMatch(/m|dim/i);
        expect(IV).not.toMatch(/m|dim/i);
        expect(V).not.toMatch(/m|dim/i);
        // ii, iii, vi should contain 'm' but not 'dim'
        expect(ii).toMatch(/m$/);
        expect(iii).toMatch(/m$/);
        expect(vi).toMatch(/m$/);
        // vii should be diminished
        expect(viio).toMatch(/dim$/);
      }
    });

    it('seventh chord qualities follow Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7', () => {
      for (const entry of CIRCLE_OF_FIFTHS) {
        const [I, ii, iii, IV, V, vi, viio] = entry.chords.sevenths;
        expect(I).toMatch(/maj7$/);
        expect(ii).toMatch(/m7$/);
        expect(iii).toMatch(/m7$/);
        expect(IV).toMatch(/maj7$/);
        expect(V).toMatch(/7$/);
        expect(V).not.toMatch(/maj7$/);
        expect(vi).toMatch(/m7$/);
        expect(viio).toMatch(/m7b5$/);
      }
    });
  });

  describe('Enharmonic equivalents', () => {
    it('B and Cb are enharmonic', () => {
      const b = getKeyInfo('B');
      expect(b?.enharmonicMajor).toBe('Cb');
      const cb = getKeyInfo('Cb');
      expect(cb?.enharmonicMajor).toBe('B');
    });

    it('F# and Gb are enharmonic', () => {
      const fs = getKeyInfo('F#');
      expect(fs?.enharmonicMajor).toBe('Gb');
      const gb = getKeyInfo('Gb');
      expect(gb?.enharmonicMajor).toBe('F#');
    });

    it('C# and Db are enharmonic', () => {
      const cs = getKeyInfo('C#');
      expect(cs?.enharmonicMajor).toBe('Db');
      const db = getKeyInfo('Db');
      expect(db?.enharmonicMajor).toBe('C#');
    });
  });

  describe('Circle navigation', () => {
    it('clockwise order has 12 keys', () => {
      expect(getClockwiseOrder()).toHaveLength(12);
    });

    it('fifth above C is G', () => {
      expect(getFifthAbove('C')).toBe('G');
    });

    it('fifth above G is D', () => {
      expect(getFifthAbove('G')).toBe('D');
    });

    it('fifth below C is F', () => {
      expect(getFifthBelow('C')).toBe('F');
    });

    it('fifth below F is Bb', () => {
      expect(getFifthBelow('F')).toBe('Bb');
    });

    it('going around the full circle returns to start', () => {
      let key = 'C';
      for (let i = 0; i < 12; i++) {
        key = getFifthAbove(key)!;
      }
      expect(key).toBe('C');
    });

    it('returns undefined for unknown key', () => {
      expect(getFifthAbove('H')).toBeUndefined();
      expect(getKeyInfo('X')).toBeUndefined();
    });
  });

  describe('Order of sharps and flats', () => {
    it('order of sharps is F# C# G# D# A# E# B#', () => {
      expect(ORDER_OF_SHARPS).toEqual(['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#']);
    });

    it('order of flats is Bb Eb Ab Db Gb Cb Fb', () => {
      expect(ORDER_OF_FLATS).toEqual(['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb']);
    });
  });
});

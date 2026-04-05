import { describe, it, expect } from 'vitest';
import {
  PROGRESSION_REGISTRY,
  getProgression,
  getProgressionsByFamily,
  searchProgressions,
} from '../progressions/progression-registry';

describe('Progression Registry', () => {
  // ── 1. Registry size ──────────────────────────────────────────────────
  it('has exactly 33 progressions', () => {
    expect(PROGRESSION_REGISTRY).toHaveLength(33);
  });

  // ── 2. All 4 families represented ─────────────────────────────────────
  it('has all 4 families represented', () => {
    const families = new Set(PROGRESSION_REGISTRY.map((p) => p.family));
    expect(families).toEqual(new Set(['jazz', 'blues', 'pop', 'classical']));
  });

  // ── 3. All IDs unique ─────────────────────────────────────────────────
  it('all progression IDs are unique', () => {
    const ids = PROGRESSION_REGISTRY.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // ── 4. totalBars matches sum of step bars ─────────────────────────────
  describe('totalBars matches sum of step bars', () => {
    for (const prog of PROGRESSION_REGISTRY) {
      it(`${prog.name}: totalBars (${prog.totalBars}) === sum of step bars`, () => {
        const sumBars = prog.steps.reduce((sum, step) => sum + step.bars, 0);
        expect(prog.totalBars).toBe(sumBars);
      });
    }
  });

  // ── 5. Key progressions exist ─────────────────────────────────────────
  describe('key progressions exist', () => {
    const requiredIds = ['ii-V-I-major', '12-bar-blues', 'I-V-vi-IV', 'perfect-authentic'];

    for (const id of requiredIds) {
      it(`${id} exists`, () => {
        expect(getProgression(id)).toBeDefined();
      });
    }
  });

  // ── 6. Bird Changes and Bird Blues ────────────────────────────────────
  it('Bird Changes exists', () => {
    const bird = getProgression('bird-changes');
    expect(bird).toBeDefined();
    expect(bird!.family).toBe('jazz');
  });

  it('Bird Blues exists', () => {
    const birdBlues = getProgression('bird-blues');
    expect(birdBlues).toBeDefined();
    expect(birdBlues!.family).toBe('blues');
  });

  // ── 7. Lookup and search ──────────────────────────────────────────────
  describe('lookup and search', () => {
    it('getProgression finds by ID', () => {
      const result = getProgression('ii-V-I-major');
      expect(result).toBeDefined();
      expect(result!.name).toBe('ii-V-I Major');
    });

    it('getProgression returns undefined for missing ID', () => {
      expect(getProgression('nonexistent')).toBeUndefined();
    });

    it('getProgressionsByFamily returns jazz progressions', () => {
      const jazz = getProgressionsByFamily('jazz');
      expect(jazz.length).toBeGreaterThan(0);
      expect(jazz.every((p) => p.family === 'jazz')).toBe(true);
    });

    it('searchProgressions finds by tag', () => {
      const results = searchProgressions('turnaround');
      expect(results.length).toBeGreaterThan(0);
    });

    it('searchProgressions finds by name', () => {
      const results = searchProgressions('12-Bar Blues');
      expect(results.some((p) => p.id === '12-bar-blues')).toBe(true);
    });
  });

  // ── Structural checks ─────────────────────────────────────────────────
  describe('structural integrity', () => {
    for (const prog of PROGRESSION_REGISTRY) {
      it(`${prog.name}: has at least one step`, () => {
        expect(prog.steps.length).toBeGreaterThan(0);
      });

      it(`${prog.name}: all steps have a romanNumeral and bars > 0`, () => {
        for (const step of prog.steps) {
          expect(step.romanNumeral).toBeTruthy();
          expect(step.bars).toBeGreaterThan(0);
        }
      });
    }
  });
});

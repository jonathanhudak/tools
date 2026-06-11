import { describe, it, expect } from 'vitest';
import { gradeCard, buildQueue, NEW_CARD, type CardState, type SrsStore } from '../srs';

const NOW = 1_750_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

describe('gradeCard', () => {
  it('good on a new card schedules 1 day out', () => {
    const s = gradeCard(NEW_CARD, 'good', NOW);
    expect(s.intervalDays).toBe(1);
    expect(s.due).toBe(NOW + DAY);
    expect(s.reps).toBe(1);
  });

  it('intervals grow geometrically with ease on repeated good', () => {
    let s: CardState = NEW_CARD;
    s = gradeCard(s, 'good', NOW); // 1d
    s = gradeCard(s, 'good', NOW); // 2.5d
    s = gradeCard(s, 'good', NOW); // 6.3d
    expect(s.intervalDays).toBeCloseTo(6.3, 1);
    expect(s.reps).toBe(3);
  });

  it('again resets reps, lowers ease, resurfaces within minutes', () => {
    let s = gradeCard(NEW_CARD, 'good', NOW);
    s = gradeCard(s, 'again', NOW);
    expect(s.reps).toBe(0);
    expect(s.ease).toBeCloseTo(2.3, 5);
    expect(s.due - NOW).toBeLessThanOrEqual(10 * 60 * 1000);
  });

  it('ease never drops below 1.3', () => {
    let s: CardState = { ...NEW_CARD, ease: 1.35 };
    s = gradeCard(s, 'again', NOW);
    s = gradeCard(s, 'again', NOW);
    expect(s.ease).toBe(1.3);
  });

  it('easy grows faster than good and raises ease', () => {
    const good = gradeCard(gradeCard(NEW_CARD, 'good', NOW), 'good', NOW);
    const easy = gradeCard(gradeCard(NEW_CARD, 'good', NOW), 'easy', NOW);
    expect(easy.intervalDays).toBeGreaterThan(good.intervalDays);
    expect(easy.ease).toBeGreaterThan(good.ease);
  });
});

describe('buildQueue', () => {
  const ids = ['a', 'b', 'c', 'd'];
  it('puts due cards (oldest first) before new cards, respecting newLimit', () => {
    const store: SrsStore = {
      a: { ...NEW_CARD, due: NOW - DAY, intervalDays: 1, reps: 1 },
      b: { ...NEW_CARD, due: NOW - 2 * DAY, intervalDays: 1, reps: 1 },
      c: { ...NEW_CARD, due: NOW + DAY, intervalDays: 1, reps: 1 }, // not due
    };
    expect(buildQueue(ids, store, 1, NOW)).toEqual(['b', 'a', 'd']);
  });
  it('all-new deck yields only newLimit cards', () => {
    expect(buildQueue(ids, {}, 2, NOW)).toEqual(['a', 'b']);
  });
});

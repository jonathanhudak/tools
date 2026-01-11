import { describe, expect, it } from 'vitest';
import { calculateScore, getScoreRank, getStreakMultiplier, isRoundSuccessful } from './scoring';

describe('scoring utilities', () => {
  it('calculates a score with streak and speed bonus', () => {
    const result = calculateScore(8, 10, 20, 40, 5);
    expect(result.baseScore).toBe(80);
    expect(result.speedBonus).toBe(50);
    expect(result.streakMultiplier).toBeCloseTo(getStreakMultiplier(5));
    expect(result.finalScore).toBeGreaterThan(80);
  });

  it('maps score ranks correctly', () => {
    expect(getScoreRank(130)).toBe('S');
    expect(getScoreRank(100)).toBe('A');
    expect(getScoreRank(80)).toBe('B');
    expect(getScoreRank(60)).toBe('C');
    expect(getScoreRank(10)).toBe('D');
  });

  it('determines round success based on threshold', () => {
    expect(isRoundSuccessful(8, 10, 0.75)).toBe(true);
    expect(isRoundSuccessful(5, 10, 0.75)).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { FixedClock } from '../src/clock/fixed-clock.adapter.js';

describe('FixedClock', () => {
  it('returns defensive copies and advances deterministically', () => {
    const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
    clock.now().setFullYear(1999);
    clock.advance(1000);
    expect(clock.now().toISOString()).toBe('2026-01-01T00:00:01.000Z');
  });
});

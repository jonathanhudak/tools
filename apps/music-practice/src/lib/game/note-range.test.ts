import { describe, expect, it } from 'vitest';
import { getNoteRange } from './note-range';

describe('note range helpers', () => {
  it('returns instrument-specific ranges', () => {
    expect(getNoteRange('guitar', 'beginner')).toBe('e2-e4');
    expect(getNoteRange('violin', 'advanced')).toBe('g3-g5');
  });

  it('falls back to piano ranges when instrument is unknown', () => {
    expect(getNoteRange('unknown', 'beginner')).toBe('c4-c5');
  });
});

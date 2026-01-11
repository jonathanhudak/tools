import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameRound } from './use-game-round';

describe('useGameRound', () => {
  it('starts a timed round and tracks correct answers', () => {
    const { result } = renderHook(() =>
      useGameRound({ difficulty: 'beginner', gameMode: 'timed' })
    );

    act(() => {
      result.current[1].startRound();
    });

    expect(result.current[0].isActive).toBe(true);

    act(() => {
      result.current[1].noteCorrect();
    });

    expect(result.current[0].correctCount).toBe(1);
    expect(result.current[0].notesCompleted).toBe(1);
  });

  it('reduces lives when incorrect in timed mode', () => {
    const { result } = renderHook(() =>
      useGameRound({ difficulty: 'beginner', gameMode: 'timed' })
    );

    act(() => {
      result.current[1].startRound();
      result.current[1].noteIncorrect();
    });

    expect(result.current[0].lives).toBe(2);
    expect(result.current[0].incorrectCount).toBe(1);
  });
});

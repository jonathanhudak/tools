/**
 * useGameRound Hook
 * Manages timed round logic for game mode
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ROUND_CONFIGS, calculateScore, isRoundSuccessful, type ScoreResult } from '../lib/utils/scoring';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type GameMode = 'practice' | 'timed';

export interface GameRoundState {
  // Round status
  isActive: boolean;
  isComplete: boolean;
  isSuccessful: boolean | null;

  // Time tracking
  timeLeft: number;
  maxTime: number;

  // Lives
  lives: number;
  maxLives: number;

  // Progress
  notesCompleted: number;
  notesRequired: number;
  correctCount: number;
  incorrectCount: number;

  // Streak
  streak: number;
  consecutiveWrong: number;

  // Score
  currentScore: ScoreResult | null;
}

export interface GameRoundActions {
  startRound: () => void;
  endRound: () => void;
  noteCorrect: () => void;
  noteIncorrect: () => void;
  resetRound: () => void;
}

export interface UseGameRoundOptions {
  difficulty: Difficulty;
  gameMode: GameMode;
  onRoundComplete?: (state: GameRoundState) => void;
  onRoundFail?: (state: GameRoundState) => void;
  onTimeUp?: () => void;
  onLifeLost?: (livesLeft: number) => void;
  onStreakMilestone?: (streak: number) => void;
}

export function useGameRound(options: UseGameRoundOptions): [GameRoundState, GameRoundActions] {
  const { difficulty, gameMode, onRoundComplete, onRoundFail, onTimeUp, onLifeLost, onStreakMilestone } = options;

  const config = ROUND_CONFIGS[difficulty];
  const maxLives = 3;

  // Initial state
  const [state, setState] = useState<GameRoundState>({
    isActive: false,
    isComplete: false,
    isSuccessful: null,
    timeLeft: config.duration,
    maxTime: config.duration,
    lives: maxLives,
    maxLives,
    notesCompleted: 0,
    notesRequired: config.notesPerRound,
    correctCount: 0,
    incorrectCount: 0,
    streak: 0,
    consecutiveWrong: 0,
    currentScore: null,
  });

  // Refs for callbacks to avoid stale closures
  const stateRef = useRef(state);
  stateRef.current = state;

  // Timer
  useEffect(() => {
    if (gameMode !== 'timed') return;
    if (!state.isActive || state.isComplete) return;

    const timer = setInterval(() => {
      setState((prev) => {
        const newTimeLeft = Math.max(0, prev.timeLeft - 1);

        // Check if time's up
        if (newTimeLeft === 0 && prev.timeLeft > 0) {
          if (onTimeUp) onTimeUp();
          // End round on time up
          return {
            ...prev,
            timeLeft: 0,
            isActive: false,
            isComplete: true,
            isSuccessful: false,
          };
        }

        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isActive, state.isComplete, gameMode, onTimeUp]);

  // Start round
  const startRound = useCallback(() => {
    setState({
      isActive: true,
      isComplete: false,
      isSuccessful: null,
      timeLeft: config.duration,
      maxTime: config.duration,
      lives: maxLives,
      maxLives,
      notesCompleted: 0,
      notesRequired: config.notesPerRound,
      correctCount: 0,
      incorrectCount: 0,
      streak: stateRef.current.streak, // Preserve streak across rounds
      consecutiveWrong: 0,
      currentScore: null,
    });
  }, [config.duration, config.notesPerRound, maxLives]);

  // End round
  const endRound = useCallback(() => {
    setState((prev) => {
      const isSuccessful = isRoundSuccessful(prev.correctCount, prev.notesRequired, config.successThreshold);

      const score = calculateScore(
        prev.correctCount,
        prev.notesRequired,
        prev.timeLeft,
        prev.maxTime,
        prev.streak
      );

      const newState = {
        ...prev,
        isActive: false,
        isComplete: true,
        isSuccessful,
        currentScore: score,
      };

      // Trigger callbacks
      if (isSuccessful && onRoundComplete) {
        onRoundComplete(newState);
      } else if (!isSuccessful && onRoundFail) {
        onRoundFail(newState);
      }

      return newState;
    });
  }, [config.successThreshold, onRoundComplete, onRoundFail]);

  // Note correct
  const noteCorrect = useCallback(() => {
    setState((prev) => {
      const newCorrect = prev.correctCount + 1;
      const newCompleted = prev.notesCompleted + 1;
      const newStreak = prev.streak + 1;
      const consecutiveWrong = 0;

      // Check for streak milestones
      if (onStreakMilestone && (newStreak === 5 || newStreak === 10 || newStreak === 20 || newStreak % 25 === 0)) {
        onStreakMilestone(newStreak);
      }

      // Check if round complete
      const roundComplete = newCompleted >= prev.notesRequired;

      return {
        ...prev,
        correctCount: newCorrect,
        notesCompleted: newCompleted,
        streak: newStreak,
        consecutiveWrong,
        isComplete: roundComplete,
        isActive: !roundComplete,
      };
    });
  }, [onStreakMilestone]);

  // Note incorrect
  const noteIncorrect = useCallback(() => {
    setState((prev) => {
      const newIncorrect = prev.incorrectCount + 1;
      const newCompleted = prev.notesCompleted + 1;
      const newLives = gameMode === 'timed' ? Math.max(0, prev.lives - 1) : prev.lives;
      const consecutiveWrong = prev.consecutiveWrong + 1;
      const streak = 0; // Reset streak on wrong note

      // Trigger life lost callback
      if (gameMode === 'timed' && newLives < prev.lives && onLifeLost) {
        onLifeLost(newLives);
      }

      // Check fail conditions (timed mode only)
      const failedByLives = gameMode === 'timed' && newLives === 0;
      const failedByConsecutive = gameMode === 'timed' && consecutiveWrong >= 3;
      const roundFailed = failedByLives || failedByConsecutive;

      // Check if round complete
      const roundComplete = newCompleted >= prev.notesRequired || roundFailed;

      return {
        ...prev,
        incorrectCount: newIncorrect,
        notesCompleted: newCompleted,
        lives: newLives,
        streak,
        consecutiveWrong,
        isComplete: roundComplete,
        isSuccessful: roundFailed ? false : null,
        isActive: !roundComplete,
      };
    });
  }, [gameMode, onLifeLost]);

  // Reset round
  const resetRound = useCallback(() => {
    setState({
      isActive: false,
      isComplete: false,
      isSuccessful: null,
      timeLeft: config.duration,
      maxTime: config.duration,
      lives: maxLives,
      maxLives,
      notesCompleted: 0,
      notesRequired: config.notesPerRound,
      correctCount: 0,
      incorrectCount: 0,
      streak: 0,
      consecutiveWrong: 0,
      currentScore: null,
    });
  }, [config.duration, config.notesPerRound, maxLives]);

  // Auto-complete round when all notes done
  useEffect(() => {
    if (state.isComplete && !state.isSuccessful && state.notesCompleted >= state.notesRequired) {
      endRound();
    }
  }, [state.isComplete, state.isSuccessful, state.notesCompleted, state.notesRequired, endRound]);

  const actions: GameRoundActions = {
    startRound,
    endRound,
    noteCorrect,
    noteIncorrect,
    resetRound,
  };

  return [state, actions];
}

import { useState, useCallback, useEffect } from 'react';
import type { GameState, Direction, Level, GameHistory } from '../types/sokoban';
import {
  parseLevel,
  movePlayer,
  saveProgress,
  saveBestMoves,
} from '../utils/game-logic';

export function useSokoban(level: Level) {
  const [gameState, setGameState] = useState<GameState>(() =>
    parseLevel(level.grid)
  );
  const [history, setHistory] = useState<GameHistory[]>([]);

  // Reset game when level changes
  useEffect(() => {
    const initialState = parseLevel(level.grid);
    setGameState(initialState);
    setHistory([]);
  }, [level]);

  const move = useCallback(
    (direction: Direction) => {
      if (gameState.levelComplete) return;

      const newState = movePlayer(gameState, direction);

      // Only record move if state actually changed
      if (newState !== gameState) {
        setHistory((prev) => [
          ...prev,
          { state: gameState, timestamp: Date.now() },
        ]);
        setGameState(newState);

        // Save progress if level completed
        if (newState.levelComplete) {
          saveProgress(level.id, true);
          saveBestMoves(level.id, newState.moves);
        }
      }
    },
    [gameState, level.id]
  );

  const undo = useCallback(() => {
    if (history.length === 0) return;

    const previousState = history[history.length - 1].state;
    setGameState(previousState);
    setHistory((prev) => prev.slice(0, -1));
  }, [history]);

  const reset = useCallback(() => {
    const initialState = parseLevel(level.grid);
    setGameState(initialState);
    setHistory([]);
  }, [level]);

  return {
    gameState,
    move,
    undo,
    reset,
    canUndo: history.length > 0,
  };
}

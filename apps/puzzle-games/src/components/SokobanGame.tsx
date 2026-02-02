import { useEffect } from 'react';
import type { Level } from '../types/sokoban';
import { useSokoban } from '../hooks/useSokoban';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { SokobanGrid } from './SokobanGrid';
import { SokobanControls } from './SokobanControls';

interface SokobanGameProps {
  level: Level;
  onLevelComplete?: () => void;
}

export function SokobanGame({ level, onLevelComplete }: SokobanGameProps) {
  const { gameState, move, undo, reset, canUndo } = useSokoban(level);
  const { handleTouchStart, handleTouchEnd } = useSwipeGesture(move);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (gameState.levelComplete) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          move('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          move('right');
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            undo();
          }
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          reset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.levelComplete, move, undo, reset]);

  // Notify parent when level is completed
  useEffect(() => {
    if (gameState.levelComplete && onLevelComplete) {
      onLevelComplete();
    }
  }, [gameState.levelComplete, onLevelComplete]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold mb-2">
            Level {level.id}: {level.name}
          </h2>
          <p className="text-sm text-gray-600">
            Push all boxes (□) onto targets (·) to complete the level
          </p>
        </div>

        <SokobanGrid
          gameState={gameState}
          onMove={move}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />

        <SokobanControls
          moves={gameState.moves}
          canUndo={canUndo}
          levelComplete={gameState.levelComplete}
          onMove={move}
          onUndo={undo}
          onReset={reset}
        />

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Controls: Arrow keys, WASD, or swipe/tap. Press R to reset, Ctrl+Z
            to undo.
          </p>
        </div>
      </div>
    </div>
  );
}

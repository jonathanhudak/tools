import { Check } from 'lucide-react';
import type { Level } from '../types/sokoban';
import { loadProgress, loadBestMoves } from '../utils/game-logic';

interface LevelSelectorProps {
  levels: Level[];
  currentLevelId: number;
  onSelectLevel: (level: Level) => void;
}

export function LevelSelector({
  levels,
  currentLevelId,
  onSelectLevel,
}: LevelSelectorProps) {
  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center mb-2">Sokoban</h1>
        <p className="text-center text-gray-600 mb-8">
          Select a level to start playing
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {levels.map((level) => {
            const progress = loadProgress(level.id);
            const bestMoves = loadBestMoves(level.id);
            const isCurrentLevel = level.id === currentLevelId;

            return (
              <button
                key={level.id}
                type="button"
                onClick={() => onSelectLevel(level)}
                className={`
                  relative p-4 border-2 border-black
                  transition-colors
                  ${
                    isCurrentLevel
                      ? 'bg-gray-200'
                      : 'bg-white hover:bg-gray-50 active:bg-gray-100'
                  }
                `}
                aria-label={`Level ${level.id}: ${level.name}${progress.completed ? ' (completed)' : ''}`}
              >
                {progress.completed && (
                  <div className="absolute top-1 right-1">
                    <Check className="w-5 h-5" />
                  </div>
                )}

                <div className="text-2xl font-bold mb-1">{level.id}</div>
                <div className="text-sm font-medium mb-1">{level.name}</div>

                {bestMoves !== null && (
                  <div className="text-xs text-gray-600">
                    Best: {bestMoves} moves
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">How to play:</p>
          <ul className="text-left max-w-md mx-auto space-y-1">
            <li>• Push all boxes (□) onto targets (·)</li>
            <li>• You can only push boxes, not pull them</li>
            <li>• Use arrow keys, WASD, or swipe to move</li>
            <li>• Tap adjacent cells to move there</li>
            <li>• Press Undo or hold to undo moves</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

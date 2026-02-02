import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Undo } from 'lucide-react';
import type { Direction } from '../types/sokoban';

interface SokobanControlsProps {
  moves: number;
  canUndo: boolean;
  levelComplete: boolean;
  onMove: (direction: Direction) => void;
  onUndo: () => void;
  onReset: () => void;
}

export function SokobanControls({
  moves,
  canUndo,
  levelComplete,
  onMove,
  onUndo,
  onReset,
}: SokobanControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Status */}
      <div className="flex items-center gap-4 text-lg font-mono">
        <div>Moves: {moves}</div>
        {levelComplete && (
          <div className="font-bold">★ Complete! ★</div>
        )}
      </div>

      {/* Direction buttons */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-start-2">
          <button
            type="button"
            onClick={() => onMove('up')}
            className="w-14 h-14 flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Move up"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onMove('left')}
          className="w-14 h-14 flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="Move left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div /> {/* Spacer */}

        <button
          type="button"
          onClick={() => onMove('right')}
          className="w-14 h-14 flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="Move right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        <div className="col-start-2">
          <button
            type="button"
            onClick={() => onMove('down')}
            className="w-14 h-14 flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Move down"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="px-4 py-2 flex items-center gap-2 border-2 border-black bg-white hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Undo move"
        >
          <Undo className="w-5 h-5" />
          <span>Undo</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 flex items-center gap-2 border-2 border-black bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="Reset level"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}

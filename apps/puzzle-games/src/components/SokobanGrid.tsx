import type { GameState, Direction, Position } from '../types/sokoban';
import type { CellType } from '../types/sokoban';
import { getAdjacentDirection } from '../utils/game-logic';

interface SokobanGridProps {
  gameState: GameState;
  onMove: (direction: Direction) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

const CELL_SYMBOLS: Record<CellType, string> = {
  wall: '█',
  floor: ' ',
  box: '□',
  target: '·',
  player: '☺',
  'box-on-target': '■',
  'player-on-target': '☻',
};

export function SokobanGrid({
  gameState,
  onMove,
  onTouchStart,
  onTouchEnd,
}: SokobanGridProps) {
  const { grid, playerPos } = gameState;

  const handleCellClick = (x: number, y: number): void => {
    const clickedPos: Position = { x, y };
    const direction = getAdjacentDirection(playerPos, clickedPos);

    if (direction) {
      onMove(direction);
    }
  };

  const maxWidth = Math.max(...grid.map((row) => row.length));

  return (
    <div
      className="flex flex-col items-center justify-center p-4 select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="inline-grid gap-0 border-2 border-black bg-white"
        style={{
          gridTemplateColumns: `repeat(${maxWidth}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const isAdjacent =
              Math.abs(x - playerPos.x) + Math.abs(y - playerPos.y) === 1;

            return (
              <button
                key={`${x}-${y}`}
                type="button"
                onClick={() => handleCellClick(x, y)}
                className={`
                  flex items-center justify-center
                  w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
                  text-2xl sm:text-3xl md:text-4xl
                  font-mono border border-gray-300
                  transition-colors
                  ${cell === 'wall' ? 'bg-black text-white' : 'bg-white text-black'}
                  ${isAdjacent && cell !== 'wall' ? 'hover:bg-gray-100 active:bg-gray-200' : ''}
                  ${cell === 'target' || cell === 'player-on-target' ? 'bg-gray-50' : ''}
                `}
                disabled={!isAdjacent || cell === 'wall'}
                aria-label={`Cell ${x},${y}: ${cell}`}
              >
                {CELL_SYMBOLS[cell]}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

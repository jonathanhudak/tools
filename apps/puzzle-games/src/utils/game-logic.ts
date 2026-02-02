import type { CellType, GameState, Position, Direction, Level } from '../types/sokoban';

export function parseLevel(levelGrid: string[]): GameState {
  const grid: CellType[][] = [];
  let playerPos: Position = { x: 0, y: 0 };

  for (let y = 0; y < levelGrid.length; y++) {
    const row: CellType[] = [];
    for (let x = 0; x < levelGrid[y].length; x++) {
      const char = levelGrid[y][x];
      let cell: CellType;

      switch (char) {
        case '#':
          cell = 'wall';
          break;
        case ' ':
          cell = 'floor';
          break;
        case '$':
          cell = 'box';
          break;
        case '.':
          cell = 'target';
          break;
        case '@':
          cell = 'player';
          playerPos = { x, y };
          break;
        case '*':
          cell = 'box-on-target';
          break;
        case '+':
          cell = 'player-on-target';
          playerPos = { x, y };
          break;
        default:
          cell = 'floor';
      }

      row.push(cell);
    }
    grid.push(row);
  }

  return {
    grid,
    playerPos,
    moves: 0,
    levelComplete: false,
  };
}

export function getDirectionVector(direction: Direction): Position {
  switch (direction) {
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
  }
}

export function movePlayer(state: GameState, direction: Direction): GameState {
  const { grid, playerPos } = state;
  const vector = getDirectionVector(direction);
  const newPlayerPos = {
    x: playerPos.x + vector.x,
    y: playerPos.y + vector.y,
  };

  // Check bounds
  if (
    newPlayerPos.y < 0 ||
    newPlayerPos.y >= grid.length ||
    newPlayerPos.x < 0 ||
    newPlayerPos.x >= grid[newPlayerPos.y].length
  ) {
    return state;
  }

  const targetCell = grid[newPlayerPos.y][newPlayerPos.x];

  // Can't move into walls
  if (targetCell === 'wall') {
    return state;
  }

  // Check if there's a box
  if (targetCell === 'box' || targetCell === 'box-on-target') {
    const boxPushPos = {
      x: newPlayerPos.x + vector.x,
      y: newPlayerPos.y + vector.y,
    };

    // Check bounds for box push
    if (
      boxPushPos.y < 0 ||
      boxPushPos.y >= grid.length ||
      boxPushPos.x < 0 ||
      boxPushPos.x >= grid[boxPushPos.y].length
    ) {
      return state;
    }

    const boxTargetCell = grid[boxPushPos.y][boxPushPos.x];

    // Can't push box into wall or another box
    if (
      boxTargetCell === 'wall' ||
      boxTargetCell === 'box' ||
      boxTargetCell === 'box-on-target'
    ) {
      return state;
    }

    // Valid push - create new state
    const newGrid = grid.map((row) => [...row]);

    // Clear old player position
    const oldPlayerCell = grid[playerPos.y][playerPos.x];
    newGrid[playerPos.y][playerPos.x] =
      oldPlayerCell === 'player-on-target' ? 'target' : 'floor';

    // Move box
    const wasBoxOnTarget = targetCell === 'box-on-target';
    newGrid[newPlayerPos.y][newPlayerPos.x] = wasBoxOnTarget
      ? 'player-on-target'
      : 'player';

    // Place box in new position
    const isTargetPosition = boxTargetCell === 'target';
    newGrid[boxPushPos.y][boxPushPos.x] = isTargetPosition
      ? 'box-on-target'
      : 'box';

    const newState: GameState = {
      grid: newGrid,
      playerPos: newPlayerPos,
      moves: state.moves + 1,
      levelComplete: false,
    };

    newState.levelComplete = checkWinCondition(newState);
    return newState;
  }

  // Normal move (no box)
  const newGrid = grid.map((row) => [...row]);

  // Clear old player position
  const oldPlayerCell = grid[playerPos.y][playerPos.x];
  newGrid[playerPos.y][playerPos.x] =
    oldPlayerCell === 'player-on-target' ? 'target' : 'floor';

  // Set new player position
  const isTargetPosition = targetCell === 'target';
  newGrid[newPlayerPos.y][newPlayerPos.x] = isTargetPosition
    ? 'player-on-target'
    : 'player';

  const newState: GameState = {
    grid: newGrid,
    playerPos: newPlayerPos,
    moves: state.moves + 1,
    levelComplete: false,
  };

  return newState;
}

export function checkWinCondition(state: GameState): boolean {
  const { grid } = state;

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];
      // If there's any target without a box, or any box not on target, not complete
      if (cell === 'target' || cell === 'player-on-target' || cell === 'box') {
        return false;
      }
    }
  }

  return true;
}

export function getAdjacentDirection(
  from: Position,
  to: Position
): Direction | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Only adjacent cells
  if (Math.abs(dx) + Math.abs(dy) !== 1) {
    return null;
  }

  if (dy === -1) return 'up';
  if (dy === 1) return 'down';
  if (dx === -1) return 'left';
  if (dx === 1) return 'right';

  return null;
}

export function saveProgress(levelId: number, completed: boolean): void {
  const key = `sokoban_level_${levelId}`;
  localStorage.setItem(key, JSON.stringify({ completed }));
}

export function loadProgress(levelId: number): { completed: boolean } {
  const key = `sokoban_level_${levelId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    return { completed: false };
  }
  try {
    return JSON.parse(stored);
  } catch {
    return { completed: false };
  }
}

export function saveBestMoves(levelId: number, moves: number): void {
  const key = `sokoban_best_${levelId}`;
  const current = loadBestMoves(levelId);
  if (current === null || moves < current) {
    localStorage.setItem(key, moves.toString());
  }
}

export function loadBestMoves(levelId: number): number | null {
  const key = `sokoban_best_${levelId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    return null;
  }
  const parsed = parseInt(stored, 10);
  return isNaN(parsed) ? null : parsed;
}

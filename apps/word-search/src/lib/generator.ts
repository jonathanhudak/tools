/**
 * Word Search Generator Algorithm
 * Generates valid word search grids from word lists
 */

export type Direction = 'horizontal' | 'vertical' | 'diagonal' | 'horizontal-back' | 'vertical-back' | 'diagonal-back';

export interface PlacedWord {
  word: string;
  startRow: number;
  startCol: number;
  direction: Direction;
}

export interface GridData {
  grid: string[][];
  placedWords: PlacedWord[];
  size: number;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface GeneratorConfig {
  words: string[];
  difficulty: DifficultyLevel;
}

const DIFFICULTY_CONFIG = {
  easy: {
    size: 8,
    directions: ['horizontal', 'vertical'] as Direction[],
  },
  medium: {
    size: 10,
    directions: ['horizontal', 'vertical', 'diagonal'] as Direction[],
  },
  hard: {
    size: 12,
    directions: ['horizontal', 'vertical', 'diagonal', 'horizontal-back', 'vertical-back', 'diagonal-back'] as Direction[],
  },
};

/**
 * Get direction deltas for row and column
 */
function getDirectionDelta(direction: Direction): { dr: number; dc: number } {
  switch (direction) {
    case 'horizontal':
      return { dr: 0, dc: 1 };
    case 'vertical':
      return { dr: 1, dc: 0 };
    case 'diagonal':
      return { dr: 1, dc: 1 };
    case 'horizontal-back':
      return { dr: 0, dc: -1 };
    case 'vertical-back':
      return { dr: -1, dc: 0 };
    case 'diagonal-back':
      return { dr: -1, dc: -1 };
  }
}

/**
 * Check if a word can be placed at the given position and direction
 */
function canPlaceWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: Direction,
  size: number
): boolean {
  const { dr, dc } = getDirectionDelta(direction);

  // Check if word fits in grid
  const endRow = row + dr * (word.length - 1);
  const endCol = col + dc * (word.length - 1);

  if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
    return false;
  }

  // Check if all positions are either empty or match the letter
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    const existing = grid[r][c];

    if (existing !== '' && existing !== word[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Place a word on the grid
 */
function placeWord(grid: string[][], word: string, row: number, col: number, direction: Direction): void {
  const { dr, dc } = getDirectionDelta(direction);

  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    grid[r][c] = word[i];
  }
}

/**
 * Try to place a word on the grid
 * Returns true if successful
 */
function tryPlaceWord(
  grid: string[][],
  word: string,
  size: number,
  allowedDirections: Direction[],
  maxAttempts: number = 100
): PlacedWord | null {
  // Try random positions and directions
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    const direction = allowedDirections[Math.floor(Math.random() * allowedDirections.length)];

    if (canPlaceWord(grid, word, row, col, direction, size)) {
      placeWord(grid, word, row, col, direction);
      return {
        word,
        startRow: row,
        startCol: col,
        direction,
      };
    }
  }

  return null;
}

/**
 * Fill empty cells with random letters
 */
function fillEmptyCells(grid: string[][], size: number): void {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === '') {
        grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

/**
 * Generate a word search grid
 */
export function generateWordSearch(config: GeneratorConfig): GridData {
  const { words, difficulty } = config;
  const { size, directions } = DIFFICULTY_CONFIG[difficulty];

  // Initialize empty grid
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));

  // Sort words by length (longest first) for better placement
  const sortedWords = [...words]
    .map((w) => w.toUpperCase().trim())
    .filter((w) => w.length > 0 && w.length <= size)
    .sort((a, b) => b.length - a.length);

  // Place words
  const placedWords: PlacedWord[] = [];

  for (const word of sortedWords) {
    const placed = tryPlaceWord(grid, word, size, directions);
    if (placed) {
      placedWords.push(placed);
    }
  }

  // Fill remaining empty cells with random letters
  fillEmptyCells(grid, size);

  return {
    grid,
    placedWords,
    size,
  };
}

/**
 * Verify that all placed words can actually be found in the grid
 */
export function verifyWordSearch(gridData: GridData): boolean {
  const { grid, placedWords } = gridData;

  for (const placed of placedWords) {
    const { word, startRow, startCol, direction } = placed;
    const { dr, dc } = getDirectionDelta(direction);

    let found = '';
    for (let i = 0; i < word.length; i++) {
      const r = startRow + dr * i;
      const c = startCol + dc * i;
      found += grid[r][c];
    }

    if (found !== word) {
      return false;
    }
  }

  return true;
}

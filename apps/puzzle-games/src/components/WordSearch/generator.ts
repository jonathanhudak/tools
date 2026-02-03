import { Difficulty, DIFFICULTY_CONFIG } from "./themes";

export interface PlacedWord {
  word: string;
  startRow: number;
  startCol: number;
  direction: [number, number];
  cells: Array<{ row: number; col: number }>;
}

export interface GeneratedPuzzle {
  grid: string[][];
  placedWords: PlacedWord[];
  size: number;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function canPlaceWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: [number, number]
): boolean {
  const [dRow, dCol] = direction;
  const size = grid.length;

  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * dRow;
    const col = startCol + i * dCol;

    if (row < 0 || row >= size || col < 0 || col >= size) {
      return false;
    }

    const existing = grid[row][col];
    if (existing !== "" && existing !== word[i]) {
      return false;
    }
  }

  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: [number, number]
): PlacedWord {
  const [dRow, dCol] = direction;
  const cells: Array<{ row: number; col: number }> = [];

  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * dRow;
    const col = startCol + i * dCol;
    grid[row][col] = word[i];
    cells.push({ row, col });
  }

  return {
    word,
    startRow,
    startCol,
    direction,
    cells,
  };
}

export function generatePuzzle(words: string[], difficulty: Difficulty): GeneratedPuzzle {
  const config = DIFFICULTY_CONFIG[difficulty];
  const size = config.size;
  const directions = config.directions as [number, number][];

  // Sort words by length (longest first for better placement)
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  // Create empty grid
  const grid: string[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(""));

  const placedWords: PlacedWord[] = [];

  // Try to place each word
  for (const word of sortedWords) {
    if (word.length > size) continue; // Skip words too long

    let placed = false;
    const shuffledDirections = shuffle(directions);
    const maxAttempts = 100;

    for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
      const dir = shuffledDirections[attempt % shuffledDirections.length];
      const startRow = Math.floor(Math.random() * size);
      const startCol = Math.floor(Math.random() * size);

      if (canPlaceWord(grid, word, startRow, startCol, dir)) {
        const placedWord = placeWord(grid, word, startRow, startCol, dir);
        placedWords.push(placedWord);
        placed = true;
      }
    }
  }

  // Fill remaining cells with random letters
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === "") {
        grid[row][col] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      }
    }
  }

  return { grid, placedWords, size };
}

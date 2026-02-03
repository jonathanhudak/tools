import { CellData, Clue, CrosswordPuzzle } from "./types";

/**
 * Build a crossword grid from puzzle clues
 */
export function buildGrid(puzzle: CrosswordPuzzle): CellData[][] {
  const grid: CellData[][] = Array.from({ length: puzzle.size }, () =>
    Array.from({ length: puzzle.size }, () => ({
      letter: null,
      userInput: "",
    }))
  );

  // Place each word in the grid
  for (const clue of puzzle.clues) {
    const { row, col, answer, direction, number } = clue;

    for (let i = 0; i < answer.length; i++) {
      const currentRow = direction === "across" ? row : row + i;
      const currentCol = direction === "across" ? col + i : col;

      if (currentRow >= puzzle.size || currentCol >= puzzle.size) {
        console.warn(`Clue ${number} exceeds grid bounds`);
        continue;
      }

      const cell = grid[currentRow][currentCol];
      cell.letter = answer[i];

      // Add clue number to the first cell of the word
      if (i === 0 && !cell.number) {
        cell.number = number;
      } else if (i === 0 && cell.number) {
        // If cell already has a number, keep the smaller one
        cell.number = Math.min(cell.number, number);
      }
    }
  }

  return grid;
}

/**
 * Get cells for a specific clue
 */
export function getCellsForClue(clue: Clue): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = [];
  const { row, col, answer, direction } = clue;

  for (let i = 0; i < answer.length; i++) {
    cells.push({
      row: direction === "across" ? row : row + i,
      col: direction === "across" ? col + i : col,
    });
  }

  return cells;
}

/**
 * Check if a clue is completely and correctly filled
 */
export function isClueCorrect(
  clue: Clue,
  grid: CellData[][]
): boolean {
  const cells = getCellsForClue(clue);
  return cells.every(({ row, col }, index) => {
    const cell = grid[row]?.[col];
    return cell && cell.userInput.toUpperCase() === clue.answer[index];
  });
}

/**
 * Check if the entire puzzle is solved
 */
export function isPuzzleSolved(
  puzzle: CrosswordPuzzle,
  grid: CellData[][]
): boolean {
  return puzzle.clues.every((clue) => isClueCorrect(clue, grid));
}

/**
 * Load saved grid from localStorage
 */
export function loadSavedGrid(puzzleId: string): CellData[][] | null {
  try {
    const saved = localStorage.getItem(`crossword-grid-${puzzleId}`);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/**
 * Save grid to localStorage
 */
export function saveGrid(puzzleId: string, grid: CellData[][]): void {
  try {
    localStorage.setItem(`crossword-grid-${puzzleId}`, JSON.stringify(grid));
  } catch (error) {
    console.error("Failed to save grid:", error);
  }
}

/**
 * Find clue for a specific cell
 */
export function findClueForCell(
  row: number,
  col: number,
  direction: "across" | "down",
  puzzle: CrosswordPuzzle
): Clue | null {
  for (const clue of puzzle.clues) {
    if (clue.direction !== direction) continue;

    const cells = getCellsForClue(clue);
    if (cells.some((c) => c.row === row && c.col === col)) {
      return clue;
    }
  }
  return null;
}

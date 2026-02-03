export type Direction = "across" | "down";

export interface Clue {
  number: number;
  direction: Direction;
  clue: string;
  answer: string;
  row: number;
  col: number;
}

export interface CrosswordPuzzle {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  size: number; // Grid will be size x size
  clues: Clue[];
}

export interface CellData {
  letter: string | null; // null = black cell
  number?: number; // clue number if this cell starts a word
  userInput: string; // what the user has typed
}

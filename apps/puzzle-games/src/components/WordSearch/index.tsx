import { useState, useCallback, useRef, useEffect } from "react";
import { THEMES, Theme, Difficulty } from "./themes";
import { generatePuzzle, GeneratedPuzzle, PlacedWord } from "./generator";
import { HowToPlay } from "../HowToPlay";

interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

function getCellsInSelection(selection: Selection): Array<{ row: number; col: number }> {
  const { startRow, startCol, endRow, endCol } = selection;
  const cells: Array<{ row: number; col: number }> = [];

  const dRow = endRow === startRow ? 0 : endRow > startRow ? 1 : -1;
  const dCol = endCol === startCol ? 0 : endCol > startCol ? 1 : -1;

  // Only allow straight lines (horizontal, vertical, or diagonal)
  const rowDist = Math.abs(endRow - startRow);
  const colDist = Math.abs(endCol - startCol);

  if (rowDist !== 0 && colDist !== 0 && rowDist !== colDist) {
    // Not a valid diagonal
    return [{ row: startRow, col: startCol }];
  }

  const steps = Math.max(rowDist, colDist);

  for (let i = 0; i <= steps; i++) {
    cells.push({
      row: startRow + i * dRow,
      col: startCol + i * dCol,
    });
  }

  return cells;
}

function wordMatchesCells(word: PlacedWord, cells: Array<{ row: number; col: number }>): boolean {
  if (word.cells.length !== cells.length) return false;

  // Check forward match
  const forwardMatch = word.cells.every(
    (c, i) => c.row === cells[i].row && c.col === cells[i].col
  );
  if (forwardMatch) return true;

  // Check reverse match
  const reversedCells = [...cells].reverse();
  const reverseMatch = word.cells.every(
    (c, i) => c.row === reversedCells[i].row && c.col === reversedCells[i].col
  );

  return reverseMatch;
}

export function WordSearch() {
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<Selection | null>(null);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);

  const startNewGame = useCallback(() => {
    const newPuzzle = generatePuzzle(theme.words, difficulty);
    setPuzzle(newPuzzle);
    setFoundWords(new Set());
    setFoundCells(new Set());
    setSelection(null);
  }, [theme, difficulty]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handlePointerDown = (row: number, col: number) => {
    setSelection({ startRow: row, startCol: col, endRow: row, endCol: col });
  };

  const handlePointerMove = (row: number, col: number) => {
    if (selection) {
      setSelection({ ...selection, endRow: row, endCol: col });
    }
  };

  const handlePointerUp = () => {
    if (!selection || !puzzle) {
      setSelection(null);
      return;
    }

    const cells = getCellsInSelection(selection);

    // Check if selection matches any unfound word
    for (const placedWord of puzzle.placedWords) {
      if (!foundWords.has(placedWord.word) && wordMatchesCells(placedWord, cells)) {
        const newFoundWords = new Set(foundWords);
        newFoundWords.add(placedWord.word);
        setFoundWords(newFoundWords);

        const newFoundCells = new Set(foundCells);
        placedWord.cells.forEach((c) => newFoundCells.add(`${c.row}-${c.col}`));
        setFoundCells(newFoundCells);
        break;
      }
    }

    setSelection(null);
  };

  const isWon = puzzle && foundWords.size === puzzle.placedWords.length;

  if (!puzzle) return null;

  const cellSize = Math.min(36, Math.floor((window.innerWidth - 64) / puzzle.size));
  const selectionCells = selection ? getCellsInSelection(selection) : [];
  const selectionSet = new Set(selectionCells.map((c) => `${c.row}-${c.col}`));

  return (
    <div className="relative">
      <HowToPlay game="word-search" />
      <div className="game-header">
        <span>{theme.name}</span>
        <span>
          {foundWords.size}/{puzzle.placedWords.length}
        </span>
      </div>

      {isWon && (
        <div className="success-message">
          <h2>🎉 All Words Found!</h2>
          <button onClick={startNewGame}>Play Again</button>
        </div>
      )}

      <div
        ref={gridRef}
        className="game-grid"
        style={{
          gridTemplateColumns: `repeat(${puzzle.size}, ${cellSize}px)`,
          touchAction: "none",
        }}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {puzzle.grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const isFound = foundCells.has(key);
            const isSelecting = selectionSet.has(key);

            return (
              <div
                key={key}
                className="game-cell"
                style={{
                  width: cellSize,
                  height: cellSize,
                  fontSize: cellSize * 0.5,
                  fontFamily: "monospace",
                  background: isFound ? "#000" : isSelecting ? "#ccc" : "#fff",
                  color: isFound ? "#fff" : "#000",
                }}
                onPointerDown={() => handlePointerDown(rowIndex, colIndex)}
                onPointerEnter={() => handlePointerMove(rowIndex, colIndex)}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>

      <div className="word-list">
        {puzzle.placedWords.map((pw) => (
          <span key={pw.word} className={`word-item ${foundWords.has(pw.word) ? "found" : ""}`}>
            {pw.word}
          </span>
        ))}
      </div>

      <div className="game-controls">
        <select
          value={theme.name}
          onChange={(e) => {
            const newTheme = THEMES.find((t) => t.name === e.target.value)!;
            setTheme(newTheme);
          }}
          style={{ padding: "12px", fontSize: "1rem", border: "2px solid #000" }}
        >
          {THEMES.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          style={{ padding: "12px", fontSize: "1rem", border: "2px solid #000" }}
        >
          <option value="easy">Easy (8×8)</option>
          <option value="medium">Medium (10×10)</option>
          <option value="hard">Hard (12×12)</option>
        </select>

        <button onClick={startNewGame}>🔄 New Game</button>
      </div>
    </div>
  );
}

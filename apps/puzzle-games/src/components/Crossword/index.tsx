import { useState, useEffect, useCallback, useRef } from "react";
import { PUZZLES } from "./puzzles";
import { CrosswordPuzzle, CellData, Clue } from "./types";
import {
  buildGrid,
  getCellsForClue,
  isPuzzleSolved,
  loadSavedGrid,
  saveGrid,
  findClueForCell,
  isClueCorrect,
} from "./utils";
import { usePlayer } from "../../contexts/PlayerContext";

export function Crossword() {
  const { currentPlayer, updatePlayerProgress } = usePlayer();
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle>(PUZZLES[0]);
  const [grid, setGrid] = useState<CellData[][]>(() => {
    const saved = loadSavedGrid(PUZZLES[0].id);
    return saved || buildGrid(PUZZLES[0]);
  });
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [showSuccess, setShowSuccess] = useState(false);
  const [startTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  // Load puzzle and grid when puzzle changes
  useEffect(() => {
    const newPuzzle = PUZZLES[puzzleIndex];
    setPuzzle(newPuzzle);
    const saved = loadSavedGrid(newPuzzle.id);
    const newGrid = saved || buildGrid(newPuzzle);
    setGrid(newGrid);
    setSelectedCell(null);
    setSelectedClue(null);
    setShowSuccess(false);
  }, [puzzleIndex]);

  // Save grid when it changes
  useEffect(() => {
    saveGrid(puzzle.id, grid);
  }, [grid, puzzle.id]);

  // Check for puzzle completion
  useEffect(() => {
    if (isPuzzleSolved(puzzle, grid)) {
      setShowSuccess(true);
      const timeMs = Date.now() - startTime;

      if (currentPlayer) {
        updatePlayerProgress((p) => {
          const newCompleted = p.crossword?.completed?.includes(puzzle.id)
            ? p.crossword.completed
            : [...(p.crossword?.completed || []), puzzle.id];

          const currentBest = p.crossword?.bestTimes?.[puzzle.id] ?? Infinity;
          const newBestTimes = {
            ...(p.crossword?.bestTimes || {}),
            [puzzle.id]: Math.min(currentBest, timeMs),
          };

          return {
            ...p,
            crossword: { completed: newCompleted, bestTimes: newBestTimes },
          };
        });
      }
    }
  }, [grid, puzzle, startTime, currentPlayer, updatePlayerProgress]);

  // Focus input when cell is selected
  useEffect(() => {
    if (selectedCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedCell]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const cell = grid[row][col];
      if (!cell.letter) return; // Black cell, ignore

      // If clicking the same cell, toggle direction
      if (selectedCell?.row === row && selectedCell?.col === col) {
        setDirection((prev) => (prev === "across" ? "down" : "across"));
      } else {
        setSelectedCell({ row, col });
      }

      // Find and set the clue for this cell
      const clue = findClueForCell(row, col, direction, puzzle);
      setSelectedClue(clue);
    },
    [selectedCell, grid, direction, puzzle]
  );

  const handleInput = useCallback(
    (value: string) => {
      if (!selectedCell) return;

      const uppercaseValue = value.toUpperCase();
      const letter = uppercaseValue.slice(-1); // Take last character

      if (letter && /^[A-Z]$/.test(letter)) {
        const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
        newGrid[selectedCell.row][selectedCell.col].userInput = letter;
        setGrid(newGrid);

        // Move to next cell in current direction
        moveToNextCell();
      }
    },
    [selectedCell, grid]
  );

  const moveToNextCell = useCallback(() => {
    if (!selectedCell || !selectedClue) return;

    const cells = getCellsForClue(selectedClue);
    const currentIndex = cells.findIndex(
      (c) => c.row === selectedCell.row && c.col === selectedCell.col
    );

    if (currentIndex >= 0 && currentIndex < cells.length - 1) {
      const nextCell = cells[currentIndex + 1];
      setSelectedCell(nextCell);
    }
  }, [selectedCell, selectedClue]);

  const handleBackspace = useCallback(() => {
    if (!selectedCell) return;

    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    newGrid[selectedCell.row][selectedCell.col].userInput = "";
    setGrid(newGrid);
  }, [selectedCell, grid]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        setDirection("across");
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setDirection("down");
      }
    },
    [handleBackspace]
  );

  const revealLetter = useCallback(() => {
    if (!selectedCell) return;

    const cell = grid[selectedCell.row][selectedCell.col];
    if (cell.letter) {
      const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
      newGrid[selectedCell.row][selectedCell.col].userInput = cell.letter;
      setGrid(newGrid);
      moveToNextCell();
    }
  }, [selectedCell, grid, moveToNextCell]);

  const checkLetter = useCallback(() => {
    if (!selectedCell) return;

    const cell = grid[selectedCell.row][selectedCell.col];
    if (cell.userInput && cell.userInput !== cell.letter) {
      // Clear incorrect letter
      const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
      newGrid[selectedCell.row][selectedCell.col].userInput = "";
      setGrid(newGrid);
    }
  }, [selectedCell, grid]);

  const resetPuzzle = useCallback(() => {
    const newGrid = buildGrid(puzzle);
    setGrid(newGrid);
    setShowSuccess(false);
    localStorage.removeItem(`crossword-grid-${puzzle.id}`);
  }, [puzzle]);

  const selectedCells = selectedClue ? getCellsForClue(selectedClue) : [];
  const selectedCellSet = new Set(selectedCells.map((c) => `${c.row}-${c.col}`));

  const acrossClues = puzzle.clues.filter((c) => c.direction === "across");
  const downClues = puzzle.clues.filter((c) => c.direction === "down");

  const cellSize = Math.min(40, Math.floor((window.innerWidth - 32) / puzzle.size));

  return (
    <div>
      <div className="game-header">
        <span>{puzzle.title}</span>
        <span className="badge">{puzzle.difficulty}</span>
      </div>

      {showSuccess && (
        <div className="success-message">
          <h2>🎉 Puzzle Complete!</h2>
          <p>Well done, word master!</p>
          <button onClick={() => setPuzzleIndex((puzzleIndex + 1) % PUZZLES.length)}>
            Next Puzzle
          </button>
        </div>
      )}

      {/* Crossword Grid */}
      <div
        className="crossword-grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${puzzle.size}, ${cellSize}px)`,
          gap: "1px",
          margin: "16px auto",
          width: "fit-content",
          background: "var(--fg)",
          border: "2px solid var(--fg)",
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const isBlack = !cell.letter;
            const isSelected =
              selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isHighlighted = selectedCellSet.has(key);
            const isCorrect = cell.userInput && cell.userInput === cell.letter;
            const isIncorrect = cell.userInput && cell.userInput !== cell.letter;

            return (
              <div
                key={key}
                className={`crossword-cell ${isBlack ? "black" : ""} ${isSelected ? "selected" : ""} ${isHighlighted ? "highlighted" : ""}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: isBlack
                    ? "var(--fg)"
                    : isSelected
                      ? "var(--cell-active)"
                      : isHighlighted
                        ? "#f0f0f0"
                        : "var(--bg)",
                  border: isBlack ? "none" : "1px solid var(--fg)",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: cellSize * 0.6,
                  fontWeight: "bold",
                  cursor: isBlack ? "default" : "pointer",
                  color: isCorrect ? "green" : isIncorrect ? "red" : "var(--fg)",
                }}
                onClick={() => !isBlack && handleCellClick(rowIndex, colIndex)}
              >
                {!isBlack && cell.number && (
                  <span
                    style={{
                      position: "absolute",
                      top: 1,
                      left: 2,
                      fontSize: cellSize * 0.3,
                      fontWeight: "normal",
                    }}
                  >
                    {cell.number}
                  </span>
                )}
                {!isBlack && cell.userInput}
              </div>
            );
          })
        )}
      </div>

      {/* Hidden input for mobile keyboard */}
      <input
        ref={inputRef}
        type="text"
        value=""
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
        }}
        aria-label="Crossword input"
      />

      {/* Current Clue Display */}
      {selectedClue && (
        <div
          style={{
            padding: "12px",
            background: "var(--cell-active)",
            border: "2px solid var(--fg)",
            margin: "16px 0",
            borderRadius: "4px",
          }}
        >
          <strong>
            {selectedClue.number} {selectedClue.direction.toUpperCase()}:
          </strong>{" "}
          {selectedClue.clue}
        </div>
      )}

      {/* Controls */}
      <div className="game-controls" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={checkLetter} disabled={!selectedCell}>
          ✓ Check
        </button>
        <button onClick={revealLetter} disabled={!selectedCell}>
          💡 Reveal
        </button>
        <button onClick={resetPuzzle}>🔄 Reset</button>
      </div>

      {/* Clues */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "24px" }}>
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "8px" }}>Across</h3>
          {acrossClues.map((clue) => {
            const isComplete = isClueCorrect(clue, grid);
            return (
              <div
                key={clue.number}
                style={{
                  marginBottom: "8px",
                  opacity: isComplete ? 0.5 : 1,
                  textDecoration: isComplete ? "line-through" : "none",
                }}
                onClick={() => {
                  setSelectedCell({ row: clue.row, col: clue.col });
                  setSelectedClue(clue);
                  setDirection("across");
                }}
              >
                <strong>{clue.number}.</strong> {clue.clue}
              </div>
            );
          })}
        </div>
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "8px" }}>Down</h3>
          {downClues.map((clue) => {
            const isComplete = isClueCorrect(clue, grid);
            return (
              <div
                key={clue.number}
                style={{
                  marginBottom: "8px",
                  opacity: isComplete ? 0.5 : 1,
                  textDecoration: isComplete ? "line-through" : "none",
                }}
                onClick={() => {
                  setSelectedCell({ row: clue.row, col: clue.col });
                  setSelectedClue(clue);
                  setDirection("down");
                }}
              >
                <strong>{clue.number}.</strong> {clue.clue}
              </div>
            );
          })}
        </div>
      </div>

      {/* Puzzle Selector */}
      <div style={{ marginTop: "24px" }}>
        <select
          value={puzzleIndex}
          onChange={(e) => setPuzzleIndex(Number(e.target.value))}
          style={{ width: "100%", padding: "12px", fontSize: "1rem" }}
        >
          {PUZZLES.map((p, i) => (
            <option key={p.id} value={i}>
              {p.title} ({p.difficulty})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

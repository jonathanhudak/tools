import React, { useState, useEffect, useCallback } from "react";
import { PUZZLES, Puzzle, calculateClues } from "./puzzles";
import { usePlayer } from "../../contexts/PlayerContext";

type CellState = "empty" | "filled" | "marked";

interface GameState {
  cells: CellState[][];
  size: number;
}

function createEmptyState(size: number): GameState {
  return {
    size,
    cells: Array(size)
      .fill(null)
      .map(() => Array(size).fill("empty")),
  };
}

function checkWin(gameState: GameState, puzzle: Puzzle): boolean {
  for (let row = 0; row < gameState.size; row++) {
    for (let col = 0; col < gameState.size; col++) {
      const expected = puzzle.grid[row][col] === 1;
      const actual = gameState.cells[row][col] === "filled";
      if (expected !== actual) return false;
    }
  }
  return true;
}

export function Nonogram() {
  const { currentPlayer, updatePlayerProgress } = usePlayer();
  
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(() => {
    const saved = localStorage.getItem("nonogram-puzzle");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [won, setWon] = useState(false);
  const [fillMode, setFillMode] = useState<"fill" | "mark">("fill");

  const puzzle = PUZZLES[currentPuzzleIndex];
  const { rowClues, colClues } = calculateClues(puzzle.grid);

  const initPuzzle = useCallback((index: number) => {
    const p = PUZZLES[index];
    setGameState(createEmptyState(p.size));
    setWon(false);
  }, []);

  useEffect(() => {
    initPuzzle(currentPuzzleIndex);
  }, [currentPuzzleIndex, initPuzzle]);

  const handleWin = useCallback(() => {
    setWon(true);
    localStorage.setItem(
      "nonogram-puzzle",
      String(Math.min(currentPuzzleIndex + 1, PUZZLES.length - 1))
    );
    
    // Update player progress
    if (currentPlayer) {
      const puzzleId = `puzzle-${puzzle.id}`;
      updatePlayerProgress((p) => ({
        ...p,
        nonogram: {
          completed: p.nonogram.completed.includes(puzzleId)
            ? p.nonogram.completed
            : [...p.nonogram.completed, puzzleId],
        },
      }));
    }
  }, [currentPuzzleIndex, currentPlayer, puzzle.id, updatePlayerProgress]);

  const handleCellClick = (row: number, col: number) => {
    if (!gameState || won) return;

    const newCells = gameState.cells.map((r) => [...r]);
    const current = newCells[row][col];

    if (fillMode === "fill") {
      // Cycle: empty → filled → empty
      newCells[row][col] = current === "filled" ? "empty" : "filled";
    } else {
      // Cycle: empty → marked → empty
      newCells[row][col] = current === "marked" ? "empty" : "marked";
    }

    const newState = { ...gameState, cells: newCells };
    setGameState(newState);

    if (checkWin(newState, puzzle)) {
      handleWin();
    }
  };

  if (!gameState) return null;

  const maxRowClues = Math.max(...rowClues.map((r) => r.length));
  const maxColClues = Math.max(...colClues.map((c) => c.length));
  const cellSize = Math.min(32, Math.floor((window.innerWidth - 64 - maxRowClues * 24) / puzzle.size));
  const clueSize = Math.min(24, cellSize);
  const completedPuzzles = currentPlayer?.nonogram.completed ?? [];

  return (
    <div>
      <div className="game-header">
        <span>
          {puzzle.id}. {puzzle.name}
        </span>
        <span>{puzzle.size}×{puzzle.size}</span>
      </div>

      {won && (
        <div className="success-message">
          <h2>🎉 Puzzle Complete!</h2>
          <p>You revealed: {puzzle.name}</p>
          {currentPuzzleIndex < PUZZLES.length - 1 && (
            <button onClick={() => setCurrentPuzzleIndex(currentPuzzleIndex + 1)}>
              Next Puzzle →
            </button>
          )}
        </div>
      )}

      {/* Mode toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setFillMode("fill")}
          style={{
            background: fillMode === "fill" ? "var(--fg)" : "var(--bg)",
            color: fillMode === "fill" ? "var(--bg)" : "var(--fg)",
          }}
        >
          ■ Fill
        </button>
        <button
          onClick={() => setFillMode("mark")}
          style={{
            background: fillMode === "mark" ? "var(--fg)" : "var(--bg)",
            color: fillMode === "mark" ? "var(--bg)" : "var(--fg)",
          }}
        >
          ✕ Mark
        </button>
      </div>

      {/* Grid with clues */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${maxRowClues * clueSize}px repeat(${puzzle.size}, ${cellSize}px)`,
          gridTemplateRows: `${maxColClues * clueSize}px repeat(${puzzle.size}, ${cellSize}px)`,
          gap: 1,
          background: "var(--border)",
          border: "2px solid var(--border)",
          margin: "0 auto",
          width: "fit-content",
        }}
      >
        {/* Empty corner */}
        <div style={{ background: "var(--bg)" }} />

        {/* Column clues */}
        {colClues.map((clues, col) => (
          <div
            key={`col-${col}`}
            style={{
              background: "var(--bg)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              fontSize: clueSize * 0.5,
              padding: 2,
            }}
          >
            {clues.map((clue, i) => (
              <div key={i}>{clue}</div>
            ))}
          </div>
        ))}

        {/* Rows with clues and cells */}
        {gameState.cells.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {/* Row clues */}
            <div
              key={`row-${rowIndex}`}
              style={{
                background: "var(--bg)",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 4,
                fontSize: clueSize * 0.5,
                padding: "0 4px",
              }}
            >
              {rowClues[rowIndex].map((clue, i) => (
                <span key={i}>{clue}</span>
              ))}
            </div>

            {/* Cells */}
            {row.map((cell, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: cell === "filled" ? "var(--cell-found)" : "var(--cell-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: cellSize * 0.6,
                  color: "var(--fg)",
                }}
              >
                {cell === "marked" && "✕"}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="game-controls">
        <button onClick={() => initPuzzle(currentPuzzleIndex)}>🔄 Reset</button>
        <select
          value={currentPuzzleIndex}
          onChange={(e) => setCurrentPuzzleIndex(parseInt(e.target.value))}
          style={{ padding: "12px", fontSize: "1rem" }}
        >
          {PUZZLES.map((p, i) => (
            <option key={p.id} value={i}>
              {completedPuzzles.includes(`puzzle-${p.id}`) ? "✓ " : ""}
              {p.id}. {p.name} ({p.size}×{p.size})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

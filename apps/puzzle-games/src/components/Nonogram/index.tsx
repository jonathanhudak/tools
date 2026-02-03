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
  const { currentPlayer, updatePlayer } = usePlayer();
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
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
      setWon(true);
      if (currentPlayer) {
        const puzzleId = `${puzzle.id}`;
        const completed = currentPlayer.nonogram.completed;
        if (!completed.includes(puzzleId)) {
          updatePlayer({
            nonogram: {
              completed: [...completed, puzzleId],
            },
          });
        }
      }
    }
  };

  if (!gameState) return null;

  const maxRowClues = Math.max(...rowClues.map((r) => r.length));
  const maxColClues = Math.max(...colClues.map((c) => c.length));
  const cellSize = Math.min(32, Math.floor((window.innerWidth - 64 - maxRowClues * 24) / puzzle.size));
  const clueSize = Math.min(24, cellSize);

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
            background: fillMode === "fill" ? "#000" : "#fff",
            color: fillMode === "fill" ? "#fff" : "#000",
          }}
        >
          ■ Fill
        </button>
        <button
          onClick={() => setFillMode("mark")}
          style={{
            background: fillMode === "mark" ? "#000" : "#fff",
            color: fillMode === "mark" ? "#fff" : "#000",
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
          background: "#000",
          border: "2px solid #000",
          margin: "0 auto",
          width: "fit-content",
        }}
      >
        {/* Empty corner */}
        <div style={{ background: "#fff" }} />

        {/* Column clues */}
        {colClues.map((clues, col) => (
          <div
            key={`col-${col}`}
            style={{
              background: "#fff",
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
                background: "#fff",
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
                  background: cell === "filled" ? "#000" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: cellSize * 0.6,
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
          style={{ padding: "12px", fontSize: "1rem", border: "2px solid #000" }}
        >
          {PUZZLES.map((p, i) => (
            <option key={p.id} value={i}>
              {p.id}. {p.name} ({p.size}×{p.size})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { LEVELS, Level } from "./levels";
import { usePlayer } from "../../contexts/PlayerContext";

type Cell = "wall" | "floor" | "target" | "box" | "boxOnTarget" | "player" | "playerOnTarget";
type Direction = "up" | "down" | "left" | "right";

interface Position {
  row: number;
  col: number;
}

interface GameState {
  grid: Cell[][];
  playerPos: Position;
  moves: number;
  history: { grid: Cell[][]; playerPos: Position }[];
}

function parseLevel(level: Level): { grid: Cell[][]; playerPos: Position } {
  const lines = level.map.split("\n");
  const maxWidth = Math.max(...lines.map((l) => l.length));
  const grid: Cell[][] = [];
  let playerPos: Position = { row: 0, col: 0 };

  for (let row = 0; row < lines.length; row++) {
    const line = lines[row].padEnd(maxWidth, " ");
    const gridRow: Cell[] = [];

    for (let col = 0; col < line.length; col++) {
      const char = line[col];
      switch (char) {
        case "#":
          gridRow.push("wall");
          break;
        case " ":
          gridRow.push("floor");
          break;
        case ".":
          gridRow.push("target");
          break;
        case "$":
          gridRow.push("box");
          break;
        case "*":
          gridRow.push("boxOnTarget");
          break;
        case "@":
          gridRow.push("floor");
          playerPos = { row, col };
          break;
        case "+":
          gridRow.push("target");
          playerPos = { row, col };
          break;
        default:
          gridRow.push("floor");
      }
    }
    grid.push(gridRow);
  }

  return { grid, playerPos };
}

function cloneGrid(grid: Cell[][]): Cell[][] {
  return grid.map((row) => [...row]);
}

function checkWin(grid: Cell[][]): boolean {
  for (const row of grid) {
    for (const cell of row) {
      if (cell === "target") return false; // Uncovered target
      if (cell === "box") return false; // Box not on target
    }
  }
  return true;
}

export function Sokoban() {
  const { currentPlayer, updatePlayerProgress } = usePlayer();
  
  const [currentLevelIndex, setCurrentLevelIndex] = useState(() => {
    const saved = localStorage.getItem("sokoban-level");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [won, setWon] = useState(false);

  const initLevel = useCallback((levelIndex: number) => {
    const level = LEVELS[levelIndex];
    const { grid, playerPos } = parseLevel(level);
    setGameState({
      grid,
      playerPos,
      moves: 0,
      history: [],
    });
    setWon(false);
  }, []);

  useEffect(() => {
    initLevel(currentLevelIndex);
  }, [currentLevelIndex, initLevel]);

  const handleWin = useCallback(() => {
    setWon(true);
    localStorage.setItem("sokoban-level", String(Math.min(currentLevelIndex + 1, LEVELS.length - 1)));
    
    // Update player progress
    if (currentPlayer) {
      const levelId = LEVELS[currentLevelIndex].id;
      updatePlayerProgress((p) => ({
        ...p,
        sokoban: {
          completedLevels: p.sokoban.completedLevels.includes(levelId)
            ? p.sokoban.completedLevels
            : [...p.sokoban.completedLevels, levelId],
        },
      }));
    }
  }, [currentLevelIndex, currentPlayer, updatePlayerProgress]);

  const move = useCallback(
    (direction: Direction) => {
      if (!gameState || won) return;

      const { grid, playerPos, moves, history } = gameState;
      const newGrid = cloneGrid(grid);

      const delta: Record<Direction, Position> = {
        up: { row: -1, col: 0 },
        down: { row: 1, col: 0 },
        left: { row: 0, col: -1 },
        right: { row: 0, col: 1 },
      };

      const d = delta[direction];
      const newRow = playerPos.row + d.row;
      const newCol = playerPos.col + d.col;

      if (newRow < 0 || newRow >= newGrid.length) return;
      if (newCol < 0 || newCol >= newGrid[0].length) return;

      const targetCell = newGrid[newRow][newCol];

      if (targetCell === "wall") return;

      if (targetCell === "box" || targetCell === "boxOnTarget") {
        // Try to push box
        const pushRow = newRow + d.row;
        const pushCol = newCol + d.col;

        if (pushRow < 0 || pushRow >= newGrid.length) return;
        if (pushCol < 0 || pushCol >= newGrid[0].length) return;

        const pushTarget = newGrid[pushRow][pushCol];
        if (pushTarget === "wall" || pushTarget === "box" || pushTarget === "boxOnTarget") {
          return;
        }

        // Push the box
        newGrid[pushRow][pushCol] = pushTarget === "target" ? "boxOnTarget" : "box";
        newGrid[newRow][newCol] = targetCell === "boxOnTarget" ? "target" : "floor";
      }

      // Move player
      const newState = {
        grid: newGrid,
        playerPos: { row: newRow, col: newCol },
        moves: moves + 1,
        history: [...history, { grid: cloneGrid(grid), playerPos }],
      };
      setGameState(newState);

      if (checkWin(newGrid)) {
        handleWin();
      }
    },
    [gameState, won, handleWin]
  );

  const undo = useCallback(() => {
    if (!gameState || gameState.history.length === 0) return;

    const newHistory = [...gameState.history];
    const previousState = newHistory.pop()!;

    setGameState({
      grid: previousState.grid,
      playerPos: previousState.playerPos,
      moves: gameState.moves - 1,
      history: newHistory,
    });
  }, [gameState]);

  const handleCellClick = (row: number, col: number) => {
    if (!gameState || won) return;

    const { playerPos } = gameState;
    const dRow = row - playerPos.row;
    const dCol = col - playerPos.col;

    // Only allow adjacent cell clicks
    if (Math.abs(dRow) + Math.abs(dCol) !== 1) return;

    if (dRow === -1) move("up");
    else if (dRow === 1) move("down");
    else if (dCol === -1) move("left");
    else if (dCol === 1) move("right");
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
          move("up");
          break;
        case "ArrowDown":
        case "s":
          move("down");
          break;
        case "ArrowLeft":
        case "a":
          move("left");
          break;
        case "ArrowRight":
        case "d":
          move("right");
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) undo();
          break;
        case "u":
          undo();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move, undo]);

  if (!gameState) return null;

  const level = LEVELS[currentLevelIndex];
  const cellSize = Math.min(44, Math.floor((window.innerWidth - 64) / gameState.grid[0].length));
  const completedLevels = currentPlayer?.sokoban.completedLevels ?? [];

  return (
    <div>
      <div className="game-header">
        <span>Level {level.id}: {level.name}</span>
        <span>Moves: {gameState.moves}</span>
      </div>

      {won && (
        <div className="success-message">
          <h2>🎉 Level Complete!</h2>
          <p>Completed in {gameState.moves} moves</p>
          {currentLevelIndex < LEVELS.length - 1 && (
            <button onClick={() => setCurrentLevelIndex(currentLevelIndex + 1)}>
              Next Level →
            </button>
          )}
        </div>
      )}

      <div
        className="game-grid"
        style={{
          gridTemplateColumns: `repeat(${gameState.grid[0].length}, ${cellSize}px)`,
        }}
      >
        {gameState.grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isPlayer =
              rowIndex === gameState.playerPos.row && colIndex === gameState.playerPos.col;

            let content = "";
            const isWall = cell === "wall";

            if (isPlayer) {
              content = "😊";
            } else if (cell === "box") {
              content = "📦";
            } else if (cell === "boxOnTarget") {
              content = "✅";
            } else if (cell === "target") {
              content = "○";
            }

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`game-cell ${isWall ? "game-cell-wall" : ""}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: isWall ? "var(--fg)" : "var(--cell-bg)",
                  fontSize: cellSize * 0.6,
                }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {content}
              </div>
            );
          })
        )}
      </div>

      <div className="game-controls">
        <button onClick={undo} disabled={gameState.history.length === 0}>
          ↩️ Undo
        </button>
        <button onClick={() => initLevel(currentLevelIndex)}>🔄 Reset</button>
        <select
          value={currentLevelIndex}
          onChange={(e) => setCurrentLevelIndex(parseInt(e.target.value))}
          style={{ padding: "12px", fontSize: "1rem" }}
        >
          {LEVELS.map((l, i) => (
            <option key={l.id} value={i}>
              {completedLevels.includes(l.id) ? "✓ " : ""}Level {l.id}: {l.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/**
 * Grid Component
 * Displays the word search grid with touch/drag selection
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { GridData, PlacedWord } from '../lib/generator';

interface GridProps {
  gridData: GridData;
  onWordFound: (word: string) => void;
  foundWords: Set<string>;
}

interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

interface CellPosition {
  row: number;
  col: number;
}

export function Grid({ gridData, onWordFound, foundWords }: GridProps): JSX.Element {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellPosition = useCallback((clientX: number, clientY: number): CellPosition | null => {
    if (!gridRef.current) return null;

    const rect = gridRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const cellSize = rect.width / gridData.size;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < gridData.size && col >= 0 && col < gridData.size) {
      return { row, col };
    }

    return null;
  }, [gridData.size]);

  const handleStart = useCallback((clientX: number, clientY: number): void => {
    const pos = getCellPosition(clientX, clientY);
    if (pos) {
      setIsDragging(true);
      setSelection({
        startRow: pos.row,
        startCol: pos.col,
        endRow: pos.row,
        endCol: pos.col,
      });
    }
  }, [getCellPosition]);

  const handleMove = useCallback((clientX: number, clientY: number): void => {
    if (!isDragging || !selection) return;

    const pos = getCellPosition(clientX, clientY);
    if (pos) {
      setSelection({
        ...selection,
        endRow: pos.row,
        endCol: pos.col,
      });
    }
  }, [isDragging, selection, getCellPosition]);

  const getSelectedWord = useCallback((sel: Selection): string => {
    const { startRow, startCol, endRow, endCol } = sel;
    const dr = Math.sign(endRow - startRow);
    const dc = Math.sign(endCol - startCol);
    const length = Math.max(Math.abs(endRow - startRow), Math.abs(endCol - startCol)) + 1;

    let word = '';
    for (let i = 0; i < length; i++) {
      const r = startRow + dr * i;
      const c = startCol + dc * i;
      if (r >= 0 && r < gridData.size && c >= 0 && c < gridData.size) {
        word += gridData.grid[r][c];
      }
    }

    return word;
  }, [gridData]);

  const handleEnd = useCallback((): void => {
    if (selection) {
      const word = getSelectedWord(selection);

      // Check if word matches any placed word
      const matchedWord = gridData.placedWords.find((placed) => placed.word === word);

      if (matchedWord && !foundWords.has(matchedWord.word)) {
        onWordFound(matchedWord.word);
      }
    }

    setIsDragging(false);
    setSelection(null);
  }, [selection, getSelectedWord, gridData.placedWords, foundWords, onWordFound]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent): void => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = (): void => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent): void => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent): void => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (): void => {
    handleEnd();
  };

  // Check if a cell is part of a found word
  const isCellInFoundWord = useCallback((row: number, col: number): boolean => {
    for (const placed of gridData.placedWords) {
      if (!foundWords.has(placed.word)) continue;

      const { startRow, startCol, direction, word } = placed;
      const dr = direction.includes('vertical') ? (direction.includes('back') ? -1 : 1) : 0;
      const dc = direction.includes('horizontal') ? (direction.includes('back') ? -1 : 1) : direction.includes('diagonal') ? (direction.includes('back') ? -1 : 1) : 0;

      for (let i = 0; i < word.length; i++) {
        const r = startRow + dr * i;
        const c = startCol + dc * i;
        if (r === row && c === col) {
          return true;
        }
      }
    }
    return false;
  }, [gridData.placedWords, foundWords]);

  // Check if a cell is in current selection
  const isCellInSelection = useCallback((row: number, col: number): boolean => {
    if (!selection) return false;

    const { startRow, startCol, endRow, endCol } = selection;
    const dr = Math.sign(endRow - startRow);
    const dc = Math.sign(endCol - startCol);
    const length = Math.max(Math.abs(endRow - startRow), Math.abs(endCol - startCol)) + 1;

    for (let i = 0; i < length; i++) {
      const r = startRow + dr * i;
      const c = startCol + dc * i;
      if (r === row && c === col) {
        return true;
      }
    }

    return false;
  }, [selection]);

  // Handle mouse leave
  useEffect(() => {
    const handleMouseLeave = (): void => {
      if (isDragging) {
        handleEnd();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleEnd]);

  return (
    <div
      ref={gridRef}
      className="grid-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridData.size}, 1fr)`,
        gap: '2px',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {gridData.grid.map((row, rowIndex) =>
        row.map((letter, colIndex) => {
          const isFound = isCellInFoundWord(rowIndex, colIndex);
          const isSelected = isCellInSelection(rowIndex, colIndex);

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`grid-cell ${isFound ? 'found' : ''} ${isSelected ? 'selected' : ''}`}
              style={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(16px, 4vw, 28px)',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                border: '2px solid black',
                backgroundColor: isFound ? 'black' : isSelected ? '#ccc' : 'white',
                color: isFound ? 'white' : 'black',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
              }}
            >
              {letter}
            </div>
          );
        })
      )}
    </div>
  );
}

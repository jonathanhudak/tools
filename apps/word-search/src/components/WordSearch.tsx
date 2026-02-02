/**
 * WordSearch Component
 * Main component that orchestrates the word search game
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Grid } from './Grid';
import { WordList } from './WordList';
import { generateWordSearch, type GridData, type DifficultyLevel } from '../lib/generator';
import { themes } from '../lib/themes';

export function WordSearch(): JSX.Element {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [selectedTheme, setSelectedTheme] = useState<string>('Animals');
  const [customWords, setCustomWords] = useState<string>('');
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [showTimer, setShowTimer] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isVictory, setIsVictory] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!showTimer || !startTime || isVictory) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimer, startTime, isVictory]);

  // Generate new puzzle
  const generatePuzzle = useCallback(() => {
    let words: string[];

    if (selectedTheme === 'Custom') {
      words = customWords
        .split(/[,\n]/)
        .map((w) => w.trim().toUpperCase())
        .filter((w) => w.length > 0);

      if (words.length === 0) {
        alert('Please enter at least one word for custom puzzle');
        return;
      }
    } else {
      const theme = themes.find((t) => t.name === selectedTheme);
      if (!theme) return;
      words = theme.words;
    }

    const newGridData = generateWordSearch({ words, difficulty });
    setGridData(newGridData);
    setFoundWords(new Set());
    setIsVictory(false);

    if (showTimer) {
      setStartTime(Date.now());
      setElapsedTime(0);
    }
  }, [difficulty, selectedTheme, customWords, showTimer]);

  // Handle word found
  const handleWordFound = useCallback((word: string) => {
    setFoundWords((prev) => {
      const newSet = new Set(prev);
      newSet.add(word);
      return newSet;
    });
  }, []);

  // Check for victory
  useEffect(() => {
    if (gridData && foundWords.size === gridData.placedWords.length && foundWords.size > 0) {
      setIsVictory(true);
    }
  }, [foundWords, gridData]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '3px solid black', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Word Search Generator</h1>
        <p style={{ fontSize: '1rem', color: '#666' }}>Touch-optimized puzzle game for Daylight Computer</p>
      </header>

      {/* Configuration Panel */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '2px solid black', backgroundColor: 'white' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Configure Puzzle</h2>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Difficulty */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Difficulty:</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '2px solid black',
                    backgroundColor: difficulty === level ? 'black' : 'white',
                    color: difficulty === level ? 'white' : 'black',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Theme:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
              {[...themes.map((t) => t.name), 'Custom'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  style={{
                    padding: '0.75rem',
                    border: '2px solid black',
                    backgroundColor: selectedTheme === theme ? 'black' : 'white',
                    color: selectedTheme === theme ? 'white' : 'black',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Words Input */}
          {selectedTheme === 'Custom' && (
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Custom Words (comma or newline separated):
              </label>
              <textarea
                value={customWords}
                onChange={(e) => setCustomWords(e.target.value)}
                placeholder="Enter words separated by commas or new lines"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.75rem',
                  border: '2px solid black',
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                }}
              />
            </div>
          )}

          {/* Timer Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="timer"
              checked={showTimer}
              onChange={(e) => setShowTimer(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label htmlFor="timer" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Show Timer</label>
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePuzzle}
            style={{
              padding: '1rem',
              border: '3px solid black',
              backgroundColor: 'black',
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Generate New Puzzle
          </button>
        </div>
      </div>

      {/* Game Area */}
      {gridData && (
        <div>
          {/* Status Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            padding: '1rem',
            border: '2px solid black',
            backgroundColor: 'white',
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
              Found: {foundWords.size} / {gridData.placedWords.length}
            </div>
            {showTimer && (
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem', fontFamily: 'monospace' }}>
                Time: {formatTime(elapsedTime)}
              </div>
            )}
          </div>

          {/* Victory Message */}
          {isVictory && (
            <div style={{
              padding: '2rem',
              border: '3px solid black',
              backgroundColor: 'black',
              color: 'white',
              textAlign: 'center',
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}>
              🎉 Congratulations! You found all words!
              {showTimer && ` Time: ${formatTime(elapsedTime)}`}
            </div>
          )}

          {/* Grid and Word List */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '2fr 1fr' : '1fr',
            gap: '2rem',
          }}>
            <div>
              <Grid gridData={gridData} onWordFound={handleWordFound} foundWords={foundWords} />
            </div>
            <div>
              <WordList words={gridData.placedWords.map((w) => w.word)} foundWords={foundWords} />
            </div>
          </div>
        </div>
      )}

      {/* Initial Message */}
      {!gridData && (
        <div style={{
          padding: '3rem',
          border: '2px solid black',
          textAlign: 'center',
          backgroundColor: 'white',
        }}>
          <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            Click "Generate New Puzzle" to start playing!
          </p>
          <p style={{ color: '#666' }}>
            Drag to select words horizontally, vertically, or diagonally.
          </p>
        </div>
      )}
    </div>
  );
}

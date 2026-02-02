/**
 * WordList Component
 * Displays the list of words to find with strikethrough for found words
 */

import React from 'react';

interface WordListProps {
  words: string[];
  foundWords: Set<string>;
  onWordHint?: (word: string) => void;
}

export function WordList({ words, foundWords, onWordHint }: WordListProps): JSX.Element {
  return (
    <div className="word-list">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Words to Find</h2>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.5rem' }}>
        {words.map((word) => {
          const isFound = foundWords.has(word);
          return (
            <li
              key={word}
              onClick={() => !isFound && onWordHint && onWordHint(word)}
              style={{
                fontSize: '1.125rem',
                fontFamily: 'monospace',
                textDecoration: isFound ? 'line-through' : 'none',
                opacity: isFound ? 0.5 : 1,
                cursor: !isFound && onWordHint ? 'pointer' : 'default',
                padding: '0.5rem',
                border: '1px solid black',
                backgroundColor: 'white',
                transition: 'all 0.2s ease',
              }}
            >
              {word}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

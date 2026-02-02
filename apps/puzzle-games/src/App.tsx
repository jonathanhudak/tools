import { useState } from 'react';
import { SokobanGame } from './components/SokobanGame';
import { LevelSelector } from './components/LevelSelector';
import { LEVELS } from './utils/levels';
import type { Level } from './types/sokoban';

export default function App() {
  const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS[0]);
  const [showLevelSelector, setShowLevelSelector] = useState(true);

  const handleSelectLevel = (level: Level): void => {
    setCurrentLevel(level);
    setShowLevelSelector(false);
  };

  const handleLevelComplete = (): void => {
    // Automatically show level selector after completion
    setTimeout(() => {
      setShowLevelSelector(true);
    }, 2000);
  };

  const handleBackToLevels = (): void => {
    setShowLevelSelector(true);
  };

  if (showLevelSelector) {
    return (
      <LevelSelector
        levels={LEVELS}
        currentLevelId={currentLevel.id}
        onSelectLevel={handleSelectLevel}
      />
    );
  }

  return (
    <div>
      <div className="fixed top-4 left-4 z-10">
        <button
          type="button"
          onClick={handleBackToLevels}
          className="px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          ← Levels
        </button>
      </div>

      <SokobanGame level={currentLevel} onLevelComplete={handleLevelComplete} />
    </div>
  );
}

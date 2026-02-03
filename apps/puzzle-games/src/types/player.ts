export interface PlayerData {
  name: string;
  sokoban: {
    completedLevels: number[];
    currentLevel: number;
  };
  wordSearch: {
    completed: string[];
    bestTimes: Record<string, number>;
  };
  nonogram: {
    completed: string[];
  };
}

export interface PlayersState {
  players: PlayerData[];
  currentPlayerId: string | null;
}

export const STORAGE_KEY = 'puzzle-games-players';

export function createDefaultPlayer(name: string): PlayerData {
  return {
    name,
    sokoban: {
      completedLevels: [],
      currentLevel: 0,
    },
    wordSearch: {
      completed: [],
      bestTimes: {},
    },
    nonogram: {
      completed: [],
    },
  };
}

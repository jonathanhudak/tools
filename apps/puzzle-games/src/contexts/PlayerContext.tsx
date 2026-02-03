import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface PlayerData {
  name: string;
  sokoban: { completedLevels: number[] };
  wordSearch: { completed: string[]; bestTimes: Record<string, number> };
  nonogram: { completed: string[] };
  crossword?: { completed: string[]; bestTimes: Record<string, number> };
}

interface PlayerContextType {
  currentPlayer: PlayerData | null;
  players: PlayerData[];
  selectPlayer: (name: string) => void;
  addPlayer: (name: string) => void;
  updatePlayerProgress: (updater: (player: PlayerData) => PlayerData) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const STORAGE_KEY = "puzzle-games-players";
const CURRENT_PLAYER_KEY = "puzzle-games-current-player";

function createNewPlayer(name: string): PlayerData {
  return {
    name,
    sokoban: { completedLevels: [] },
    wordSearch: { completed: [], bestTimes: {} },
    nonogram: { completed: [] },
    crossword: { completed: [], bestTimes: {} },
  };
}

function loadPlayers(): PlayerData[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function savePlayers(players: PlayerData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<PlayerData[]>(() => loadPlayers());
  const [currentPlayerName, setCurrentPlayerName] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(CURRENT_PLAYER_KEY);
  });

  const currentPlayer = players.find((p) => p.name === currentPlayerName) ?? null;

  useEffect(() => {
    savePlayers(players);
  }, [players]);

  useEffect(() => {
    if (currentPlayerName) {
      localStorage.setItem(CURRENT_PLAYER_KEY, currentPlayerName);
    }
  }, [currentPlayerName]);

  const selectPlayer = (name: string) => {
    setCurrentPlayerName(name);
  };

  const addPlayer = (name: string) => {
    if (players.some((p) => p.name === name)) return;
    const newPlayer = createNewPlayer(name);
    setPlayers([...players, newPlayer]);
    setCurrentPlayerName(name);
  };

  const updatePlayerProgress = (updater: (player: PlayerData) => PlayerData) => {
    if (!currentPlayer) return;
    setPlayers(
      players.map((p) => (p.name === currentPlayer.name ? updater(p) : p))
    );
  };

  return (
    <PlayerContext.Provider
      value={{ currentPlayer, players, selectPlayer, addPlayer, updatePlayerProgress }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}

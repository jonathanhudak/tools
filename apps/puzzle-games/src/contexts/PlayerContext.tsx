import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { PlayerData } from '../types/player';
import {
  loadPlayersState,
  addPlayer,
  getCurrentPlayer,
  updatePlayerData,
  setCurrentPlayer as setCurrentPlayerInStorage,
  getAllPlayers,
} from '../services/player-storage';

interface PlayerContextType {
  currentPlayer: PlayerData | null;
  allPlayers: PlayerData[];
  addNewPlayer: (name: string) => void;
  switchPlayer: (playerId: string) => void;
  updatePlayer: (updates: Partial<PlayerData>) => void;
  isPlayerSelected: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useState<PlayerData | null>(null);
  const [allPlayers, setAllPlayers] = useState<PlayerData[]>([]);

  useEffect(() => {
    const state = loadPlayersState();
    setAllPlayers(state.players);
    const player = getCurrentPlayer();
    setCurrentPlayer(player);
  }, []);

  const addNewPlayer = (name: string): void => {
    const newPlayer = addPlayer(name);
    setCurrentPlayer(newPlayer);
    setAllPlayers(getAllPlayers());
  };

  const switchPlayer = (playerId: string): void => {
    setCurrentPlayerInStorage(playerId);
    const player = getCurrentPlayer();
    setCurrentPlayer(player);
  };

  const updatePlayer = (updates: Partial<PlayerData>): void => {
    if (!currentPlayer) {
      console.error('No current player to update');
      return;
    }

    updatePlayerData(currentPlayer.name, updates);
    const updatedPlayer = getCurrentPlayer();
    setCurrentPlayer(updatedPlayer);
    setAllPlayers(getAllPlayers());
  };

  return (
    <PlayerContext.Provider
      value={{
        currentPlayer,
        allPlayers,
        addNewPlayer,
        switchPlayer,
        updatePlayer,
        isPlayerSelected: currentPlayer !== null,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextType {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

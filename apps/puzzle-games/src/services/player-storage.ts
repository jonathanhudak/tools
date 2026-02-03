import type { PlayerData, PlayersState } from '../types/player';
import { STORAGE_KEY, createDefaultPlayer } from '../types/player';

export function loadPlayersState(): PlayersState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { players: [], currentPlayerId: null };
    }
    const parsed = JSON.parse(stored) as PlayersState;
    return parsed;
  } catch (error) {
    console.error('Failed to load players state:', error);
    return { players: [], currentPlayerId: null };
  }
}

export function savePlayersState(state: PlayersState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save players state:', error);
  }
}

export function addPlayer(name: string): PlayerData {
  const state = loadPlayersState();
  const newPlayer = createDefaultPlayer(name);

  state.players.push(newPlayer);
  state.currentPlayerId = name;

  savePlayersState(state);
  return newPlayer;
}

export function getCurrentPlayer(): PlayerData | null {
  const state = loadPlayersState();
  if (!state.currentPlayerId) {
    return null;
  }
  return state.players.find(p => p.name === state.currentPlayerId) ?? null;
}

export function updatePlayerData(playerId: string, updates: Partial<PlayerData>): void {
  const state = loadPlayersState();
  const playerIndex = state.players.findIndex(p => p.name === playerId);

  if (playerIndex === -1) {
    console.error('Player not found:', playerId);
    return;
  }

  state.players[playerIndex] = {
    ...state.players[playerIndex],
    ...updates,
  };

  savePlayersState(state);
}

export function setCurrentPlayer(playerId: string): void {
  const state = loadPlayersState();
  if (!state.players.find(p => p.name === playerId)) {
    console.error('Player not found:', playerId);
    return;
  }

  state.currentPlayerId = playerId;
  savePlayersState(state);
}

export function getAllPlayers(): PlayerData[] {
  const state = loadPlayersState();
  return state.players;
}

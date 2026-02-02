export type CellType = 'wall' | 'floor' | 'box' | 'target' | 'player' | 'box-on-target' | 'player-on-target';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  grid: CellType[][];
  playerPos: Position;
  moves: number;
  levelComplete: boolean;
}

export interface Level {
  id: number;
  name: string;
  grid: string[];
}

export interface GameHistory {
  state: GameState;
  timestamp: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

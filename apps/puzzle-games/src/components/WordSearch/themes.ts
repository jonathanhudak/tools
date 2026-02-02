export interface Theme {
  name: string;
  words: string[];
}

export const THEMES: Theme[] = [
  {
    name: "Animals",
    words: ["DOG", "CAT", "BIRD", "FISH", "BEAR", "LION", "WOLF", "DEER", "FROG", "DUCK"],
  },
  {
    name: "Space",
    words: ["STAR", "MOON", "SUN", "MARS", "COMET", "ORBIT", "ALIEN", "ROCKET", "PLANET", "GALAXY"],
  },
  {
    name: "Dinosaurs",
    words: ["TREX", "RAPTOR", "FOSSIL", "HORN", "CLAW", "TAIL", "BONE", "GIANT", "TEETH", "ROAR"],
  },
  {
    name: "Food",
    words: ["PIZZA", "APPLE", "BREAD", "CANDY", "JUICE", "PASTA", "SALAD", "TACO", "FRUIT", "CAKE"],
  },
  {
    name: "Nature",
    words: ["TREE", "FLOWER", "RIVER", "ROCK", "GRASS", "LEAF", "CLOUD", "RAIN", "SNOW", "WIND"],
  },
];

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_CONFIG: Record<Difficulty, { size: number; directions: number[][] }> = {
  easy: {
    size: 8,
    directions: [
      [0, 1],  // horizontal
      [1, 0],  // vertical
    ],
  },
  medium: {
    size: 10,
    directions: [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [1, -1],  // diagonal down-left
    ],
  },
  hard: {
    size: 12,
    directions: [
      [0, 1],   // horizontal
      [0, -1],  // horizontal backwards
      [1, 0],   // vertical
      [-1, 0],  // vertical backwards
      [1, 1],   // diagonal down-right
      [-1, -1], // diagonal up-left
      [1, -1],  // diagonal down-left
      [-1, 1],  // diagonal up-right
    ],
  },
};

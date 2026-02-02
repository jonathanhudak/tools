/**
 * Preset word themes for word search puzzles
 */

export interface Theme {
  name: string;
  words: string[];
}

export const themes: Theme[] = [
  {
    name: 'Animals',
    words: ['ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'TIGER', 'MONKEY', 'ZEBRA', 'KOALA', 'PANDA', 'RABBIT'],
  },
  {
    name: 'Space',
    words: ['PLANET', 'ROCKET', 'ASTEROID', 'GALAXY', 'COMET', 'METEOR', 'NEBULA', 'ORBIT', 'STAR', 'MOON'],
  },
  {
    name: 'Dinosaurs',
    words: ['TREX', 'RAPTOR', 'STEGO', 'TRICERA', 'BRONTO', 'PTERANO', 'DIPLO', 'IGUANO', 'ANKYLO', 'SPINO'],
  },
];

export function getThemeByName(name: string): Theme | undefined {
  return themes.find((theme) => theme.name === name);
}

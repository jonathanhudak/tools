/**
 * Color palette generation utilities using LCH color space
 */

import chroma from 'chroma-js';
import type { ColorPaletteOptions } from './types';

const DEFAULT_OPTIONS: Required<ColorPaletteOptions> = {
  baseHue: Math.random() * 360,
  chroma: 80,
  lightness: 60,
  strategy: 'complementary',
};

/**
 * Generates a palette of complementary colors in LCH color space
 */
export function generateComplementaryPalette(
  count: number,
  options: ColorPaletteOptions = {}
): string[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { baseHue, chroma, lightness, strategy } = opts;

  const hues = getHuesForStrategy(baseHue, count, strategy);

  return hues.map((hue) => chroma.lch(lightness, chroma, hue).hex());
}

/**
 * Generates random complementary colors with varied lightness
 */
export function generateRandomPalette(count: number): string[] {
  const baseHue = Math.random() * 360;
  const colors: string[] = [];

  for (let i = 0; i < count; i++) {
    const hue = (baseHue + (i * 360) / count) % 360;
    const l = 40 + Math.random() * 40; // 40-80 range
    const c = 60 + Math.random() * 40; // 60-100 range

    colors.push(chroma.lch(l, c, hue).hex());
  }

  return colors;
}

/**
 * Generates a gradient between two colors
 */
export function generateGradient(
  color1: string,
  color2: string,
  steps: number
): string[] {
  return chroma.scale([color1, color2]).mode('lch').colors(steps);
}

/**
 * Get hue values based on color strategy
 */
function getHuesForStrategy(
  baseHue: number,
  count: number,
  strategy: ColorPaletteOptions['strategy']
): number[] {
  switch (strategy) {
    case 'complementary':
      // Distribute evenly around the color wheel
      return Array.from({ length: count }, (_, i) => (baseHue + (i * 360) / count) % 360);

    case 'analogous':
      // Colors within 60 degrees of base hue
      return Array.from({ length: count }, (_, i) => (baseHue + (i * 60) / count - 30) % 360);

    case 'triadic':
      // Three colors evenly spaced (120 degrees apart)
      return Array.from({ length: Math.min(count, 3) }, (_, i) => (baseHue + i * 120) % 360);

    case 'split-complementary':
      // Base + two colors adjacent to complement
      if (count === 1) return [baseHue];
      if (count === 2) return [baseHue, (baseHue + 180) % 360];
      return [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360];

    default:
      return Array.from({ length: count }, (_, i) => (baseHue + (i * 360) / count) % 360);
  }
}

/**
 * Validates if a color is valid
 */
export function isValidColor(color: string): boolean {
  try {
    chroma(color);
    return true;
  } catch {
    return false;
  }
}

/**
 * Converts hex color to LCH components
 */
export function hexToLch(hex: string): { l: number; c: number; h: number } {
  const [l, c, h] = chroma(hex).lch();
  return { l, c, h: h || 0 };
}

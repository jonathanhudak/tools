/**
 * Font configuration for RSVP Reader
 * Supports both local and remote (Google Fonts) fonts with lazy loading
 */

export type FontSource = 'local' | 'google';

export interface FontConfig {
  id: string;
  name: string;
  displayName: string;
  source: FontSource;
  cssClass: string;
  // For Google Fonts
  googleFontUrl?: string;
  // For local fonts
  localFontPath?: string;
  fontFace?: string;
}

/**
 * Available fonts for RSVP Reader
 * Add new fonts here to make them available in the UI
 */
export const AVAILABLE_FONTS: FontConfig[] = [
  {
    id: 'system-mono',
    name: 'System Monospace',
    displayName: 'System Mono',
    source: 'local',
    cssClass: 'font-mono',
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    displayName: 'JetBrains Mono',
    source: 'local',
    cssClass: 'font-jetbrains',
    localFontPath: '/JetBrainsMono-2.304/fonts/webfonts',
    fontFace: `
      @font-face {
        font-family: 'JetBrains Mono';
        src: url('/JetBrainsMono-2.304/fonts/webfonts/JetBrainsMono-Regular.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'JetBrains Mono';
        src: url('/JetBrainsMono-2.304/fonts/webfonts/JetBrainsMono-Bold.woff2') format('woff2');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
    `,
  },
  {
    id: 'cascadia-code',
    name: 'Cascadia Code',
    displayName: 'Cascadia Code',
    source: 'google',
    cssClass: 'font-cascadia',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cascadia+Code:wght@400;700&display=swap',
  },
  {
    id: 'special-elite',
    name: 'Special Elite',
    displayName: 'Special Elite',
    source: 'google',
    cssClass: 'font-special-elite',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Special+Elite&display=swap',
  },
];

export const DEFAULT_FONT_ID = 'jetbrains-mono';

/**
 * Get font configuration by ID
 */
export function getFontById(id: string): FontConfig | undefined {
  return AVAILABLE_FONTS.find(font => font.id === id);
}

/**
 * Get default font configuration
 */
export function getDefaultFont(): FontConfig {
  return getFontById(DEFAULT_FONT_ID) || AVAILABLE_FONTS[0];
}

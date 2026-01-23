/**
 * Font loader utility for lazy loading fonts on demand
 */

import type { FontConfig } from './fontConfig';

/**
 * Track which fonts have been loaded to avoid duplicate loading
 */
const loadedFonts = new Set<string>();

/**
 * Track pending font loads to avoid duplicate requests
 */
const pendingLoads = new Map<string, Promise<void>>();

/**
 * Load a font lazily based on its configuration
 * @param fontConfig - Font configuration to load
 * @returns Promise that resolves when font is loaded
 */
export async function loadFont(fontConfig: FontConfig): Promise<void> {
  // Check if already loaded
  if (loadedFonts.has(fontConfig.id)) {
    return;
  }

  // Check if already loading
  const pendingLoad = pendingLoads.get(fontConfig.id);
  if (pendingLoad) {
    return pendingLoad;
  }

  // System fonts don't need loading
  if (fontConfig.source === 'local' && !fontConfig.fontFace) {
    loadedFonts.add(fontConfig.id);
    return;
  }

  // Create loading promise
  const loadPromise = (async () => {
    try {
      if (fontConfig.source === 'google' && fontConfig.googleFontUrl) {
        await loadGoogleFont(fontConfig);
      } else if (fontConfig.source === 'local' && fontConfig.fontFace) {
        await loadLocalFont(fontConfig);
      }

      loadedFonts.add(fontConfig.id);
    } catch (error) {
      console.error(`Failed to load font ${fontConfig.name}:`, error);
      throw error;
    } finally {
      pendingLoads.delete(fontConfig.id);
    }
  })();

  pendingLoads.set(fontConfig.id, loadPromise);
  return loadPromise;
}

/**
 * Load a Google Font by injecting a link element
 */
function loadGoogleFont(fontConfig: FontConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!fontConfig.googleFontUrl) {
      reject(new Error('Google Font URL not provided'));
      return;
    }

    // Check if link already exists
    const existingLink = document.querySelector(
      `link[href="${fontConfig.googleFontUrl}"]`
    );
    if (existingLink) {
      resolve();
      return;
    }

    // Add preconnect links for Google Fonts if not already present
    if (!document.querySelector('link[href="https://fonts.googleapis.com"]')) {
      const preconnect1 = document.createElement('link');
      preconnect1.rel = 'preconnect';
      preconnect1.href = 'https://fonts.googleapis.com';
      document.head.appendChild(preconnect1);

      const preconnect2 = document.createElement('link');
      preconnect2.rel = 'preconnect';
      preconnect2.href = 'https://fonts.gstatic.com';
      preconnect2.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect2);
    }

    // Create and inject link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontConfig.googleFontUrl;

    link.onload = () => {
      // Wait a bit for font to be available
      setTimeout(() => resolve(), 100);
    };

    link.onerror = () => {
      reject(new Error(`Failed to load Google Font: ${fontConfig.name}`));
    };

    document.head.appendChild(link);
  });
}

/**
 * Load a local font by injecting CSS @font-face rules
 */
function loadLocalFont(fontConfig: FontConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!fontConfig.fontFace) {
      reject(new Error('Font face definition not provided'));
      return;
    }

    // Check if style element already exists
    const styleId = `font-${fontConfig.id}`;
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      resolve();
      return;
    }

    // Create and inject style element
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = fontConfig.fontFace;
    document.head.appendChild(style);

    // Wait for fonts to load using Font Loading API
    if ('fonts' in document) {
      document.fonts.ready
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.warn('Font loading API error:', error);
          // Still resolve as font may be loaded
          resolve();
        });
    } else {
      // Fallback: wait a bit for font to be available
      setTimeout(() => resolve(), 100);
    }
  });
}

/**
 * Check if a font is loaded
 */
export function isFontLoaded(fontId: string): boolean {
  return loadedFonts.has(fontId);
}

/**
 * Preload a font (useful for prefetching)
 */
export function preloadFont(fontConfig: FontConfig): void {
  loadFont(fontConfig).catch((error) => {
    console.warn(`Failed to preload font ${fontConfig.name}:`, error);
  });
}

#!/usr/bin/env node

/**
 * Generate minimal PWA icon placeholders
 * Creates simple PNG files for PWA support
 */

import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

// Ensure public directory exists
try {
  mkdirSync(publicDir, { recursive: true });
} catch (err) {
  // Directory already exists
}

/**
 * Create a minimal black PNG with a white puzzle icon
 * Using a data URL approach - creating actual PNG binary data
 */
function createMinimalPNG(size) {
  // Create a simple SVG and save it as-is
  // vite-plugin-pwa can handle SVG icons in modern browsers
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#000000"/>
  <g fill="#FFFFFF">
    <path d="M128 128h80v-32c0-17.67 14.33-32 32-32s32 14.33 32 32v32h80v80h32c17.67 0 32 14.33 32 32s-14.33 32-32 32h-32v80h-80v32c0 17.67-14.33 32-32 32s-32-14.33-32-32v-32h-80v-80h-32c-17.67 0-32-14.33-32-32s14.33-32 32-32h32v-80z"/>
    <circle cx="180" cy="300" r="12"/>
    <circle cx="220" cy="300" r="12"/>
    <circle cx="332" cy="300" r="12"/>
  </g>
  <text x="256" y="440" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="48" font-weight="bold">PUZZLE</text>
</svg>`;

  return svg;
}

// Create icon files
console.log("Generating PWA icon placeholders...\n");

const sizes = [192, 512];

sizes.forEach((size) => {
  const svg = createMinimalPNG(size);
  const filename = `pwa-${size}x${size}.svg`;
  const filepath = join(publicDir, filename);

  writeFileSync(filepath, svg);
  console.log(`✓ Created ${filename} (${size}x${size})`);
});

// Also create apple-touch-icon
const appleTouchIcon = createMinimalPNG(180);
writeFileSync(join(publicDir, "apple-touch-icon.png"), appleTouchIcon);
console.log(`✓ Created apple-touch-icon.png (placeholder SVG)`);

// Create favicon
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#000000"/>
  <path fill="#FFFFFF" d="M128 128h80v-32c0-17.67 14.33-32 32-32s32 14.33 32 32v32h80v80h32c17.67 0 32 14.33 32 32s-14.33 32-32 32h-32v80h-80v32c0 17.67-14.33 32-32 32s-32-14.33-32-32v-32h-80v-80h-32c-17.67 0-32-14.33-32-32s14.33-32 32-32h32v-80z"/>
</svg>`;
writeFileSync(join(publicDir, "favicon.svg"), favicon);
console.log(`✓ Created favicon.svg`);

console.log("\n⚠️  Note: These are SVG placeholders.");
console.log("For production PNG icons, consider using tools like:");
console.log("  - @resvg/resvg-js (Node.js SVG to PNG converter)");
console.log("  - sharp (image processing library)");
console.log("  - Online tools like https://realfavicongenerator.net/");
console.log("\n✨ Done!");

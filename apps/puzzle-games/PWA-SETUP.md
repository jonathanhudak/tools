# PWA Setup for Puzzle Games

This document describes the PWA (Progressive Web App) implementation for the puzzle-games app.

## What Was Added

### 1. Dependencies

Added `vite-plugin-pwa` to `package.json`:

```json
"vite-plugin-pwa": "^0.21.1"
```

### 2. Vite Configuration (`vite.config.ts`)

Configured the VitePWA plugin with:

- **Manifest**: App name, description, theme colors, icons
- **Service Worker**: Auto-update registration type
- **Workbox**: Caching strategies for offline support
  - Caches all app assets (JS, CSS, HTML, images)
  - Implements cache-first strategy for Google Fonts
  - Enables full offline functionality

### 3. Icons

Created an icon generation system:

- `generate-icons.js` - Script that creates minimal black placeholder PNGs
- `public/icon.svg` - Source SVG with puzzle-themed design
- `public/README.md` - Instructions for creating proper production icons

The build script automatically runs `generate-icons.js` before building.

### 4. Build Script

Updated `package.json` scripts:

```json
{
  "build": "node generate-icons.js && vite build",
  "generate-icons": "node generate-icons.js"
}
```

## Testing the PWA

### 1. Install Dependencies

```bash
cd apps/puzzle-games
pnpm install
```

### 2. Build the App

```bash
pnpm run build
```

This will:
1. Generate placeholder PNG icons
2. Build the app with Vite
3. Create a service worker
4. Generate a web app manifest

### 3. Test Locally

```bash
pnpm run preview
```

Then:
1. Open browser DevTools
2. Go to Application > Service Workers
3. Verify service worker is registered
4. Go to Application > Manifest
5. Check manifest is loaded correctly

### 4. Test Offline Mode

1. In DevTools, go to Network tab
2. Check "Offline" checkbox
3. Reload the page
4. Verify app still works

### 5. Test Installability

#### Desktop (Chrome/Edge):
- Look for install icon in address bar
- Click to install as PWA
- Verify app opens in standalone window

#### Mobile (iOS/Android):
- Open in mobile browser
- Look for "Add to Home Screen" option
- Install and verify icon appears on home screen
- Open app and verify it runs standalone

## Lighthouse PWA Score

Run Lighthouse audit:

```bash
npx lighthouse http://localhost:4173 --view
```

Target: Score > 90

## Production Icons

The current icons are minimal black placeholders. For production:

### Option 1: Use the icon generation script with proper SVG

1. Update `public/icon.svg` with your branding
2. Install a converter: `pnpm add -D @resvg/resvg-js`
3. Convert SVG to PNG:
   ```bash
   npx resvg public/icon.svg public/pwa-192x192.png --width 192 --height 192
   npx resvg public/icon.svg public/pwa-512x512.png --width 512 --height 512
   npx resvg public/icon.svg public/apple-touch-icon.png --width 180 --height 180
   ```

### Option 2: Use an online generator

Visit https://realfavicongenerator.net/ and upload your design.

## Files Modified

- `apps/puzzle-games/package.json` - Added dependency and scripts
- `apps/puzzle-games/vite.config.ts` - Added PWA plugin configuration
- `apps/puzzle-games/generate-icons.js` - Icon generation script (new)
- `apps/puzzle-games/public/icon.svg` - SVG icon source (new)
- `apps/puzzle-games/public/README.md` - Icon documentation (new)

## Next Steps

1. Run `pnpm install` in the monorepo root
2. Run `pnpm run build` in apps/puzzle-games
3. Test the PWA functionality
4. Replace placeholder icons with proper branding
5. Test on actual mobile devices (especially Daylight Computer)
6. Run Lighthouse audit to verify PWA score > 90

## Troubleshooting

### Service Worker Not Registering

- Check browser console for errors
- Verify the app is served over HTTPS (or localhost)
- Check that `manifest.webmanifest` is generated in the build output

### Icons Not Appearing

- Run `pnpm run generate-icons` manually
- Check that PNG files exist in `public/` directory
- Verify icon paths in `vite.config.ts` match actual filenames

### App Not Installable

- Check Lighthouse PWA audit for missing requirements
- Verify manifest has all required fields
- Ensure service worker is registered successfully
- Test on different browsers (Chrome, Edge, Safari)

### Offline Mode Not Working

- Check DevTools > Application > Service Workers
- Verify service worker status is "Activated"
- Check Cache Storage has cached resources
- Try clearing cache and rebuilding

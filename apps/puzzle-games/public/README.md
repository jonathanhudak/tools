# PWA Icons

This directory contains icons for the Progressive Web App (PWA).

## Icon Files Needed

- `pwa-192x192.png` - 192x192px PNG icon
- `pwa-512x512.png` - 512x512px PNG icon
- `apple-touch-icon.png` - 180x180px PNG icon for iOS
- `favicon.ico` - Favicon

## Generating Icons

### Option 1: Run the icon generation script

```bash
cd apps/puzzle-games/public
node create-icons.mjs
```

This creates minimal black placeholder PNGs.

### Option 2: Convert from SVG (Recommended for production)

Install a conversion tool:

```bash
npm install -D @resvg/resvg-js
```

Then convert the `icon.svg`:

```bash
npx resvg icon.svg pwa-192x192.png --width 192 --height 192
npx resvg icon.svg pwa-512x512.png --width 512 --height 512
npx resvg icon.svg apple-touch-icon.png --width 180 --height 180
```

### Option 3: Use an online tool

Visit https://realfavicongenerator.net/ and upload `icon.svg` to generate all required icons.

## Current Status

The `icon.svg` file contains a simple puzzle-themed design with a black background and white elements, optimized for the Daylight Computer's e-ink display.

For production use, consider creating proper branded icons with your preferred design.

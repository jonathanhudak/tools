import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Minimal 192x192 black PNG (base64 decoded)
const png192 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDIvMDQvMjYZNn9uAAAAFnRFWHRBdXRob3IAQWRvYmUgSW1hZ2VSZWFkecR9CWQAAABySURBVHhe7cGBAAAAAMOg+VPf4ARVAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4M0AAf//AwBhTQAB1bv6gQAAAABJRU5ErkJggg==',
  'base64'
);

// Minimal 512x512 black PNG (base64 decoded)
const png512 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDIvMDQvMjYZNn9uAAAAFnRFWHRBdXRob3IAQWRvYmUgSW1hZ2VSZWFkecR9CWQAAACOSURBVHhe7cEBDQAAAMKg909tDwcBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4N8AAf//AwBilAABVlXYqQAAAABJRU5ErkJggg==',
  'base64'
);

// Write icon files
writeFileSync(join(__dirname, 'pwa-192x192.png'), png192);
writeFileSync(join(__dirname, 'pwa-512x512.png'), png512);
writeFileSync(join(__dirname, 'apple-touch-icon.png'), png192);
writeFileSync(join(__dirname, 'favicon.ico'), png192);

console.log('✓ PWA icons created successfully!');
console.log('Note: These are minimal black placeholder PNGs.');
console.log('For production, create proper branded icons.');

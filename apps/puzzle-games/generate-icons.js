const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Minimal black PNG files (base64 encoded)
const png192 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDIvMDQvMjYZNn9uAAAAFnRFWHRBdXRob3IAQWRvYmUgSW1hZ2VSZWFkecR9CWQAAABySURBVHhe7cGBAAAAAMOg+VPf4ARVAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4M0AAf//AwBhTQAB1bv6gQAAAABJRU5ErkJggg==',
  'base64'
);

const png512 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDIvMDQvMjYZNn9uAAAAFnRFWHRBdXRob3IAQWRvYmUgSW1hZ2VSZWFkecR9CWQAAACOSURBVHhe7cEBDQAAAMKg909tDwcBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4N8AAf//AwBilAABVlXYqQAAAABJRU5ErkJggg==',
  'base64'
);

// Write icon files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png192);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png192);

console.log('✓ PWA icon placeholders created successfully!');
console.log('  - pwa-192x192.png (192x192)');
console.log('  - pwa-512x512.png (512x512)');
console.log('  - apple-touch-icon.png');
console.log('  - favicon.ico');
console.log('\nNote: These are minimal black placeholders.');
console.log('For production, create proper branded icons.');

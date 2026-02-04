#!/bin/bash

# Create placeholder PNG icons for PWA
# These are minimal black PNGs - replace with proper icons for production

cd "$(dirname "$0")/../public"

# Create a 192x192 black PNG (minimal valid PNG with black pixels)
echo "Creating pwa-192x192.png..."
echo -n "iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDIvMDQvMjYZNn9uAAAAFnRFWHRBdXRob3IAQWRvYmUgSW1hZ2VSZWFkecR9CWQAAABySURBVHhe7cGBAAAAAMOg+VPf4ARVAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4M0AAf//AwBhTQAB1bv6gQAAAABJRU5ErkJggg==" | base64 -d > pwa-192x192.png

# Create a 512x512 black PNG
echo "Creating pwa-512x512.png..."
echo -n "iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDIvMDQvMjYZNn9uAAAAF nRFWHRBdXRob3IAQWRvYmUgSW1hZ2VSZWFkecR9CWQAAACOSURBVHhe7cEBDQAAAMKg909tDwcBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4N8AAf//AwBilAABVlXYqQAAAABJRU5ErkJggg==" | base64 -d > pwa-512x512.png

# Create apple-touch-icon (180x180)
echo "Creating apple-touch-icon.png..."
cp pwa-192x192.png apple-touch-icon.png

# Create favicon.ico (using 192 as source for simplicity)
echo "Creating favicon.ico..."
cp pwa-192x192.png favicon.ico

echo "✓ PWA icons created successfully!"
echo ""
echo "Note: These are placeholder black PNGs."
echo "For production, create proper branded icons with:"
echo "  - Your app logo/design"
echo "  - Proper transparency/backgrounds"
echo "  - Tools like https://realfavicongenerator.net/"

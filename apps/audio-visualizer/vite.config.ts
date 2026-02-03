import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths({
      projects: ['../../packages/ui/tsconfig.json', './tsconfig.json'],
    }),
  ],
  base: '/tools/audio-visualizer/',
  build: {
    outDir: '../../docs/audio-visualizer',
    emptyOutDir: true,
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['@hudak/ui', '@hudak/audio-viz-core', 'p5'],
  },
  server: {
    port: 3000,
    open: true,
  },
});

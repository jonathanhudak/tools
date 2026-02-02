import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths({
      projects: ['../../packages/ui/tsconfig.json', './tsconfig.json'],
    }),
  ],
  base: '/tools/puzzle-games/',
  build: {
    outDir: '../../docs/puzzle-games',
    emptyOutDir: true,
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['@hudak/ui'],
  },
  server: {
    port: 3001,
    open: true,
  },
});

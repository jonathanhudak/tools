import { copyFileSync } from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    tsconfigPaths({
      projects: ['../../packages/ui/tsconfig.json', './tsconfig.json'],
    }),
    {
      name: 'spa-fallback',
      closeBundle() {
        try {
          copyFileSync('../../docs/music-practice/index.html', '../../docs/music-practice/404.html');
        } catch {}
      },
    },
  ],
  base: '/tools/music-practice/',
  build: {
    outDir: '../../docs/music-practice',
    emptyOutDir: true,
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['@hudak/ui'],
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});

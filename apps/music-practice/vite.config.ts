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
  ],
  base: '/music-practice/',
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
});

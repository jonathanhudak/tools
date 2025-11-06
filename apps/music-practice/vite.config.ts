import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  base: '/music-practice/',
  build: {
    outDir: '../../docs/music-practice',
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@hudak/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@hudak/ui'],
  },
  server: {
    port: 3000,
    open: true,
  },
});

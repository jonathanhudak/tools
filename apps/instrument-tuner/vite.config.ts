import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  base: '/tools/instrument-tuner/',
  build: {
    outDir: '../../docs/instrument-tuner',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 3004,
    open: true,
  },
});

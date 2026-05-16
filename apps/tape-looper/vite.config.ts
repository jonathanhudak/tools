import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths({ projects: ['./tsconfig.json'] })],
  base: '/tools/tape-looper/',
  build: {
    outDir: '../../docs/tape-looper',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: { port: 3001 },
  test: { environment: 'jsdom' },
});

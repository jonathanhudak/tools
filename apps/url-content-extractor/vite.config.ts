import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/tools/url-content-extractor/',
  build: {
    outDir: '../../docs/url-content-extractor',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 3001,
    open: true,
  },
});

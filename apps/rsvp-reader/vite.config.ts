import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/tools/rsvp-reader/',
  build: {
    outDir: '../../docs/rsvp-reader',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 3001,
    open: true,
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/tools/diffshub/',
  build: {
    outDir: '../../docs/diffshub',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 3010,
    open: true,
  },
});

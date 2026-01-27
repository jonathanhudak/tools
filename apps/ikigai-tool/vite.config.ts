import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/tools/ikigai-tool/',
  build: {
    outDir: '../../docs/ikigai-tool',
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  }
});

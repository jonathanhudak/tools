import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: '/tools/puzzle-games/',
  build: {
    outDir: '../../docs/puzzle-games',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 5177,
  },
});

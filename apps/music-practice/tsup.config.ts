import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['js/app.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  splitting: false,
  treeshake: true,
  minify: false,
  platform: 'browser',
  target: 'es2020',
  bundle: true,
  noExternal: ['tonal', 'pitchy'], // Force bundle these dependencies
  external: []
});

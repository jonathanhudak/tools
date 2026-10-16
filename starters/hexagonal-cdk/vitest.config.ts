import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // ArchUnitTS's `toPassAsync()` matcher registers itself on the global `expect`.
    globals: true,
    environment: 'node',
    projects: [
      { extends: true, test: { name: 'unit', include: ['packages/*/test/**/*.test.ts'] } },
      { extends: true, test: { name: 'arch', include: ['arch/**/*.arch.test.ts'], testTimeout: 60_000 } },
    ],
  },
});

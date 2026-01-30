# Shared Packages

Changes to packages affect all dependent apps.

## Packages

| Package | Purpose |
|---------|---------|
| `packages/ui/` | Shared UI components (shadcn/ui) |
| `packages/audio-components/` | Audio processing utilities |

## After Modifying a Package

1. Rebuild the package:
   ```bash
   pnpm --filter @hudak/ui run build
   ```

2. Rebuild all apps:
   ```bash
   pnpm run build
   ```

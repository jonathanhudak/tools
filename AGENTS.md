# AGENTS.md

Web tools monorepo. Uses **pnpm** and **Turborepo**.

## Commands

| Task | Command |
|------|---------|
| Build all | `pnpm run build` |
| Typecheck | `pnpm run typecheck` |
| Dev server | `cd apps/<tool> && pnpm run dev` |

## Critical Rule

When adding a new tool, you **must** add its metadata to `scripts/generate-landing.js`.
This is the #1 missed step. See [Adding Tools Guide](.claude/agents/adding-tools.md).

## Guides

- [Adding New Tools](.claude/agents/adding-tools.md)
- [Common Pitfalls](.claude/agents/common-pitfalls.md)
- [Shared Packages](.claude/agents/shared-packages.md)

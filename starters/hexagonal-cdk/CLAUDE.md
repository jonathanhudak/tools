# CLAUDE.md

Read and follow [AGENTS.md](./AGENTS.md). It is the single source of truth for this starter.

The short version: dependencies point inward (composition -> adapters -> application -> domain).
Enforcement config is read-only for you. If a boundary blocks you, add a port in
`packages/domain/src/ports` and implement it in `packages/adapters-driven`. Run `pnpm verify` before finishing.

# AGENTS.md - hexagonal-cdk starter

This service is a **hexagonal (ports & adapters)** TypeScript app on AWS CDK. The architecture
is enforced by machines, not by convention. Read this before writing code.

## The rings (dependencies point inward only)

| Ring | Folder | May import | Put here |
|---|---|---|---|
| domain | `packages/domain/src` | nothing (itself only) | entities, value objects, pure functions, **port interfaces** in `ports/*.port.ts` |
| application | `packages/application/src` | `@hex/domain` | use cases in `use-cases/*.use-case.ts` (constructor-injected ports) |
| adapters-driven | `packages/adapters-driven/src` | `@hex/domain`, `@aws-sdk/*` | `*.adapter.ts` classes that `implements XxxPort` (S3, in-memory, clocks) |
| adapters-driving | `packages/adapters-driving/src` | `@hex/application`, `@hex/domain`, type-only `aws-lambda` | HTTP / SQS handlers that receive use cases as arguments |
| composition | `packages/composition/src` | every ring, `@aws-sdk/client-s3` | wiring (`container.ts`) and Lambda entry points (`lambdas/*.lambda.ts`) |
| infra | `infra/{bin,lib}` | `aws-cdk-lib`, `constructs`, `node:*` | CDK stacks; references Lambda entries **by path**, never imports ring code |

Tests live in `packages/<ring>/test/*.test.ts`. Use the in-memory adapters
(`@hex/adapters-driven/in-memory`); no mocking libraries.

## Where does my change go?

- **New business rule / validation** -> `domain/src/model`. Pure. No time, randomness, I/O, `console`, `process`.
- **New workflow** -> a new `application/src/use-cases/<name>.use-case.ts`, export it from the ring `index.ts`.
- **Need storage, search, HTTP, time, IDs, queues, LLM calls...** -> that is a **port**:
  1. `domain/src/ports/<name>.port.ts` exporting `interface <Name>Port` (re-export from `ports/index.ts`).
  2. Depend on it in the use case constructor.
  3. `adapters-driven/src/<tech>/<tech>-<name>.adapter.ts` with `class X implements <Name>Port`, plus an in-memory one for tests.
  4. Wire it in `composition/src/container.ts`.
- **New entry point (API route, queue, schedule)** -> handler in `adapters-driving`, Lambda entry in `composition/src/lambdas`, resource in `infra/lib`.

## Rules for agents

1. **Never edit enforcement config**: `eslint.config.js`, `.dependency-cruiser.cjs`, any `tsconfig*.json`,
   `vitest.config.ts`, `.npmrc`, `pnpm-workspace.yaml`, `packages/*/package.json`, `arch/`, `canary/`,
   `scripts/`, `.claude/`, `.github/workflows/`, `CODEOWNERS*`. These are denied in `.claude/settings.json`
   and owned by humans in CODEOWNERS. If a rule blocks you, **the design is wrong, not the rule: add a port.**
2. **No suppression**: `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck` are all lint errors,
   and ESLint runs with `--no-inline-config` anyway, so they do nothing.
3. **No new dependencies** without a human. Declaring a dependency in a ring's `package.json` is an
   architectural decision. Undeclared imports do not resolve (pnpm isolated `node_modules`).
4. Every file must live in a known ring folder (`boundaries/no-unknown-files`).
5. Before you say you are done: `pnpm verify` must pass. A PostToolUse hook also lints and cruises each
   file you edit and reports violations back to you immediately.

## Commands

```bash
pnpm install
pnpm verify        # typecheck + lint + cruise + arch tests + unit tests + canary + cdk synth
pnpm test          # unit tests only
pnpm arch:canary   # prove every rail still catches its planted violation
```

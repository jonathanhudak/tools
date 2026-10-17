# hexagonal-cdk starter

A starter for a **hexagonal (ports & adapters) TypeScript service on AWS CDK**, with the
architecture enforced tightly enough that autonomous coding agents cannot drift from it.

The domain is a toy **design-system corpus**: ingest a Figma component node, normalize it into a
`ComponentDoc`, store it in S3, and make it searchable. The business logic is deliberately small;
the starter exists for its enforcement layers.

```
POST /components ─┐                                         ┌─> S3ComponentRepo  (ComponentRepoPort)
SQS ingest queue ─┼─> adapters-driving ─> application ─> domain <─┼─> S3SearchIndex     (SearchIndexPort)
GET  /search     ─┘   (Lambda handlers)   (use cases)   (ports)   └─> SystemClock       (ClockPort)
                          ^                                              ^
                          └──────────── composition (wiring) ────────────┘
```

## Hexagonal / clean / onion → folders

| Hexagonal | Clean architecture | Onion | Folder |
|---|---|---|---|
| Domain model + **ports** | Entities (+ gateway interfaces) | Domain model + domain services | `packages/domain` (`src/model`, `src/ports`) |
| Application services | Use cases / interactors | Application services | `packages/application` (`src/use-cases`) |
| Driving (primary) adapters | Controllers / presenters | UI / API | `packages/adapters-driving` (HTTP + SQS handlers) |
| Driven (secondary) adapters | Gateways / frameworks & drivers | Infrastructure | `packages/adapters-driven` (S3, in-memory, clock) |
| Configurator | Main / composition root | Dependency resolution | `packages/composition` (+ Lambda entry points) |
| (outside the hexagon) | Frameworks & drivers | Infrastructure | `infra/` (CDK app) |

## Enforcement layers

Every layer is independent, and `pnpm arch:canary` proves each one still catches violations.

| # | Layer | Tool | What it catches | Where |
|---|---|---|---|---|
| 1 | Package boundaries | pnpm isolated `node_modules` (`hoist=false`) + TS project references (`tsc -b`) | Importing a package the ring does not declare; relative imports into another ring's files | `.npmrc`, `packages/*/package.json`, `tsconfig*.json` |
| 2 | Ring policy | `eslint-plugin-boundaries` v7 `boundaries/dependencies` (default **disallow**), `no-unknown-files`, `no-unknown-dependencies`, `no-ignored-dependencies` | Any ring-to-ring or ring-to-npm edge not on the allow-list, with fix-it messages; files outside a known ring | `eslint.config.js` |
| 3 | Core purity | `no-restricted-imports` / `-globals` / `-properties` / `-syntax` on `domain` + `application` | `node:*`, builtins, `@aws-sdk/*`, `aws-cdk-lib`; `fetch`, `process`, `console`, timers; `Date.now()`, `new Date()`, `Math.random()`, dynamic `import()` | `eslint.config.js` |
| 4 | Graph check | dependency-cruiser | Ring rules (mirrors layer 2 independently), `no-circular`, `no-orphans`, unresolvable/undeclared deps, adapters importing adapters, only composition imports both adapter packages, infra never imports rings | `.dependency-cruiser.cjs` → `pnpm arch:cruise` |
| 5 | Architecture tests | ArchUnitTS (vitest) with empty-test protection **on** | Layer rules, cycles, `*.port.ts` only in `domain/src/ports` and exporting only `interface *Port`, `*.use-case.ts` placement, driven adapters `implements *Port`, Lambda entries only in composition. A renamed folder fails instead of passing on zero files | `arch/rings.arch.test.ts` → `pnpm arch:test` |
| 6a | Anti-suppression | `--no-inline-config` **and** `linterOptions.noInlineConfig`, `--max-warnings 0`, `eslint-comments/no-use`, `@typescript-eslint/ban-ts-comment` | `eslint-disable*`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck` | `eslint.config.js` |
| 6b | Canary | `scripts/canary.mjs` | Planted violations (domain→adapter, `Date.now`, application→`@aws-sdk/client-s3`, `eslint-disable`/`@ts-ignore`, a cycle, a misplaced port, driving→driven, a stray file). Fails if **any** expected report goes missing | `canary/` → `pnpm arch:canary` |
| 6c | Agent permissions | `.claude/settings.json` deny rules + PostToolUse hook | Claude Code cannot Edit/Write enforcement files; every edit is linted and cruised, and violations go straight back to the agent | `.claude/` |
| 6d | Human review | `CODEOWNERS.example` | Changes to enforcement files require an architect's approval | move to `.github/CODEOWNERS` |
| 6e | Agent instructions | `AGENTS.md` / `CLAUDE.md` | Tells the agent where code goes and to "add a port, never edit the rules" | |
| 7 | Single gate | `pnpm verify` | typecheck → lint → cruise → arch tests → unit tests → canary → `cdk synth`, with a pass/fail summary | `scripts/verify.mjs`, CI workflow |

### How the canary works

`canary/fixtures/` mirrors the repo layout (`packages/domain/src/__canary__/…`). The runner copies
the starter to a temp dir, overlays the fixtures so each violation sits in a real ring folder, runs
tsc, ESLint, dependency-cruiser and ArchUnitTS against the copy, then checks every expectation in
`canary/expectations.json`. The working tree is never modified, and normal lint/cruise runs exclude
`canary/`. If someone weakens a rule, the canary goes red.

## Usage

```bash
cd starters/hexagonal-cdk
pnpm install            # its own workspace + lockfile; not part of the root monorepo
pnpm verify             # everything (about 1 min)
pnpm test               # unit tests (in-memory adapters, no mocks)
pnpm synth              # cdk synth (offline; environment-agnostic stack; never deploys)
```

Requires Node ≥ 22.12 and pnpm 9.

## Copy into a new repo

```bash
cp -R starters/hexagonal-cdk ~/code/my-service && cd ~/code/my-service
rm -rf node_modules packages/*/node_modules infra/node_modules
git init
mkdir -p .github/workflows
# CI: copy the workflow from this monorepo, delete `defaults.run.working-directory`,
# the `paths:` filters and the `starters/hexagonal-cdk/` prefixes:
cp ../tools/.github/workflows/hexagonal-cdk-starter.yml .github/workflows/verify.yml
mv CODEOWNERS.example .github/CODEOWNERS      # then replace @your-org/architects
pnpm install && pnpm verify
```

Then:

1. In GitHub branch protection for `main`, require the `verify` check and **Require review from Code Owners**.
2. Rename the `@hex/*` scope if you like. Package names appear in `package.json` files, imports,
   `eslint.config.js` (`no-restricted-imports` patterns) and ArchUnitTS's `@hex/domain` check.
3. To add a capability, add a port (see `AGENTS.md`). To add a ring, update **all** of
   `eslint.config.js`, `.dependency-cruiser.cjs`, `arch/`, the tsconfig references, and add a canary
   fixture plus expectation proving the new rule bites.

## Notes and limits

- **`S3SearchIndex` is a toy**: one JSON object holding the terms, rewritten on every upsert. The ingest
  Lambda has reserved concurrency 1 to keep writes serial. Replace it with OpenSearch or a Bedrock
  knowledge base behind the same `SearchIndexPort`.
- **Driving adapters do not construct use cases.** They export factories (`makeHttpHandler(useCases)`).
  Building a use case needs driven adapters, and only `composition` may import those.
- **The `.claude/settings.json` deny list only works when Claude Code runs with this folder as its
  project root.** Nested inside the monorepo, Claude Code reads the repo root's `.claude/` instead. The
  deny list is a guard rail, not a sandbox: CI, CODEOWNERS and the canary are the real gate.

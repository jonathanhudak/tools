# DiffsHub

A fast, virtualized GitHub diff viewer — a self-hostable clone of [diffshub.com](https://diffshub.com).
Paste a pull request, commit, or compare URL (or a raw diff) and browse the changes with a file
tree, unified/split views, and on-demand syntax highlighting. Large diffs stay smooth because rows
are virtualized, so only the visible lines are ever in the DOM.

## Features

- **Multiple sources** — load a `github.com` PR / commit / compare URL, paste a raw unified diff, or
  open a local `.diff` / `.patch` file. Everything runs in the browser; no account, no backend.
- **File tree** — collapsible directory tree with per-file add/delete counts and status colors.
- **Unified & split views** — toggle per file.
- **Syntax highlighting** — powered by [Shiki](https://shiki.style); each language grammar is
  lazy-loaded only when a file of that type is opened.
- **Virtualized rendering** — built on [`@tanstack/react-virtual`](https://tanstack.com/virtual) so
  even very large diffs scroll smoothly.
- **Dark mode** — follows your system preference, with a manual toggle.

## How GitHub URLs are fetched

GitHub serves a unified diff at the `.diff` suffix of any PR / commit / compare URL, but it does not
send CORS headers, so the browser can't fetch it directly. DiffsHub routes the request through the
public `api.allorigins.win` proxy (the same pattern used by the RSVP Reader tool in this repo). Only
public repositories work; nothing is authenticated.

If you'd rather not depend on a proxy, use the **Paste diff** tab — `git diff > changes.diff` and
drop the file in.

## Query parameters

The app reads these on load (used by the `diffshub` skill launcher):

- `?diff=<github url>` (alias `?url=`) — auto-load and render the diff.
- `?view=split` — start in split view.

Example: `http://localhost:3010/tools/diffshub/?diff=https://github.com/owner/repo/pull/123&view=split`

## Development

```bash
# from the repo root
pnpm install
pnpm diff dev        # or: pnpm --filter @hudak/diffshub dev
```

The dev server runs at <http://localhost:3010/tools/diffshub/>.

```bash
pnpm diff build      # production build into ../../docs/diffshub
pnpm diff typecheck
pnpm diff lint
```

## Architecture

```
src/
├── App.tsx              # State, layout, query-param auto-load, highlight pre-warming
├── components/
│   ├── DiffInput.tsx    # URL / paste / file inputs + theme toggle
│   ├── FileTree.tsx     # Collapsible tree built from changed file paths
│   └── DiffView.tsx     # Virtualized unified/split row renderer
├── lib/
│   ├── github.ts        # Parse a GitHub URL → .diff URL; fetch via CORS proxy
│   ├── diff.ts          # parse-diff → flat row models for unified & split views
│   └── highlight.ts     # Shiki singleton, lazy language loading, line cache
└── types.ts             # Shared diff/row types
```

DiffsHub itself is closed-source, so this is a capability clone built on an open stack
(React + Vite + TypeScript, `parse-diff`, `@tanstack/react-virtual`, and Shiki) that matches the
conventions of the rest of this monorepo.

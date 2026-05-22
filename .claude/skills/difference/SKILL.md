---
name: difference
description: Open a GitHub diff, pull request, commit, or compare URL in the local Difference viewer (a fast, virtualized diff browser in apps/difference). Use when the user wants to view, browse, or review a GitHub diff/PR/commit locally, or asks to "open this in the diff tool". Also handles raw .diff/.patch files.
---

# Difference — local diff viewer

Difference (`apps/difference`) is a fast, virtualized viewer for diffs with a file tree, unified/split
views, and syntax highlighting. This skill launches it locally and, if given a URL, opens it pointed
straight at that diff.

## When to use

- The user gives a `github.com` pull request, commit, or compare URL and wants to view/review it.
- The user says "open this in the diff tool", "show me this diff locally", or similar.
- The user has a raw `.diff` / `.patch` file or pasted diff text they want to browse.

## How to launch

Run the launcher script. It is idempotent — it installs deps on first run, starts the Vite dev
server on port 3010 if it isn't already up, then prints (and tries to open) the target URL.

```bash
# Just start the viewer:
.claude/skills/difference/scripts/launch.sh

# Open a specific PR / commit / compare URL:
.claude/skills/difference/scripts/launch.sh "https://github.com/owner/repo/pull/123"

# Start directly in split view:
.claude/skills/difference/scripts/launch.sh --split "https://github.com/owner/repo/commit/<sha>"
```

The script prints the final URL (e.g. `http://localhost:3010/tools/difference/?diff=…`). Surface that
URL to the user — on a remote/headless environment the browser can't auto-open, so the user opens it
themselves. The dev server runs in the background; its log is at `/tmp/difference-dev.log`.

## Supported URL forms

- Pull request: `https://github.com/<owner>/<repo>/pull/<n>`
- Commit: `https://github.com/<owner>/<repo>/commit/<sha>`
- Compare: `https://github.com/<owner>/<repo>/compare/<base>...<head>`
- A direct `.diff` / `.patch` URL.

Only **public** repositories work via URL — Difference fetches the `.diff` through a public CORS proxy
(`api.allorigins.win`) with no authentication. For private repos or local changes, tell the user to
use the **Paste diff** tab or the "open a .diff / .patch file" option: they can generate one with
`git diff > changes.diff` (or `gh pr diff <n> > pr.diff`) and load that file.

## Notes

- Port: `3010`, served at `http://localhost:3010/tools/difference/`.
- Requires `pnpm` and that the repo's dependencies are installed (the script runs `pnpm install` if
  `node_modules` is missing).
- To stop the viewer: `pkill -f vite` (or close the background process).

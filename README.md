# Tools Monorepo

A collection of small, useful tools built with AI-assisted coding. Each tool is designed to be simple, focused, and practical.

This is a **monorepo** managed with [Turborepo](https://turbo.build/repo) and [pnpm](https://pnpm.io/), using shared TypeScript and ESLint configurations for consistency across projects.

## Available Tools

| Tool | Description | Tech Stack |
|------|-------------|------------|
| [InstrumentPractice Pro](./apps/music-practice/) | A comprehensive instrument practice app with MIDI/microphone support for sight reading, scales, and music theory training | React + Vite + TypeScript |
| [Visual HTML Builder](./apps/visual-html-builder/) | A visual HTML editor with real-time preview, inline editing, and full style customization | Vanilla HTML/CSS/JS |

## Quick Start

### Prerequisites

This project uses [pnpm](https://pnpm.io/) as the package manager. Install it globally:

```bash
npm install -g pnpm
# or
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Commands

```bash
# Install all dependencies
pnpm install

# Build all apps
pnpm run build

# Start development for all apps
pnpm run dev

# Type check all TypeScript apps
pnpm run typecheck

# Lint all apps
pnpm run lint

# Run commands for a specific workspace
pnpm --filter @hudak/music-practice dev
pnpm --filter @hudak/instrument-tuner build
```

## Project Structure

```
tools/
├── apps/                      # Individual applications
│   ├── music-practice/        # React + Vite app
│   └── visual-html-builder/   # Static HTML app
├── packages/                  # Shared packages
│   ├── typescript-config/     # Shared TypeScript configs
│   └── eslint-config/         # Shared ESLint configs
├── docs/                      # Built apps for GitHub Pages
└── turbo.json                 # Turborepo configuration
```

## Development Guide

For detailed development guidelines, coding standards, and architecture documentation, see [CLAUDE.md](./CLAUDE.md).

## Adding New Tools

See the [CLAUDE.md](./CLAUDE.md#adding-new-tools) guide for templates and instructions on adding new tools to the monorepo.

## Deployment

All tools are automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

- Live site: [https://jhudak.github.io/tools/](https://jhudak.github.io/tools/)
- Each tool is available at `/tools/{app-name}/`

## License

ISC License - see individual tool directories for specific licensing information.

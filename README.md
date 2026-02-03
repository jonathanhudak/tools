# Tools Monorepo

A collection of small, useful tools built with AI-assisted coding. Each tool is designed to be simple, focused, and practical.

This is a **monorepo** managed with [Turborepo](https://turbo.build/repo) and [pnpm](https://pnpm.io/), using shared TypeScript and ESLint configurations for consistency across projects.

## Available Tools

| Tool | Description | Status | Tech Stack |
|------|-------------|--------|------------|
| [InstrumentPractice Pro](./apps/music-practice/) | Comprehensive instrument practice app with MIDI/microphone support for sight reading, scales, and music theory training | ✅ Complete | React + Vite + TypeScript |
| [Instrument Tuner](./apps/instrument-tuner/) | Real-time pitch detection tuner for guitar, bass, and more | ✅ Complete | React + Vite + TypeScript |
| [Local Finance](./apps/local-finance/) | Privacy-first CLI for personal finance analysis with AI categorization | 🔧 In Progress | TypeScript + SQLite |
| [Ikigai Tool](./apps/ikigai-tool/) | Interactive Ikigai discovery tool to find your purpose | ✅ Complete | React + React Flow |
| [RSVP Reader](./apps/rsvp-reader/) | Speed reading app with RSVP technology and zero-jiggle ORP | ✅ Complete | React + Vite |
| [Visual HTML Builder](./apps/visual-html-builder/) | Visual HTML editor with real-time preview and inline editing | ✅ Complete | Vanilla HTML/CSS/JS |

## Shared Packages

| Package | Description |
|---------|-------------|
| [@hudak/ui](./packages/ui/) | Shared shadcn/ui components for React apps |
| [@hudak/audio-components](./packages/audio-components/) | Audio visualization components (gauge, etc.) |
| [@tools/typescript-config](./packages/typescript-config/) | Shared TypeScript configurations |
| [@tools/eslint-config](./packages/eslint-config/) | Shared ESLint configurations |

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
│   ├── instrument-tuner/      # React + Vite app
│   ├── local-finance/         # CLI app (TypeScript)
│   ├── ikigai-tool/           # React + React Flow
│   ├── rsvp-reader/           # React + Vite app
│   └── visual-html-builder/   # Static HTML app
├── packages/                  # Shared packages
│   ├── ui/                    # Shared UI components
│   ├── audio-components/      # Audio visualization
│   ├── typescript-config/     # Shared TypeScript configs
│   └── eslint-config/         # Shared ESLint configs
├── docs/                      # Documentation and roadmaps
└── turbo.json                 # Turborepo configuration
```

## Roadmap

See [docs/tools-roadmap-feb2026.md](./docs/tools-roadmap-feb2026.md) for the full roadmap.

### Coming Soon

- **Trade Journal CLI** - Log trades, calculate stats, track P&L
- **Sobriety Tracker** - Personal milestone and check-in tracker
- **Obsidian Daily CLI** - Generate templated daily notes
- **Gap Scanner** - Pre-market gap analysis with Polygon API

### Improvements Planned

- Local Finance: Think or Swim import support
- Music Practice: Scales Quiz module
- Ikigai Tool: Guided prompts for discovery

## Development Guide

For detailed development guidelines, coding standards, and architecture documentation, see [CLAUDE.md](./CLAUDE.md).

## Adding New Tools

See the [CLAUDE.md](./CLAUDE.md#adding-new-tools) guide for templates and instructions on adding new tools to the monorepo.

### Quick Template

```bash
# Create new React app
cd apps
pnpm create vite my-tool --template react-ts
cd my-tool
# Update package.json name to @hudak/my-tool
# Add workspace dependencies if needed
```

## Deployment

All tools are automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

- Live site: [https://jhudak.github.io/tools/](https://jhudak.github.io/tools/)
- Each tool is available at `/tools/{app-name}/`

## Contributing

This is currently a personal project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm typecheck && pnpm lint`
5. Submit a pull request

## Philosophy

All tools in this monorepo follow these principles:

- **Privacy-first**: Local data, no tracking, no accounts required
- **Simple**: Do one thing well
- **Fast**: No unnecessary dependencies, quick to load
- **Portable**: Works offline when possible

## License

ISC License - see individual tool directories for specific licensing information.

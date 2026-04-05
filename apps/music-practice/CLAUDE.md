# CLAUDE.md — Music Practice

## Project

- **Name**: `@hudak/music-practice`
- **Description**: Web-based instrument practice app for sight reading, scales, chords, and key signature recognition. Supports piano (MIDI), violin, and guitar (microphone pitch detection).
- **Author**: Jonathan Hudak
- **Monorepo**: Part of `tools-monorepo` (pnpm workspaces + Turborepo)

## Tech Stack

- **Framework**: React 18 + TypeScript (ESM)
- **Bundler**: Vite (with `@vitejs/plugin-react`, `@tailwindcss/vite`)
- **Routing**: TanStack Router (file-based, auto code-splitting)
- **Data**: TanStack React Query
- **Styling**: Tailwind CSS v4 (self-contained theme in `src/index.css`)
- **Music notation**: VexFlow 4.2+
- **Music theory**: Tonal.js
- **Audio input**: Web MIDI API, Web Audio API + Pitchy (pitch detection)
- **Audio playback**: Tone.js
- **UI components**: `@hudak/ui` (shared shadcn/ui package), Lucide icons, Framer Motion, Sonner toasts
- **Testing**: Vitest + jsdom + Testing Library; Puppeteer for screenshot tests
- **Linting**: ESLint via `@tools/eslint-config`
- **TypeScript config**: extends `@tools/typescript-config/react.json`

## Key Directories

```
src/
├── routes/           # TanStack Router pages (index, play, chord-quiz, scales-quiz, chord-scale, dev, about)
├── components/       # React components
│   ├── play/         # Sight-reading game UI (notation-card, score-hud, radial-timer)
│   ├── notation/     # StaffDisplay, FallingNotesDisplay, TabDisplay
│   ├── ChordQuiz/    # Chord quiz game
│   ├── ChordReference/  # Chord diagrams, search, progression builder
│   ├── ChordScaleGame/  # Scale/chord-scale quiz (QuizGenerator, DegreeQuiz, etc.)
│   ├── ScaleReference/  # Scale diagrams and displays
│   ├── ScaleLearningHub/
│   └── ChordScaleMatrix/
├── hooks/            # use-theme, use-game-round
├── lib/
│   ├── input/        # MidiManager, AudioManager (device I/O)
│   ├── notation/     # VexFlow staff-renderer, falling-notes, tab-renderer
│   ├── utils/        # music-theory, scoring, storage, pitch-detector, audio-playback, instrument-config
│   ├── game/         # note-range, render-note
│   ├── modules/      # sight-reading module
│   ├── services/     # audio-devices
│   └── __tests__/    # Unit tests for lib (chord-library, piano-voicings, etc.)
├── data/             # chord-scale-matrix, hello
└── test/             # Vitest setup (jsdom)
docs/                 # UX research, plans (ux-overhaul)
test-screenshots/     # Puppeteer screenshot baselines
```

## Path Aliases

- `@/*` → `./src/*`
- `@hudak/ui/*` → `../../packages/ui/src/*`

## Commands

```sh
# From monorepo root (preferred):
pnpm music dev          # Start dev server (port 3000)
pnpm music build        # Production build → ../../docs/music-practice/
pnpm music test:unit    # Vitest unit tests
pnpm music typecheck    # tsc --noEmit
pnpm music lint         # ESLint

# From this directory:
pnpm dev                # Vite dev server (port 3000, auto-opens browser)
pnpm build              # Build to ../../docs/music-practice/
pnpm test:unit          # vitest run
pnpm test:watch         # vitest (watch mode)
pnpm test               # Puppeteer screenshot test (node test-sight-reading.js)
pnpm typecheck          # Type check
pnpm lint               # Lint
pnpm clean              # Remove dist + node_modules
```

## Build Output

- Builds to `../../docs/music-practice/` (GitHub Pages deployment)
- Base URL: `/tools/music-practice/`
- SPA fallback: copies index.html → 404.html for client-side routing
- Sourcemaps enabled

## Conventions

- **ESM only** (`"type": "module"` in package.json)
- **File-based routing**: Add routes in `src/routes/`. TanStack Router auto-generates `src/routeTree.gen.ts` — do not edit manually.
- **Component colocation**: Feature components live in named subdirectories under `src/components/` (e.g., `ChordQuiz/`, `ChordReference/`). Tests colocated in `__tests__/` subdirs.
- **Shared UI**: Import from `@hudak/ui` for base components (Button, Card, Select, etc.). These consume CSS custom properties defined in `src/index.css`.
- **Self-contained theme**: `src/index.css` is fully self-contained (does NOT import shared globals). It defines all CSS custom properties for the warm palette theme.
- **Music theory utils**: Use `tonal` library for note/scale/chord operations. App-specific helpers in `src/lib/utils/music-theory.ts`.
- **Input abstraction**: MidiManager for MIDI keyboards, AudioManager for microphone. Both in `src/lib/input/`.
- **Storage**: LocalStorage-based persistence via `src/lib/utils/storage.ts`. No backend/API.
- **Testing**: Vitest for unit tests. Test files use `.test.ts` / `.test.tsx` suffix, colocated near source or in `__tests__/` dirs.

## Legacy Directories (ignore)

- `js/` — Old pre-Vite source (excluded from tsconfig)
- `css/` — Old stylesheets
- `Music Learning Game App/` — Earlier prototype/reference (separate package.json)

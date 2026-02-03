# CLAUDE.md - Development Guide

> AI-assisted development guide for the Tools monorepo. This document outlines standards, architecture, and conventions for building focused web-based tools.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Coding Standards](#coding-standards)
- [Development Workflow](#development-workflow)
- [Migration Plan: React + Vite + Turborepo](#migration-plan-react--vite--turborepo)
- [Adding New Tools](#adding-new-tools)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

### Mission
A collection of small, useful tools built with AI-assisted coding. Each tool is designed to be simple, focused, and practical.

### Current Tools
- **music-practice/** - InstrumentPractice Pro: Multi-instrument practice app with MIDI/microphone support (TypeScript + tsup)
- **visual-html-builder/** - Visual HTML editor with real-time preview (vanilla HTML/CSS/JS)

### Technology Philosophy
- **Simplicity First**: Prefer vanilla/minimal dependencies unless complexity warrants a framework
- **Progressive Enhancement**: Start simple, add complexity only when needed
- **AI-Assisted**: Built with AI pair programming (Claude Code, GitHub Copilot, etc.)
- **User-Focused**: No tracking, no accounts, privacy-first design

---

## Architecture

### Monorepo Structure

```
tools/
├── .claude/                      # Claude Code configuration
├── .github/workflows/            # CI/CD pipelines
├── docs/                         # GitHub Pages deployment output (generated)
├── build.js                      # Custom build orchestrator
├── package.json                  # Root dependencies (CI/CD tools)
├── CLAUDE.md                     # This file
├── README.md                     # User-facing documentation
│
├── [tool-name]/                  # Individual tool directories
│   ├── package.json              # Optional: for TypeScript/build tools
│   ├── tsconfig.json             # Optional: TypeScript configuration
│   ├── index.html                # Required: Entry point
│   ├── README.md                 # Tool-specific documentation
│   ├── PRD.md                    # Optional: Product requirements
│   ├── css/                      # Stylesheets
│   ├── js/ or src/               # Source code
│   └── dist/                     # Build output (generated)
│
└── shared/ (future)              # Shared configurations and utilities
```

### Build System

**Current**: Custom Node.js build script (`build.js`)
- Detects apps with `package.json` + build script → runs `npm ci && npm run build`
- Detects static HTML apps → copies files as-is
- Outputs to `docs/` for GitHub Pages deployment
- Generates landing page with links to all tools

**Future**: Turborepo (see Migration Plan)

---

## Coding Standards

### TypeScript Standards

#### Configuration Template (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*", "js/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Key Principles**:
- **Strict Mode**: Always enable strict type checking
- **ES2020+**: Target modern JavaScript for browser environments
- **ESNext Modules**: Use ESM for future compatibility
- **Source Maps**: Enable for debugging
- **No Unused Code**: Enforce clean code with noUnusedLocals/Parameters
- **Bundler Resolution**: Use "bundler" mode for Vite/tsup compatibility

#### Naming Conventions

```typescript
// Classes: PascalCase
class MidiManager { }
class StaffRenderer { }

// Interfaces/Types: PascalCase with descriptive names
interface AudioConfig { }
type NoteValidator = (note: number) => boolean;

// Functions/Methods: camelCase with verb prefixes
function detectPitch() { }
function validateNote() { }
function renderStaff() { }

// Constants: UPPER_SNAKE_CASE for true constants
const MAX_PITCH_TOLERANCE = 50;
const DEFAULT_INSTRUMENT = 'piano';

// Variables: camelCase
let currentNote = 60;
const midiDevice = null;

// Files: kebab-case
// audio-manager.ts, pitch-detector.ts, staff-renderer.ts
```

#### Code Organization

```typescript
// 1. Imports (external, then internal)
import { Note } from 'tonal';
import { analyzeFrequency } from 'pitchy';

import { MidiManager } from './midi/midi-manager';
import type { InstrumentConfig } from './types';

// 2. Types/Interfaces
interface PracticeSession {
  startTime: number;
  correctNotes: number;
  totalNotes: number;
}

// 3. Constants
const DEFAULT_TIMEOUT = 5000;

// 4. Class/Function definitions
export class AudioManager {
  private audioContext: AudioContext | null = null;

  constructor(private config: AudioConfig) {
    this.initialize();
  }

  private initialize(): void {
    // Implementation
  }

  public async startListening(): Promise<void> {
    // Public API
  }
}

// 5. Exports (if not inline)
export { AudioManager };
```

---

### ESLint Standards

#### Recommended Configuration (`.eslintrc.json`)

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-debugger": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
  "env": {
    "browser": true,
    "es2020": true,
    "node": true
  }
}
```

**Shared Config (Future with Turborepo)**:
- Create `packages/eslint-config/` with presets
- Extend in individual tools: `"extends": ["@tools/eslint-config"]`

**Key Rules**:
- No `any` types (use `unknown` or specific types)
- Explicit return types for public functions
- No `var`, prefer `const` over `let`
- Console logs allowed only for warnings/errors (not debug logs)
- Use type imports when possible

---

### CSS/Styling Standards

#### Tailwind CSS v4 + shadcn/ui (React Apps)

For React applications, we use Tailwind CSS v4 with the Vite plugin and shadcn/ui components.

**Key Setup Requirements:**

1. **Package Structure:**
```
packages/ui/
├── src/
│   ├── components/        # shadcn/ui components
│   ├── lib/utils.ts       # cn() utility
│   └── styles/
│       └── globals.css    # Tailwind + theme config
```

2. **Critical: Custom Utility Classes**

Tailwind v4 does NOT automatically generate utilities for custom CSS variables. You must explicitly define them:

```css
/* packages/ui/src/styles/globals.css */
@import "tailwindcss";

@source "../**/*.{ts,tsx}";  /* Tell Tailwind to scan UI components */

@theme {
  /* Define color variables in HSL format */
  --color-popover: 0 0% 100%;
  --color-card: 0 0% 100%;
  /* ... other colors */
}

.dark {
  /* Dark mode overrides */
  --color-popover: 0 0% 10%;
  --color-card: 0 0% 15%;
}

@layer base {
  * {
    border-color: hsl(var(--color-border));
  }
  body {
    background-color: hsl(var(--color-background));
    color: hsl(var(--color-foreground));
  }
}

/* CRITICAL: Manually define semantic color utilities */
@layer utilities {
  .bg-popover {
    background-color: hsl(var(--color-popover));
  }
  .bg-card {
    background-color: hsl(var(--color-card));
  }
  .text-popover-foreground {
    color: hsl(var(--color-popover-foreground));
  }
  .text-card-foreground {
    color: hsl(var(--color-card-foreground));
  }
  /* Add all other semantic color utilities */
}
```

**Why This Is Required:**
- Tailwind v4 automatically generates utilities like `bg-red-500` from its built-in color palette
- Custom CSS variables (like `--color-popover`) are NOT automatically converted to utilities
- shadcn/ui components use classes like `bg-popover`, which won't work without explicit definitions
- The `@source` directive tells Tailwind where to scan for class names

3. **App-Level CSS:**
```css
/* apps/music-practice/src/index.css */
@import "@hudak/ui/styles/globals.css";

/* Override theme colors for this app */
:root {
  --color-primary: 222 47% 55%;
  --radius-lg: 0.75rem;
}

.dark {
  --color-primary: 222 47% 65%;
}
```

4. **Vite Configuration:**
```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // No config needed - uses CSS-based config
  ],
});
```

5. **Dark Mode Toggle:**
```typescript
// Toggle dark mode by adding/removing .dark class on documentElement
const toggleTheme = () => {
  document.documentElement.classList.toggle('dark');
};
```

#### Vanilla CSS (Non-React Apps)

For non-React apps, use standard CSS Custom Properties:

```
css/
├── reset.css          # Optional: CSS reset/normalization
├── variables.css      # CSS custom properties (design tokens)
├── components.css     # Reusable component styles
└── styles.css         # Main stylesheet (imports others or standalone)
```

#### CSS Custom Properties (Design Tokens)

```css
:root {
  /* Colors - Semantic naming */
  --color-primary: #667eea;
  --color-primary-dark: #5568d3;
  --color-secondary: #764ba2;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;

  /* Neutral colors */
  --color-bg: #ffffff;
  --color-surface: #f8f9fa;
  --color-text: #2c3e50;
  --color-text-muted: #7f8c8d;
  --color-border: #dee2e6;

  /* Spacing scale (0.25rem base) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;

  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;

  /* Borders */
  --border-radius-sm: 4px;
  --border-radius: 8px;
  --border-radius-lg: 12px;
  --border-width: 1px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;
}

/* Dark theme */
[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-surface: #2d2d2d;
  --color-text: #e4e4e7;
  --color-text-muted: #a1a1aa;
  --color-border: #404040;
}
```

#### BEM-like Naming Convention

```css
/* Block */
.staff-renderer { }

/* Block__Element */
.staff-renderer__canvas { }
.staff-renderer__controls { }

/* Block--Modifier */
.staff-renderer--dark-theme { }
.staff-renderer--compact { }

/* Block__Element--Modifier */
.staff-renderer__button--active { }
```

**Avoid**:
- Deep nesting (max 2-3 levels)
- IDs for styling (use classes)
- `!important` (redesign specificity instead)
- Inline styles (use utility classes or CSS-in-JS if needed)

#### Responsive Design

```css
/* Mobile-first approach */
.container {
  padding: var(--space-4);
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
  }
}
```

**Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: >= 1024px

---

### JavaScript/TypeScript Code Style

#### General Principles

1. **Prefer Functional Patterns**: Use pure functions, immutability, and composition
2. **Avoid Side Effects**: Keep functions predictable and testable
3. **Single Responsibility**: Each function/class should do one thing well
4. **Descriptive Names**: Code should be self-documenting
5. **Comments**: Explain "why", not "what"

```typescript
// ❌ Bad: Unclear, mutating, side effects
function proc(d: any) {
  d.status = 'active';
  saveToDb(d);
  return d;
}

// ✅ Good: Clear, immutable, explicit
function activateUser(user: User): User {
  const updatedUser = { ...user, status: 'active' };
  return updatedUser;
}

// Side effect handled separately
async function saveActivatedUser(user: User): Promise<void> {
  const activated = activateUser(user);
  await database.save(activated);
}
```

#### Error Handling

```typescript
// Always handle errors explicitly
async function loadMidiDevice(): Promise<MidiDevice | null> {
  try {
    const access = await navigator.requestMIDIAccess();
    return access.inputs.values().next().value ?? null;
  } catch (error) {
    console.error('Failed to access MIDI device:', error);
    return null;
  }
}

// For critical errors, throw with context
class AudioInitError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'AudioInitError';
  }
}

async function initializeAudio(): Promise<AudioContext> {
  try {
    return new AudioContext();
  } catch (error) {
    throw new AudioInitError(
      'Failed to initialize Web Audio API. Check browser compatibility.',
      error instanceof Error ? error : undefined
    );
  }
}
```

#### Async/Await Patterns

```typescript
// ✅ Good: Sequential operations
async function setupAudio() {
  const context = await createAudioContext();
  const stream = await getUserMedia();
  const analyzer = createAnalyzer(context, stream);
  return analyzer;
}

// ✅ Good: Parallel operations
async function loadResources() {
  const [samples, config, presets] = await Promise.all([
    loadAudioSamples(),
    loadConfiguration(),
    loadPresets()
  ]);
  return { samples, config, presets };
}

// ❌ Avoid: Mixing then() and await
async function badPattern() {
  const result = await fetchData().then(data => process(data)); // Just use await!
  return result;
}
```

---

### Security Standards

#### Input Validation

```typescript
// Always validate external inputs
function parseNoteInput(input: unknown): number | null {
  if (typeof input !== 'number') return null;
  if (input < 0 || input > 127) return null; // MIDI range
  if (!Number.isInteger(input)) return null;
  return input;
}

// Sanitize user-provided strings
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 255);
}
```

#### Content Security

```html
<!-- Add CSP headers to prevent XSS -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';">
```

#### Avoid Common Vulnerabilities

- **XSS**: Never use `innerHTML` with user input (use `textContent`)
- **Injection**: Validate all inputs, use parameterized queries if using a backend
- **CSRF**: Not applicable for client-only apps, but add tokens if adding backend
- **Sensitive Data**: Never store secrets in localStorage (API keys, tokens, etc.)

```typescript
// ❌ Bad: XSS vulnerability
element.innerHTML = userInput;

// ✅ Good: Safe text insertion
element.textContent = userInput;

// ✅ Good: Safe HTML with sanitization (if needed)
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

---

## Development Workflow

### Getting Started

```bash
# Clone repository
git clone https://github.com/[username]/tools.git
cd tools

# Install root dependencies (CI/CD tools)
npm install

# Navigate to a specific tool
cd music-practice

# Install tool dependencies
npm install

# Start development server (if configured)
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
```

### Branch Strategy

- **main**: Production-ready code, auto-deploys to GitHub Pages
- **feature/[name]**: Feature development branches
- **fix/[name]**: Bug fix branches

### Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add microphone support for violin input
fix: correct pitch detection tolerance calculation
docs: update README with browser compatibility
refactor: extract MIDI logic into separate manager
perf: optimize canvas rendering for falling notes
test: add unit tests for music theory utilities
chore: update dependencies
```

**Semantic Release Integration**:
- `feat:` → Minor version bump (1.0.0 → 1.1.0)
- `fix:` → Patch version bump (1.0.0 → 1.0.1)
- `BREAKING CHANGE:` → Major version bump (1.0.0 → 2.0.0)

### Testing Strategy

**Current**: Manual testing via browser
**Future**: Add automated testing

```json
// package.json (future)
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "happy-dom": "^12.0.0"
  }
}
```

**Test Organization**:
```
src/
├── utils/
│   ├── music-theory.ts
│   └── music-theory.test.ts
```

---

## Workflow Orchestration for AI Agents

> **For AI Agents**: This section outlines the workflow orchestration principles and strategies for working effectively on this codebase.

### Core Principles

#### Simplicity First

- **Prefer minimal solutions**: Choose the simplest approach that solves the problem
- **Avoid over-engineering**: Don't add features, abstractions, or complexity that isn't explicitly needed
- **Question complexity**: If a solution feels complex, step back and find a simpler path
- **Incremental improvements**: Make small, focused changes rather than large refactors

```typescript
// ❌ Over-engineered
class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: Map<string, unknown>;

  private constructor() {
    this.config = new Map();
  }

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  set(key: string, value: unknown): void {
    this.config.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.config.get(key) as T | undefined;
  }
}

// ✅ Simple and sufficient
const config = {
  maxRetries: 3,
  timeout: 5000,
} as const;
```

#### No Laziness

- **Complete implementations**: Never use placeholders, TODOs, or stub implementations
- **Write real code**: Every function must have a complete, working implementation
- **No shortcuts**: Avoid cutting corners or deferring work to "later"
- **Test as you go**: Verify functionality immediately, don't defer testing

```typescript
// ❌ Lazy implementation
async function processData(data: Data): Promise<Result> {
  // TODO: Implement data processing
  throw new Error('Not implemented');
}

// ✅ Complete implementation
async function processData(data: Data): Promise<Result> {
  const validated = validateData(data);
  const transformed = transformData(validated);
  return await saveResult(transformed);
}
```

#### Minimal Impact

- **Surgical changes**: Modify only what's necessary to achieve the goal
- **Preserve working code**: Don't refactor or "improve" code that isn't broken
- **Respect existing patterns**: Follow the established conventions in the codebase
- **Avoid scope creep**: Stick to the task at hand, don't expand the scope

```typescript
// Task: Add error logging to the save function

// ❌ Too much impact - unnecessary refactoring
async function saveData(data: Data): Promise<void> {
  // Refactored entire function to use new patterns
  try {
    const repository = new DataRepository();
    const entity = DataMapper.toEntity(data);
    await repository.save(entity);
    logger.info('Data saved successfully');
  } catch (error) {
    logger.error('Failed to save data', error);
    throw error;
  }
}

// ✅ Minimal impact - only adds logging
async function saveData(data: Data): Promise<void> {
  try {
    await database.save(data);
    console.error('Data saved successfully'); // Added
  } catch (error) {
    console.error('Failed to save data:', error); // Added
    throw error;
  }
}
```

### Workflow Orchestration Strategies

#### Plan Mode

Use plan mode for complex tasks that require:
- Multiple file modifications
- Architectural decisions
- Understanding unfamiliar code
- Coordinating changes across the codebase

**When to use plan mode:**
```
✅ Adding a new feature with multiple components
✅ Refactoring a significant portion of code
✅ Implementing a complex algorithm
✅ Making changes that affect multiple systems

❌ Fixing a simple typo
❌ Adding a single function
❌ Updating documentation
❌ Making trivial configuration changes
```

**Plan mode workflow:**
1. **Explore**: Use Glob/Grep to understand the codebase structure
2. **Design**: Create a step-by-step plan with clear objectives
3. **Review**: Present the plan for approval
4. **Execute**: Implement the plan methodically
5. **Verify**: Test and validate each step

#### Subagent Strategy

Delegate specialized tasks to focused subagents:

- **Explore agent**: For finding files, searching code, understanding architecture
- **General-purpose agent**: For complex multi-step research tasks
- **Task agent**: For autonomous execution of well-defined tasks

**Example delegation:**
```markdown
Task: Optimize database queries in the API layer

Main agent:
1. Use Explore agent to find all API endpoints
2. Use Grep to identify database query patterns
3. Use Task agent to implement query optimizations
4. Verify improvements with benchmarks
```

#### Self-Improvement Loop

Continuously refine your approach:

1. **Execute**: Implement the current task
2. **Observe**: Note what worked well and what didn't
3. **Reflect**: Identify patterns and anti-patterns
4. **Adapt**: Adjust your approach for the next task
5. **Document**: Record lessons learned in `tasks/lessons.md`

**Example reflection:**
```markdown
## Lesson: Always read the full file before editing

### What happened:
Made an edit to a function without reading the entire file, missed that
the function was called with different parameter types in other locations.

### Impact:
Introduced a type error that broke the build.

### Improvement:
Always use Read tool to view the complete file before making edits.
Check for all usages with Grep when modifying function signatures.
```

#### Verification Strategy

Always verify changes before marking tasks complete:

**Pre-commit verification:**
- [ ] Code compiles/builds without errors
- [ ] Type checking passes (`pnpm run typecheck`)
- [ ] Linting passes (`pnpm run lint`)
- [ ] Tests pass (if applicable)
- [ ] Changes match the original request
- [ ] No unintended side effects

**Post-commit verification:**
- [ ] CI/CD pipeline succeeds
- [ ] Deployed changes work as expected
- [ ] No regressions in existing functionality

#### Demand Elegance

Strive for code that is:
- **Readable**: Clear variable names, logical structure
- **Maintainable**: Easy to modify and extend
- **Robust**: Handles edge cases and errors gracefully
- **Efficient**: Performs well without premature optimization

```typescript
// ❌ Not elegant
const f = (d: any) => {
  let r = [];
  for (let i = 0; i < d.length; i++) {
    if (d[i].t === 'a' && d[i].v > 10) {
      r.push(d[i]);
    }
  }
  return r;
};

// ✅ Elegant
function filterActiveItems(items: Item[]): Item[] {
  return items.filter(item =>
    item.type === 'active' && item.value > 10
  );
}
```

#### Autonomous Bug Fixing

When you encounter errors:

1. **Read the error**: Understand the complete error message and stack trace
2. **Locate the cause**: Use Grep/Read to find the source of the issue
3. **Fix immediately**: Don't defer or report back - fix it
4. **Verify the fix**: Rebuild and test to ensure it's resolved
5. **Continue**: Resume the original task

**Example workflow:**
```markdown
Task: Add new API endpoint

1. Create endpoint handler [Done]
2. Add routing [Done]
3. Run build
   → Error: Type 'string' is not assignable to type 'number'
   → Fixed: Corrected type in request validator
   → Re-run build: Success
4. Add tests [In Progress]
```

### Task Management Workflow

#### Using TodoWrite

Use the TodoWrite tool to:
- Track multi-step tasks
- Maintain focus and context
- Provide transparency to users
- Avoid forgetting critical steps

**Best practices:**
```markdown
✅ Break down tasks into specific, actionable items
✅ Mark tasks in_progress before starting them
✅ Complete tasks immediately after finishing
✅ Add new tasks as you discover them
✅ Remove tasks that are no longer relevant

❌ Don't batch completions (mark done immediately)
❌ Don't leave tasks in_progress when switching
❌ Don't mark incomplete work as complete
❌ Don't create vague tasks like "Fix everything"
```

**Example task list:**
```markdown
- [x] Read existing authentication code
- [x] Design JWT token structure
- [ ] Implement token generation
- [ ] Add token validation middleware
- [ ] Update login endpoint
- [ ] Add refresh token logic
- [ ] Write authentication tests
- [ ] Update API documentation
```

#### Task Breakdown Strategy

**Complex task → Small, manageable steps:**

```markdown
Task: Implement user authentication

Too broad:
- [ ] Add authentication

Better breakdown:
- [ ] Install JWT library
- [ ] Create token generation utility
- [ ] Add password hashing function
- [ ] Create authentication middleware
- [ ] Update user model with password field
- [ ] Add login endpoint
- [ ] Add logout endpoint
- [ ] Add password reset flow
- [ ] Write unit tests for auth utilities
- [ ] Write integration tests for auth endpoints
- [ ] Update API documentation
```

#### Progress Tracking

Update task status in real-time:

- **pending**: Task not started
- **in_progress**: Currently working on (only ONE at a time)
- **completed**: Finished and verified

**Workflow:**
1. Start task → Mark as `in_progress`
2. Complete task → Immediately mark as `completed`
3. Discover new requirement → Add as `pending`
4. Hit blocker → Add subtask to resolve blocker
5. Finish all tasks → Provide summary

---

## Migration Plan: React + Vite + Turborepo

### Goals

1. **Modern Build System**: Replace custom `build.js` with Turborepo
2. **Framework Adoption**: Migrate music-practice to React for better state management
3. **Shared Configuration**: Centralize TypeScript, ESLint, and build configs
4. **Improved DX**: Hot module replacement, faster builds, better debugging

### Target Structure

```
tools/
├── .github/workflows/           # CI/CD (updated for Turborepo)
├── apps/
│   ├── music-practice/          # React + Vite app
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json        # Extends @tools/tsconfig
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── components/
│   │       ├── hooks/
│   │       └── utils/
│   └── visual-html-builder/     # Static or migrate to React later
│
├── packages/
│   ├── eslint-config/           # Shared ESLint config
│   │   ├── package.json
│   │   ├── index.js
│   │   └── react.js
│   ├── typescript-config/       # Shared TypeScript configs
│   │   ├── package.json
│   │   ├── base.json
│   │   ├── react.json
│   │   └── node.json
│   ├── ui/                      # Shared React components (future)
│   └── utils/                   # Shared utilities (music-theory, etc.)
│
├── turbo.json                   # Turborepo pipeline config
├── package.json                 # Root workspace config
└── pnpm-workspace.yaml          # pnpm workspaces config
```

### Phase 1: Setup Turborepo

```bash
# Initialize Turborepo
npx create-turbo@latest

# Or migrate manually
npm install turbo --save-dev
```

**turbo.json**:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "docs/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

**Root package.json**:
```json
{
  "name": "tools-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "typecheck": "turbo run typecheck",
    "lint": "turbo run lint",
    "deploy": "turbo run build && gh-pages -d docs -t true"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "gh-pages": "^6.3.0"
  }
}
```

### Phase 2: Create Shared Configs

**packages/typescript-config/package.json**:
```json
{
  "name": "@tools/typescript-config",
  "version": "0.0.0",
  "private": true,
  "files": ["base.json", "react.json", "node.json"]
}
```

**packages/typescript-config/base.json**:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**packages/typescript-config/react.json**:
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

**packages/eslint-config/package.json**:
```json
{
  "name": "@tools/eslint-config",
  "version": "0.0.0",
  "private": true,
  "main": "index.js",
  "files": ["index.js", "react.js"],
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

**packages/eslint-config/react.js**:
```javascript
module.exports = {
  extends: [
    './index.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off' // Using TypeScript
  }
};
```

### Phase 3: Migrate music-practice to React + Vite

**apps/music-practice/package.json**:
```json
{
  "name": "music-practice",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "tonal": "^6.4.2",
    "pitchy": "^4.1.0"
  },
  "devDependencies": {
    "@tools/eslint-config": "workspace:*",
    "@tools/typescript-config": "workspace:*",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "typescript": "^5.9.3"
  }
}
```

**apps/music-practice/vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/music-practice/', // For GitHub Pages
  build: {
    outDir: '../../docs/music-practice',
    emptyOutDir: true,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
```

**apps/music-practice/tsconfig.json**:
```json
{
  "extends": "@tools/typescript-config/react.json",
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Migration Steps**:
1. Create React app structure in `apps/music-practice/`
2. Convert TypeScript modules to React components
3. Replace manual DOM manipulation with React state/refs
4. Extract reusable logic into custom hooks
5. Update build pipeline in CI/CD

**Example Component Migration**:

```typescript
// Before (vanilla TS)
class StaffRenderer {
  private container: HTMLElement;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
  }

  render(note: number) {
    this.container.innerHTML = ''; // Clear
    // VexFlow rendering...
  }
}

// After (React)
import { useEffect, useRef } from 'react';

interface StaffRendererProps {
  note: number | null;
}

export function StaffRenderer({ note }: StaffRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || note === null) return;

    // VexFlow rendering logic
    const renderer = new Vex.Flow.Renderer(
      containerRef.current,
      Vex.Flow.Renderer.Backends.SVG
    );
    // ... render note

    return () => {
      // Cleanup
      containerRef.current!.innerHTML = '';
    };
  }, [note]);

  return <div ref={containerRef} className="staff-renderer" />;
}
```

### Phase 4: Update CI/CD

**.github/workflows/release.yml** (updated):
```yaml
name: Release and Deploy

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build all apps
        run: pnpm run build

      - name: Deploy to GitHub Pages
        run: pnpm run deploy
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Phase 5: Developer Experience Improvements

**VS Code Workspace Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.workingDirectories": [
    { "pattern": "apps/*" },
    { "pattern": "packages/*" }
  ]
}
```

**Recommended Extensions** (`.vscode/extensions.json`):
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## Adding New Tools

> **For AI Agents**: See `AGENTS.md` for detailed instructions on adding tools, including common pitfalls and the critical requirement to add tool metadata to `scripts/generate-landing.js`.

### Quick Start Checklist

- [ ] Create directory: `apps/[tool-name]/`
- [ ] Add `package.json` with standard scripts
- [ ] Extend shared configs: `@tools/typescript-config`, `@tools/eslint-config`
- [ ] Create `index.html` as entry point
- [ ] Add README.md with:
  - Features
  - Getting started
  - Browser compatibility
  - Architecture
- [ ] Configure Vite build to output to `docs/[tool-name]/`
- [ ] **CRITICAL: Add tool metadata to `scripts/generate-landing.js`** (REQUIRED - tool must be added to `toolMetadata` object with name, description, techStack, type, and hasDeployment)
- [ ] Update root README with tool listing
- [ ] Test build: `pnpm run build`
- [ ] Test deploy locally: `pnpm run preview`
- [ ] Verify tool appears in build output (check console for "Found X tool(s)")
- [ ] Verify tool card appears in `docs/index.html` after build (landing page is auto-generated)

### Template: New React + Vite Tool

```bash
# From repo root
cd apps
mkdir my-new-tool
cd my-new-tool

# Initialize package.json
cat > package.json << 'EOF'
{
  "name": "my-new-tool",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@tools/eslint-config": "workspace:*",
    "@tools/typescript-config": "workspace:*",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "typescript": "^5.9.3"
  }
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "extends": "@tools/typescript-config/react.json",
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/my-new-tool/',
  build: {
    outDir: '../../docs/my-new-tool',
    emptyOutDir: true,
    sourcemap: true
  }
});
EOF

# Create source structure
mkdir -p src
cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

cat > src/App.tsx << 'EOF'
export default function App() {
  return (
    <div>
      <h1>My New Tool</h1>
      <p>Start building!</p>
    </div>
  );
}
EOF

# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My New Tool</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
EOF

# Install dependencies
pnpm install

# Start dev server
pnpm run dev
```

---

## Deployment

### GitHub Pages Configuration

**Repository Settings**:
- Source: Deploy from branch
- Branch: `main`
- Folder: `/docs`

**Custom Domain** (optional):
1. Add `CNAME` file to `docs/`:
   ```
   tools.yourdomain.com
   ```
2. Configure DNS with CNAME record pointing to `[username].github.io`

### Build Pipeline

```bash
# Local build and deploy
pnpm run build    # Build all apps to docs/
pnpm run deploy   # Push docs/ to gh-pages branch

# Automated via GitHub Actions
# Triggered on push to main branch
```

### Environment-Specific Builds

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/my-tool/' : '/',
  build: {
    sourcemap: mode !== 'production'
  }
}));
```

---

## Troubleshooting

### Common Issues

#### TypeScript Errors After Adding Dependency

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
pnpm install

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### Vite Build Fails with "Cannot find module"

```typescript
// Check vite.config.ts resolve.alias
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}

// Ensure tsconfig.json has matching paths
"paths": {
  "@/*": ["./src/*"]
}
```

#### ESLint Errors in React Files

```bash
# Ensure @vitejs/plugin-react is installed
pnpm add -D @vitejs/plugin-react

# Check eslint config extends react preset
# .eslintrc.json
{
  "extends": ["@tools/eslint-config/react"]
}
```

#### Turborepo Cache Issues

```bash
# Clear Turborepo cache
pnpm turbo run build --force

# Or delete cache directory
rm -rf .turbo
```

#### GitHub Pages Deployment Issues

1. Check `docs/` directory exists and has content
2. Verify `base` in vite.config.ts matches repository name
3. Ensure `.nojekyll` file is in `docs/`
4. Check GitHub Actions logs for errors

---

## Resources

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Turborepo Handbook](https://turbo.build/repo/docs)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)

### Tools Used
- **tonal**: Music theory library
- **pitchy**: Pitch detection
- **VexFlow**: Music notation rendering
- **Web MIDI API**: MIDI device access
- **Web Audio API**: Audio processing

### Code Quality
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [BEM Methodology](http://getbem.com/)

---

## Version History

### v1.0.0 - Initial CLAUDE.md (2025-01-04)
- Documented current architecture and standards
- Established TypeScript, ESLint, and CSS conventions
- Created migration plan for React + Vite + Turborepo
- Added templates for new tools

---

**Questions or Suggestions?**
Open an issue on GitHub or reach out to the maintainer.


## Docs

Always put new documents within `./docs`
Use sub folders to categorize like `./docs/plans` and `./docs/research`
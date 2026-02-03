# Obsidian Plugins Migration Guide

Complete step-by-step guide for migrating the three Obsidian plugins from [jonathanhudak/obsidian-tools](https://github.com/jonathanhudak/obsidian-tools) into the tools monorepo.

## Overview

**Plugins to migrate:**
1. **habit-calendar** - GitHub-style calendar for habit tracking
2. **music-embed** - Music embed with time markers
3. **time** - Time markers in notes

**Migration goals:**
- Flat directory structure: `apps/obsidian-{plugin-name}/`
- Preserve git history via subtree merge
- Convert from Svelte to React
- Adopt pnpm workspace conventions
- Follow CLAUDE.md standards

---

## Phase 1: Git Subtree Merge (Preserves History)

### Step 1: Add Source Repository as Remote

```bash
cd /path/to/tools
git checkout claude/issue-33-20260203-0636  # Or your working branch

# Add obsidian-tools as a remote
git remote add obsidian-tools https://github.com/jonathanhudak/obsidian-tools.git

# Fetch all branches and history
git fetch obsidian-tools
```

### Step 2: Create Plugin Directories

```bash
mkdir -p apps/obsidian-habit-calendar
mkdir -p apps/obsidian-music-embed
mkdir -p apps/obsidian-time
```

### Step 3: Subtree Merge Each Plugin

**Option A: Merge entire repo, then restructure**
```bash
# Merge the entire obsidian-tools repo preserving history
git subtree add --prefix=temp-obsidian-tools obsidian-tools main --squash

# Move plugins to their flat locations
git mv temp-obsidian-tools/habit-calendar/* apps/obsidian-habit-calendar/
git mv temp-obsidian-tools/music-embed/* apps/obsidian-music-embed/
git mv temp-obsidian-tools/time/* apps/obsidian-time/

# Remove temporary directory
git rm -rf temp-obsidian-tools

# Commit the restructure
git commit -m "refactor: restructure obsidian plugins to flat directory structure

Moved plugins from temp-obsidian-tools/ to flat apps/ structure:
- habit-calendar -> apps/obsidian-habit-calendar
- music-embed -> apps/obsidian-music-embed
- time -> apps/obsidian-time

Co-authored-by: Jonathan Hudak <jonathanhudak@users.noreply.github.com>"
```

**Option B: Merge each plugin individually (cleaner but more complex)**
```bash
# This requires the source repo to have subdirectories for each plugin
# Use if obsidian-tools has a plugins/ directory structure

git subtree add --prefix=apps/obsidian-habit-calendar \
  obsidian-tools main:habit-calendar --squash

git subtree add --prefix=apps/obsidian-music-embed \
  obsidian-tools main:music-embed --squash

git subtree add --prefix=apps/obsidian-time \
  obsidian-tools main:time --squash
```

---

## Phase 2: Convert to React + Vite

For each plugin, perform the following conversion:

### 2.1 Update package.json

**Before (Svelte + esbuild):**
```json
{
  "name": "obsidian-habit-calendar",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "dev": "esbuild src/main.ts --bundle --watch --external:obsidian --outfile=main.js",
    "build": "esbuild src/main.ts --bundle --external:obsidian --outfile=main.js"
  },
  "devDependencies": {
    "obsidian": "^1.0.0",
    "svelte": "^3.0.0",
    "esbuild": "^0.17.0",
    "typescript": "^4.9.0"
  }
}
```

**After (React + Vite):**
```json
{
  "name": "@hudak/obsidian-habit-calendar",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@hudak/ui": "workspace:*",
    "@tanstack/react-router": "^1.91.8"
  },
  "devDependencies": {
    "@tools/eslint-config": "workspace:*",
    "@tools/typescript-config": "workspace:*",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.7",
    "typescript": "^5.9.3",
    "eslint": "^9.18.0",
    "vite-tsconfig-paths": "^5.1.4",
    "@tailwindcss/vite": "^4.1.16"
  }
}
```

### 2.2 Create Vite Configuration

**apps/obsidian-habit-calendar/vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  base: '/tools/obsidian-habit-calendar/',
  build: {
    outDir: '../../docs/obsidian-habit-calendar',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 3005,
    open: true,
  },
});
```

### 2.3 Update TypeScript Configuration

**apps/obsidian-habit-calendar/tsconfig.json:**
```json
{
  "extends": "@tools/typescript-config/react.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 2.4 Add ESLint Configuration

**apps/obsidian-habit-calendar/.eslintrc.json:**
```json
{
  "extends": ["@tools/eslint-config/react"],
  "parserOptions": {
    "project": "./tsconfig.json"
  }
}
```

### 2.5 Create Entry Point Files

**apps/obsidian-habit-calendar/index.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Habit Calendar - Track Your Daily Habits</title>
  <meta name="description" content="GitHub-style calendar for tracking daily habits">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

**apps/obsidian-habit-calendar/src/main.tsx:**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**apps/obsidian-habit-calendar/src/index.css:**
```css
@import "@hudak/ui/styles/globals.css";

:root {
  --color-primary: 222 47% 55%;
  --radius-lg: 0.75rem;
}

.dark {
  --color-primary: 222 47% 65%;
}
```

### 2.6 Convert Svelte Components to React

**Svelte Pattern → React Pattern**

**Before (Svelte):**
```svelte
<!-- HabitCalendar.svelte -->
<script lang="ts">
  export let habits: Habit[];
  let selectedDate: string = '';

  function handleDateClick(date: string) {
    selectedDate = date;
  }
</script>

<div class="habit-calendar">
  {#each habits as habit}
    <div class="habit-day" on:click={() => handleDateClick(habit.date)}>
      {habit.date}
    </div>
  {/each}
</div>
```

**After (React):**
```typescript
// HabitCalendar.tsx
import { useState } from 'react';

interface Habit {
  date: string;
  // ... other fields
}

interface HabitCalendarProps {
  habits: Habit[];
}

export function HabitCalendar({ habits }: HabitCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className="habit-calendar">
      {habits.map((habit) => (
        <div
          key={habit.date}
          className="habit-day"
          onClick={() => handleDateClick(habit.date)}
        >
          {habit.date}
        </div>
      ))}
    </div>
  );
}
```

### 2.7 Update App Root Component

**apps/obsidian-habit-calendar/src/App.tsx:**
```typescript
import { HabitCalendar } from './components/HabitCalendar';
import { useMockHabits } from './hooks/useMockHabits';

export default function App() {
  const habits = useMockHabits();

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Habit Calendar</h1>
        <p className="text-muted-foreground">
          Track your daily habits with a GitHub-style calendar
        </p>
      </header>

      <main>
        <HabitCalendar habits={habits} />
      </main>
    </div>
  );
}
```

---

## Phase 3: Add Tool Metadata

### 3.1 Update scripts/generate-landing.js

Add each plugin to the `toolMetadata` object:

```javascript
const toolMetadata = {
  // ... existing tools

  'obsidian-habit-calendar': {
    name: 'Habit Calendar',
    description: 'GitHub-style calendar for tracking daily habits (Don\'t break the chain)',
    techStack: 'React + Vite',
    type: 'productivity',
    hasDeployment: true,
  },
  'obsidian-music-embed': {
    name: 'Music Embed',
    description: 'Embed music with time markers for practice and learning',
    techStack: 'React + Vite',
    type: 'music',
    hasDeployment: true,
  },
  'obsidian-time': {
    name: 'Time Markers',
    description: 'Add time markers to notes for time-based references',
    techStack: 'React + Vite',
    type: 'productivity',
    hasDeployment: true,
  },
};
```

### 3.2 Create README for Each Plugin

**apps/obsidian-habit-calendar/README.md:**
```markdown
# Habit Calendar

GitHub-style calendar for tracking daily habits using the "Don't break the chain" method (popularized by Jerry Seinfeld).

## Features

- 📅 Visual calendar grid showing habit completion
- 🔥 Streak tracking
- 📊 Monthly/yearly views
- 💾 Local data persistence
- 🎨 Customizable themes

## Originally

This was an Obsidian plugin for tracking habits within Obsidian notes. It has been migrated to a standalone React web app.

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm --filter @hudak/obsidian-habit-calendar dev

# Build for production
pnpm --filter @hudak/obsidian-habit-calendar build
```

## Migration Notes

- **From:** Svelte + esbuild (Obsidian plugin)
- **To:** React + Vite (standalone web app)
- **Git history:** Preserved via subtree merge from [jonathanhudak/obsidian-tools](https://github.com/jonathanhudak/obsidian-tools)
```

---

## Phase 4: Update Root Configuration

### 4.1 Update pnpm-workspace.yaml

Already includes `apps/*`, so no changes needed.

### 4.2 Update Root README.md

Add new tools to the tools list:

```markdown
### Productivity & Tracking
- **Habit Calendar** - GitHub-style habit tracking calendar
- **Time Markers** - Add time markers to notes

### Music Tools
- **Music Practice** - Interactive music learning game
- **Instrument Tuner** - Real-time tuner for multiple instruments
- **Music Embed** - Embed music with time markers
```

---

## Phase 5: Test & Verify

### 5.1 Install Dependencies

```bash
# From repo root
pnpm install
```

### 5.2 Type Check

```bash
pnpm --filter @hudak/obsidian-habit-calendar typecheck
pnpm --filter @hudak/obsidian-music-embed typecheck
pnpm --filter @hudak/obsidian-time typecheck
```

### 5.3 Run Dev Servers

```bash
# Test each individually
pnpm --filter @hudak/obsidian-habit-calendar dev
pnpm --filter @hudak/obsidian-music-embed dev
pnpm --filter @hudak/obsidian-time dev
```

### 5.4 Build All

```bash
pnpm run build
```

### 5.5 Verify Landing Page

```bash
# Check that landing page was generated with new tools
open docs/index.html

# Should see 3 new tool cards
```

---

## Phase 6: Commit & Push

```bash
git add apps/obsidian-habit-calendar apps/obsidian-music-embed apps/obsidian-time
git add scripts/generate-landing.js
git add README.md

git commit -m "feat: migrate obsidian plugins to React monorepo

Migrated three Obsidian plugins from jonathanhudak/obsidian-tools:
- habit-calendar: GitHub-style habit tracking
- music-embed: Music embed with time markers
- time: Time markers for notes

Changes:
- Converted from Svelte + esbuild to React + Vite
- Adopted pnpm workspace conventions
- Added to monorepo build pipeline
- Preserved git history via subtree merge
- Created standalone web apps (no longer Obsidian plugins)

Co-authored-by: Jonathan Hudak <jonathanhudak@users.noreply.github.com>"

git push origin claude/issue-33-20260203-0636
```

---

## Phase 7: Archive Source Repository

After successful migration and deployment:

1. **Add Archive Notice to obsidian-tools README:**
   ```markdown
   # Archived: obsidian-tools

   This repository has been archived. All plugins have been migrated to:
   https://github.com/jonathanhudak/tools

   New locations:
   - habit-calendar → https://github.com/jonathanhudak/tools/tree/main/apps/obsidian-habit-calendar
   - music-embed → https://github.com/jonathanhudak/tools/tree/main/apps/obsidian-music-embed
   - time → https://github.com/jonathanhudak/tools/tree/main/apps/obsidian-time
   ```

2. **Archive the Repository:**
   - Go to https://github.com/jonathanhudak/obsidian-tools/settings
   - Scroll to "Danger Zone"
   - Click "Archive this repository"

---

## Common Issues & Solutions

### Issue: Build Fails with "Cannot find module @hudak/ui"

**Solution:**
```bash
# Ensure root dependencies are installed
cd /path/to/tools
pnpm install

# Build the ui package first
pnpm --filter @hudak/ui build  # (actually no-op, but ensures it's in workspace)
```

### Issue: Type errors with Tailwind classes

**Solution:**
Make sure `index.css` imports the UI globals:
```css
@import "@hudak/ui/styles/globals.css";
```

### Issue: Vite dev server port conflict

**Solution:**
Assign unique ports in each `vite.config.ts`:
```typescript
server: {
  port: 3005,  // habit-calendar
  // port: 3006,  // music-embed
  // port: 3007,  // time
}
```

---

## Key Differences: Obsidian Plugin vs Standalone Web App

| Aspect | Obsidian Plugin | Standalone Web App |
|--------|----------------|-------------------|
| **Entry Point** | manifest.json | index.html |
| **Build Tool** | esbuild | Vite |
| **Framework** | Svelte (optional) | React |
| **API** | Obsidian Plugin API | Web APIs |
| **Distribution** | Obsidian Community Plugins | GitHub Pages |
| **Data Storage** | Obsidian vault | LocalStorage / IndexedDB |
| **Navigation** | Obsidian tabs/panels | React Router |

---

## Next Steps

1. **Enhance Features:**
   - Add data export/import
   - Implement cloud sync (optional)
   - Add analytics dashboards

2. **Integration:**
   - Consider creating Obsidian plugins that sync with these web apps
   - Add API endpoints for data exchange

3. **Documentation:**
   - Create user guides
   - Add video tutorials
   - Document migration path for Obsidian users

---

**Migration Prepared By:** Claude Code
**Date:** 2026-02-03
**Issue:** #33 - Migrate obsidian-tools plugins into monorepo

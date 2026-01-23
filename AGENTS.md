# AGENTS.md - AI Agent Development Guide

> Instructions for AI agents working on the Tools monorepo. This document provides specific guidelines for automated development tasks.

## Table of Contents

- [Overview](#overview)
- [Adding New Tools](#adding-new-tools)
- [Making Changes](#making-changes)
- [Testing and Verification](#testing-and-verification)
- [Common Pitfalls](#common-pitfalls)

---

## Overview

This monorepo contains multiple web-based tools built with AI-assisted development. AI agents working on this codebase should follow these guidelines to ensure consistency and proper integration.

### Repository Structure

```
tools/
├── apps/                          # Individual tool applications
│   ├── music-practice/
│   ├── instrument-tuner/
│   ├── rsvp-reader/
│   └── ...
├── packages/                      # Shared packages
│   ├── ui/                        # Shared UI components (shadcn/ui)
│   └── audio-components/          # Audio processing utilities
├── scripts/                       # Build and deployment scripts
│   └── generate-landing.js        # Landing page generator
└── docs/                          # GitHub Pages deployment (generated)
```

---

## Adding New Tools

When adding a new tool to the monorepo, you **MUST** follow these steps:

### 1. Create the Tool Directory

Create a new directory under `apps/` with a kebab-case name:

```bash
mkdir apps/my-new-tool
cd apps/my-new-tool
```

### 2. Set Up the Tool Structure

Follow the template in CLAUDE.md under "Adding New Tools" section.

### 3. **CRITICAL: Add Tool to Landing Page Index**

**This is the most commonly missed step!** You must manually add your tool's metadata to the landing page generator.

Edit `scripts/generate-landing.js` and add your tool to the `toolMetadata` object:

```javascript
const toolMetadata = {
  // ... existing tools ...

  'my-new-tool': {
    name: 'My New Tool',  // Display name (Title Case)
    description: 'A clear, concise description of what this tool does and its key features.',
    techStack: ['React', 'TypeScript', 'Vite', 'Tailwind v4'],  // Technologies used
    type: 'web-app',  // or 'cli-tool'
    hasDeployment: true,  // true for web apps, false for CLI tools
  },
};
```

**Important Notes:**
- The key ('my-new-tool') must match the directory name in `apps/`
- Use Title Case for the `name` field
- Keep the description to 1-2 sentences
- List the primary technologies in `techStack`
- Set `type` to 'web-app' or 'cli-tool'
- Set `hasDeployment: true` for web apps, `false` for CLI tools

### 4. Build and Verify

After adding the metadata, build the project and verify your tool appears:

```bash
pnpm run build
```

This will:
1. Build all apps (including your new tool)
2. Run `scripts/generate-landing.js` to create `docs/index.html`
3. Output a list of found tools

**Verify the output includes your tool:**
```
✅ Found X tool(s): ..., my-new-tool, ...
```

### 5. Check the Landing Page

Open `docs/index.html` and verify your tool card appears with:
- Correct name and description
- Proper tech stack badges
- Working "Launch App" and "View Code" links

### 6. Update Documentation

Add your tool to the root `README.md` if it's user-facing.

---

## Making Changes

### When Modifying Existing Tools

1. **Read before modifying**: Always use the Read tool to examine files before making changes
2. **Follow existing patterns**: Match the coding style and structure of the existing code
3. **Test locally**: Run `pnpm run dev` in the tool's directory to test changes
4. **Rebuild**: Run `pnpm run build` to ensure production builds work

### When Modifying Shared Packages

Changes to packages affect all dependent apps:

- `packages/ui/`: UI components used by multiple apps
- `packages/audio-components/`: Audio processing utilities

After modifying shared packages:
1. Rebuild the package: `pnpm --filter @hudak/ui run build`
2. Test affected apps
3. Rebuild all: `pnpm run build`

---

## Testing and Verification

### Before Committing

Always verify these steps:

1. **Build succeeds**: `pnpm run build` completes without errors
2. **Type checking passes**: `pnpm run typecheck` has no errors
3. **No lint errors**: `pnpm run lint` passes
4. **Landing page includes all tools**: Check `docs/index.html`

### Development Workflow

```bash
# Install dependencies
pnpm install

# Develop a specific tool
cd apps/my-tool
pnpm run dev

# Build all apps
pnpm run build

# Preview production build locally
pnpm run preview
```

---

## Common Pitfalls

### ❌ Mistake: Forgetting to Add Tool Metadata

**Problem**: You create a new tool in `apps/` but forget to add it to `scripts/generate-landing.js`.

**Result**: The tool builds successfully but doesn't appear on the landing page (docs/index.html).

**Solution**: Always add the tool metadata to `scripts/generate-landing.js` as shown in step 3 above.

### ❌ Mistake: Incorrect Tool Key

**Problem**: The key in `toolMetadata` doesn't match the directory name.

```javascript
// ❌ Wrong - key doesn't match directory
'myNewTool': {  // Directory is 'my-new-tool'
  name: 'My New Tool',
  // ...
}

// ✅ Correct - key matches directory
'my-new-tool': {  // Directory is 'my-new-tool'
  name: 'My New Tool',
  // ...
}
```

**Result**: Tool won't appear on landing page even though it's in the metadata.

**Solution**: Ensure the key exactly matches the directory name in `apps/`.

### ❌ Mistake: Not Rebuilding After Changes

**Problem**: You add tool metadata but don't rebuild.

**Result**: Changes don't appear in `docs/index.html`.

**Solution**: Always run `pnpm run build` after modifying `scripts/generate-landing.js`.

### ❌ Mistake: Missing Build Script

**Problem**: Tool's `package.json` doesn't have a `build` script.

**Result**: Turbo skips the tool during build.

**Solution**: Ensure your tool has a build script:

```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

For static HTML apps, use:

```json
{
  "scripts": {
    "build": "echo 'Static app - no build needed' && exit 0"
  }
}
```

---

## Quick Checklist for AI Agents

When adding a new tool:

- [ ] Created directory in `apps/[tool-name]/`
- [ ] Added `package.json` with build script
- [ ] Created `index.html` entry point
- [ ] Added `README.md` with documentation
- [ ] **Added tool metadata to `scripts/generate-landing.js`** ⚠️ CRITICAL
- [ ] Ran `pnpm run build` successfully
- [ ] Verified tool appears in build output
- [ ] Checked `docs/index.html` contains tool card
- [ ] Tested "Launch App" link works
- [ ] Committed changes with descriptive message

---

## Resources

- See `CLAUDE.md` for detailed coding standards and conventions
- See `README.md` for user-facing documentation
- See `turbo.json` for build pipeline configuration

---

**Remember**: The landing page is auto-generated, but tool metadata must be manually added to `scripts/generate-landing.js`. This is the #1 most commonly forgotten step when adding new tools.

# Adding New Tools

When adding a new tool to the monorepo, follow these steps:

## 1. Create the Tool Directory

```bash
mkdir apps/my-new-tool
cd apps/my-new-tool
```

Use kebab-case for directory names.

## 2. Set Up the Tool

Create `package.json` with a build script:

```json
{
  "name": "my-new-tool",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

For static HTML apps:

```json
{
  "scripts": {
    "build": "echo 'Static app' && exit 0"
  }
}
```

Create `index.html` as the entry point.

## 3. Add Tool Metadata (CRITICAL)

Edit `scripts/generate-landing.js` and add your tool to `toolMetadata`:

```javascript
const toolMetadata = {
  // ... existing tools ...

  'my-new-tool': {
    name: 'My New Tool',
    description: 'A clear, concise description of what this tool does.',
    techStack: ['React', 'TypeScript', 'Vite'],
    type: 'web-app',
    hasDeployment: true,
  },
};
```

**Requirements:**
- Key must match directory name exactly (`my-new-tool`, not `myNewTool`)
- Use Title Case for `name`
- Set `type` to `'web-app'` or `'cli-tool'`
- Set `hasDeployment: true` for web apps, `false` for CLI tools

## 4. Build and Verify

```bash
pnpm run build
```

Verify output includes your tool:
```
✅ Found X tool(s): ..., my-new-tool, ...
```

## 5. Check the Landing Page

Open `docs/index.html` and confirm:
- Tool card appears
- Name and description are correct
- "Launch App" link works

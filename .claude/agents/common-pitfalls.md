# Common Pitfalls

## Forgetting to Add Tool Metadata

**Problem**: Tool created in `apps/` but not added to `scripts/generate-landing.js`.

**Result**: Tool builds but doesn't appear on landing page.

**Fix**: Add metadata to `scripts/generate-landing.js`. See [Adding Tools](adding-tools.md#3-add-tool-metadata-critical).

---

## Incorrect Tool Key

**Problem**: Key in `toolMetadata` doesn't match directory name.

```javascript
// ❌ Wrong
'myNewTool': { ... }  // Directory is 'my-new-tool'

// ✅ Correct
'my-new-tool': { ... }
```

**Result**: Tool won't appear on landing page.

**Fix**: Key must exactly match the directory name in `apps/`.

---

## Missing Build Script

**Problem**: Tool's `package.json` lacks a `build` script.

**Result**: Turbo skips the tool during build.

**Fix**: Add a build script:

```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

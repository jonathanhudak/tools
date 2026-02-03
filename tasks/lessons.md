# Lessons Learned

> Document lessons learned during development to improve future work and avoid repeating mistakes.

## How to Use This File

When you encounter an issue, make a mistake, or discover a better approach, document it here using this template:

```markdown
## Lesson: [Brief title]

**Date**: YYYY-MM-DD

### What happened:
[Describe the situation, issue, or mistake]

### Impact:
[What was the consequence? Build errors, bugs, wasted time, etc.]

### Root cause:
[Why did this happen? Missing knowledge, wrong assumption, etc.]

### Solution:
[How was it fixed or what should have been done?]

### Takeaway:
[One-sentence principle to remember for next time]
```

---

## Examples

### Lesson: Always read the entire file before making edits

**Date**: 2026-02-03

**What happened:**
Made an edit to a function without reading the complete file, only looking at the function itself. Missed that the function was called with different parameter types in other locations throughout the file.

**Impact:**
Introduced a TypeScript error that broke the build. Had to spend additional time debugging and fixing the issue.

**Root cause:**
Assumed the function signature could be changed in isolation without checking all call sites.

**Solution:**
Always use the Read tool to view the complete file before making edits. Use Grep to search for all usages of the function when modifying signatures.

**Takeaway:**
Read the full context before making changes - never edit in isolation.

---

### Lesson: Verify build configuration changes immediately

**Date**: 2026-02-03

**What happened:**
Modified `vite.config.ts` to add a new plugin but didn't test the build immediately. Later discovered the configuration was invalid when trying to deploy.

**Impact:**
Delayed deployment and required emergency fixes to the build configuration.

**Root cause:**
Assumed the configuration was correct without verification. Didn't run `pnpm run build` after the change.

**Solution:**
Always run `pnpm run build` immediately after modifying build configuration files. Test changes in isolation before moving to the next task.

**Takeaway:**
Verify configuration changes immediately - don't defer testing.

---

### Lesson: Check for shared packages before duplicating code

**Date**: 2026-02-03

**What happened:**
Implemented a custom audio processing utility in an app without checking if similar functionality existed in `packages/audio-components/`.

**Impact:**
Duplicated code that was already available in a shared package, creating maintenance burden.

**Root cause:**
Didn't explore the `packages/` directory to see what utilities were already available.

**Solution:**
Always check `packages/` for existing utilities before implementing new ones. Use Grep to search for similar functionality across the codebase.

**Takeaway:**
Explore before you build - reuse existing code when possible.

---

## Your Lessons

Add your lessons learned below this line:

---

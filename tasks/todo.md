# Task Tracking

> Track ongoing tasks, work in progress, and planned improvements for the Tools monorepo.

## Active Tasks

### In Progress

*No active tasks*

### Pending

*No pending tasks*

---

## Completed Tasks

### 2026-02-03

- [x] Integrated workflow orchestration guidelines into CLAUDE.md
- [x] Created tasks/lessons.md for documenting lessons learned
- [x] Created tasks/todo.md for task tracking

---

## Backlog

### High Priority

*No high priority items*

### Medium Priority

*No medium priority items*

### Low Priority / Nice to Have

*No low priority items*

---

## How to Use This File

### For AI Agents

When working on complex tasks:

1. **Add task to "Pending"** when you identify work that needs to be done
2. **Move to "In Progress"** when you start working on it
3. **Move to "Completed"** when finished, with the date
4. **Add to "Backlog"** for future work that isn't part of current task

### Task Format

```markdown
- [ ] Brief, actionable description of the task
  - Context: Why this needs to be done
  - Files: Which files will be affected
  - Dependencies: What needs to happen first
```

### Example

```markdown
### Pending

- [ ] Add dark mode to music-practice app
  - Context: User requested in issue #42
  - Files: apps/music-practice/src/App.tsx, globals.css
  - Dependencies: None

- [ ] Migrate visual-html-builder to React
  - Context: Part of Turborepo migration plan
  - Files: apps/visual-html-builder/*
  - Dependencies: Complete music-practice migration first
```

---

## Notes

- Keep this file updated in real-time
- Archive completed tasks monthly to keep the file manageable
- Link to relevant issues, PRs, or documentation
- Use this for tracking both code tasks and documentation tasks

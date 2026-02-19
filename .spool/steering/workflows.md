# Multi-Agent Workflows

This project uses specialized agents for different phases of development. Each agent has a focused role and passes context to the next via specs, docs, and code.

## Workflow: Feature Development

```
planner → developer → verifier → tester → reviewer → compound
```

**How to run:**
1. Start with `planner` — describe the feature, get a spec
2. Switch to `developer` — implement tasks from the spec
3. Switch to `verifier` — validate acceptance criteria
4. Switch to `tester` — write/run tests
5. Switch to `reviewer` — review the full changeset
6. Switch to `compound` — extract learnings

## Workflow: Bug Fix

```
triager → investigator → developer → verifier → reviewer → compound
```

## Workflow: Security Audit

```
scanner → triager → fixer → verifier → tester → reviewer → compound
```

## Build & Test Commands

```bash
# Build
# no build script configured

# Test
# no test script configured
```

## Context Passing

Agents share context through:
- **Specs** in `.kiro/specs/` — requirements, design, tasks
- **Steering files** — persistent project knowledge
- **Git history** — recent commits and diffs
- **Learnings** — insights from past workflows

## Tips

- Let each agent finish before moving to the next
- Review agent output before proceeding — catch issues early
- The compound step is non-optional — always extract learnings
- Update steering files when you notice agents making repeated mistakes

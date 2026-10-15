---
name: quick
description: Workflow for a small contained task. Use for a bug fix, a rename, or an edit to three files or fewer.
argument-hint: "<task>"
user-invocable: true
---

## Quick Workflow

$ARGUMENTS

You are executing the **quick workflow** - a lightweight process for simple, contained tasks.

**All rules from `CLAUDE.md` (root and per-app) apply at all times during this workflow.** This skill adds structure on top - it does not override any existing rule.

### Scope check

Before proceeding, evaluate:

- Will this touch **3 or fewer files**?
- Is there **no new architecture** or cross-layer coordination?
- Is the change **straightforward** with no ambiguity?

If **any answer is no** - suggest switching to `/craft` and explain why. Wait for user confirmation before proceeding either way.

### Execute

1. **Read** the affected files
2. **Implement** the change directly
3. **Write tests** if the change introduces testable behavior (skip for pure renames, formatting, config changes)
4. **Run** `pnpm checklist`
5. **Recap** in 1-3 lines: what changed and why

No plan file. No checkpoints. No ceremony.

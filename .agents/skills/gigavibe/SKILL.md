---
name: gigavibe
description: Breaks a milestone into a series of `/craft` plans. Writes no code. Use when you start a project or a milestone.
argument-hint: "[<analysis doc paths> | <scope description>]"
user-invocable: true
---

## Gigavibe - Project Breakdown

$ARGUMENTS

You are executing the **gigavibe workflow** - a high-level project decomposition that reads all source documents, understands the full scope, and produces a series of `/craft` plan files. You do **NOT** write code or execute plans. You only plan.

**All rules from `CLAUDE.md` (root and per-app) apply.**

### Input

The user provides one or more of:

- File paths to analysis/design documents (functional analysis, technical analysis, Figma references, etc.)
- A high-level description of the project or milestone scope
- References to existing `.plans/` files to build on

If no files are specified, look for these defaults in the project root:

- `ANALYSIS.md` (functional analysis)
- `docs/Analisi Funzionale.md`
- `docs/Analisi Tecnica.md`
- `.figma.json`

### Plan file naming convention

Read `.agents/skills/craft/SKILL.md` with the Read tool first, so its format is in context without a nested skill call. Its "Plan file format" section is the template for every plan this skill writes.

All generated plans follow the `/craft` naming convention:

```
.plans/NNN-kebab-case-name.md
```

- **`NNN`** is a zero-padded 3-digit **sequence number** (001, 002, 003...). Determines execution order.
- **`kebab-case-name`** is a short, descriptive slug (2-4 words max).
- Read existing `.plans/*.md` to find the highest existing number. Start new plans from `highest + 1`.

### Phase 1: Deep comprehension

1. **Read every source document** provided or found. Read them fully - do not skim.
2. **Read the codebase structure**: `CLAUDE.md` (root + per-app), `README.md`, `package.json` files to understand the monorepo layout, existing packages, and conventions.
3. **Thorough codebase audit**: explore the actual code - routes, services, storage, frontend pages, DB schema. Build a mental inventory of **what already exists and works**. This is critical for the gap analysis in Phase 2.
4. **Read existing `.plans/INDEX.md`** to understand what has already been planned or completed. Cross-reference with the codebase: a plan marked `completed` should have its code in place. A plan marked `paused` may have partial code.
5. **Read `.figma.json`** if it exists - note the design reference for UI-heavy plans.

### Phase 2: Gap analysis & scope mapping

1. Extract **every feature, requirement, and constraint** from the source documents.
2. **Gap analysis**: for each requirement, check whether it is already implemented in the codebase (from Phase 1 audit) or covered by a completed plan. Mark each as:
    - **Done** - code exists and works, covered by a completed plan
    - **Partial** - plan exists but is paused/in-progress, or code is incomplete
    - **Missing** - not yet planned or implemented
3. **Only create plans for Partial and Missing items.** Do not re-plan what is already done.
4. Group the remaining items into **logical phases** - each phase becomes one `/craft` plan. A phase is a coherent unit of work that can be developed and tested independently.
5. Order phases by **dependency** (what must be built first) and **priority** (what the user/client needs soonest).
6. For each phase, identify:
    - Which layers it touches (models, storage, API routes, services, routers, frontend)
    - External dependencies (third-party APIs, new libraries, etc.)
    - Whether it has UI work (for `--figma` flagging)
    - Estimated complexity (number of steps likely needed)

### Phase 3: Plan generation

For each phase, create a `/craft` plan file at `.plans/NNN-<phase-slug>.md` with:

1. Full frontmatter including `sources` pointing to the analysis docs read, `sequence` with the NNN number
2. **Comprehension** section summarizing the scope of this specific phase
3. **Validation vs functional analysis** - which requirements from the source docs this phase covers
4. **Plan** with steps and microtasks - detailed enough that `/craft` execution can start immediately
5. **Research** section with placeholders noting what needs to be researched before execution (third-party APIs, libraries, etc.) - will be filled when `/craft` runs
6. **Questions & Answers** section - empty, to be filled when `/craft` runs
7. **Decisions** table - pre-filled with any architectural decisions already clear from the source docs
8. **Tests** table - pre-filled with the test cases this phase should verify
9. **Resume notes** - initial context for the first execution

Set `status: not-started` for all plans.

### Phase 4: Index

Create or update `.plans/INDEX.md`:

```markdown
# Plans

| #   | Plan                                      | Status      | Description                | Dependencies |
| --- | ----------------------------------------- | ----------- | -------------------------- | ------------ |
| 001 | [database-schema](001-database-schema.md) | not-started | DB tables and relations    | -            |
| 002 | [auth-flow](002-auth-flow.md)             | not-started | Firebase + JWT auth        | 001          |
| 003 | [enrichment-api](003-enrichment-api.md)   | not-started | Atoka enrichment endpoints | 001          |
```

Include:

- Sequence number, plan link, status, brief description
- **Dependencies** column - which plans must be completed before this one can start
- Any notes about the overall project scope at the top

### Phase 5: Present to user

Show the user:

1. The full list of phases with brief descriptions
2. Recommended execution order (respecting dependencies)
3. Any open questions or ambiguities found in the source documents
4. Total number of plans created

**Do NOT start executing any plan.** The user will run `/craft` or `/resume-plan` on individual plans when ready.

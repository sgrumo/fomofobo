---
name: craft
description: Plans a complex task in a `.plans/` file with steps, checkpoints, and resume notes. Use when a task needs a written plan before the code.
argument-hint: "<task> [--figma] [--no-research] [--no-questions]"
user-invocable: true
---

## Craft Workflow

$ARGUMENTS

You are executing the **craft workflow** - a structured, checkpoint-driven process for complex tasks. Follow every phase exactly.

**All rules from `CLAUDE.md` (root and per-app) apply at all times during this workflow.** This skill adds structure on top - it does not override any existing rule.

### Flags

Parse the following flags from arguments:

| Flag             | Effect                                                                  |
| ---------------- | ----------------------------------------------------------------------- |
| `--figma`        | Enable Figma design enforcement. See "Figma design enforcement" below.  |
| `--no-research`  | Skip Phase 2b (web research). Use when the task needs no external info. |
| `--no-questions` | Skip Phase 2c (clarifying questions). Use when the task is fully clear. |

### Plan file naming convention

Plan files live in `.plans/`. Create that directory if it does not exist. Plan files follow this pattern:

```
.plans/NNN-kebab-case-name.md
```

- **`NNN`** is a zero-padded 3-digit **sequence number** (001, 002, 003...). Determines execution order. When creating a new plan, read existing files in `.plans/` and pick the next available number.
- **`kebab-case-name`** is a short, descriptive slug (2-4 words max). Must clearly convey what the plan does.

Examples: `001-database-schema.md`, `002-auth-integration.md`, `015-atoka-enrichment.md`

After creating or completing a plan, **update `.plans/INDEX.md`** (see "Plan index" below).

### Plan index

`.plans/INDEX.md` is a status dashboard. Keep it up to date whenever a plan's status changes.

Format:

```markdown
# Plans

| #   | Plan                                        | Status      | Description                   |
| --- | ------------------------------------------- | ----------- | ----------------------------- |
| 001 | [database-schema](001-database-schema.md)   | completed   | DB tables, relations, indexes |
| 002 | [auth-integration](002-auth-integration.md) | in-progress | Firebase + JWT auth flow      |
| 003 | [enrichment-api](003-enrichment-api.md)     | not-started | Atoka enrichment endpoints    |
```

| Status        | Meaning                                            |
| ------------- | -------------------------------------------------- |
| `not-started` | Plan created, waiting for user checkpoint approval |
| `in-progress` | Actively executing steps                           |
| `paused`      | Stopped due to context limit, safe to `/clear`     |
| `completed`   | All steps done, tests passed, checklist green      |

A completed plan has no effect on later runs. Keep it for reference, or remove it.

### Figma design enforcement

**Activated by:** `--figma` flag

When this flag is present:

1. **During Phase 1 (Comprehension)**: read `.figma.json` from the project root to get the Figma file URL. If the file does not exist, stop and tell the user to run `/figma <url>` first.
2. **Set `figma: true`** in the plan file frontmatter - this persists the choice for the entire plan, including after resume.
3. **Before ANY step that touches UI** (components, pages, layouts, styles, anything visual):
    - Fetch the Figma file using the MCP tool (`mcp__figma__get_file` or equivalent) with the saved URL
    - Study the relevant frames/components in the design
    - The implementation **MUST** match the Figma design: spacing, colors, typography, layout, component structure
    - In the step's recap, note which Figma frames/components were referenced
4. **Sub-agents**: any agent launched for UI work (frontend Task agents, etc.) must receive explicit instructions to fetch and follow the Figma design before making changes.
5. **Post-step validation for UI steps**: verify the implementation visually matches the Figma design. Flag any deviations in the recap.

When resuming a plan that has `figma: true` in frontmatter, re-read `.figma.json` and enforce Figma adherence for all remaining UI steps - even if `--figma` was not passed in the resume message.

### Phase 1: Comprehension

1. Read the user's request carefully
2. Read `ANALYSIS.md` in the project root (if it exists) - this is the functional analysis
3. Read any other analysis/design documents referenced in the plan frontmatter `sources` field or mentioned by the user
4. If `--figma` flag is present: read `.figma.json` and validate the Figma link exists
5. Explore the codebase areas affected by the task
6. If anything is ambiguous **and `--no-questions` is NOT set**, ask the user **before** proceeding

### Phase 2: Planning

1. Break the task into **steps** (logical units of work)
2. Break each step into **microtasks** (atomic, checkable items) ordered by priority
3. **Validate plan against `ANALYSIS.md`**: check coherence, flag any delta or missing coverage
4. **Determine the sequence number**: read existing `.plans/*.md` files, find the highest `NNN`, use `NNN+1`
5. Create the plan file at `.plans/NNN-<task-slug>.md` using the format below
6. **Update `.plans/INDEX.md`**: add the new plan row with status `not-started`

### Phase 2b: Research (skip if `--no-research`)

**MANDATORY unless `--no-research` is passed.** Before any code is written:

1. For **each step** in the plan, identify what external information would be useful:
    - Third-party API documentation (endpoints, auth, response structures, rate limits)
    - Library/framework docs (configuration, patterns, caveats)
    - Best practices or known pitfalls for the specific integration
2. **Use web search** to research each item. Prioritize official documentation.
3. Write findings in the plan's **## Research** section, organized by step.
4. Update the plan's steps/microtasks if research revealed new requirements, constraints, or better approaches.

### Phase 2c: Clarifying questions (skip if `--no-questions`)

**MANDATORY unless `--no-questions` is passed.** After research, before execution:

1. Review the plan and identify **any ambiguity, assumption, or missing detail** that could lead to rework.
2. **STOP and ask the user** all questions at once - do not ask one at a time.
3. Once the user replies, **adapt the plan** to incorporate the answers.
4. Write the Q&A exchange in the plan's **## Questions & Answers** section.

#### Plan file format

```markdown
---
task: "<concise task description>"
status: not-started
current-step: 1
current-microtask: 1
created: <YYYY-MM-DD>
sequence: <NNN>
sources:
    - ./ANALYSIS.md
    - <any other analysis/design docs referenced>
figma: false
---

## Comprehension

<!-- what was asked, context, constraints, scope -->

## Validation vs functional analysis

<!-- deltas found, confirmations, points to clarify with user -->

## Research

<!-- findings from web research, organized by step. Empty if --no-research -->

## Questions & Answers

<!-- Q&A with the user. Empty if --no-questions -->

## Plan

### Step 1: <name>

Priority: <high|medium|low>
Status: not-started
UI: <true|false>

- [ ] microtask 1 - description
- [ ] microtask 2 - description

#### Figma reference

<!-- only present if figma: true AND UI: true - list frames/components referenced -->

#### Recap

<!-- filled after step completion -->

---

### Step 2: <name>

...

## Decisions

| #   | Decision | Rationale | Step |
| --- | -------- | --------- | ---- |

## Tests

| Test | Type     | Status  |
| ---- | -------- | ------- |
| ...  | e2e/unit | pending |

## Resume notes

<!-- critical context for resuming after /clear - updated after every step -->
```

5. Present the plan to the user

### Phase 3: Checkpoint

**STOP here.** Show the plan and wait for the user's explicit confirmation before executing.

- If the user requests changes, update the plan and checkpoint again
- Do NOT proceed to execution without approval
- Offer an adversarial pass: the user can run `/adversarial .plans/NNN-<slug>.md` to have the plan attacked before approving it. If they do and accept findings, fold them into the plan and checkpoint again. Their call, not a gate.

### Phase 4: Execution (loop per step)

For each step:

1. **Mark** the step as `in-progress` in the plan file, update `current-step`. **Update `.plans/INDEX.md`** status to `in-progress`.
2. **If `figma: true` AND step has `UI: true`**: fetch the Figma design via MCP before writing any code. Study the relevant frames. Do NOT skip this.
3. **Execute** microtasks one at a time:
    - After completing each microtask, check `[x]` in the plan file and update `current-microtask`
4. **Post-step validation**: verify the step's result is coherent with `ANALYSIS.md`
    - For UI steps with Figma: also verify implementation matches the design
5. **Write and run tests** for backend steps that introduced testable behavior:
    - E2E tests for new/changed API endpoints (follow `e2e/AGENTS.md`)
    - Run the tests immediately and fix failures before moving on
    - Update the Tests table in the plan file
6. **Write recap** in the step's `#### Recap` section:
    - What was done
    - Decisions made and why (also add to the Decisions table)
    - Any unexpected findings
    - For UI steps: fill `#### Figma reference` with frames/components used
7. **Re-evaluate plan**: did new tasks, edge cases, or considerations emerge?
    - If yes: insert them at the correct priority position in upcoming steps
    - If steps were added/removed, note it in the recap
8. **Update "Resume notes"** with current context, open questions, next action
9. Move to next step, repeat from 4.1

### Phase 5: Context guard

Monitor your context usage throughout execution. When you estimate you are at roughly **60-70% of context capacity**:

1. **Stop execution** - do NOT try to squeeze in one more step
2. **Update the plan file** with exact state:
    - `status: paused`
    - `current-step` and `current-microtask` pointing to where you stopped
    - All completed microtasks checked off
    - Recap written for the last completed step
3. **Update `.plans/INDEX.md`** status to `paused`
4. **Write detailed "Resume notes"**:
    - What you were about to do next
    - Any in-flight considerations or open decisions
    - Files you were working on and their current state
    - Anything the next context needs to know that is NOT in the plan already
5. **Tell the user**: "Plan updated at `.plans/<name>.md`. After `/clear`, run `/resume-plan`."

### Phase 6: Closure - MANDATORY gate

When all steps are complete, you **MUST** run the following gate before marking the plan as completed. **Do NOT skip any step. Do NOT mark the plan completed if any step fails.**

#### 6.0 Functional analysis validation

If `ANALYSIS.md` exists in the project root:

1. Re-read `ANALYSIS.md` (or the relevant sections referenced in the plan's `sources` frontmatter)
2. For **each requirement** that this plan was supposed to address, verify it is actually implemented - not just planned, not just partially done, but **working in the codebase right now**
3. Check for **regressions**: did any step break something that a previous plan delivered?
4. List any **deltas** (requirements not met, deviations from spec, partial implementations) in the plan's recap
5. **If any critical requirement is not met: stop, fix it, then re-run this check**

If `ANALYSIS.md` does not exist, skip but note "No functional analysis - skipped" in the recap.

#### 6.1 Database migrations

If the plan introduced or modified any Drizzle schema (`packages/storage/src/db-schema.ts`):

Follow the migration flow in `packages/storage/CLAUDE.md` before the commit.

#### 6.2 Checklist

Run `pnpm checklist`, exactly that. It runs typecheck, lint, format, unit tests and build. If a check fails, fix and re-run.

#### 6.3 E2E tests

If the plan touched backend endpoints, run the E2E tests as `e2e/AGENTS.md` describes. Include the tests in this plan's Tests table and the tests of any referenced previous plan. If a test fails, fix and re-run.

#### 6.4 Adversarial pass — offer, don't gate

Tell the user they can run `/adversarial feature .plans/NNN-<slug>.md` now — that reviews the delivered feature against the plan as its spec. If they run it and accept findings, fix them and re-run 6.2 and 6.3 before finalizing.

#### 6.5 Finalize

Only after 6.0–6.3 all pass:

1. Update plan file: `status: completed`
2. **Update `.plans/INDEX.md`** status to `completed`
3. Brief summary to the user: what was accomplished, functional analysis compliance, migration status, test results, checklist status

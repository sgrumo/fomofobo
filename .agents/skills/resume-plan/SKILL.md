---
name: resume-plan
description: Resume a paused `/craft` plan from its recorded step.
argument-hint: "[<plan number or name>]"
user-invocable: true
disable-model-invocation: true
---

## Resume Craft Plan

Scan `.plans/` for the active plan and continue execution.

### Steps

1. **Read the index**: read `.plans/INDEX.md` to understand all plans, their statuses, and execution order.

2. **Find the plan to resume**:
    - Look for plans with status `paused` or `in-progress` in INDEX.md
    - If **none found**: tell the user "No active plan found. Check `.plans/INDEX.md` for status."
    - If **multiple found**: resume the one with the **lowest sequence number** (it should be completed first). If the user wants a different one, they can specify.
    - If the user passed a plan name or number as argument, resume that one instead.

3. **Load plan state**:
    - Read the full plan file
    - Note `current-step` and `current-microtask` from frontmatter
    - Read the **"Resume notes"** section - this is your primary context
    - Read the recap of the last completed step for continuity
    - If `figma: true` in frontmatter: read `.figma.json` from the project root

4. **Re-read source documents**: read ALL files listed in the `sources` frontmatter field (e.g. `ANALYSIS.md`, technical analysis docs, design docs). These provide the functional and technical context that the plan was built against. Do NOT skip this - plans reference these documents and you need them loaded.

5. **Re-read plan sections**: read the **"Research"** and **"Questions & Answers"** sections of the plan file. These contain critical decisions and context gathered before execution started. Do NOT skip this.

6. **Load the craft rules**: read `.agents/skills/craft/SKILL.md` with the Read tool, so its rules are in context without a nested skill call. Phases 4 to 6 of that file govern the rest of this run.

7. **Resume execution**: continue from **Phase 4** of the `/craft` workflow, starting at the exact step and microtask indicated by the frontmatter pointers. All `/craft` rules apply (validation, testing, recap, context guard, Figma enforcement if active).

8. **Update status**: set `status: in-progress` in the plan file if it was `paused`. Update `.plans/INDEX.md` accordingly.

**Do NOT** re-plan or re-ask questions. Trust the plan file, research, Q&A, and resume notes.

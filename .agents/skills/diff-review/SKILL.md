---
name: diff-review
description: Review the staged changes, or any diff.
argument-hint: "[ref | path]"
user-invocable: true
disable-model-invocation: true
---

# Code Review

Two independent reviewers with fresh context and the same prompt. You are the judge: merge, prune, fix what has only one right answer, write the tests worth having, report the rest by criticality.

**Hard budget: exactly 2 subagents, spawned in parallel in one message.** No verifier fan-outs, no workflows, no extra passes.

## Steps

### 1. Resolve the diff scope

- No argument → `git diff --cached`, falling back to `git diff` when nothing is staged.
- A ref (`main`, `HEAD~3`, a tag) → `git diff <ref>...HEAD`. Three dots diff from the merge-base, so commits that landed on the ref after the branch point stay out of the review. Two dots would show them inverted, as if the branch had reverted them.
- A path → `git diff -- <path>`.
- Empty diff, or a ref that does not resolve → say so and stop. Fail here, not inside two parallel reviewers.

### 2. Spawn 2 reviewers in parallel

Two `code-reviewer` agents, **same message**, **identical** prompt:

> Review the changes from `<diff command>`. Run that exact command to get the diff, read surrounding code only where needed to judge correctness. Report every genuine issue you find. Follow the Output Format in your agent definition **exactly** — the slot template, the word caps, and the "Never write" list. Nothing else.

Don't restate the format in the prompt: it lives in `code-reviewer.md`, and step 7 reuses the same slots.

### 3. Judge and merge

- **Both found it** → keep, tag `[both]`.
- **One found it** → read the code. Confirm it yourself → keep, tag `[confirmed]`. Otherwise drop.
- **Drop** preference comments, unconfirmable hedges, anything already handled elsewhere, and refactor-territory findings that slipped through.

Verify the claim, not just the code around it. A reviewer asserting a bug without checking what actually guards it is common — a fail-open branch that a caller already handles, a coercion whose result is signed rather than compared. That check is the job.

The tag carries the confidence — never a sentence about it, no "both reviewers converged", no "I verified the criticals myself".

### 4. Fix what has only one right answer

Decide per finding, never by severity tier. **Fix it, without asking**, when both hold:

- **Mandatory** — leaving it means the code is wrong: it crashes, corrupts, leaks, fails open, or silently does the wrong thing. There is no version of "ship as is" that isn't a bug.
- **One shape** — the correct fix is forced by the surrounding code. A missed `await`, an inverted guard, an off-by-one, a 4xx treated as success, a missing null check, a wrong import, a convention violation.

A mandatory finding is not a proposal. Reporting "you must fix this" and then not fixing it is the failure mode this step exists to kill — if it must be fixed and you know how, fix it.

Comment wording is never mandatory. Never rewrite a comment for style — a reworded hedge can turn a true comment into a false one. One exception: if your fix makes an adjacent comment false, correct it in the same edit. A stale comment beside a corrected guard is an incomplete fix, not a style choice.

**Leave it as a finding** only when the fix is a real decision, not a repair:

- Two or more defensible shapes and the code doesn't pick one (retry vs fail closed vs degrade).
- It changes an API contract, a UX, a schema, or persisted data.
- The blast radius runs past the diff — callers, other apps, a migration.

State the assumption in the finding body when you fix under one, and never invent behavior to make an ambiguous fix compile.

### 5. Write the tests worth having

Same call, made the same way: if the test is worth having, **write it** — don't ask, don't propose. Scope is the diff, not only the findings.

- **Write one** when the finding is hard to catch by reading (subtle edge case, error path, boundary, auth branch), when a step-4 fix changed behavior nothing pins down, or when correctness matters (money, dates/timezones, access control, migrations). A fix to a reachable bug with no test pinning it is the default case for writing one.
- **Write one for the diff itself** when it adds real logic nothing covers and a regression there would be silent — a new branch, a new mapper, a changed boundary. No finding needed to justify it.
- **Skip it** for type-level issues the compiler catches, pure styling, pass-through wrappers, or anything that would restate the implementation. No coverage theater.
- **Build on the existing setup** — another spec file, a fixture, a helper, fitting the touched package's conventions. Read the neighbours before writing; follow `e2e/AGENTS.md` for E2E tests. Never stand one up from nothing: no new runner, no local DB, `.env`, or harness. Nothing to build on → skip it and say so in one line.

Each test asserts the behavior, not the implementation, and fails against the pre-fix code — if it would have passed before the fix, it pins nothing.

### 6. Verify

Touched anything in step 4 or 5 → run `pnpm checklist` (exactly that) and repair what it flags. Touched nothing → skip it.

Green is the assumed baseline, so don't report it. Can't get it green — a test exposes a second bug, a fix cascades — revert **that** change, keep the rest, and report it as an outstanding finding with what you learned.

### 7. Report

**No preamble** — the report starts at the first heading. No scope recap, no reviewer count, no checklist status.

| Section            | IDs                  | Holds                                    |
| ------------------ | -------------------- | ---------------------------------------- |
| `## ✅ Fixed`      | `F1, F2, …` (step 4) | what you changed, severity tagged        |
| `## 🧪 Tests`      | `T1, T2, …` (step 5) | what you wrote, and what each pins       |
| `## 🔴 Critical`   | `C1, C2, …`          | outstanding — the decision is the user's |
| `## 🟠 Warning`    | `W1, W2, …`          | outstanding                              |
| `## 🔵 Suggestion` | `S1, S2, …`          | outstanding                              |

Done work leads; what's left for the user follows. A fixed finding lives in `✅ Fixed` only — never also in its severity section.

IDs let the user reply by reference ("revert F2, do C1, ignore S1"). Never renumber them within a review. Skip empty sections — don't write "none".

`🔴 🟠 🔵` each open with a triage table, then the finding bodies:

````markdown
## 🔴 Critical

| ID  | Where                               | Issue                                             |
| --- | ----------------------------------- | ------------------------------------------------- |
| C1  | `…/services/item-service.ts:52`     | inverted owner guard admits every other user      |
| C2  | `…/item-form/item-form.state.ts:31` | conversion drops `dueDate` when the state has one |

**C1** `apps/<api-app>/src/services/item-service.ts:52` `[confirmed]`

```ts
const item = await this.storage.getById(id)
if (item.ownerId === userId) {
    throw appError("Forbidden", "not the owner")
}
return item
```

**Breaks:** owner calls `GET /api/items/{id}` → 403; any other user → 200 with the item
**Chain:** `apps/<api-app>/src/services/item-service.ts:52` → `item-router.ts:31`
**Fix:** throw when `item.ownerId !== userId`.
````

- **Scope** — these sections are outstanding findings only, each one you deliberately left. `Fix:` names the choice the user makes, not an instruction you skipped.
- **Table** — `Where` elided to the last two path segments; `Issue` is the claim line, **≤10 words**, lowercase, no trailing period. The body header carries the full path.
- **Bodies** — bold `**C1**` header, no `####` headings, no `---` rules. A blank line always follows the header, snippet or not.
- **Slots** — the reviewer's slots unchanged: same order, same caps, same `Never write` list. You merge and prune, never rewrite into prose. Cut an over-budget slot; never expand one that was in budget.
- **Prose** — the caps here are tighter than the reviewer's slot caps. A tighter cap wins. Table cells and list lines are clipped fragments, not sentences.
- **Snippets** — the reviewer's quote rules, including when to omit. Most `Chain:` findings have no snippet and that's correct output. Re-cut a truncated or `>`-quoted snippet from the file; drop one that means nothing on its own.

`✅ Fixed` and `🧪 Tests` are flat one-line lists — no tables, no snippets, no bodies:

```markdown
## ✅ Fixed

- **F1** 🔴 `apps/<api-app>/src/routers/item-router.ts:40` — `ItemNotFound` now maps to 404, not 500
- **F2** 🟠 `packages/storage/src/db-schema.ts:88` — nullable column the mapper assumed present

## 🧪 Tests

- **T1** `e2e/<api-app>/items/get-by-id.test.ts` — an unknown id returns 404 (pins F1)
```

Each line: ID, severity for fixes, `path:line`, then what changed or what the test pins, **≤15 words**. No test worth writing → one line saying why. A fix made under an assumption names it on its own line, `Assumed:` + ≤15 words.

Close with **at most two lines**: `Reply with IDs: "do C1, revert F2, ignore the rest"`, and — only when the diff had real ones — `Run /refactor for style/pattern cleanups.`

Nothing else: no verdict paragraph, no "I'd take C1 and C2 before this ships", no recap of what you just listed.

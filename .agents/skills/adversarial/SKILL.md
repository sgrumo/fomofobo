---
name: adversarial
description: Attack a change, or the document that proposes it, with parallel adversaries under one judge.
argument-hint: "[ref | <document path> | feature <document path>]"
user-invocable: true
disable-model-invocation: true
---

# Adversarial Review

Several `adversary` agents, each starting from a blank context, each assigned one attack lens and nothing else. You are the judge: verify, merge, prune, report by severity. You report — you don't edit.

**Hard budget: 3-5 subagents, one parallel batch, no second round.** No verifier fan-outs, no workflows, no re-spawning a lens that came back empty.

## Steps

### 1. Resolve the artifact and the spec

Two questions decide everything downstream: **what you attack**, and **what proves it wrong**.

| Argument         | Artifact                                                  | Spec                                  |
| ---------------- | --------------------------------------------------------- | ------------------------------------- |
| empty            | `git diff --cached`, or `git diff` when nothing is staged | the user's ask, quoted verbatim       |
| a git ref        | `git diff <ref>...HEAD` (merge-base, see below)           | the user's ask, quoted verbatim       |
| a document path  | that document                                             | every document it names as its source |
| `feature <path>` | the diff, resolved as for an empty argument               | that document                         |

- **Artifact** — a document that proposes a change, or a diff that is one. Nothing else is reviewable here.
- **Spec** — the documents the artifact promised to satisfy. A document that names its sources hands you them; with none, take the request as the user stated it.
- Three dots diff from the merge-base, so commits that landed on the ref after the branch point stay out of the artifact. Two dots would show them inverted.
- Empty diff, a ref that does not resolve, or a path that does not exist → say so and stop. Fail here, not inside five parallel adversaries.

State the resolved artifact and the diff command in one line before spawning. That's the only preamble this skill gets.

### 2. Assemble the brief

**The brief is the adversary's entire world.** Fresh context is the whole point — anything you add from yours biases them toward agreeing with you, and a captured adversary is worth nothing.

Each prompt contains exactly:

- how to reach the artifact: the document path, or the literal diff command to run
- the spec from step 1: the document paths, or the user's ask quoted verbatim with no interpretation
- the lens name, one line

**Never in a prompt:** your summary of the artifact or of what was built, what you already checked or already believe, findings you expect them to confirm, anything reassuring ("this part is verified", "the tests pass"), the conversation's history, an earlier review's results, or the fact that other adversaries exist and what they cover.

Locators, not content — point at the document, don't paste it. Paths make them read the artifact as it is; a paste makes them read your excerpt of it.

Prompts are **identical except the lens line**. Don't restate the output format either: it lives in `adversary.md`, and step 5 reuses the same slots.

### 3. Pick the lenses

Three always. Add the fourth and fifth only on their trigger:

| Lens                      | Attacks                                              | When                                                                                   |
| ------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `requirements-gap`        | asked-for behavior that isn't there                  | always                                                                                 |
| `failure-modes`           | edge cases, error paths, partial failure, races      | always                                                                                 |
| `blast-radius`            | callers, contracts, regressions, migration ordering  | always                                                                                 |
| `security-data-integrity` | auth, injection, data loss, silent-wrongness domains | touches auth, DB schema, money, dates, PII, external input, or a destructive operation |
| `simpler-path`            | wrong-sized solution, reinvented existing code       | document ≥5 steps, or diff ≥10 files / ~400 lines                                      |

Both triggers can fire at once — that's the 5-agent case, and it's the ceiling. Say which lenses you picked in the step-1 line; don't justify the ones you skipped.

### 4. Spawn

All adversaries in **one message**, in parallel. `adversary` agent type. One lens each, never two.

### 5. Judge

- **Two or more lenses raised it** → keep, tag the lens IDs (`[A1 A3]`).
- **One lens raised it** → check it yourself against the code. Confirmed → keep with that lens ID. Otherwise drop. A surviving single-ID finding means you verified it, so it needs no second tag.
- **Merge** the same defect seen through different lenses into one finding at the highest severity claimed — never two entries for one bug.
- **Drop** preference comments, anything whose trigger nobody can name, out-of-lens drift, style and pattern nitpicks (`/refactor` owns those), and anything already handled elsewhere in the code.

**Every `Evidence:` line gets checked.** Read the cited `path:line`. An adversary told to distrust the artifact will sometimes overshoot into a confident citation of something that isn't there — a caller that doesn't exist, a requirement the spec never stated, a guard it didn't notice one file over. Evidence you can't reproduce drops the finding, whatever its severity and however many lenses agreed. That check is the job.

Volume is not signal. Five lenses returning forty findings and three surviving is a normal, correct outcome.

### 6. Report

**No preamble beyond the step-1 line** — the report starts at the first heading. No lens recap, no counts, no "the adversaries converged on".

| Section            | IDs         |
| ------------------ | ----------- |
| `## 🔴 Critical`   | `C1, C2, …` |
| `## 🟠 Warning`    | `W1, W2, …` |
| `## 🔵 Suggestion` | `S1, S2, …` |

IDs let the user reply by reference ("fix C1 W2, ignore S1"). Never renumber them within a review. Skip empty sections — don't write "none".

Each section opens with a triage table, then the finding bodies:

```markdown
## 🔴 Critical

| ID  | Where                             | Issue                                    |
| --- | --------------------------------- | ---------------------------------------- |
| C1  | `docs/invite-flow.md:64`          | revoke leaves the pending token accepted |
| C2  | `…/services/invite-service.ts:52` | ownership check runs after the mutation  |

**C1** `docs/invite-flow.md:64` `[A1 A4]`

**Breaks:** revoked invite → token still in email → accepted after revocation
**Evidence:** `docs/specs/invites.md:112` requires revocation to invalidate the link; `packages/storage/src/invites/invites-storage.ts:88` only flips `status`
**Fix:** add a step deleting the token row inside the revoke transaction.
```

- **Table** — `Where` elided to the last two path segments; `Issue` is the claim line, **≤10 words**, lowercase, no trailing period. The body header carries the full path.
- **Bodies** — bold `**C1**` header, then the path and the lens tag, no `####` headings, no `---` rules. A blank line always follows the header, snippet or not.
- **Slots** — the adversary's slots unchanged: same order, same caps, same `Never write` list. You merge and prune, never rewrite into prose. Cut an over-budget slot; never expand one that was in budget.
- **Snippets** — the adversary's quote rules, including when to omit. Most findings against a document have no snippet and that's correct output. Re-cut a truncated or `>`-quoted snippet from the file; drop one that means nothing on its own.

Close with **two lines at most**:

- `**Verdict:**` one line — whether the artifact holds as written, or which IDs block it.
- `Reply with IDs: "fix C1 W2, ignore the rest"`

Nothing else: no recap of what you just listed, no encouragement, no next-steps list. **Make no edits and run no checklist** — accepting a finding is the user's call, and the fix belongs to whoever owns the artifact.

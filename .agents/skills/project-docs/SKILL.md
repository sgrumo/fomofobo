---
name: project-docs
description: What goes into docs/ and when. Use when a change alters the product scope, a business rule, or the architecture, when the user pastes a change request or a call transcript, after a production incident, when the project closes, when you add or change a file in docs/, or when the repo has no docs/product.md.
---

# Project docs

`docs/` tells a reader what this product is, what it does, and what changed in it. The reader can be a new developer, a reviewer, or the Quinck Hub wiki, which shows `docs/` to the presales team.

This skill says what to write. Before you write any text, invoke `/writing`.

## The layout

| File              | Kind     | Content                                                                             |
| ----------------- | -------- | ----------------------------------------------------------------------------------- |
| `docs/product.md` | Snapshot | The product as it is now: overview, perimeter, architecture and integrations.       |
| `docs/history.md` | Log      | The changes of scope, the rebuilds, the incidents, and the decisions. Newest first. |
| `docs/<spec>.md`  | Snapshot | A specification or a client deliverable for one domain area.                        |

- `docs/` holds only what the code cannot show: the rules of the domain, the reasons for the choices, and the history. If the code, a test, a manifest, or another doc holds a fact, point to it at most.
- `docs/history.md` is the only file with history. Every other file describes the system as it is now, ordered by the domain.
- A file exists only when it has content. A missing file means "nothing to say yet", never an error. `product.md` starts with the first backfill or the first change of scope, and `history.md` starts with its first entry.
- A plan, a phase list, a work log, or a postmortem goes outside `docs/`. Add a new file only when the user asks for it.
- A specification opens with one sentence that states its role.
- Every file is in English, except a client deliverable or a file for an external team. That file uses the language of its reader.
- The repo can reach the client. No file names a person, quotes a call or a mail, or judges the client. No money, no hours, no rates, no environment URLs.

If you write `product.md`, read `references/product.md`. If you write `history.md`, read `references/history.md`.

## The test for a history entry

Add an entry to `history.md` only when the answer is yes:

> Does this change what a future estimate of a similar project must include?

Yes: the client changes the scope or a rule of a built or started feature. The team throws away work. An incident reaches production. A decision changes the cost or the plan. The project closes.

No: a feature inside the sold scope, a bug fix, a refactor, a dependency update, a UI change, a change reverted in the same week, a new detail of an event that has an entry. Git holds those.

If the answer is not clear, ask the user one question with the test.

## Mode: update

Use this mode when the session changed scope, a rule, or the architecture, when the user pastes a change request, or after an incident.

1. Read `docs/product.md` and the first three entries of `docs/history.md`.
2. List the parts that the change alters: `## Overview`, an area of `## Perimeter`, an item of `## Architecture and integrations`.
3. Rewrite each altered part to the current state. Remove `(not built)` from a feature that now exists.
4. Apply the test. If the answer is yes, write one entry, or update the entry of the same event.
5. Put the doc change in the same commit as the code.

Done when every altered part describes the current state and the test has an answer.

## Mode: close

Use this mode when the project ends or goes to maintenance.

1. Read all of `history.md`.
2. Write one entry with the cause `A decision.` Its `Check next time` names what the next estimate of a similar project must include.
3. Mark each feature of `## Perimeter` that the client asked for and that does not exist with `(not built)`.

Done when the closing entry exists and every area of `## Perimeter` is true.

## Mode: backfill

Use this mode when the repo has no `docs/product.md`.

1. If `docs/wiki/technical.md` or `docs/wiki/evolution.md` exists, move them to `docs/product.md` and `docs/history.md`, then map the old sections to the format of the references.
2. Read the code, `docs/`, the `README.md`, and `git log --format='%ad %s' --date=short`.
3. Write `product.md` from the code. If an old doc and the code disagree, the code is correct.
4. Propose the history entries as a list: date, title, cause, and the commit or the doc that proves it. Write only the entries that the user approves. If the user approves none, do not create `history.md`.

Done when both files exist and each entry has a proof that the user approved.

## Mode: specification

Use this mode when the user asks for a new file in `docs/`, or when you change a specification.

1. Read the file, and list `docs/` to see the other files.
2. Open with one sentence that states the role of the file. Write the rules of the domain area. A rule with no written confirmation goes under `## Open questions`: what is undecided, and what to ask.
3. If the file is over 400 lines, propose a split by domain area. Split only after a yes.

Done when the file describes the current rules and its first sentence states its role.

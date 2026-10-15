# `docs/history.md` format

The Hub checks each rule here that names a key, a heading, or an order, and shows a problem as a notice.

## Frontmatter

```yaml
---
standard: draft
title: Delivery backend
---
```

`standard` is required. `title` is optional. No other key.

## Entries

Newest first. Change an old entry only to correct a fact.

```markdown
## 2026-05-12 · Rider shifts rebuilt for the third time

### Changed

The shift model moved from fixed slots to rider-defined windows. Two weeks of rework.

### Why

A client request. The operating model changed after the first pilot.

### Check next time

Agree on the shift model with the client before the estimate.
```

- The heading: the date of the change as `YYYY-MM-DD`, `·`, and a title of eight words at most.
- `### Changed`: what is different in the product, two sentences at most. If the size of the rework is known, add it in words.
- `### Why`: the first sentence is one of `A client request.`, `A technical problem.`, `A wrong estimate.`, `A decision.`, `An incident.` Free prose follows.
- `### Check next time`: one instruction that a future estimate or project must settle early.

If the product has several repos, record each event in one repo only: the repo that holds the API, or the only repo that changed.

## From a transcript to an entry

| The input holds                              | The output holds                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| A quote, a name, the tone of the call        | The rule that changed: "The client changed the vehicle availability rule."            |
| Five asks in one call                        | One entry for each ask that passes the test. The other asks change `product.md` only. |
| An ask that the team built and then reverted | Nothing.                                                                              |

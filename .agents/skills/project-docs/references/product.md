# `docs/product.md` format

The Hub checks each rule here that names a key, a heading, or an order, and shows a problem as a notice.

## Frontmatter

```yaml
---
standard: draft
title: Delivery backend
summary: Order, rider, and payment backend for a food delivery service.
---
```

`standard` is required. `title` and `summary` are optional. No other key. `summary` is one sentence of 25 words at most. If the product has several repos, `title` names the part that this repo holds.

## Sections

Three `##` sections, in this order. A section with no content keeps its heading and one line: `None.`

### `## Overview`

One paragraph of prose, 120 words at most. It states what the product does, for which users, and the core problem it solves. A reader who compares two products reads this paragraph first.

### `## Perimeter`

One `###` heading for each domain area, in the words of the client: "Rider dispatch", "Quotes". Under each heading, one short paragraph for each rule, limit, or algorithm, three sentences at most.

```markdown
### Rider dispatch

The platform proposes a rider for each ride. It ranks the riders by distance from the pickup, then by the load of the shift. An operator can override the proposal.
```

- Write a rule that changes an estimate or that a new developer must know. A validation detail stays in the code.
- Name a rule, a limit, or an algorithm, never a screen, a component, or a field.
- Mark a feature that the client asked for and that does not exist with `(not built)`.

### `## Architecture and integrations`

A list:

- The parts of the system and how they talk, five items at most.
- One item for each external service: the service, what the project uses it for, and one detail. "Firebase Authentication: email-link sign-in for riders."
- The deploy path, in one item.
- A choice that the code does not show goes into the item of the part it decides, as "because" and the reason.

Frameworks, libraries, and cloud resources stay out of the list unless an item explains a choice. The manifests and the infrastructure code hold them.

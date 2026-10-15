---
name: figma
description: Save the Figma file link that `/craft --figma` reads as the design reference.
argument-hint: "<figma url>"
user-invocable: true
---

## Save Figma Link

$ARGUMENTS

Save the provided Figma file URL for use as design reference during development.

### Steps

1. **Parse** the Figma URL from the arguments
    - Must be a valid Figma URL (contains `figma.com`)
    - If no URL provided, show current saved link (if any) and ask for one

2. **Read** the existing `.figma.json` in the project root (if it exists)

3. **Save** the link to `.figma.json`:

```json
{
    "url": "<figma-file-url>",
    "saved": "<YYYY-MM-DD>"
}
```

4. **Confirm** to the user: "Figma link saved. Use `/craft --figma` to enforce design adherence on UI tasks."

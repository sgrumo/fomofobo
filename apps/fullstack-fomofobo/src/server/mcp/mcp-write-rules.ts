import "server-only"

export const WRITE_ANNOTATIONS = {
    readOnlyHint: false,
    destructiveHint: true,
    openWorldHint: false,
}

export const CONFIRMATION_RULE =
    "Before you call it, show the user every field you will send, in plain words with names in place of ids, and wait for a clear yes. Never invent a value that the source does not give: ask."

export const DELETE_RULE =
    "Before you call it, name what goes in plain words, say that it cannot be undone, and wait for a clear yes."

export const BLOCK_RULE =
    "Before you call it, name what you block, ask the user for the reason when they gave none, and wait for a clear yes."

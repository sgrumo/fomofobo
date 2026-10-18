import { styles } from "frontend-shared/styles"

export const searchFieldRootStyles = styles(
    () =>
        "pixel-corners drop-shadow-hard-md relative flex h-11 items-center gap-2.5 px-2.5 has-[input:focus-visible]:[--pixel-ink:var(--color-focus)]",
)

export const searchFieldIconStyles = styles(() => "text-fg flex shrink-0 [&>svg]:size-4")

export const searchFieldInputContainerStyles = styles(
    () => "relative flex min-w-0 flex-1",
)

export const searchFieldInputStyles = styles(
    () =>
        "peer tp-pixel-md text-fg caret-live w-full appearance-none bg-transparent outline-none placeholder:text-transparent [&::-webkit-search-cancel-button]:appearance-none",
)

export const searchFieldPlaceholderStyles = styles(
    () =>
        "tp-pixel-md text-fg pointer-events-none absolute inset-y-0 left-0 flex max-w-full items-center gap-1 peer-focus:[&>[data-cursor]]:invisible",
)

export const searchFieldPlaceholderTextStyles = styles(() => "truncate")

export const searchFieldCursorStyles = styles(
    () => "bg-live animate-cursor-blink h-3.5 w-2 shrink-0",
)

export const searchFieldClearStyles = styles(
    () =>
        "text-fg enabled:hover:bg-surface-muted focus-visible:outline-focus flex shrink-0 rounded-sm p-1 focus-visible:outline-2 [&>svg]:size-3",
)

import { styles } from "frontend-shared/styles"

export const buttonToggleStyles = styles(
    () =>
        "focus-visible:outline-focus text-fg hover:bg-surface-muted data-[pressed]:bg-surface-inverse data-[pressed]:text-fg-inverse flex cursor-default items-center justify-center rounded-sm p-2 transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:size-5",
)

export const buttonToggleGroupStyles = styles(
    () =>
        "border-line bg-surface shadow-hard-sm flex items-center gap-1 rounded-md border-2 p-1",
)

export const buttonToggleGroupItemStyles = styles((opts: { toggled: boolean }) => [
    "text-fg hover:bg-surface-muted flex cursor-default items-center justify-center rounded-sm p-2 transition-colors select-none [&>svg]:size-5",
    {
        "bg-surface-inverse text-fg-inverse hover:bg-surface-inverse": opts.toggled,
    },
])

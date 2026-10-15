import { styles } from "frontend-shared/styles"

export const buttonToggleStyles = styles(
    () =>
        "focus-visible:outline-focus text-fg-muted hover:bg-surface-muted hover:text-fg data-[pressed]:bg-line-muted data-[pressed]:text-fg flex cursor-default items-center justify-center rounded-md p-2 transition-colors outline-none select-none focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:size-5",
)

export const buttonToggleGroupStyles = styles(
    () => "border-line-muted flex items-center gap-1 rounded-lg border p-1",
)

export const buttonToggleGroupItemStyles = styles((opts: { toggled: boolean }) => [
    "text-fg-muted hover:bg-surface-muted hover:text-fg flex cursor-default items-center justify-center rounded-md p-2 transition-colors select-none [&>svg]:size-5",
    {
        "bg-line-muted text-fg": opts.toggled,
    },
])

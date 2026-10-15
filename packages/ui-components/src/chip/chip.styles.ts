import { styles } from "frontend-shared/styles"

export const chipRowStyles = styles(
    () => "hidden-scrollbar flex items-center gap-1.5 overflow-x-auto px-0.5 pt-0.5 pb-1",
)

export const chipStyles = styles(
    () =>
        "group tp-pixel-sm border-line bg-surface text-fg shadow-hard-sm focus-visible:outline-focus data-[pressed]:bg-surface-inverse data-[pressed]:text-fg-inverse not-data-[pressed]:enabled:hover:bg-surface-muted inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border-2 px-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50",
)

export const chipIconStyles = styles(() => "flex [&>svg]:size-3")

export const chipCountStyles = styles(
    () => "text-fg-muted group-data-[pressed]:text-line-muted",
)

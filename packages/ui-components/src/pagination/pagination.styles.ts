import { styles } from "frontend-shared/styles"

import type { PaginationSize } from "./pagination.helper"

interface PaginationSizeOpts {
    size: PaginationSize
}

export const paginationNavStyles = styles((opts: PaginationSizeOpts) => [
    "text-fg enabled:hover:bg-surface-muted focus-visible:outline-focus flex shrink-0 items-center justify-center rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40",
    {
        "size-7 [&>svg]:size-4": opts.size === "md",
        "size-6 [&>svg]:size-3.5": opts.size === "sm",
    },
])

interface PaginationItemStylesOpts extends PaginationSizeOpts {
    selected: boolean
}
export const paginationItemStyles = styles((opts: PaginationItemStylesOpts) => [
    "focus-visible:outline-focus flex shrink-0 items-center justify-center rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40",
    {
        "tp-pixel-md size-7": opts.size === "md",
        "tp-pixel-sm size-6": opts.size === "sm",
        "bg-surface-inverse text-fg-inverse": opts.selected,
        "text-fg enabled:hover:bg-surface-muted": !opts.selected,
    },
])

export const paginationEllipsisStyles = styles((opts: PaginationSizeOpts) => [
    "text-fg-subtle flex shrink-0 items-center justify-center",
    {
        "tp-pixel-md size-7": opts.size === "md",
        "tp-pixel-sm size-6": opts.size === "sm",
    },
])

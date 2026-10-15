import { styles } from "frontend-shared/styles"

import type { PaginationSize } from "./pagination.helper"

interface PaginationSizeOpts {
    size: PaginationSize
}

export const paginationNavStyles = styles((opts: PaginationSizeOpts) => [
    "flex shrink-0 items-center justify-center text-neutral-800 transition-colors enabled:hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-100 dark:enabled:hover:bg-neutral-800",
    {
        "size-7 rounded-lg [&>svg]:size-4": opts.size === "md",
        "size-6 rounded-md [&>svg]:size-3.5": opts.size === "sm",
    },
])

interface PaginationItemStylesOpts extends PaginationSizeOpts {
    selected: boolean
}
export const paginationItemStyles = styles((opts: PaginationItemStylesOpts) => [
    "flex shrink-0 items-center justify-center transition-colors disabled:opacity-40",
    {
        "tp-b2-medium size-7 rounded-lg": opts.size === "md",
        "tp-c1-medium size-6 rounded-md": opts.size === "sm",
        "bg-primary-600 text-primary-100 dark:bg-primary-100 dark:text-primary-800":
            opts.selected,
        "text-neutral-800 enabled:hover:bg-neutral-100 dark:text-neutral-100 dark:enabled:hover:bg-neutral-800":
            !opts.selected,
    },
])

export const paginationEllipsisStyles = styles((opts: PaginationSizeOpts) => [
    "flex shrink-0 items-center justify-center text-neutral-400 dark:text-neutral-500",
    {
        "tp-b2-medium size-7": opts.size === "md",
        "tp-c1-medium size-6": opts.size === "sm",
    },
])

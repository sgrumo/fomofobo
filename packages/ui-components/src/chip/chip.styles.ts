import { styles } from "frontend-shared/styles"

import type { ChipTone } from "./chip.helper"

export const chipRowStyles = styles(
    () => "hidden-scrollbar flex items-center gap-1.5 overflow-x-auto px-0.5 pt-0.5 pb-1",
)

export const chipBarStyles = styles(
    () =>
        "border-line bg-surface shadow-hard-sm inline-flex shrink-0 items-stretch overflow-hidden rounded-md border-2 [&>*]:h-6 [&>*]:rounded-none [&>*]:border-0 [&>*]:shadow-none [&>*+*]:border-l-2",
)

export const chipStyles = styles((tone: ChipTone) => [
    "group tp-pixel-sm border-line bg-surface text-fg shadow-hard-sm focus-visible:outline-focus not-data-[pressed]:enabled:hover:bg-surface-muted inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border-2 px-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50",
    {
        "data-[pressed]:bg-surface-inverse data-[pressed]:text-fg-inverse":
            tone === "inverse",
        "data-[pressed]:bg-live": tone === "live",
        "data-[pressed]:bg-upcoming": tone === "upcoming",
        "data-[pressed]:bg-ended": tone === "ended",
        "data-[pressed]:bg-permanent": tone === "permanent",
    },
])

export const chipIconStyles = styles(() => "flex [&>svg]:size-3")

export const chipCountStyles = styles((tone: ChipTone) => [
    "text-fg-muted",
    {
        "group-data-[pressed]:text-line-muted": tone === "inverse",
        "group-data-[pressed]:text-fg": tone !== "inverse",
    },
])

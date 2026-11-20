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
    "group tp-pixel-sm text-fg focus-visible:outline-focus inline-flex h-7 shrink-0 items-center gap-1.5 px-2.5 transition-[background-color,color,scale] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-2 focus-visible:outline-offset-2 enabled:active:scale-95 disabled:opacity-50 motion-reduce:enabled:active:scale-100",
    {
        "bg-surface border-line shadow-hard-sm not-data-[pressed]:enabled:hover:bg-surface-muted data-[pressed]:bg-surface-inverse data-[pressed]:text-fg-inverse rounded-md border-2":
            tone === "inverse",
        // A colored chip draws the stepped corners of the search field, see-through until pressed
        "pixel-frame": tone !== "inverse",
        "bg-live/40 data-[pressed]:bg-live": tone === "live",
        "bg-upcoming/40 data-[pressed]:bg-upcoming": tone === "upcoming",
        "bg-ended/40 data-[pressed]:bg-ended": tone === "ended",
        "bg-permanent/40 data-[pressed]:bg-permanent": tone === "permanent",
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

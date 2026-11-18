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
        // A colored chip draws stepped corners, as the search field, in its tint over the map until pressed
        "pixel-corners drop-shadow-hard-sm relative": tone !== "inverse",
        "[--pixel-fill:var(--color-live-on-map)] data-[pressed]:[--pixel-fill:var(--color-live)]":
            tone === "live",
        "[--pixel-fill:var(--color-upcoming-on-map)] data-[pressed]:[--pixel-fill:var(--color-upcoming)]":
            tone === "upcoming",
        "[--pixel-fill:var(--color-ended-on-map)] data-[pressed]:[--pixel-fill:var(--color-ended)]":
            tone === "ended",
        "[--pixel-fill:var(--color-permanent-on-map)] data-[pressed]:[--pixel-fill:var(--color-permanent)]":
            tone === "permanent",
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

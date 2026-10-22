import { styles } from "frontend-shared/styles"

import type { BadgeTone } from "./badge.helper"

export const badgeStyles = styles((tone: BadgeTone) => [
    "tp-pixel-sm border-line inline-flex items-center gap-1.5 rounded-sm border-2 px-1.5 py-0.5 whitespace-nowrap",
    {
        "bg-live text-fg": tone === "live",
        "bg-upcoming text-fg": tone === "upcoming",
        "bg-ended text-fg": tone === "ended",
        "bg-permanent text-fg": tone === "permanent",
        "bg-surface text-fg": tone === "neutral",
        "bg-surface-inverse text-fg-inverse": tone === "inverse",
    },
])

export const badgeDotStyles = styles((tone: BadgeTone) => [
    "size-1.5 shrink-0",
    {
        "bg-live": tone === "neutral",
        "bg-current": tone !== "neutral",
        "animate-live-pulse motion-reduce:animate-none": tone === "live",
    },
])

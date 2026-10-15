import { styles } from "frontend-shared/styles"

import type { TickProgressTone } from "./tick-progress.helper"

const ticks =
    "bg-[repeating-linear-gradient(to_right,currentColor_0_2px,transparent_2px_4px)]"

export const tickProgressTrackStyles = styles(() => [
    "text-line-muted relative h-3.5 w-full overflow-hidden",
    ticks,
])

export const tickProgressFillStyles = styles((tone: TickProgressTone) => [
    "absolute inset-y-0 left-0 transition-[width]",
    ticks,
    {
        "text-fg": tone === "ink",
        "text-live": tone === "live",
    },
])

import { styles } from "frontend-shared/styles"

import type { ProgressSize } from "./progress.helper"

interface ProgressSizeOpts {
    size: ProgressSize
}

export const progressRootStyles = styles(() => "w-full")

export const progressTrackStyles = styles((opts: ProgressSizeOpts) => [
    "bg-surface border-line relative w-full overflow-hidden rounded-sm border-2",
    {
        "h-3": opts.size === "sm",
        "h-4": opts.size === "md",
    },
])

export const progressIndicatorStyles = styles(() => [
    "bg-surface-inverse h-full transition-[width] data-[status=indeterminate]:w-full data-[status=indeterminate]:animate-pulse",
])

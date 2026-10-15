import { styles } from "frontend-shared/styles"

import type { ProgressSize } from "./progress.helper"

interface ProgressSizeOpts {
    size: ProgressSize
}

export const progressRootStyles = styles(() => "w-full")

export const progressTrackStyles = styles((opts: ProgressSizeOpts) => [
    "relative w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700",
    {
        "h-2": opts.size === "sm",
        "h-3": opts.size === "md",
    },
])

export const progressIndicatorStyles = styles(() => [
    "bg-primary-600 dark:bg-primary-300 h-full transition-[width] data-[status=complete]:rounded-full data-[status=indeterminate]:w-full data-[status=indeterminate]:animate-pulse data-[status=progressing]:rounded-full",
])

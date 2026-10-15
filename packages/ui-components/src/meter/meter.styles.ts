import { styles } from "frontend-shared/styles"

import type { MeterSize } from "./meter.helper"

interface MeterSizeOpts {
    size: MeterSize
}

export const meterRootStyles = styles(() => "w-full")

export const meterTrackStyles = styles((opts: MeterSizeOpts) => [
    "relative w-full rounded-full bg-neutral-200 dark:bg-neutral-700",
    {
        "h-2": opts.size === "sm",
        "h-3": opts.size === "md",
    },
])

export const meterIndicatorStyles = styles(() => [
    "bg-primary-600 dark:bg-primary-300 h-full rounded-full transition-[width]",
])

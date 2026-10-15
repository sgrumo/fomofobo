import { styles } from "frontend-shared/styles"

import type { MeterSize } from "./meter.helper"

interface MeterSizeOpts {
    size: MeterSize
}

export const meterRootStyles = styles(() => "w-full")

export const meterTrackStyles = styles((opts: MeterSizeOpts) => [
    "bg-surface border-line relative w-full overflow-hidden rounded-sm border-2",
    {
        "h-3": opts.size === "sm",
        "h-4": opts.size === "md",
    },
])

export const meterIndicatorStyles = styles(() => [
    "bg-upcoming h-full transition-[width]",
])

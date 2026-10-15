import { styles } from "frontend-shared/styles"

import type { MeterSize } from "./meter.helper"

interface MeterSizeOpts {
    size: MeterSize
}

export const meterRootStyles = styles(() => "w-full")

export const meterTrackStyles = styles((opts: MeterSizeOpts) => [
    "bg-line-muted relative w-full rounded-full",
    {
        "h-2": opts.size === "sm",
        "h-3": opts.size === "md",
    },
])

export const meterIndicatorStyles = styles(() => [
    "bg-surface-inverse h-full rounded-full transition-[width]",
])

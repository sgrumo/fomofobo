import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"
import type { StrictOmit } from "shared/types"

import type { TickProgressTone } from "./tick-progress.helper"
import { tickProgressFraction } from "./tick-progress.helper"
import { tickProgressFillStyles, tickProgressTrackStyles } from "./tick-progress.styles"

interface TickProgressProps extends StrictOmit<
    ComponentProps<"div">,
    "role" | "children" | "aria-label"
> {
    label: string
    value: number
    min: number
    max: number
    valueText?: string
    tone?: TickProgressTone
}
export const TickProgress = ({
    label,
    value,
    min,
    max,
    valueText,
    tone = "ink",
    className,
    ...props
}: TickProgressProps) => (
    <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={valueText}
        className={cn(tickProgressTrackStyles(), className)}
        {...props}
    >
        <div
            className={tickProgressFillStyles(tone)}
            style={{ width: `${String(tickProgressFraction(value, min, max) * 100)}%` }}
        />
    </div>
)

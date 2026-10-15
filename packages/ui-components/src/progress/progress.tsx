import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { clamp, identity } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"
import type { Require, StrictOmit } from "shared/types"
import { match } from "ts-pattern"

import { normalizeBaseUiStyling } from "../styling/styling.helper"
import type { ProgressSize } from "./progress.helper"
import {
    progressIndicatorStyles,
    progressRootStyles,
    progressTrackStyles,
} from "./progress.styles"

interface ProgressProps extends Require<
    StrictOmit<ComponentProps<typeof ProgressPrimitive.Root>, "value">,
    "min" | "max"
> {
    value: number
    size?: ProgressSize
}

export const Progress = ({
    value: propValue,
    min: propMin,
    max: propMax,
    size = "sm",
    className: propClassName,
    ...props
}: ProgressProps) => {
    const min = Number.isNaN(propMin)
        ? Number.MIN_SAFE_INTEGER
        : clamp(propMin, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
    const max = Number.isNaN(propMax)
        ? Number.MAX_SAFE_INTEGER
        : clamp(propMax, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)

    const value = match(propValue)
        .returnType<number>()
        .when(
            matchedPropValue => Number.isNaN(matchedPropValue),
            () => min,
        )
        .with(Infinity, () => max)
        .with(-Infinity, () => min)
        .otherwise(identity)

    return (
        <ProgressPrimitive.Root
            value={value}
            min={min}
            max={max}
            className={state =>
                cn(progressRootStyles(), normalizeBaseUiStyling(propClassName, state))
            }
            {...props}
        >
            <ProgressPrimitive.Track className={progressTrackStyles({ size })}>
                <ProgressPrimitive.Indicator className={progressIndicatorStyles()} />
            </ProgressPrimitive.Track>
        </ProgressPrimitive.Root>
    )
}

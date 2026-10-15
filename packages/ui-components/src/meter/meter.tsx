import { Meter as MeterPrimitive } from "@base-ui/react/meter"
import { clamp, identity } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import type { ComponentProps } from "react"
import type { Require, StrictOmit } from "shared/types"
import { match } from "ts-pattern"

import { normalizeBaseUiStyling } from "../styling/styling.helper"
import type { MeterSize } from "./meter.helper"
import { meterIndicatorStyles, meterRootStyles, meterTrackStyles } from "./meter.styles"

interface MeterProps extends Require<
    StrictOmit<ComponentProps<typeof MeterPrimitive.Root>, "value">,
    "min" | "max"
> {
    value: number
    size?: MeterSize
}

export const Meter = ({
    value: propValue,
    min: propMin,
    max: propMax,
    size = "sm",
    className: propClassName,
    ...props
}: MeterProps) => {
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
        <MeterPrimitive.Root
            value={value}
            min={min}
            max={max}
            className={state =>
                cn(meterRootStyles(), normalizeBaseUiStyling(propClassName, state))
            }
            {...props}
        >
            <MeterPrimitive.Track className={meterTrackStyles({ size })}>
                <MeterPrimitive.Indicator className={meterIndicatorStyles()} />
            </MeterPrimitive.Track>
        </MeterPrimitive.Root>
    )
}

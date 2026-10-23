import { useId } from "react"
import { View } from "react-native"
import Svg, { Defs, Pattern, Rect } from "react-native-svg"

import { THEME_COLORS } from "@/lib/theme/theme-tokens"
import { cn } from "@/lib/utils/class-names"

import {
    TICK_PITCH,
    TICK_PROGRESS_HEIGHT,
    TICK_WIDTH,
    tickProgressFillColors,
    tickProgressStyles,
    tickProgressTrackColor,
} from "./tick-progress.styles"

type TickProgressTone = keyof typeof tickProgressFillColors

interface TickProgressProps {
    label: string
    value: number
    min: number
    max: number
    valueText?: string
    tone?: TickProgressTone
    className?: string
}

const TickProgress = (props: TickProgressProps) => {
    const id = useId()
    const fraction =
        props.max > props.min && Number.isFinite(props.value)
            ? Math.min(
                  Math.max((props.value - props.min) / (props.max - props.min), 0),
                  1,
              )
            : 0

    return (
        <View
            accessibilityRole="progressbar"
            accessibilityLabel={props.label}
            accessibilityValue={{
                min: props.min,
                max: props.max,
                now: props.value,
                text: props.valueText,
            }}
            className={cn(tickProgressStyles, props.className)}
        >
            <Svg width="100%" height={TICK_PROGRESS_HEIGHT}>
                <Defs>
                    {[
                        { key: "track", color: THEME_COLORS[tickProgressTrackColor] },
                        {
                            key: "fill",
                            color: THEME_COLORS[
                                tickProgressFillColors[props.tone ?? "ink"]
                            ],
                        },
                    ].map(ticks => (
                        <Pattern
                            key={ticks.key}
                            id={`${id}-${ticks.key}`}
                            width={TICK_PITCH}
                            height={TICK_PROGRESS_HEIGHT}
                            patternUnits="userSpaceOnUse"
                        >
                            <Rect
                                width={TICK_WIDTH}
                                height={TICK_PROGRESS_HEIGHT}
                                fill={ticks.color}
                            />
                        </Pattern>
                    ))}
                </Defs>
                <Rect width="100%" height="100%" fill={`url(#${id}-track)`} />
                <Rect
                    width={`${String(fraction * 100)}%`}
                    height="100%"
                    fill={`url(#${id}-fill)`}
                />
            </Svg>
        </View>
    )
}

export { TickProgress }
export type { TickProgressTone }

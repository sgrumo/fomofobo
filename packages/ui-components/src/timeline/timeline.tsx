import { cn } from "frontend-shared/styles"
import type { ReactNode } from "react"

import { TickProgress } from "../tick-progress/tick-progress"
import type { TickProgressTone } from "../tick-progress/tick-progress.helper"
import {
    timelineEndStyles,
    timelineLabelsStyles,
    timelineNowStyles,
    timelineRootStyles,
} from "./timeline.styles"

interface TimelineProps {
    label: string
    value: number
    min: number
    max: number
    valueText?: string
    start: ReactNode
    now?: ReactNode
    end: ReactNode
    tone?: TickProgressTone
    className?: string
}
export const Timeline = (props: TimelineProps) => (
    <div className={cn(timelineRootStyles(), props.className)}>
        <TickProgress
            label={props.label}
            value={props.value}
            min={props.min}
            max={props.max}
            valueText={props.valueText}
            tone={props.tone}
        />
        <div className={timelineLabelsStyles()}>
            <span>{props.start}</span>
            <span className={timelineNowStyles()}>{props.now}</span>
            <span className={timelineEndStyles()}>{props.end}</span>
        </div>
    </div>
)

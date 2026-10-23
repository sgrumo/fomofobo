import { View } from "react-native"

import { Text } from "@/components/ui/text/text"
import { TickProgress } from "@/components/ui/tick-progress/tick-progress"
import type { TickProgressTone } from "@/components/ui/tick-progress/tick-progress"
import { cn } from "@/lib/utils/class-names"

import {
    timelineEndStyles,
    timelineLabelStyles,
    timelineLabelsStyles,
    timelineNowStyles,
    timelineStyles,
} from "./timeline.styles"

interface TimelineProps {
    label: string
    value: number
    min: number
    max: number
    valueText?: string
    start: string
    now: string
    end: string
    tone?: TickProgressTone
    className?: string
}

const Timeline = (props: TimelineProps) => (
    <View className={cn(timelineStyles, props.className)}>
        <TickProgress
            label={props.label}
            value={props.value}
            min={props.min}
            max={props.max}
            valueText={props.valueText}
            tone={props.tone}
        />
        <View className={timelineLabelsStyles}>
            <Text className={timelineLabelStyles}>{props.start}</Text>
            <Text className={cn(timelineLabelStyles, timelineNowStyles)}>
                {props.now}
            </Text>
            <Text className={cn(timelineLabelStyles, timelineEndStyles)}>
                {props.end}
            </Text>
        </View>
    </View>
)

export { Timeline }

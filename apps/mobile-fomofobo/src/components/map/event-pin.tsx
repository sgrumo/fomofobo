import type { MarkerEmphasis } from "domain/event-clusters"
import { pinTagOf } from "domain/pin-tag"
import type { PinStart } from "domain/pin-tag"
import type { CategoryIcon, OccurrenceStatus } from "models"
import { useTranslation } from "react-i18next"
import { Pressable, View } from "react-native"
import Animated, { steps, useReducedMotion } from "react-native-reanimated"
import type { CSSAnimationProperties } from "react-native-reanimated"
import { isDefined } from "shared/values"
import { match } from "ts-pattern"

import { Badge } from "@/components/ui/badge/badge"
import { PixelCircle } from "@/components/ui/pixel-circle/pixel-circle"
import { PixelIcon } from "@/components/ui/pixel-icon/pixel-icon"
import { cn } from "@/lib/utils/class-names"

const PIN_ICON_SIZE = 20

// Grows the inset, not the scale, so the ring keeps its 2 pt stroke, as the web `radar` keyframes
const radarRing: CSSAnimationProperties = {
    animationName: {
        from: { top: 0, right: 0, bottom: 0, left: 0, opacity: 1 },
        to: { top: -24, right: -24, bottom: -24, left: -24, opacity: 0 },
    },
    animationDuration: "2s",
    animationIterationCount: "infinite",
    animationTimingFunction: steps(8),
}

const RADAR_RINGS = [
    { key: "inner", restInset: "-inset-1.5", delay: "0s" },
    { key: "outer", restInset: "-inset-4", delay: "1s" },
] as const

interface EventPinProps {
    title: string
    status: OccurrenceStatus
    start: PinStart
    icon: CategoryIcon
    // Other results at the same venue
    moreCount: number
    emphasis: MarkerEmphasis
    onSelect: () => void
}

export const EventPin = (props: EventPinProps) => {
    const { t } = useTranslation("shared")
    const reducedMotion = useReducedMotion()

    const tag = match(pinTagOf(props.status, props.start))
        .with({ type: "live" }, () => (
            <Badge tone="live" className="rounded-none">
                {t("Map.LiveBadge")}
            </Badge>
        ))
        .with({ type: "start" }, start => (
            <Badge tone="upcoming" className="rounded-none">
                {start.text}
            </Badge>
        ))
        .with({ type: "ended" }, () => (
            <Badge tone="ended" className="rounded-none">
                {t("Status.ended")}
            </Badge>
        ))
        .exhaustive()

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={[
                t("Map.Pin", {
                    title: props.title,
                    status: t(`Status.${props.status}`),
                    time:
                        props.start.day === undefined
                            ? props.start.time
                            : `${props.start.day} ${props.start.time}`,
                }),
                props.moreCount === 0
                    ? undefined
                    : t("Map.MoreHere", { count: props.moreCount }),
            ]
                .filter(isDefined)
                .join(", ")}
            onPress={props.onSelect}
            className={cn("items-center gap-1", {
                "opacity-35": props.emphasis === "dimmed",
            })}
        >
            <View className="flex-row">
                {tag}
                {props.moreCount !== 0 && (
                    <Badge
                        tone="inverse"
                        className="min-w-6 justify-center rounded-none px-0"
                    >
                        {`+${String(props.moreCount)}`}
                    </Badge>
                )}
            </View>
            <View className="h-9 w-9">
                {props.status === "live" &&
                    RADAR_RINGS.map(ring => (
                        <Animated.View
                            key={ring.key}
                            className={cn(
                                "absolute rounded-full border-2 border-dashed border-live",
                                reducedMotion ? ring.restInset : "inset-0",
                            )}
                            style={
                                reducedMotion
                                    ? undefined
                                    : { ...radarRing, animationDelay: ring.delay }
                            }
                        />
                    ))}
                <PixelCircle
                    size={36}
                    fill={props.status}
                    shadow={props.emphasis === "selected" ? "md" : undefined}
                    dashed={props.status === "ended"}
                >
                    <PixelIcon name={props.icon} size={PIN_ICON_SIZE} centered={true} />
                </PixelCircle>
            </View>
        </Pressable>
    )
}

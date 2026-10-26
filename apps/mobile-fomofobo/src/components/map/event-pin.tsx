import type { MarkerEmphasis } from "domain/event-clusters"
import { pinTagOf } from "domain/pin-tag"
import type { PinStart } from "domain/pin-tag"
import { LIVE_WAVE_PERIOD_MS, LIVE_WAVE_RINGS } from "domain/pixel-shapes"
import type { CategoryIcon, OccurrenceStatus } from "models"
import { useTranslation } from "react-i18next"
import { Pressable, View } from "react-native"
import Animated, { useReducedMotion } from "react-native-reanimated"
import type { CSSAnimationProperties } from "react-native-reanimated"
import Svg, { Path } from "react-native-svg"
import { isDefined } from "shared/values"
import { match } from "ts-pattern"

import { Badge } from "@/components/ui/badge/badge"
import { PixelCircle } from "@/components/ui/pixel-circle/pixel-circle"
import { PixelIcon } from "@/components/ui/pixel-icon/pixel-icon"
import { THEME_COLORS } from "@/lib/theme/theme-tokens"
import { cn } from "@/lib/utils/class-names"

const PIN_ICON_SIZE = 20

const PIN_SIZE = 36

// Lit, then half lit, then dark for the second half of the period, as the web `wave-ring` keyframes
const waveRing: CSSAnimationProperties = {
    animationName: {
        "0%": { opacity: 1 },
        "25%": { opacity: 0.5 },
        "50%": { opacity: 0 },
        "100%": { opacity: 0 },
    },
    animationDuration: LIVE_WAVE_PERIOD_MS,
    animationIterationCount: "infinite",
    animationTimingFunction: "step-end",
}

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
                    LIVE_WAVE_RINGS.filter(
                        // Reduced motion keeps the inner ring of each wave, still
                        (_, index) => !reducedMotion || index % 2 === 0,
                    ).map(ring => (
                        <Animated.View
                            key={ring.radius}
                            pointerEvents="none"
                            className="absolute"
                            style={{
                                left: PIN_SIZE / 2 - ring.reach,
                                top: PIN_SIZE / 2 - ring.reach,
                                ...(reducedMotion
                                    ? undefined
                                    : { ...waveRing, animationDelay: ring.delayMs }),
                            }}
                        >
                            <Svg
                                width={2 * ring.reach}
                                height={2 * ring.reach}
                                viewBox={ring.viewBox}
                            >
                                <Path
                                    d={ring.path}
                                    fill={THEME_COLORS.live}
                                    fillOpacity={ring.fade}
                                />
                            </Svg>
                        </Animated.View>
                    ))}
                <PixelCircle
                    size={PIN_SIZE}
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

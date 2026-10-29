import type { MarkerEmphasis } from "domain/event-clusters"
import { pinTagOf } from "domain/pin-tag"
import type { PinStart } from "domain/pin-tag"
import {
    EVENT_DISC,
    LIVE_WAVE,
    LIVE_WAVE_FRAME_MS,
    MARKER_CELL_PX,
    SELECTED_EVENT_DISC,
    SELECTED_LIVE_WAVE,
} from "domain/pixel-markers"
import type { CategoryIcon, OccurrenceStatus } from "models"
import { useTranslation } from "react-i18next"
import { Pressable, View } from "react-native"
import { isDefined } from "shared/values"
import { match } from "ts-pattern"

import { PixelDisc } from "@/components/map/pixel-disc"
import { PixelSprite } from "@/components/map/pixel-sprite"
import { Badge } from "@/components/ui/badge/badge"
import { THEME_COLORS } from "@/lib/theme/theme-tokens"
import { cn } from "@/lib/utils/class-names"

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
            {/* Draws above the live wave of the disc */}
            <View className="z-10 flex-row">
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
            <PixelDisc
                kind={props.status}
                icon={props.icon}
                selected={props.emphasis === "selected"}
                behind={
                    props.status === "live" && (
                        <PixelSprite
                            sprite={
                                props.emphasis === "selected"
                                    ? SELECTED_LIVE_WAVE
                                    : LIVE_WAVE
                            }
                            frameMs={LIVE_WAVE_FRAME_MS}
                            color={THEME_COLORS.live}
                            box={
                                (props.emphasis === "selected"
                                    ? SELECTED_EVENT_DISC
                                    : EVENT_DISC
                                ).cells * MARKER_CELL_PX
                            }
                        />
                    )
                }
            />
        </Pressable>
    )
}

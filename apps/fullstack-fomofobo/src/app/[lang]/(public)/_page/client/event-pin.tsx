"use client"

import type { MarkerEmphasis } from "domain/event-clusters"
import { pinTagOf } from "domain/pin-tag"
import type { PinStart } from "domain/pin-tag"
import { LIVE_WAVE, LIVE_WAVE_FRAME_MS, SELECTED_LIVE_WAVE } from "domain/pixel-markers"
import { cn } from "frontend-shared/styles"
import type { CategoryIcon, OccurrenceStatus } from "models"
import { useTranslation } from "react-i18next"
import { isDefined } from "shared/values"
import { match } from "ts-pattern"
import { Badge } from "ui-components/badge"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

import { PixelDisc } from "./pixel-disc"
import { PixelSprite } from "./pixel-sprite"

interface EventPinProps extends RouteClientComponentProps<"root"> {
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

    const badge = match(pinTagOf(props.status, props.start))
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
        <button
            type="button"
            aria-label={[
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
            onClick={props.onSelect}
            className={cn(
                "flex cursor-pointer flex-col items-center gap-1 transition-opacity",
                { "opacity-35": props.emphasis === "dimmed" },
            )}
        >
            {/* Draws above the live wave of the disc */}
            <span className="relative z-10 flex items-center">
                {badge}
                {props.moreCount === 0 ? undefined : (
                    <Badge
                        tone="inverse"
                        className="min-w-6 justify-center rounded-none px-0"
                    >
                        +{props.moreCount}
                    </Badge>
                )}
            </span>
            <PixelDisc
                route={props.route}
                kind={props.status}
                icon={props.icon}
                selected={props.emphasis === "selected"}
                behind={
                    props.status === "live" ? (
                        <PixelSprite
                            route={props.route}
                            sprite={
                                props.emphasis === "selected"
                                    ? SELECTED_LIVE_WAVE
                                    : LIVE_WAVE
                            }
                            frameMs={LIVE_WAVE_FRAME_MS}
                            className="text-live"
                        />
                    ) : undefined
                }
            />
        </button>
    )
}

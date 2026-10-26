"use client"

import type { MarkerEmphasis } from "domain/event-clusters"
import { pinTagOf } from "domain/pin-tag"
import type { PinStart } from "domain/pin-tag"
import { cn } from "frontend-shared/styles"
import type { CategoryIcon, OccurrenceStatus } from "models"
import { useTranslation } from "react-i18next"
import { isDefined } from "shared/values"
import { match } from "ts-pattern"
import { Badge } from "ui-components/badge"
import { PixelIcon } from "ui-components/pixel-icons"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

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
    const radarRing =
        "border-live animate-radar pointer-events-none absolute rounded-full border-2 border-dashed motion-reduce:animate-none"

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
            <span className="flex items-center">
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
            <span className="relative flex size-9 items-center justify-center">
                {props.status === "live" ? (
                    <>
                        <span
                            aria-hidden={true}
                            className={cn(radarRing, "-inset-1.5")}
                        />
                        <span
                            aria-hidden={true}
                            className={cn(radarRing, "-inset-4 [animation-delay:1s]")}
                        />
                    </>
                ) : undefined}
                <span
                    className={cn(
                        "pixel-circle-36 text-fg relative flex size-9 items-center justify-center",
                        {
                            "drop-shadow-hard-md": props.emphasis === "selected",
                            "[--pixel-fill:var(--color-live)]": props.status === "live",
                            "[--pixel-fill:var(--color-upcoming)]":
                                props.status === "upcoming",
                            "[--pixel-fill:var(--color-ended)] before:[mask-image:repeating-conic-gradient(#000_0_15deg,transparent_15deg_30deg)]":
                                props.status === "ended",
                        },
                    )}
                >
                    <PixelIcon name={props.icon} centered={true} className="size-5" />
                </span>
            </span>
        </button>
    )
}

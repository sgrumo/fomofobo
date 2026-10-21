"use client"

import { cn } from "frontend-shared/styles"
import type { CategoryIcon, OccurrenceStatus } from "models"
import { useTranslation } from "react-i18next"
import { match } from "ts-pattern"
import { Badge } from "ui-components/badge"
import { PixelIcon } from "ui-components/pixel-icons"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface EventPinProps extends RouteClientComponentProps<"root"> {
    title: string
    status: OccurrenceStatus
    startTime: string
    // `dd.MM` of a start on another day than today, undefined for today
    startDay: string | undefined
    icon: CategoryIcon
    onSelect: () => void
}

export const EventPin = (props: EventPinProps) => {
    const { t } = useTranslation("shared")

    const badge = match(props.status)
        .with("live", () => (
            <Badge tone="live" className="rounded-none">
                {t("Map.LiveBadge")}
            </Badge>
        ))
        .with("upcoming", () => (
            <Badge tone="upcoming" className="rounded-none">
                {props.startDay ?? props.startTime}
            </Badge>
        ))
        .with("ended", () => (
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
            aria-label={t("Map.Pin", {
                title: props.title,
                status: t(`Status.${props.status}`),
                time:
                    props.startDay === undefined
                        ? props.startTime
                        : `${props.startDay} ${props.startTime}`,
            })}
            onClick={props.onSelect}
            className="flex cursor-pointer flex-col items-center gap-1"
        >
            {badge}
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
                        "pixel-circle-36 drop-shadow-hard-sm text-fg relative flex size-9 items-center justify-center",
                        {
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

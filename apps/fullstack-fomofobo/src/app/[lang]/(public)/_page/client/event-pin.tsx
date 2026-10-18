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
    icon: CategoryIcon
    onSelect: () => void
}

export const EventPin = (props: EventPinProps) => {
    const { t } = useTranslation("shared")

    const badge = match(props.status)
        .with("live", () => <Badge tone="live">{t("Map.LiveBadge")}</Badge>)
        .with("upcoming", () => <Badge tone="upcoming">{props.startTime}</Badge>)
        .with("ended", () => <Badge tone="ended">{t("Status.ended")}</Badge>)
        .exhaustive()

    return (
        <button
            type="button"
            aria-label={t("Map.Pin", {
                title: props.title,
                status: t(`Status.${props.status}`),
                time: props.startTime,
            })}
            onClick={props.onSelect}
            className={cn(
                "flex cursor-pointer flex-col items-center gap-1",
                props.status === "ended" && "opacity-60",
            )}
        >
            {badge}
            <span className="relative flex size-9 items-center justify-center">
                {props.status === "live" ? (
                    <span
                        aria-hidden={true}
                        className="border-live absolute inset-0 animate-ping rounded-full border-2"
                    />
                ) : undefined}
                <span
                    className={cn(
                        "border-line shadow-hard-sm text-fg relative flex size-9 items-center justify-center rounded-full border-2",
                        {
                            "bg-live": props.status === "live",
                            "bg-upcoming": props.status === "upcoming",
                            "bg-ended border-dashed": props.status === "ended",
                        },
                    )}
                >
                    <PixelIcon name={props.icon} centered={true} className="size-5" />
                </span>
            </span>
        </button>
    )
}

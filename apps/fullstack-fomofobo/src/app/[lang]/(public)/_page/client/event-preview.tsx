"use client"

import type { Category, GeoPoint, OccurrenceSummary } from "models"
import type { ReactNode } from "react"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import type { StrictOmit } from "shared/types"
import { isDefined } from "shared/values"
import { Alert } from "ui-components/alert"
import { Badge } from "ui-components/badge"
import {
    BottomSheetContent,
    BottomSheetRoot,
    BottomSheetTitle,
} from "ui-components/bottom-sheet"
import { DitheredImage } from "ui-components/dithered-image"
import { IconButton } from "ui-components/icon-button"
import { PixelIconArrow, PixelIconBack, PixelIconClose } from "ui-components/pixel-icons"
import { Spinner } from "ui-components/spinner"
import { TickProgress } from "ui-components/tick-progress"

import { SaveToggle } from "@/components/client/save-toggle/save-toggle"
import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { countdownParts } from "@/lib/events/countdown"
import { localTimeOf } from "@/lib/events/local-format"
import { occurrenceProgress } from "@/lib/events/occurrence-progress"
import { occurrenceStatus } from "@/lib/events/occurrence-status"
import { formatDistance } from "@/lib/geo/format-distance"
import { haversineDistance } from "@/lib/geo/haversine-distance"
import { PLATFORM_TIME_ZONE } from "@/lib/platform/platform"

interface PreviewPaging {
    index: number
    total: number
    onPrevious: () => void
    onNext: () => void
}

interface EventPreviewProps extends RouteClientComponentProps<"root"> {
    open: boolean
    occurrence: OccurrenceSummary | undefined
    loadFailed: boolean
    categories: ReadonlyMap<string, Category>
    position: GeoPoint | undefined
    now: Date
    paging: PreviewPaging | undefined
    onClose: () => void
}

interface PreviewBodyProps extends StrictOmit<
    EventPreviewProps,
    "open" | "occurrence" | "loadFailed" | "onClose"
> {
    occurrence: OccurrenceSummary
    closeButton: ReactNode
}

const PreviewBody = (props: PreviewBodyProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()

    const occurrence = props.occurrence
    const paging = props.paging
    const span = {
        startsAt: new Date(occurrence.startsAt),
        endsAt: new Date(occurrence.endsAt),
    }
    const status = occurrenceStatus(span, props.now)
    const progress = occurrenceProgress(span, props.now)
    const remaining = countdownParts(progress.remainingMs)
    const remainingText =
        remaining.hours > 0
            ? t("Countdown.HoursMinutes", { ...remaining })
            : t("Countdown.Minutes", { ...remaining })
    const details = [
        ...occurrence.categoryIds.map(id => props.categories.get(id)?.name),
        // PLACEHOLDER(OP-19): no distance without the position of the device
        props.position === undefined
            ? undefined
            : formatDistance(
                  haversineDistance(props.position, occurrence.venue.coordinates),
                  language,
              ),
        occurrence.price ?? t("Preview.Free"),
    ].filter(isDefined)

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <Badge tone={status} dot={true}>
                    {t(`Status.${status}`)}
                </Badge>
                <div className="flex items-center gap-2">
                    {status === "live" ? (
                        <span className="tp-pixel-sm uppercase">
                            {t("Preview.Remaining", { time: remainingText })}
                        </span>
                    ) : undefined}
                    <SaveToggle occurrence={occurrence} size="sm" />
                    {props.closeButton}
                </div>
            </div>
            {paging === undefined ? undefined : (
                <div className="flex items-center justify-center gap-2">
                    <IconButton
                        aria-label={t("Preview.Previous")}
                        icon={<PixelIconBack />}
                        size="sm"
                        disabled={paging.index === 0}
                        onClick={() => {
                            paging.onPrevious()
                        }}
                    />
                    <span className="tp-pixel-sm">
                        {t("Preview.Position", {
                            index: paging.index + 1,
                            total: paging.total,
                        })}
                    </span>
                    <IconButton
                        aria-label={t("Preview.Next")}
                        icon={<PixelIconBack className="rotate-180" />}
                        size="sm"
                        disabled={paging.index === paging.total - 1}
                        onClick={() => {
                            paging.onNext()
                        }}
                    />
                </div>
            )}
            <div className="border-line flex gap-3 border-t-2 pt-3">
                {occurrence.coverPhotoUrl === null ? undefined : (
                    <DitheredImage
                        src={occurrence.coverPhotoUrl}
                        alt=""
                        className="size-24 shrink-0 rounded-sm"
                    />
                )}
                <div className="flex min-w-0 flex-col gap-1">
                    <BottomSheetTitle className="tp-pixel-xl uppercase">
                        {occurrence.title}
                    </BottomSheetTitle>
                    <span className="tp-body-md text-fg-muted">
                        {occurrence.venue.name}
                    </span>
                    <span className="tp-pixel-sm uppercase">{details.join(" · ")}</span>
                </div>
            </div>
            {status === "live" ? (
                <TickProgress
                    label={t("Preview.Elapsed")}
                    value={progress.elapsedFraction * 100}
                    min={0}
                    max={100}
                    tone="live"
                />
            ) : undefined}
            <div className="border-line flex items-center justify-between gap-2 border-t-2 pt-3">
                <span className="tp-pixel-xl">
                    {localTimeOf(span.startsAt, PLATFORM_TIME_ZONE)}→
                    {localTimeOf(span.endsAt, PLATFORM_TIME_ZONE)}
                </span>
                <RouteLink
                    route={routes.eventDetail}
                    parameters={{
                        lang: language,
                        eventId: occurrence.eventId,
                        date: occurrence.date,
                    }}
                    query={{}}
                    aria-label={t("Preview.Open")}
                    className="pixel-circle-48 drop-shadow-hard-sm text-fg relative flex size-12 items-center justify-center rounded-full [--pixel-fill:var(--color-live)] [&>svg]:size-5"
                >
                    <PixelIconArrow />
                </RouteLink>
            </div>
        </div>
    )
}

export const EventPreview = (props: EventPreviewProps) => {
    const { t } = useTranslation("shared")

    const closeButton = (
        <IconButton
            aria-label={t("Preview.Close")}
            icon={<PixelIconClose />}
            size="sm"
            onClick={props.onClose}
        />
    )

    return (
        <BottomSheetRoot
            open={props.open}
            onOpenChange={open => {
                if (!open) {
                    props.onClose()
                }
            }}
        >
            <BottomSheetContent>
                {props.occurrence === undefined ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                            <BottomSheetTitle>{t("Preview.Title")}</BottomSheetTitle>
                            {closeButton}
                        </div>
                        {props.loadFailed ? (
                            <Alert type="error" text={t("Preview.Unavailable")} />
                        ) : (
                            <Spinner title={t("Preview.Loading")} />
                        )}
                    </div>
                ) : (
                    <PreviewBody
                        route={props.route}
                        occurrence={props.occurrence}
                        categories={props.categories}
                        position={props.position}
                        now={props.now}
                        paging={props.paging}
                        closeButton={closeButton}
                    />
                )}
            </BottomSheetContent>
        </BottomSheetRoot>
    )
}

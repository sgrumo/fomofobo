"use client"

import type { Category, OccurrenceSummary, PublicVenue } from "models"
import Image from "next/image"
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
import { IconButton } from "ui-components/icon-button"
import { PixelIconArrow, PixelIconBack, PixelIconClose } from "ui-components/pixel-icons"
import { Spinner } from "ui-components/spinner"
import { TickProgress } from "ui-components/tick-progress"

import { SaveToggle } from "@/components/client/save-toggle/save-toggle"
import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { localTimeOf } from "@/lib/events/local-format"
import { occurrenceProgress } from "@/lib/events/occurrence-progress"
import { occurrenceStatus } from "@/lib/events/occurrence-status"
import { usePriceSummary } from "@/lib/hooks/use-price-summary"
import { PLATFORM_TIME_ZONE } from "@/lib/platform/platform"

interface PreviewPaging {
    index: number
    total: number
    onPrevious: () => void
    onNext: () => void
}

export type PreviewVenue = Pick<
    PublicVenue,
    "id" | "name" | "address" | "coverPhotoUrl" | "kind" | "programmeUrl"
>

export type PreviewEntry =
    | { type: "occurrence"; occurrence: OccurrenceSummary }
    | { type: "venue"; venue: PreviewVenue }

interface EventPreviewProps extends RouteClientComponentProps<"root"> {
    open: boolean
    entry: PreviewEntry | undefined
    loadFailed: boolean
    categories: ReadonlyMap<string, Category>
    now: Date
    paging: PreviewPaging | undefined
    onClose: () => void
}

interface PagingControlsProps {
    paging: PreviewPaging
}

const PagingControls = (props: PagingControlsProps) => {
    const { t } = useTranslation("shared")
    const paging = props.paging

    return (
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
    )
}

interface PreviewBodyProps extends StrictOmit<
    EventPreviewProps,
    "open" | "entry" | "loadFailed" | "onClose"
> {
    occurrence: OccurrenceSummary
    closeButton: ReactNode
}

const PreviewBody = (props: PreviewBodyProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const priceSummary = usePriceSummary()

    const occurrence = props.occurrence
    const span = {
        startsAt: new Date(occurrence.startsAt),
        endsAt: new Date(occurrence.endsAt),
    }
    const status = occurrenceStatus(span, props.now)
    const elapsedFraction = occurrenceProgress(span, props.now)
    const details = [
        ...occurrence.categoryIds.map(id => props.categories.get(id)?.name),
        priceSummary(occurrence.priceScheme),
        occurrence.interestedCount === null
            ? undefined
            : t("Detail.Interested", { count: occurrence.interestedCount }),
    ].filter(isDefined)

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <Badge tone={status} dot={true}>
                    {t(`Status.${status}`)}
                </Badge>
                <div className="flex items-center gap-2">
                    <SaveToggle occurrence={occurrence} size="sm" />
                    {props.closeButton}
                </div>
            </div>
            {props.paging === undefined ? undefined : (
                <PagingControls paging={props.paging} />
            )}
            <div className="border-line flex gap-3 border-t-2 pt-3">
                <Image
                    src={occurrence.coverPhotoUrl}
                    width={96}
                    height={96}
                    unoptimized={true}
                    alt=""
                    className="size-24 shrink-0 rounded-sm object-cover"
                />
                <div className="flex min-w-0 flex-col gap-1">
                    <BottomSheetTitle className="tp-pixel-xl uppercase">
                        {occurrence.title}
                    </BottomSheetTitle>
                    {occurrence.venue.isBlocked ? (
                        <span className="tp-body-md text-fg-muted">
                            {occurrence.venue.name}
                        </span>
                    ) : (
                        <RouteLink
                            route={routes.venueDetail}
                            parameters={{ lang: language, venueId: occurrence.venue.id }}
                            query={{}}
                            className="tp-body-md text-fg-muted underline"
                        >
                            {occurrence.venue.name}
                        </RouteLink>
                    )}
                    <span className="tp-pixel-sm uppercase">{details.join(" · ")}</span>
                </div>
            </div>
            {status === "live" ? (
                <TickProgress
                    label={t("Preview.Elapsed")}
                    value={elapsedFraction * 100}
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

interface VenuePreviewBodyProps {
    venue: PreviewVenue
    paging: PreviewPaging | undefined
    closeButton: ReactNode
}

const VenuePreviewBody = (props: VenuePreviewBodyProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const venue = props.venue

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                {venue.kind === "regular" ? undefined : (
                    <Badge tone="permanent">{t(`VenueKind.${venue.kind}`)}</Badge>
                )}
                <div className="ml-auto">{props.closeButton}</div>
            </div>
            {props.paging === undefined ? undefined : (
                <PagingControls paging={props.paging} />
            )}
            <div className="border-line flex gap-3 border-t-2 pt-3">
                {venue.coverPhotoUrl === null ? undefined : (
                    <Image
                        src={venue.coverPhotoUrl}
                        width={96}
                        height={96}
                        unoptimized={true}
                        alt=""
                        className="size-24 shrink-0 rounded-sm object-cover"
                    />
                )}
                <div className="flex min-w-0 flex-col gap-1">
                    <BottomSheetTitle className="tp-pixel-xl uppercase">
                        {venue.name}
                    </BottomSheetTitle>
                    <span className="tp-body-md text-fg-muted">{venue.address}</span>
                </div>
            </div>
            <div className="border-line flex items-center gap-2 border-t-2 pt-3">
                {venue.programmeUrl === null ? undefined : (
                    <a
                        href={venue.programmeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="border-line shadow-hard-md tp-pixel-md bg-permanent text-fg rounded-md border-2 px-4 py-3 uppercase"
                    >
                        {t("Preview.Programme")}
                    </a>
                )}
                <RouteLink
                    route={routes.venueDetail}
                    parameters={{ lang: language, venueId: venue.id }}
                    query={{}}
                    aria-label={t("Preview.OpenVenue")}
                    className="pixel-circle-48 drop-shadow-hard-sm text-fg relative ml-auto flex size-12 items-center justify-center rounded-full [--pixel-fill:var(--color-permanent)] [&>svg]:size-5"
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
                {props.entry === undefined ? (
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
                ) : props.entry.type === "occurrence" ? (
                    <PreviewBody
                        route={props.route}
                        occurrence={props.entry.occurrence}
                        categories={props.categories}
                        now={props.now}
                        paging={props.paging}
                        closeButton={closeButton}
                    />
                ) : (
                    <VenuePreviewBody
                        venue={props.entry.venue}
                        paging={props.paging}
                        closeButton={closeButton}
                    />
                )}
            </BottomSheetContent>
        </BottomSheetRoot>
    )
}

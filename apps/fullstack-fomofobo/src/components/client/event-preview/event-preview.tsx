"use client"

import { dayMonthOf, localDateOf, localTimeOf } from "domain/local-format"
import { occurrenceProgress } from "domain/occurrence-progress"
import { occurrenceStatus } from "domain/occurrence-status"
import { venuePhotoToneOf } from "domain/photo-tone"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import { cn } from "frontend-shared/styles"
import type { Category, OccurrenceSummary, PublicVenue } from "models"
import type { ReactNode } from "react"
import { useEffect, useEffectEvent, useId, useRef, useState } from "react"
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
import { TonedImage } from "@/components/client/toned-image/toned-image"
import { useClosingText } from "@/lib/hooks/use-closing-text"
import { useNonModalDialog } from "@/lib/hooks/use-non-modal-dialog"
import { usePriceSummary } from "@/lib/hooks/use-price-summary"

interface PreviewPaging {
    index: number
    total: number
    onPrevious: () => void
    onNext: () => void
}

export type PreviewVenue = Pick<
    PublicVenue,
    "id" | "name" | "address" | "coordinates" | "coverPhotoUrl" | "kind" | "closingDays"
>

export type PreviewEntry =
    | { type: "occurrence"; occurrence: OccurrenceSummary }
    | { type: "venue"; venue: PreviewVenue }

type RenderTitle = (text: string, className?: string) => ReactNode

interface PreviewPanelProps {
    entry: PreviewEntry | undefined
    loadFailed: boolean
    categories: ReadonlyMap<string, Category>
    now: Date
    paging: PreviewPaging | undefined
    renderTitle: RenderTitle
    onOpenDetail: () => void
    onOpenVenue: (venueId: string) => void
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
    PreviewPanelProps,
    "entry" | "loadFailed" | "onClose"
> {
    occurrence: OccurrenceSummary
    closeButton: ReactNode
}

const PreviewBody = (props: PreviewBodyProps) => {
    const { t } = useTranslation("shared")
    const priceSummary = usePriceSummary()

    const occurrence = props.occurrence
    const span = {
        startsAt: new Date(occurrence.startsAt),
        endsAt: new Date(occurrence.endsAt),
    }
    const status = occurrenceStatus(span, props.now)
    const elapsedFraction = occurrenceProgress(span, props.now)
    const startsToday =
        localDateOf(span.startsAt, PLATFORM_TIME_ZONE) ===
        localDateOf(props.now, PLATFORM_TIME_ZONE)
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
                <TonedImage
                    src={occurrence.coverPhotoUrl}
                    tone={status}
                    width={96}
                    height={96}
                    alt=""
                    className="size-24 shrink-0 rounded-sm object-cover"
                />
                <div className="flex min-w-0 flex-col gap-1">
                    {props.renderTitle(occurrence.title, "tp-pixel-xl uppercase")}
                    {occurrence.venue.isBlocked ? (
                        <span className="tp-body-md text-fg-muted">
                            {occurrence.venue.name}
                        </span>
                    ) : (
                        <button
                            type="button"
                            className="tp-body-md text-fg-muted cursor-pointer self-start text-left underline"
                            onClick={() => {
                                props.onOpenVenue(occurrence.venue.id)
                            }}
                        >
                            {occurrence.venue.name}
                        </button>
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
                <span className="flex flex-col">
                    {startsToday ? undefined : (
                        <span className="tp-pixel-sm">
                            {dayMonthOf(span.startsAt, PLATFORM_TIME_ZONE)}
                        </span>
                    )}
                    <span className="tp-pixel-xl">
                        {/* Thin spaces part the arrow from the times */}
                        {`${localTimeOf(span.startsAt, PLATFORM_TIME_ZONE)}\u2009→\u2009${localTimeOf(span.endsAt, PLATFORM_TIME_ZONE)}`}
                    </span>
                </span>
                <button
                    type="button"
                    aria-label={t("Preview.Open")}
                    onClick={props.onOpenDetail}
                    className={cn(
                        "pixel-circle-48 drop-shadow-hard-sm text-fg relative flex size-12 cursor-pointer items-center justify-center rounded-full [&>svg]:size-5",
                        {
                            "[--pixel-fill:var(--color-live)]": status === "live",
                            "[--pixel-fill:var(--color-upcoming)]": status === "upcoming",
                            "[--pixel-fill:var(--color-ended)]": status === "ended",
                        },
                    )}
                >
                    <PixelIconArrow />
                </button>
            </div>
        </div>
    )
}

interface VenuePreviewBodyProps {
    venue: PreviewVenue
    paging: PreviewPaging | undefined
    renderTitle: RenderTitle
    closeButton: ReactNode
    onOpenDetail: () => void
}

const VenuePreviewBody = (props: VenuePreviewBodyProps) => {
    const { t } = useTranslation("shared")
    const closingText = useClosingText()(props.venue.closingDays)
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
                    <TonedImage
                        src={venue.coverPhotoUrl}
                        tone={venuePhotoToneOf(venue.kind)}
                        width={96}
                        height={96}
                        alt=""
                        className="size-24 shrink-0 rounded-sm object-cover"
                    />
                )}
                <div className="flex min-w-0 flex-col gap-1">
                    {props.renderTitle(venue.name, "tp-pixel-xl uppercase")}
                    <span className="tp-body-md text-fg-muted">{venue.address}</span>
                </div>
            </div>
            <div className="border-line flex items-center gap-2 border-t-2 pt-3">
                {closingText === undefined ? undefined : (
                    <span className="tp-pixel-sm uppercase">{closingText}</span>
                )}
                <button
                    type="button"
                    aria-label={t("Preview.OpenVenue")}
                    onClick={props.onOpenDetail}
                    className="pixel-circle-48 drop-shadow-hard-sm text-fg relative ml-auto flex size-12 cursor-pointer items-center justify-center rounded-full [--pixel-fill:var(--color-permanent)] [&>svg]:size-5"
                >
                    <PixelIconArrow />
                </button>
            </div>
        </div>
    )
}

const PreviewPanel = (props: PreviewPanelProps) => {
    const { t } = useTranslation("shared")

    const closeButton = (
        <IconButton
            aria-label={t("Preview.Close")}
            icon={<PixelIconClose />}
            size="sm"
            onClick={props.onClose}
        />
    )

    if (props.entry === undefined) {
        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    {props.renderTitle(t("Preview.Title"))}
                    {closeButton}
                </div>
                {props.loadFailed ? (
                    <Alert type="error" text={t("Preview.Unavailable")} />
                ) : (
                    <Spinner title={t("Preview.Loading")} />
                )}
            </div>
        )
    }

    return props.entry.type === "occurrence" ? (
        <PreviewBody
            occurrence={props.entry.occurrence}
            categories={props.categories}
            now={props.now}
            paging={props.paging}
            renderTitle={props.renderTitle}
            closeButton={closeButton}
            onOpenDetail={props.onOpenDetail}
            onOpenVenue={props.onOpenVenue}
        />
    ) : (
        <VenuePreviewBody
            venue={props.entry.venue}
            paging={props.paging}
            renderTitle={props.renderTitle}
            closeButton={closeButton}
            onOpenDetail={props.onOpenDetail}
        />
    )
}

interface EventPreviewProps extends StrictOmit<PreviewPanelProps, "renderTitle"> {
    open: boolean
    // Height of the open sheet in px, 0 once it closes
    onHeightChange: (height: number) => void
}

export const EventPreview = (props: EventPreviewProps) => {
    const readHeightChange = useEffectEvent(props.onHeightChange)
    const [sheet, setSheet] = useState<HTMLDivElement | null>(null)

    useEffect(() => {
        if (sheet === null) {
            readHeightChange(0)
            return undefined
        }
        const observer = new ResizeObserver(() => {
            readHeightChange(sheet.offsetHeight)
        })
        observer.observe(sheet)
        return () => {
            observer.disconnect()
        }
    }, [sheet])

    return (
        <BottomSheetRoot
            open={props.open}
            onOpenChange={open => {
                if (!open) {
                    props.onClose()
                }
            }}
        >
            <BottomSheetContent ref={setSheet}>
                <PreviewPanel
                    entry={props.entry}
                    loadFailed={props.loadFailed}
                    categories={props.categories}
                    now={props.now}
                    paging={props.paging}
                    renderTitle={(text, className) => (
                        <BottomSheetTitle className={className}>{text}</BottomSheetTitle>
                    )}
                    onOpenDetail={props.onOpenDetail}
                    onOpenVenue={props.onOpenVenue}
                    onClose={props.onClose}
                />
            </BottomSheetContent>
        </BottomSheetRoot>
    )
}

interface NonModalPreviewProps extends StrictOmit<
    PreviewPanelProps,
    "entry" | "loadFailed" | "renderTitle"
> {
    entry: PreviewEntry
}

// Native events on the card that the map below it would handle
const MAP_GESTURE_EVENTS = ["mousedown", "touchstart", "wheel", "dblclick"] as const

export const EventPreviewCard = (props: NonModalPreviewProps) => {
    const titleId = useId()
    const cardRef = useRef<HTMLElement>(null)
    useNonModalDialog(cardRef, props.onClose)

    useEffect(() => {
        const card = cardRef.current
        if (card === null) {
            return undefined
        }
        const keepFromMap = (event: Event) => {
            event.stopPropagation()
        }
        for (const type of MAP_GESTURE_EVENTS) {
            card.addEventListener(type, keepFromMap)
        }
        return () => {
            for (const type of MAP_GESTURE_EVENTS) {
                card.removeEventListener(type, keepFromMap)
            }
        }
    }, [])

    return (
        <section
            ref={cardRef}
            role="dialog"
            aria-modal={false}
            aria-labelledby={titleId}
            tabIndex={-1}
            className="pixel-corners drop-shadow-hard-lg relative w-[23.75rem] cursor-auto p-4 outline-none"
        >
            <PreviewPanel
                entry={props.entry}
                loadFailed={false}
                categories={props.categories}
                now={props.now}
                paging={props.paging}
                renderTitle={(text, className) => (
                    <h2 id={titleId} className={cn("text-fg tp-pixel-lg", className)}>
                        {text}
                    </h2>
                )}
                onOpenDetail={props.onOpenDetail}
                onOpenVenue={props.onOpenVenue}
                onClose={props.onClose}
            />
        </section>
    )
}

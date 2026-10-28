"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { localTimeOf, weekdayDateOf } from "domain/local-format"
import { occurrenceStatus } from "domain/occurrence-status"
import { venuePhotoToneOf } from "domain/photo-tone"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import { venueShareTextOf } from "domain/share-summary"
import { historyDatesOf, VENUE_HISTORY_PAGE_SIZE } from "domain/venue-history"
import type {
    OccurrenceRef,
    OccurrenceSummary,
    PublicVenue,
    VenueHistoryItem,
} from "models"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"
import { Badge } from "ui-components/badge"
import { Button } from "ui-components/button"
import { IconButton } from "ui-components/icon-button"
import {
    PixelIconBack,
    PixelIconDirections,
    PixelIconFacebook,
    PixelIconInstagram,
    PixelIconLink,
} from "ui-components/pixel-icons"
import { Spinner } from "ui-components/spinner"

import { DirectionsLink } from "@/components/client/directions-link/directions-link"
import { ShareRow } from "@/components/client/share-row/share-row"
import { TonedImage } from "@/components/client/toned-image/toned-image"
import { api } from "@/lib/api/client-api"

const linkClassName =
    "border-line shadow-hard-md tp-pixel-sm flex items-center justify-center gap-2 rounded-md border-2 px-3 py-2 uppercase [&>svg]:size-4"

interface VenueDetailProps {
    venue: PublicVenue
    now: Date
    shareUrl: string
    onBack: () => void
    onOpenEvent: (ref: OccurrenceRef) => void
}

export const VenueDetail = (props: VenueDetailProps) => {
    const { t } = useTranslation("shared")
    const { venue } = props

    const links = [
        {
            url: venue.links.websiteUrl,
            label: t("Venue.Website"),
            icon: <PixelIconLink />,
        },
        {
            url: venue.links.instagramUrl,
            label: t("Detail.Instagram"),
            icon: <PixelIconInstagram />,
        },
        {
            url: venue.links.facebookUrl,
            label: t("Detail.Facebook"),
            icon: <PixelIconFacebook />,
        },
    ]

    return (
        <article className="flex flex-col gap-5">
            <header className="flex items-center gap-3">
                <IconButton
                    aria-label={t("Detail.Back")}
                    icon={<PixelIconBack />}
                    onClick={props.onBack}
                />
            </header>
            {venue.coverPhotoUrl === null ? undefined : (
                <TonedImage
                    src={venue.coverPhotoUrl}
                    tone={venuePhotoToneOf(venue.kind)}
                    width={1200}
                    height={900}
                    alt={t("Venue.Cover", { name: venue.name })}
                    className="border-line aspect-[4/3] w-full rounded-md border-2 object-cover"
                />
            )}
            <div className="flex flex-col gap-2">
                {venue.kind === "regular" ? undefined : (
                    <Badge tone="permanent" className="self-start">
                        {t(`VenueKind.${venue.kind}`)}
                    </Badge>
                )}
                <h1 className="tp-pixel-2xl uppercase">{venue.name}</h1>
                <p className="tp-body-md text-fg-muted">{venue.address}</p>
                {venue.description === null ? undefined : (
                    <p className="tp-body-lg">{venue.description}</p>
                )}
            </div>
            <div className="flex flex-wrap gap-3">
                {venue.programmeUrl === null ? undefined : (
                    <a
                        href={venue.programmeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`${linkClassName} bg-permanent text-fg`}
                    >
                        {t("Preview.Programme")}
                    </a>
                )}
                <DirectionsLink
                    coordinates={venue.coordinates}
                    className={`${linkClassName} bg-surface-inverse text-fg-inverse`}
                >
                    <PixelIconDirections />
                    {t("Detail.Directions")}
                </DirectionsLink>
                {links.map(link =>
                    link.url === null ? undefined : (
                        <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`${linkClassName} bg-social text-fg`}
                        >
                            {link.icon}
                            {link.label}
                        </a>
                    ),
                )}
            </div>
            <section aria-label={t("Venue.Upcoming")} className="flex flex-col gap-3">
                <h2 className="tp-pixel-md uppercase">{t("Venue.Upcoming")}</h2>
                {venue.upcoming.length === 0 ? (
                    <p className="tp-body-md text-fg-muted">{t("Venue.NoUpcoming")}</p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {venue.upcoming.map(occurrence => (
                            <UpcomingItem
                                key={occurrence.eventId}
                                occurrence={occurrence}
                                now={props.now}
                                onOpen={props.onOpenEvent}
                            />
                        ))}
                    </ul>
                )}
            </section>
            <VenueHistory venueId={venue.id} />
            <ShareRow url={props.shareUrl} text={venueShareTextOf(venue)} />
        </article>
    )
}

interface UpcomingItemProps {
    occurrence: OccurrenceSummary
    now: Date
    onOpen: (ref: OccurrenceRef) => void
}

const UpcomingItem = (props: UpcomingItemProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const { occurrence } = props
    const startsAt = new Date(occurrence.startsAt)
    const status = occurrenceStatus(
        { startsAt, endsAt: new Date(occurrence.endsAt) },
        props.now,
    )

    return (
        <li className="bg-surface border-line shadow-hard-md rounded-md border-2 p-3">
            <button
                type="button"
                className="flex w-full cursor-pointer flex-col gap-1 text-left"
                onClick={() => {
                    props.onOpen({ eventId: occurrence.eventId, date: occurrence.date })
                }}
            >
                <Badge tone={status} dot={true} className="self-start">
                    {t(`Status.${status}`)}
                </Badge>
                <span className="tp-pixel-lg uppercase">{occurrence.title}</span>
                <span className="tp-pixel-sm uppercase">
                    {weekdayDateOf(startsAt, PLATFORM_TIME_ZONE, language)}{" "}
                    {localTimeOf(startsAt, PLATFORM_TIME_ZONE)}
                </span>
            </button>
        </li>
    )
}

interface VenueHistoryProps {
    venueId: string
}

const VenueHistory = (props: VenueHistoryProps) => {
    const { t } = useTranslation("shared")
    const history = useInfiniteQuery(
        api.listVenueHistoryInfiniteQuery({
            params: { venueId: props.venueId },
            pageSize: VENUE_HISTORY_PAGE_SIZE,
        }),
    )
    const items = (history.data?.pages ?? []).flatMap(page => page.items)

    return (
        <section aria-label={t("Venue.History")} className="flex flex-col gap-3">
            <h2 className="tp-pixel-md uppercase">{t("Venue.History")}</h2>
            {history.isPending ? (
                <Spinner title={t("Venue.HistoryLoading")} />
            ) : history.isError && history.data === undefined ? (
                <Alert type="error" text={t("Venue.HistoryError")} />
            ) : items.length === 0 ? (
                <p className="tp-body-md text-fg-muted">{t("Venue.NoHistory")}</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {items.map(item => (
                        <HistoryItem key={item.eventId} item={item} />
                    ))}
                </ul>
            )}
            {history.isFetchNextPageError ? (
                <Alert type="error" text={t("Venue.HistoryError")} />
            ) : undefined}
            {history.hasNextPage ? (
                <Button
                    variant="secondary"
                    size="sm"
                    className="self-start"
                    disabled={history.isFetchingNextPage}
                    onClick={() => {
                        void history.fetchNextPage()
                    }}
                >
                    {t("Venue.More")}
                </Button>
            ) : undefined}
        </section>
    )
}

interface HistoryItemProps {
    item: VenueHistoryItem
}

const HistoryItem = (props: HistoryItemProps) => (
    <li className="border-line flex flex-col gap-1 border-b-2 border-dashed pb-2">
        <span className="tp-pixel-sm text-fg-muted uppercase">
            {historyDatesOf(props.item)}
        </span>
        <span className="tp-body-md">{props.item.title}</span>
    </li>
)

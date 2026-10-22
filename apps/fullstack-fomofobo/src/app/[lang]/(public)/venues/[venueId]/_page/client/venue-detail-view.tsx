"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { LanguageKey } from "i18n/i18n"
import type { OccurrenceSummary, VenueHistoryItem } from "models"
import Image from "next/image"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"
import { Badge } from "ui-components/badge"
import { IconButton } from "ui-components/icon-button"
import { Pagination } from "ui-components/pagination"
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
import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { formatLocalDate, localTimeOf, weekdayDateOf } from "@/lib/events/local-format"
import { occurrenceStatus } from "@/lib/events/occurrence-status"
import { useBackToMap } from "@/lib/hooks/use-back-to-map"
import { useNow } from "@/lib/hooks/use-now"
import { PLATFORM_TIME_ZONE } from "@/lib/platform/platform"
import { VENUE_HISTORY_PAGE_SIZE } from "@/lib/venues/history"

const CLOCK_TICK_MS = 60_000

const linkClassName =
    "border-line shadow-hard-md tp-pixel-sm flex items-center justify-center gap-2 rounded-md border-2 px-3 py-2 uppercase [&>svg]:size-4"

interface VenueDetailViewProps extends RouteClientComponentProps<"venueDetail"> {
    url: string
}

export const VenueDetailView = (props: VenueDetailViewProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const goBack = useBackToMap()
    const now = useNow(CLOCK_TICK_MS)
    const { parameters, query, setQuery } = useDynamicRoute(routes[props.route])
    // The page renders only after the server read the venue, so the cache holds it.
    const { data: venue } = useQuery(
        api.getPublicVenueQuery({ params: { venueId: parameters.venueId }, query: {} }),
    )
    const history = useQuery({
        ...api.listVenueHistoryQuery({
            params: { venueId: parameters.venueId },
            query: { page: query.page ?? 1, pageSize: VENUE_HISTORY_PAGE_SIZE },
        }),
        placeholderData: keepPreviousData,
    })

    if (venue === undefined) {
        return undefined
    }

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
        <article className="mx-auto flex min-h-full max-w-xl flex-col gap-5 p-4">
            <header className="flex items-center gap-3">
                <IconButton
                    aria-label={t("Detail.Back")}
                    icon={<PixelIconBack />}
                    onClick={goBack}
                />
            </header>
            {venue.coverPhotoUrl === null ? undefined : (
                <Image
                    src={venue.coverPhotoUrl}
                    width={1200}
                    height={900}
                    unoptimized={true}
                    alt={t("Venue.Cover", { name: venue.name })}
                    className="border-line aspect-[4/3] w-full rounded-md border-2 object-cover"
                />
            )}
            <div className="flex flex-col gap-2">
                <h1 className="tp-pixel-2xl uppercase">{venue.name}</h1>
                <p className="tp-body-md text-fg-muted">{venue.address}</p>
                {venue.description === null ? undefined : (
                    <p className="tp-body-lg">{venue.description}</p>
                )}
            </div>
            <div className="flex flex-wrap gap-3">
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
                                now={now}
                                language={language}
                            />
                        ))}
                    </ul>
                )}
            </section>
            <section aria-label={t("Venue.History")} className="flex flex-col gap-3">
                <h2 className="tp-pixel-md uppercase">{t("Venue.History")}</h2>
                {history.isPending ? (
                    <Spinner title={t("Venue.HistoryLoading")} />
                ) : history.isError ? (
                    <Alert type="error" text={t("Venue.HistoryError")} />
                ) : history.data.items.length === 0 ? (
                    <p className="tp-body-md text-fg-muted">{t("Venue.NoHistory")}</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {history.data.items.map(item => (
                            <HistoryItem key={item.eventId} item={item} />
                        ))}
                    </ul>
                )}
                {history.data === undefined ? undefined : (
                    <Pagination
                        page={history.data.page}
                        totalPages={history.data.totalPages}
                        onPageChange={page => {
                            setQuery({ page })
                        }}
                    />
                )}
            </section>
            <ShareRow url={props.url} text={`${venue.name} · ${venue.address}`} />
        </article>
    )
}

interface UpcomingItemProps {
    occurrence: OccurrenceSummary
    now: Date
    language: LanguageKey
}

const UpcomingItem = (props: UpcomingItemProps) => {
    const { t } = useTranslation("shared")
    const { occurrence } = props
    const startsAt = new Date(occurrence.startsAt)
    const status = occurrenceStatus(
        { startsAt, endsAt: new Date(occurrence.endsAt) },
        props.now,
    )

    return (
        <li className="bg-surface border-line shadow-hard-md rounded-md border-2 p-3">
            <RouteLink
                route={routes.eventDetail}
                parameters={{
                    lang: props.language,
                    eventId: occurrence.eventId,
                    date: occurrence.date,
                }}
                query={{}}
                className="flex flex-col gap-1"
            >
                <Badge tone={status} dot={true} className="self-start">
                    {t(`Status.${status}`)}
                </Badge>
                <span className="tp-pixel-lg uppercase">{occurrence.title}</span>
                <span className="tp-pixel-sm uppercase">
                    {weekdayDateOf(startsAt, PLATFORM_TIME_ZONE, props.language)}{" "}
                    {localTimeOf(startsAt, PLATFORM_TIME_ZONE)}
                </span>
            </RouteLink>
        </li>
    )
}

interface HistoryItemProps {
    item: VenueHistoryItem
}

const HistoryItem = (props: HistoryItemProps) => {
    const { item } = props
    const firstDate = formatLocalDate(item.firstDate)
    const lastDate = formatLocalDate(item.lastDate)

    return (
        <li className="border-line flex flex-col gap-1 border-b-2 border-dashed pb-2">
            <span className="tp-pixel-sm text-fg-muted uppercase">
                {firstDate === lastDate ? firstDate : `${firstDate} → ${lastDate}`}
            </span>
            <span className="tp-body-md">{item.title}</span>
        </li>
    )
}

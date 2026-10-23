"use client"

import { useQuery } from "@tanstack/react-query"
import { localTimeOf } from "domain/local-format"
import { occurrenceFactsOf } from "domain/occurrence-facts"
import { occurrenceProgress } from "domain/occurrence-progress"
import { occurrenceStatus } from "domain/occurrence-status"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import { priceDetailRows } from "domain/price-details"
import { formatEuroCents } from "domain/price-summary"
import { shareSummaryOf } from "domain/share-summary"
import type { LanguageKey } from "i18n/i18n"
import type { OccurrenceDetail, PriceScheme } from "models"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { match } from "ts-pattern"
import { Badge } from "ui-components/badge"
import { IconButton } from "ui-components/icon-button"
import {
    PixelIconBack,
    PixelIconDirections,
    PixelIconFacebook,
    PixelIconInstagram,
    PixelIconShare,
} from "ui-components/pixel-icons"
import { StatGrid } from "ui-components/stat-grid"
import { Timeline } from "ui-components/timeline"
import { useToast } from "ui-components/toast"

import { DirectionsLink } from "@/components/client/directions-link/directions-link"
import { SaveToggle } from "@/components/client/save-toggle/save-toggle"
import { ShareRow } from "@/components/client/share-row/share-row"
import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { useBackToMap } from "@/lib/hooks/use-back-to-map"
import { useCopyLink } from "@/lib/hooks/use-copy-link"
import { useNow } from "@/lib/hooks/use-now"
import { usePriceSummary } from "@/lib/hooks/use-price-summary"

import { PhotoGallery } from "./photo-gallery"

const CLOCK_TICK_MS = 60_000

const actionClassName =
    "border-line shadow-hard-md tp-pixel-md flex flex-1 items-center justify-center gap-2 rounded-md border-2 px-4 py-3 uppercase [&>svg]:size-4"

interface EventDetailViewProps extends RouteClientComponentProps<"eventDetail"> {
    url: string
}

export const EventDetailView = (props: EventDetailViewProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const goBack = useBackToMap()
    const toast = useToast()
    const copyLink = useCopyLink()
    const now = useNow(CLOCK_TICK_MS)
    const { parameters } = useDynamicRoute(routes[props.route])
    // The page renders only after the server read the occurrence, so the cache holds it.
    const { data: occurrence } = useQuery(
        api.getOccurrenceQuery({
            params: { eventId: parameters.eventId, date: parameters.date },
            query: {},
        }),
    )

    if (occurrence === undefined) {
        return undefined
    }

    const share = () => {
        const data = { title: occurrence.title, url: globalThis.location.href }
        // Both calls run first in the click: Safari drops the user gesture after an await.
        if ("canShare" in navigator && navigator.canShare(data)) {
            navigator.share(data).catch((error: unknown) => {
                if (!(error instanceof DOMException && error.name === "AbortError")) {
                    toast.add({ type: "error", error: { type: "generic" } })
                }
            })
            return
        }
        void copyLink(data.url)
    }

    return (
        <article className="mx-auto flex min-h-full max-w-xl flex-col gap-5 p-4 pb-28">
            <PhotoGallery
                route={props.route}
                title={occurrence.title}
                photos={occurrence.photos}
                coverPhotoUrl={occurrence.coverPhotoUrl}
                controls={
                    <>
                        <IconButton
                            aria-label={t("Detail.Back")}
                            icon={<PixelIconBack />}
                            onClick={goBack}
                        />
                        <div className="flex gap-2">
                            <SaveToggle occurrence={occurrence} />
                            <IconButton
                                aria-label={t("Detail.Share")}
                                icon={<PixelIconShare />}
                                onClick={share}
                            />
                        </div>
                    </>
                }
            />
            <OccurrenceBody occurrence={occurrence} now={now} language={language} />
            <ShareRow
                url={props.url}
                text={`${occurrence.title} · ${shareSummaryOf(occurrence, language)}`}
            />
            <nav
                aria-label={t("Detail.Actions")}
                className="bg-surface border-line fixed inset-x-0 bottom-0 flex gap-3 border-t-2 p-4"
            >
                <DirectionsLink
                    coordinates={occurrence.venue.coordinates}
                    className={`${actionClassName} bg-surface-inverse text-fg-inverse`}
                >
                    <PixelIconDirections />
                    {t("Detail.Directions")}
                </DirectionsLink>
                {occurrence.externalLinks.instagramUrl === null ? undefined : (
                    <a
                        href={occurrence.externalLinks.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`${actionClassName} bg-social text-fg`}
                    >
                        <PixelIconInstagram />
                        {t("Detail.Instagram")}
                    </a>
                )}
                {occurrence.externalLinks.facebookUrl === null ? undefined : (
                    <a
                        href={occurrence.externalLinks.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`${actionClassName} bg-social text-fg`}
                    >
                        <PixelIconFacebook />
                        {t("Detail.Facebook")}
                    </a>
                )}
            </nav>
        </article>
    )
}

interface OccurrenceBodyProps {
    occurrence: OccurrenceDetail
    now: Date
    language: LanguageKey
}

const OccurrenceBody = (props: OccurrenceBodyProps) => {
    const { t } = useTranslation("shared")
    const priceSummary = usePriceSummary()
    const { occurrence } = props
    const span = {
        startsAt: new Date(occurrence.startsAt),
        endsAt: new Date(occurrence.endsAt),
    }
    const status = occurrenceStatus(span, props.now)
    const elapsedFraction = occurrenceProgress(span, props.now)
    const startTime = localTimeOf(span.startsAt, PLATFORM_TIME_ZONE)
    const endTime = localTimeOf(span.endsAt, PLATFORM_TIME_ZONE)

    const facts = occurrenceFactsOf(occurrence, props.language).map(fact =>
        match(fact)
            .with({ type: "date" }, date => ({
                label: t("Detail.Date"),
                value: date.weekdayDate,
            }))
            .with({ type: "time" }, time => ({
                label: t("Detail.Time"),
                value: `${time.start}→${time.end}`,
            }))
            .with({ type: "entry" }, entry => ({
                label: t("Detail.Entry"),
                value: priceSummary(entry.priceScheme),
            }))
            .with({ type: "capacity" }, capacity => ({
                label: t("Detail.Capacity"),
                value: t("Detail.Places", { count: capacity.places }),
            }))
            .with({ type: "interested" }, interested => ({
                label: t("Detail.Interest"),
                value: t("Detail.Interested", { count: interested.count }),
            }))
            .exhaustive(),
    )

    return (
        <>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <Badge tone={status} dot={true}>
                        {t(`Status.${status}`)}
                    </Badge>
                </div>
                {status === "live" ? (
                    <Timeline
                        label={t("Preview.Elapsed")}
                        value={elapsedFraction * 100}
                        min={0}
                        max={100}
                        start={startTime}
                        now={t("Detail.Now", {
                            time: localTimeOf(props.now, PLATFORM_TIME_ZONE),
                        })}
                        end={endTime}
                        tone="live"
                    />
                ) : undefined}
            </div>
            <div className="flex flex-col gap-2">
                <h1 className="tp-pixel-2xl uppercase">{occurrence.title}</h1>
                {occurrence.description === null ? undefined : (
                    <p className="tp-body-lg text-fg-muted">{occurrence.description}</p>
                )}
            </div>
            <StatGrid items={facts} />
            <PriceDetails priceScheme={occurrence.priceScheme} />
            <section aria-label={t("Detail.Venue")} className="flex flex-col gap-1">
                <h2 className="tp-pixel-sm text-fg-muted uppercase">
                    {t("Detail.Venue")}
                </h2>
                {occurrence.venue.isBlocked ? (
                    <p className="tp-pixel-lg">{occurrence.venue.name}</p>
                ) : (
                    <RouteLink
                        route={routes.venueDetail}
                        parameters={{
                            lang: props.language,
                            venueId: occurrence.venue.id,
                        }}
                        query={{}}
                        className="tp-pixel-lg underline"
                    >
                        {occurrence.venue.name}
                    </RouteLink>
                )}
                <p className="tp-body-md text-fg-muted">{occurrence.venue.address}</p>
            </section>
        </>
    )
}

interface PriceDetailsProps {
    priceScheme: PriceScheme
}

const PriceDetails = (props: PriceDetailsProps) => {
    const { t } = useTranslation("shared")
    const rows = priceDetailRows(props.priceScheme).map(row =>
        match(row)
            .with({ type: "free" }, () => ({
                key: "entry",
                label: t("Detail.Prices.Entry"),
                value: t("Price.Free"),
            }))
            .with({ type: "full" }, full => ({
                key: "full",
                label: t("Detail.Prices.Full"),
                value: formatEuroCents(full.cents),
            }))
            .with({ type: "reduced" }, reduced => ({
                key: `reduced-${String(reduced.index)}`,
                label: reduced.label,
                value: formatEuroCents(reduced.cents),
            }))
            .with({ type: "membership" }, membership => ({
                key: "membership",
                label: t("Detail.Prices.Membership"),
                value:
                    membership.costCents === null
                        ? membership.name
                        : `${membership.name} · ${formatEuroCents(membership.costCents)}`,
            }))
            .with({ type: "minimum-age" }, minimumAge => ({
                key: "minimum-age",
                label: t("Detail.Prices.MinimumAge"),
                value: t("Price.MinimumAge", { age: minimumAge.age }),
            }))
            .with({ type: "notes" }, notes => ({
                key: "notes",
                label: t("Detail.Prices.Notes"),
                value: notes.text,
            }))
            .exhaustive(),
    )

    return rows.length === 0 ? undefined : (
        <section aria-label={t("Detail.Prices.Label")} className="flex flex-col gap-2">
            <h2 className="tp-pixel-sm text-fg-muted uppercase">
                {t("Detail.Prices.Label")}
            </h2>
            <dl className="border-line divide-line-muted flex flex-col divide-y-2 border-2">
                {rows.map(row => (
                    <div
                        key={row.key}
                        className="flex items-baseline justify-between gap-3 px-3 py-2"
                    >
                        <dt className="tp-body-md">{row.label}</dt>
                        <dd className="tp-pixel-md text-right">{row.value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    )
}

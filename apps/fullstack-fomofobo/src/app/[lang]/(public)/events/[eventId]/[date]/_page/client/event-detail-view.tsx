"use client"

import { useQuery } from "@tanstack/react-query"
import type { GeoPoint, OccurrenceDetail } from "models"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { isDefined } from "shared/values"
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

import { SaveToggle } from "@/components/client/save-toggle/save-toggle"
import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { countdownParts } from "@/lib/events/countdown"
import { localTimeOf, weekdayDateOf } from "@/lib/events/local-format"
import { occurrenceProgress } from "@/lib/events/occurrence-progress"
import { occurrenceStatus } from "@/lib/events/occurrence-status"
import { directionsUrl, mapsProviderOf } from "@/lib/geo/directions-url"
import { formatDistance } from "@/lib/geo/format-distance"
import { haversineDistance } from "@/lib/geo/haversine-distance"
import { useBackToMap } from "@/lib/hooks/use-back-to-map"
import { useGeolocation } from "@/lib/hooks/use-geolocation"
import { useNow } from "@/lib/hooks/use-now"
import { PLATFORM_TIME_ZONE } from "@/lib/platform/platform"

import { PhotoGallery } from "./photo-gallery"

const CLOCK_TICK_MS = 60_000

const actionClassName =
    "border-line shadow-hard-md tp-pixel-md flex flex-1 items-center justify-center gap-2 rounded-md border-2 px-4 py-3 uppercase [&>svg]:size-4"

export const EventDetailView = (props: RouteClientComponentProps<"eventDetail">) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const goBack = useBackToMap()
    const toast = useToast()
    const now = useNow(CLOCK_TICK_MS)
    const geolocation = useGeolocation()
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

    const copyLink = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url)
            toast.add({ type: "success", messages: [t("Detail.LinkCopied")] })
        } catch {
            toast.add({ type: "error", error: { type: "generic" } })
        }
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
            <OccurrenceBody
                occurrence={occurrence}
                now={now}
                position={
                    geolocation.state.status === "granted"
                        ? geolocation.state.position
                        : undefined
                }
                language={language}
            />
            <nav
                aria-label={t("Detail.Actions")}
                className="bg-surface border-line fixed inset-x-0 bottom-0 flex gap-3 border-t-2 p-4"
            >
                <a
                    href={directionsUrl(occurrence.venue.coordinates, "google")}
                    target="_blank"
                    rel="noreferrer"
                    className={`${actionClassName} bg-surface-inverse text-fg-inverse`}
                    onClick={event => {
                        if (
                            mapsProviderOf(
                                navigator.userAgent,
                                navigator.maxTouchPoints,
                            ) === "apple"
                        ) {
                            event.preventDefault()
                            globalThis.location.assign(
                                directionsUrl(occurrence.venue.coordinates, "apple"),
                            )
                        }
                    }}
                >
                    <PixelIconDirections />
                    {t("Detail.Directions")}
                </a>
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
    position: GeoPoint | undefined
    language: string
}

const OccurrenceBody = (props: OccurrenceBodyProps) => {
    const { t } = useTranslation("shared")
    const { occurrence } = props
    const span = {
        startsAt: new Date(occurrence.startsAt),
        endsAt: new Date(occurrence.endsAt),
    }
    const status = occurrenceStatus(span, props.now)
    const progress = occurrenceProgress(span, props.now)
    const remaining = countdownParts(progress.remainingMs)
    const startTime = localTimeOf(span.startsAt, PLATFORM_TIME_ZONE)
    const endTime = localTimeOf(span.endsAt, PLATFORM_TIME_ZONE)

    const facts = [
        {
            label: t("Detail.Date"),
            value: weekdayDateOf(span.startsAt, PLATFORM_TIME_ZONE, props.language),
        },
        { label: t("Detail.Time"), value: `${startTime}→${endTime}` },
        { label: t("Detail.Entry"), value: occurrence.price ?? t("Preview.Free") },
        // PLACEHOLDER(OP-19): no distance without the position of the device
        props.position === undefined
            ? undefined
            : {
                  label: t("Detail.Distance"),
                  value: formatDistance(
                      haversineDistance(props.position, occurrence.venue.coordinates),
                      props.language,
                  ),
              },
    ].filter(isDefined)

    return (
        <>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <Badge tone={status} dot={true}>
                        {t(`Status.${status}`)}
                    </Badge>
                    {status === "live" ? (
                        <span className="text-live-strong tp-pixel-2xl">
                            {t("Detail.Remaining", {
                                time:
                                    remaining.hours > 0
                                        ? t("Countdown.HoursMinutes", { ...remaining })
                                        : t("Countdown.Minutes", { ...remaining }),
                            })}
                        </span>
                    ) : undefined}
                </div>
                {status === "live" ? (
                    <Timeline
                        label={t("Preview.Elapsed")}
                        value={progress.elapsedFraction * 100}
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
            <section aria-label={t("Detail.Venue")} className="flex flex-col gap-1">
                <h2 className="tp-pixel-sm text-fg-muted uppercase">
                    {t("Detail.Venue")}
                </h2>
                <p className="tp-pixel-lg">{occurrence.venue.name}</p>
                <p className="tp-body-md text-fg-muted">{occurrence.venue.address}</p>
            </section>
        </>
    )
}

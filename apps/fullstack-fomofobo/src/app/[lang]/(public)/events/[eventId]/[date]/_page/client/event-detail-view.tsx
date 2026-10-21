"use client"

import { useQuery } from "@tanstack/react-query"
import type { OccurrenceDetail } from "models"
import type { ReactNode } from "react"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { Badge } from "ui-components/badge"
import { IconButton } from "ui-components/icon-button"
import {
    PixelIconBack,
    PixelIconDirections,
    PixelIconFacebook,
    PixelIconInstagram,
    PixelIconLink,
    PixelIconShare,
    PixelIconTelegram,
    PixelIconWhatsApp,
    PixelIconX,
} from "ui-components/pixel-icons"
import { StatGrid } from "ui-components/stat-grid"
import { Timeline } from "ui-components/timeline"
import { useToast } from "ui-components/toast"

import { SaveToggle } from "@/components/client/save-toggle/save-toggle"
import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { localTimeOf, weekdayDateOf } from "@/lib/events/local-format"
import { occurrenceProgress } from "@/lib/events/occurrence-progress"
import { occurrenceStatus } from "@/lib/events/occurrence-status"
import { directionsUrl, mapsProviderOf } from "@/lib/geo/directions-url"
import { useBackToMap } from "@/lib/hooks/use-back-to-map"
import { useNow } from "@/lib/hooks/use-now"
import { PLATFORM_TIME_ZONE } from "@/lib/platform/platform"
import { shareSummaryOf } from "@/lib/share/share-summary"
import { shareUrlOf } from "@/lib/share/share-urls"
import type { ShareTarget } from "@/lib/share/share-urls"

import { PhotoGallery } from "./photo-gallery"

const CLOCK_TICK_MS = 60_000

const shareTargets: ReadonlyArray<{ target: ShareTarget; icon: ReactNode }> = [
    { target: "whatsapp", icon: <PixelIconWhatsApp /> },
    { target: "telegram", icon: <PixelIconTelegram /> },
    { target: "facebook", icon: <PixelIconFacebook /> },
    { target: "x", icon: <PixelIconX /> },
]

const shareLinkClassName =
    "pixel-circle-40 drop-shadow-hard-md text-fg focus-visible:outline-focus relative inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:[--pixel-fill:var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-4"

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
            <OccurrenceBody occurrence={occurrence} now={now} language={language} />
            <ShareRow
                url={props.url}
                text={`${occurrence.title} · ${shareSummaryOf(occurrence, language)}`}
                onCopy={() => {
                    void copyLink(props.url)
                }}
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
    const elapsedFraction = occurrenceProgress(span, props.now)
    const startTime = localTimeOf(span.startsAt, PLATFORM_TIME_ZONE)
    const endTime = localTimeOf(span.endsAt, PLATFORM_TIME_ZONE)

    const facts = [
        {
            label: t("Detail.Date"),
            value: weekdayDateOf(span.startsAt, PLATFORM_TIME_ZONE, props.language),
        },
        { label: t("Detail.Time"), value: `${startTime}→${endTime}` },
        { label: t("Detail.Entry"), value: occurrence.price ?? t("Preview.Free") },
    ]

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

interface ShareRowProps {
    url: string
    text: string
    onCopy: () => void
}

const ShareRow = (props: ShareRowProps) => {
    const { t } = useTranslation("shared")

    return (
        <section aria-label={t("Detail.ShareOn.Label")} className="flex flex-col gap-2">
            <h2 className="tp-pixel-sm text-fg-muted uppercase">
                {t("Detail.ShareOn.Label")}
            </h2>
            <div className="flex flex-wrap gap-3">
                {shareTargets.map(({ target, icon }) => (
                    <a
                        key={target}
                        href={shareUrlOf(target, { url: props.url, text: props.text })}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={t(`Detail.ShareOn.${target}`)}
                        className={shareLinkClassName}
                    >
                        {icon}
                    </a>
                ))}
                <IconButton
                    aria-label={t("Detail.ShareOn.Copy")}
                    icon={<PixelIconLink />}
                    onClick={props.onCopy}
                />
            </div>
        </section>
    )
}

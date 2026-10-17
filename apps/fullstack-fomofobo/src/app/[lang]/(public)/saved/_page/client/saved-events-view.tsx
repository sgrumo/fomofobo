"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"
import { Badge } from "ui-components/badge"
import { IconButton } from "ui-components/icon-button"
import { PixelIconBack } from "ui-components/pixel-icons"
import { Spinner } from "ui-components/spinner"

import { SaveToggle } from "@/components/client/save-toggle/save-toggle"
import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { localTimeOf, weekdayDateOf } from "@/lib/events/local-format"
import { occurrenceStatus } from "@/lib/events/occurrence-status"
import { useBackToMap } from "@/lib/hooks/use-back-to-map"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { useNow } from "@/lib/hooks/use-now"
import { PLATFORM_TIME_ZONE } from "@/lib/platform/platform"

const CLOCK_TICK_MS = 60_000

export const SavedEventsView = (_props: RouteClientComponentProps<"saved">) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const goBack = useBackToMap()
    const now = useNow(CLOCK_TICK_MS)
    const [savedEvents] = useLocalStorage("saved-events")

    const newestFirst = savedEvents.events.toSorted((first, second) =>
        second.savedAt.localeCompare(first.savedAt),
    )
    const lookup = useQuery({
        ...api.lookupOccurrencesQuery({
            params: {},
            query: { ref: newestFirst.map(saved => `${saved.eventId}:${saved.date}`) },
        }),
        enabled: newestFirst.length > 0,
        placeholderData: keepPreviousData,
    })
    // An unsaved event leaves the list at once, before the next lookup answers.
    const savedIds = new Set(newestFirst.map(saved => saved.eventId))
    const occurrences = (lookup.data ?? []).filter(occurrence =>
        savedIds.has(occurrence.eventId),
    )

    const body =
        newestFirst.length === 0 ? (
            <p className="tp-body-md text-fg-muted">{t("Saved.Empty")}</p>
        ) : lookup.isError ? (
            <Alert type="error" text={t("Saved.Error")} />
        ) : lookup.isPending ? (
            <Spinner title={t("Saved.Loading")} />
        ) : occurrences.length === 0 ? (
            <p className="tp-body-md text-fg-muted">{t("Saved.NoneVisible")}</p>
        ) : (
            <ul className="flex flex-col gap-3">
                {occurrences.map(occurrence => {
                    const startsAt = new Date(occurrence.startsAt)
                    const status = occurrenceStatus(
                        { startsAt, endsAt: new Date(occurrence.endsAt) },
                        now,
                    )
                    return (
                        <li
                            key={`${occurrence.eventId}:${occurrence.date}`}
                            className="bg-surface border-line shadow-hard-md flex items-start gap-3 rounded-md border-2 p-3"
                        >
                            <RouteLink
                                route={routes.eventDetail}
                                parameters={{
                                    lang: language,
                                    eventId: occurrence.eventId,
                                    date: occurrence.date,
                                }}
                                query={{}}
                                className="flex min-w-0 flex-1 flex-col gap-1"
                            >
                                <Badge tone={status} dot={true} className="self-start">
                                    {t(`Status.${status}`)}
                                </Badge>
                                <span className="tp-pixel-lg uppercase">
                                    {occurrence.title}
                                </span>
                                <span className="tp-body-md text-fg-muted">
                                    {occurrence.venue.name}
                                </span>
                                <span className="tp-pixel-sm uppercase">
                                    {weekdayDateOf(
                                        startsAt,
                                        PLATFORM_TIME_ZONE,
                                        language,
                                    )}{" "}
                                    {localTimeOf(startsAt, PLATFORM_TIME_ZONE)}
                                </span>
                            </RouteLink>
                            <SaveToggle occurrence={occurrence} size="sm" />
                        </li>
                    )
                })}
            </ul>
        )

    return (
        <section className="mx-auto flex max-w-xl flex-col gap-4 p-4">
            <header className="flex items-center gap-3">
                <IconButton
                    aria-label={t("Detail.Back")}
                    icon={<PixelIconBack />}
                    onClick={goBack}
                />
                <h1 className="tp-pixel-2xl uppercase">{t("PageTitle.Saved")}</h1>
            </header>
            {body}
        </section>
    )
}

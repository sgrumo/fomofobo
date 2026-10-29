"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { localTimeOf, weekdayDateOf } from "domain/local-format"
import { occurrenceStatus } from "domain/occurrence-status"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import type { OccurrenceRef } from "models"
import type { MouseEvent } from "react"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"
import { Badge } from "ui-components/badge"
import { Spinner } from "ui-components/spinner"

import { SaveToggle } from "@/components/client/save-toggle/save-toggle"
import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { readSavedSnapshots } from "@/lib/pwa/saved-snapshots"

/**
 * @description True when a click opens the link in place: the main button, with no modifier key
 * @param event Click read
 */
const isPlainClick = (event: MouseEvent): boolean =>
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey

interface SavedEventsListProps {
    now: Date
    // A plain click on a saved event, which opens its detail in place of the link
    onOpen: (ref: OccurrenceRef) => void
}

export const SavedEventsList = (props: SavedEventsListProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
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
    // Offline, the list comes from the copies the save toggle keeps on the device.
    const snapshots = useQuery({
        queryKey: ["saved-snapshots", newestFirst],
        queryFn: () => readSavedSnapshots(newestFirst),
        enabled: lookup.isError,
    })
    const fromSnapshots =
        lookup.isError && snapshots.isSuccess && snapshots.data.length > 0
    // An unsaved event leaves the list at once, before the next lookup answers.
    const savedIds = new Set(newestFirst.map(saved => saved.eventId))
    const occurrences = ((fromSnapshots ? snapshots.data : lookup.data) ?? []).filter(
        occurrence => savedIds.has(occurrence.eventId),
    )

    const body =
        newestFirst.length === 0 ? (
            <p className="tp-body-md text-fg-muted">{t("Saved.Empty")}</p>
        ) : lookup.isError && !snapshots.isPending && !fromSnapshots ? (
            <Alert type="error" text={t("Saved.Error")} />
        ) : lookup.isPending || (lookup.isError && snapshots.isPending) ? (
            <Spinner title={t("Saved.Loading")} />
        ) : occurrences.length === 0 ? (
            <p className="tp-body-md text-fg-muted">{t("Saved.NoneVisible")}</p>
        ) : (
            <ul className="flex flex-col gap-3">
                {occurrences.map(occurrence => {
                    const startsAt = new Date(occurrence.startsAt)
                    const status = occurrenceStatus(
                        { startsAt, endsAt: new Date(occurrence.endsAt) },
                        props.now,
                    )
                    return (
                        <li
                            key={`${occurrence.eventId}:${occurrence.date}`}
                            className="bg-surface border-line shadow-hard-md flex items-start gap-3 rounded-md border-2 p-3"
                        >
                            <RouteLink
                                route={routes.root}
                                parameters={{ lang: language }}
                                query={{
                                    event: occurrence.eventId,
                                    occurrence: occurrence.date,
                                    detail: true,
                                }}
                                className="flex min-w-0 flex-1 flex-col gap-1"
                                onClick={event => {
                                    if (isPlainClick(event)) {
                                        event.preventDefault()
                                        props.onOpen({
                                            eventId: occurrence.eventId,
                                            date: occurrence.date,
                                        })
                                    }
                                }}
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
        <>
            {fromSnapshots ? <Alert type="info" text={t("Saved.Offline")} /> : undefined}
            {body}
        </>
    )
}

"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { localTimeOf, weekdayDateOf } from "domain/local-format"
import { occurrenceStatus } from "domain/occurrence-status"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import { cn } from "frontend-shared/styles"
import type { OccurrenceRef } from "models"
import type { MouseEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"
import { Badge } from "ui-components/badge"
import { IconButton } from "ui-components/icon-button"
import { PixelIconBack } from "ui-components/pixel-icons"
import { Spinner } from "ui-components/spinner"

import { EventPreviewPanel } from "@/components/client/event-preview/event-preview"
import { SaveToggle } from "@/components/client/save-toggle/save-toggle"
import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { useBackToMap } from "@/lib/hooks/use-back-to-map"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { useNow } from "@/lib/hooks/use-now"
import { readSavedSnapshots } from "@/lib/pwa/saved-snapshots"

import { InstallEntry } from "./install-entry"

const CLOCK_TICK_MS = 60_000

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

export const SavedEventsView = (props: RouteClientComponentProps<"saved">) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const goBack = useBackToMap()
    const now = useNow(CLOCK_TICK_MS)
    const [savedEvents] = useLocalStorage("saved-events")
    // The `md` breakpoint of the preview panel of the map
    const wide = useMediaQuery("(min-width: 48rem)")
    const [selectedRef, setSelectedRef] = useState<OccurrenceRef>()
    const panelRef = useRef<HTMLDivElement>(null)
    const categories = useQuery(api.listCategoriesQuery({ params: {}, query: {} }))

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
    // A wide screen opens a saved event in a panel on the right, as the map does
    const selected =
        wide && selectedRef !== undefined
            ? occurrences.find(
                  occurrence =>
                      occurrence.eventId === selectedRef.eventId &&
                      occurrence.date === selectedRef.date,
              )
            : undefined
    const panelOpen = selected !== undefined

    // A press outside the panel closes it, before a click on another event opens that one
    useEffect(() => {
        if (!panelOpen) {
            return undefined
        }
        const closeOnOutsidePress = (event: PointerEvent) => {
            const panel = panelRef.current
            if (
                panel !== null &&
                event.target instanceof Node &&
                !panel.contains(event.target)
            ) {
                setSelectedRef(undefined)
            }
        }
        document.addEventListener("pointerdown", closeOnOutsidePress)
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsidePress)
        }
    }, [panelOpen])

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
                                onClick={event => {
                                    if (wide && isPlainClick(event)) {
                                        event.preventDefault()
                                        setSelectedRef({
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
        <div className={cn({ "pr-[25.75rem]": panelOpen })}>
            <section className="mx-auto flex max-w-xl flex-col gap-4 p-4">
                <header className="flex items-center gap-3">
                    <IconButton
                        aria-label={t("Detail.Back")}
                        icon={<PixelIconBack />}
                        onClick={goBack}
                    />
                    <h1 className="tp-pixel-2xl uppercase">{t("PageTitle.Saved")}</h1>
                </header>
                {fromSnapshots ? (
                    <Alert type="info" text={t("Saved.Offline")} />
                ) : undefined}
                {body}
                <InstallEntry route={props.route} />
            </section>
            {selected === undefined ? undefined : (
                <div ref={panelRef} className="fixed top-4 right-4 bottom-4 w-[23.75rem]">
                    <EventPreviewPanel
                        entry={{ type: "occurrence", occurrence: selected }}
                        categories={
                            new Map(
                                categories.data?.map(category => [category.id, category]),
                            )
                        }
                        now={now}
                        paging={undefined}
                        onClose={() => {
                            setSelectedRef(undefined)
                        }}
                    />
                </div>
            )}
        </div>
    )
}

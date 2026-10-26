"use client"

import { useQuery } from "@tanstack/react-query"
import { centerQueryOf, nextLocateRequest, searchCenterOf } from "domain/map-center"
import type { LocateRequest } from "domain/map-center"
import { hasActiveFilters } from "domain/map-filters"
import { placeQueryOf, textQueryOf } from "domain/map-search"
import { isSameSpotEntry, spotEntriesOf } from "domain/spot-entries"
import { cn } from "frontend-shared/styles"
import type { OccurrenceRef, OccurrenceSummary } from "models"
import dynamic from "next/dynamic"
import { useEffect, useId, useRef, useState } from "react"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { match } from "ts-pattern"
import { Alert } from "ui-components/alert"
import { Button } from "ui-components/button"
import { IconButton } from "ui-components/icon-button"
import {
    PixelIconFilter,
    PixelIconLocate,
    PixelIconSaved,
} from "ui-components/pixel-icons"
import { Spinner } from "ui-components/spinner"
import { useToast } from "ui-components/toast"

import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { useGeolocation } from "@/lib/hooks/use-geolocation"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { useNow } from "@/lib/hooks/use-now"
import { useOnline } from "@/lib/hooks/use-online"

import { CategoryChips } from "./category-chips"
import { DateChips } from "./date-chips"
import { EventPreview, EventPreviewCard } from "./event-preview"
import type { PreviewEntry, PreviewVenue } from "./event-preview"
import { PlaceSearch } from "./place-search"

const EventMap = dynamic(() => import("./event-map").then(module => module.EventMap), {
    ssr: false,
})

const CLOCK_TICK_MS = 60_000

type PreviewTarget =
    | { type: "occurrence"; ref: OccurrenceRef }
    | { type: "venue"; venueId: string }

/**
 * @description Returns the preview entry of the selected occurrence, else of the selected venue
 * @param occurrence Occurrence selected, if any
 * @param venue Venue selected, if any
 */
const previewEntryOf = (
    occurrence: OccurrenceSummary | undefined,
    venue: PreviewVenue | undefined,
): PreviewEntry | undefined => {
    if (occurrence !== undefined) {
        return { type: "occurrence", occurrence }
    }
    return venue === undefined ? undefined : { type: "venue", venue }
}

/**
 * @description Returns the selection that opens the preview of an entry
 * @param entry Entry opened
 */
const targetOf = (entry: PreviewEntry): PreviewTarget =>
    entry.type === "occurrence"
        ? {
              type: "occurrence",
              ref: { eventId: entry.occurrence.eventId, date: entry.occurrence.date },
          }
        : { type: "venue", venueId: entry.venue.id }

export const MapScreen = (props: RouteClientComponentProps<"root">) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const toast = useToast()
    const { query, setQuery } = useDynamicRoute(routes[props.route])
    const geolocation = useGeolocation()
    const now = useNow(CLOCK_TICK_MS)
    const online = useOnline()
    const filtersId = useId()
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [locateRequest, setLocateRequest] = useState<LocateRequest>()
    const filtersActive = hasActiveFilters(query)
    const overlayRef = useRef<HTMLDivElement>(null)
    // The `md` breakpoint of the filter panel
    const wide = useMediaQuery("(min-width: 48rem)")

    const {
        center,
        hasQueryCenter: hasUrlCenter,
        locationOff,
        searchReady,
    } = searchCenterOf(query, geolocation.state.status)
    const position =
        geolocation.state.status === "granted" ? geolocation.state.position : undefined

    // The first position becomes the center, unless the URL already names one.
    useEffect(() => {
        if (position !== undefined && !hasUrlCenter) {
            setQuery(centerQueryOf(position))
        }
    }, [position, hasUrlCenter, setQuery])

    const categories = useQuery(api.listCategoriesQuery({ params: {}, query: {} }))
    const search = useQuery({
        ...api.searchOccurrencesQuery({
            params: {},
            query: {
                lat: center.latitude,
                lng: center.longitude,
                q: query.q,
                categoryIds: query.category === undefined ? undefined : [query.category],
                free: query.free,
                date: query.date ?? "default",
                from: query.from,
                to: query.to,
            },
        }),
        enabled: searchReady,
    })

    // A failed search keeps the last results on the map.
    const [results, setResults] = useState(search.data)
    if (search.data !== undefined && search.data !== results) {
        setResults(search.data)
    }

    const categoriesById = new Map(
        categories.data?.map(category => [category.id, category]),
    )
    const iconOf = (categoryId: string) => categoriesById.get(categoryId)?.icon ?? "other"

    const selectedRef =
        query.event === undefined || query.occurrence === undefined
            ? undefined
            : { eventId: query.event, date: query.occurrence }
    const fromResults =
        selectedRef === undefined
            ? undefined
            : results?.occurrences.find(
                  occurrence =>
                      occurrence.eventId === selectedRef.eventId &&
                      occurrence.date === selectedRef.date,
              )
    // An event suggestion can name an occurrence outside the results.
    const detail = useQuery({
        ...api.getOccurrenceQuery({
            params: { eventId: query.event ?? "", date: query.occurrence ?? "" },
            query: {},
        }),
        enabled: selectedRef !== undefined && fromResults === undefined,
    })
    const selectedVenueId = selectedRef === undefined ? query.venue : undefined
    const venueFromResults = results?.permanentVenues.find(
        venue => venue.id === selectedVenueId,
    )
    // A shared link can name a venue outside the results.
    const venueDetail = useQuery({
        ...api.getPublicVenueQuery({
            params: { venueId: selectedVenueId ?? "" },
            query: {},
        }),
        enabled: selectedVenueId !== undefined && venueFromResults === undefined,
    })
    const selectedOccurrence =
        selectedRef === undefined ? undefined : (fromResults ?? detail.data)
    const selectedVenue =
        selectedVenueId === undefined ? undefined : (venueFromResults ?? venueDetail.data)
    const selected = previewEntryOf(selectedOccurrence, selectedVenue)
    const spotVenueId =
        selected?.type === "occurrence"
            ? selected.occurrence.venue.id
            : selected?.venue.id
    const sameSpot: PreviewEntry[] =
        spotVenueId === undefined || results === undefined
            ? []
            : spotEntriesOf(results, spotVenueId)
    const spotIndex = sameSpot.findIndex(entry => isSameSpotEntry(entry, selected))

    // True while the open preview owns the history entry that a close pops.
    const previewPushedRef = useRef(false)
    const openPreview = (target: PreviewTarget) => {
        const opening = selectedRef === undefined && selectedVenueId === undefined
        previewPushedRef.current = opening || previewPushedRef.current
        setQuery(
            target.type === "occurrence"
                ? {
                      event: target.ref.eventId,
                      occurrence: target.ref.date,
                      venue: undefined,
                  }
                : { event: undefined, occurrence: undefined, venue: target.venueId },
            { history: opening ? "push" : "replace" },
        )
    }
    const closePreview = () => {
        if (previewPushedRef.current) {
            previewPushedRef.current = false
            globalThis.history.back()
            return
        }
        setQuery(
            { event: undefined, occurrence: undefined, venue: undefined },
            { history: "replace" },
        )
    }
    const showSpotEntry = (index: number) => {
        const entry = sameSpot.at(index)
        if (entry !== undefined && index >= 0) {
            openPreview(targetOf(entry))
        }
    }

    const paging =
        sameSpot.length > 1 && spotIndex !== -1
            ? {
                  index: spotIndex,
                  total: sameSpot.length,
                  onPrevious: () => {
                      showSpotEntry(spotIndex - 1)
                  },
                  onNext: () => {
                      showSpotEntry(spotIndex + 1)
                  },
              }
            : undefined
    // A wide screen shows the preview above its pin, once the entry and its place are known
    const previewCard =
        wide && selected !== undefined
            ? {
                  coordinates:
                      selected.type === "occurrence"
                          ? selected.occurrence.venue.coordinates
                          : selected.venue.coordinates,
                  content: (
                      <EventPreviewCard
                          route={props.route}
                          entry={selected}
                          categories={categoriesById}
                          now={now}
                          paging={paging}
                          onClose={closePreview}
                      />
                  ),
              }
            : undefined

    const locate = async () => {
        const result = await geolocation.locate()
        match(result)
            .with({ status: "granted" }, granted => {
                setQuery({ ...centerQueryOf(granted.position), place: undefined })
                setLocateRequest(previous =>
                    nextLocateRequest(granted.position, previous),
                )
            })
            .with({ status: "denied" }, () => {
                toast.add({
                    type: "info",
                    title: t("Map.LocationBlocked.Title"),
                    messages: [t("Map.LocationBlocked.Description")],
                })
            })
            .with({ status: "unavailable" }, () => {
                toast.add({
                    type: "info",
                    title: t("Map.LocationUnavailable.Title"),
                    messages: [t("Map.LocationUnavailable.Description")],
                })
            })
            .with({ status: "unknown" }, () => undefined)
            .exhaustive()
    }

    const notices = [
        !hasUrlCenter && locationOff ? (
            <Alert key="location-off" type="info" text={t("Map.LocationOff")}>
                {/* A blocked permission answers at once: the toast of `locate` tells how to lift it */}
                <Button
                    variant="secondary"
                    size="sm"
                    className="self-start"
                    onClick={() => {
                        void locate()
                    }}
                >
                    {t("Map.AllowLocation")}
                </Button>
            </Alert>
        ) : undefined,
        online ? undefined : (
            <Alert key="offline" type="warning" text={t("Map.Offline")} />
        ),
        search.isError ? (
            <Alert
                key="error"
                type="error"
                text={online ? t("Map.Error") : t("Map.NeedsConnection")}
            />
        ) : undefined,
        results?.truncated === true ? (
            <Alert key="truncated" type="warning" text={t("Map.Truncated")} />
        ) : undefined,
    ]

    return (
        <section aria-label={t("Map.Label")} className="bg-map-ground absolute inset-0">
            <EventMap
                route={props.route}
                center={center}
                locateRequest={locateRequest}
                position={position}
                occurrences={results?.occurrences ?? []}
                permanentVenues={results?.permanentVenues ?? []}
                iconOf={iconOf}
                selectedVenueId={spotVenueId}
                previewCard={previewCard}
                overlayRef={overlayRef}
                now={now}
                onSelect={ref => {
                    openPreview({ type: "occurrence", ref })
                }}
                onSelectVenue={venueId => {
                    openPreview({ type: "venue", venueId })
                }}
            />
            <div
                ref={overlayRef}
                className="pointer-events-none absolute inset-x-4 top-4 flex flex-col gap-2 [&>*]:pointer-events-auto"
            >
                <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                        <PlaceSearch
                            // A new place, or a recenter that clears it, resets the typed text.
                            key={query.place ?? ""}
                            route={props.route}
                            center={center}
                            initialText={query.place ?? query.q ?? ""}
                            onPlaceSelect={place => {
                                setQuery(placeQueryOf(place))
                            }}
                            onEventSelect={ref => {
                                openPreview({ type: "occurrence", ref })
                            }}
                            onTextSubmit={text => {
                                setQuery(textQueryOf(text))
                            }}
                        />
                    </div>
                    <div className="relative md:hidden">
                        <IconButton
                            aria-label={t("Filters.Label")}
                            aria-expanded={filtersOpen}
                            aria-controls={filtersId}
                            icon={<PixelIconFilter />}
                            tone={filtersOpen ? "inverse" : "surface"}
                            onClick={() => {
                                setFiltersOpen(open => !open)
                            }}
                        />
                        {filtersActive ? (
                            <span
                                aria-hidden={true}
                                className="bg-live border-line pointer-events-none absolute -top-0.5 -right-0.5 size-3 border-2"
                            />
                        ) : undefined}
                    </div>
                </div>
                {/* Below `md` the filters sit in a panel that the filter button opens. */}
                <div
                    id={filtersId}
                    className={cn(
                        "flex flex-col gap-2",
                        filtersOpen
                            ? "max-md:pixel-corners max-md:drop-shadow-hard-md max-md:relative max-md:p-2"
                            : "max-md:hidden",
                    )}
                >
                    <CategoryChips
                        route={props.route}
                        categories={categories.data ?? []}
                        counts={results?.categoryCounts}
                        selected={query.category}
                        onChange={setQuery}
                        className="max-md:flex-wrap"
                    />
                    <DateChips
                        route={props.route}
                        query={query}
                        now={now}
                        onChange={setQuery}
                        className="max-md:flex-wrap"
                    />
                </div>
                {notices}
            </div>
            {/* Clears the map attribution, which sits in the bottom corner. */}
            <div className="absolute right-4 bottom-8 flex items-center gap-2">
                {search.isFetching ? (
                    <Spinner title={t("Map.Loading")} size="xs" />
                ) : undefined}
                <RouteLink
                    route={routes.saved}
                    parameters={{ lang: language }}
                    query={{}}
                    aria-label={t("Saved.Open")}
                    className="pixel-circle-40 drop-shadow-hard-md text-fg relative inline-flex size-10 shrink-0 items-center justify-center rounded-full [&>svg]:size-4"
                >
                    <PixelIconSaved />
                </RouteLink>
                <IconButton
                    aria-label={t("Map.Locate")}
                    icon={<PixelIconLocate />}
                    onClick={() => {
                        void locate()
                    }}
                />
            </div>
            <EventPreview
                route={props.route}
                open={
                    previewCard === undefined &&
                    (selectedRef !== undefined || selectedVenueId !== undefined)
                }
                entry={selected}
                loadFailed={
                    selectedRef === undefined ? venueDetail.isError : detail.isError
                }
                categories={categoriesById}
                now={now}
                paging={paging}
                onClose={closePreview}
            />
        </section>
    )
}

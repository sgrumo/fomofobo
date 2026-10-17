"use client"

import { useQuery } from "@tanstack/react-query"
import type { GeoPoint, OccurrenceSummary } from "models"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { match } from "ts-pattern"
import { Alert } from "ui-components/alert"
import { IconButton } from "ui-components/icon-button"
import { PixelIconLocate } from "ui-components/pixel-icons"
import { Spinner } from "ui-components/spinner"
import { useToast } from "ui-components/toast"

import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { statusBarCounts } from "@/lib/events/status-bar-counts"
import { roundCenter } from "@/lib/geo/round-center"
import { useGeolocation } from "@/lib/hooks/use-geolocation"
import { useNow } from "@/lib/hooks/use-now"
import { DEFAULT_CITY, PLATFORM_TIME_ZONE } from "@/lib/platform/platform"

import { CategoryChips } from "./category-chips"
import { DateChips } from "./date-chips"
import { PlaceSearch } from "./place-search"
import { StatusBar } from "./status-bar"

const EventMap = dynamic(() => import("./event-map").then(module => module.EventMap), {
    ssr: false,
})

const CLOCK_TICK_MS = 60_000

/**
 * @description Returns the query keys that make the point the search center
 * @param point Point that becomes the center
 */
const centerQuery = (point: GeoPoint) => {
    const { latitude, longitude } = roundCenter(point)
    return { lat: latitude, lng: longitude }
}

export const MapScreen = (props: RouteClientComponentProps<"root">) => {
    const { t } = useTranslation("shared")
    const toast = useToast()
    const { query, setQuery } = useDynamicRoute(routes[props.route])
    const geolocation = useGeolocation()
    const now = useNow(CLOCK_TICK_MS)

    const urlCenter =
        query.lat === undefined || query.lng === undefined
            ? undefined
            : { latitude: query.lat, longitude: query.lng }
    const hasUrlCenter = urlCenter !== undefined
    const center = urlCenter ?? DEFAULT_CITY.center
    const position =
        geolocation.state.status === "granted" ? geolocation.state.position : undefined
    const locationOff =
        geolocation.state.status === "denied" ||
        geolocation.state.status === "unavailable"

    // The first position becomes the center, unless the URL already names one.
    useEffect(() => {
        if (position !== undefined && !hasUrlCenter) {
            setQuery(centerQuery(position))
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
                date: query.date ?? "default",
                from: query.from,
                to: query.to,
            },
        }),
        // Waits for the first answer of the browser, so the default city never flashes by.
        enabled: hasUrlCenter || locationOff,
    })

    // A failed search keeps the last results on the map.
    const [results, setResults] = useState(search.data)
    if (search.data !== undefined && search.data !== results) {
        setResults(search.data)
    }

    const icons = new Map(categories.data?.map(category => [category.id, category.icon]))
    const iconOf = (occurrence: OccurrenceSummary) =>
        icons.get(occurrence.primaryCategoryId) ?? "other"

    const locate = async () => {
        const result = await geolocation.locate()
        match(result)
            .with({ status: "granted" }, granted => {
                setQuery({ ...centerQuery(granted.position), place: undefined })
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
            <Alert key="location-off" type="info" text={t("Map.LocationOff")} />
        ) : undefined,
        search.isError ? (
            <Alert key="error" type="error" text={t("Map.Error")} />
        ) : undefined,
        results !== undefined && results.occurrences.length === 0 ? (
            <Alert key="empty" type="info" text={t("Map.Empty")} />
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
                position={position}
                occurrences={results?.occurrences ?? []}
                iconOf={iconOf}
                now={now}
                onSelect={ref => {
                    setQuery({ event: ref.eventId, occurrence: ref.date })
                }}
            />
            <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-col gap-2 [&>*]:pointer-events-auto">
                <PlaceSearch
                    // A new place, or a recenter that clears it, resets the typed text.
                    key={query.place ?? ""}
                    route={props.route}
                    center={center}
                    initialText={query.place ?? query.q ?? ""}
                    onPlaceSelect={place => {
                        setQuery({
                            ...centerQuery(place.coordinates),
                            place: place.label,
                            q: undefined,
                        })
                    }}
                    onEventSelect={ref => {
                        setQuery({ event: ref.eventId, occurrence: ref.date })
                    }}
                    onTextSubmit={text => {
                        setQuery({ q: text, place: undefined })
                    }}
                />
                <CategoryChips
                    route={props.route}
                    categories={categories.data ?? []}
                    counts={
                        results === undefined
                            ? undefined
                            : new Map(
                                  results.categoryCounts.map(entry => [
                                      entry.categoryId,
                                      entry.count,
                                  ]),
                              )
                    }
                    selected={query.category}
                    onSelect={category => {
                        setQuery({ category })
                    }}
                />
                <DateChips
                    route={props.route}
                    now={now}
                    date={query.date}
                    from={query.from}
                    to={query.to}
                    onChange={filter => {
                        setQuery(filter)
                    }}
                />
                {notices}
            </div>
            {/* Clears the map attribution, which sits in the bottom corner. */}
            <div className="absolute inset-x-4 bottom-8 flex items-center gap-2">
                <StatusBar
                    route={props.route}
                    now={now}
                    counts={
                        results === undefined
                            ? undefined
                            : statusBarCounts(
                                  results.occurrences,
                                  now,
                                  PLATFORM_TIME_ZONE,
                              )
                    }
                    truncated={results?.truncated === true}
                />
                {search.isFetching ? (
                    <Spinner title={t("Map.Loading")} size="xs" />
                ) : undefined}
                <IconButton
                    aria-label={t("Map.Locate")}
                    icon={<PixelIconLocate />}
                    onClick={() => {
                        void locate()
                    }}
                />
            </div>
        </section>
    )
}

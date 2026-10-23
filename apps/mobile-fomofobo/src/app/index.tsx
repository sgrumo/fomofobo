import { useQuery } from "@tanstack/react-query"
import { centerQueryOf, searchCenterOf } from "domain/map-center"
import { isSameSpotEntry, spotEntriesOf } from "domain/spot-entries"
import { Link } from "expo-router"
import type { OccurrenceSummary } from "models"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { match } from "ts-pattern"

import { EventMap } from "@/components/map/event-map"
import { EventPreview } from "@/components/map/event-preview"
import type { PreviewEntry, PreviewVenue } from "@/components/map/event-preview"
import { useDeviceLocation } from "@/components/map/use-device-location"
import { useMapQuery } from "@/components/map/use-map-query"
import { Button } from "@/components/ui/button/button"
import { IconButton } from "@/components/ui/icon-button/icon-button"
import { Notice } from "@/components/ui/notice/notice"
import { Spinner } from "@/components/ui/spinner/spinner"
import { Text } from "@/components/ui/text/text"
import { showToast } from "@/components/ui/toast/toast-store"
import { api } from "@/lib/api/client"
import { useNow } from "@/lib/hooks/use-now"

const TOAST_DURATION_MS = 5000

const CLOCK_TICK_MS = 60_000

// Clears the attribution line at the bottom edge
const CONTROLS_BOTTOM_OFFSET = 32

const CLEARED_SELECTION = { event: undefined, occurrence: undefined, venue: undefined }

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

const MapScreen = () => {
    const { t } = useTranslation("shared")
    const insets = useSafeAreaInsets()
    const { query, setQuery } = useMapQuery()
    const location = useDeviceLocation()
    const now = useNow(CLOCK_TICK_MS)
    const { center, hasQueryCenter, locationOff, searchReady } = searchCenterOf(
        query,
        location.state.status,
    )
    const position =
        location.state.status === "granted" ? location.state.position : undefined

    // The first fix becomes the center, unless the params already name one.
    const fixLatitude = position?.latitude
    const fixLongitude = position?.longitude
    useEffect(() => {
        if (fixLatitude !== undefined && fixLongitude !== undefined && !hasQueryCenter) {
            setQuery(centerQueryOf({ latitude: fixLatitude, longitude: fixLongitude }))
        }
    }, [fixLatitude, fixLongitude, hasQueryCenter, setQuery])

    const { data: categories } = useQuery(
        api.listCategoriesQuery({ params: {}, query: {} }),
    )
    const {
        data: search,
        isFetching: searchFetching,
        isError: searchFailed,
    } = useQuery({
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
    const [results, setResults] = useState(search)
    if (search !== undefined && search !== results) {
        setResults(search)
    }

    const categoriesById = new Map(categories?.map(category => [category.id, category]))
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
    // A link can name an occurrence outside the results.
    const { data: detail, isError: detailFailed } = useQuery({
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
    // A link can name a venue outside the results.
    const { data: venueDetail, isError: venueDetailFailed } = useQuery({
        ...api.getPublicVenueQuery({
            params: { venueId: selectedVenueId ?? "" },
            query: {},
        }),
        enabled: selectedVenueId !== undefined && venueFromResults === undefined,
    })
    const selected = previewEntryOf(
        selectedRef === undefined ? undefined : (fromResults ?? detail),
        selectedVenueId === undefined ? undefined : (venueFromResults ?? venueDetail),
    )
    const spotVenueId =
        selected?.type === "occurrence"
            ? selected.occurrence.venue.id
            : selected?.venue.id
    const sameSpot =
        spotVenueId === undefined || results === undefined
            ? []
            : spotEntriesOf(results, spotVenueId)
    const spotIndex = sameSpot.findIndex(entry => isSameSpotEntry(entry, selected))

    const showSpotEntry = (index: number) => {
        const entry = sameSpot[index]
        if (entry === undefined) {
            return
        }
        setQuery(
            entry.type === "occurrence"
                ? {
                      event: entry.occurrence.eventId,
                      occurrence: entry.occurrence.date,
                      venue: undefined,
                  }
                : { event: undefined, occurrence: undefined, venue: entry.venue.id },
        )
    }

    const locate = async () => {
        const result = await location.locate()
        match(result)
            .with({ status: "granted" }, granted => {
                setQuery({ ...centerQueryOf(granted.position), place: undefined })
            })
            .with({ status: "unavailable" }, () => {
                showToast(
                    {
                        tone: "info",
                        title: t("Map.LocationUnavailable.Title"),
                        message: t("Map.LocationUnavailable.Description"),
                    },
                    TOAST_DURATION_MS,
                )
            })
            .with({ status: "denied" }, { status: "unknown" }, () => undefined)
            .exhaustive()
    }

    return (
        <View className="flex-1 bg-map-ground">
            <EventMap
                center={center}
                position={position}
                occurrences={results?.occurrences ?? []}
                permanentVenues={results?.permanentVenues ?? []}
                iconOf={iconOf}
                now={now}
                onSelect={ref => {
                    setQuery({
                        event: ref.eventId,
                        occurrence: ref.date,
                        venue: undefined,
                    })
                }}
                onSelectVenue={venueId => {
                    setQuery({ event: undefined, occurrence: undefined, venue: venueId })
                }}
            />
            <View
                className="absolute inset-x-4 gap-2"
                style={{ top: insets.top + 8 }}
                pointerEvents="box-none"
            >
                {__DEV__ && (
                    <Link href="/showcase" asChild={true}>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="self-start"
                            accessibilityLabel="Open the showcase"
                        >
                            <Text>Showcase</Text>
                        </Button>
                    </Link>
                )}
                {!hasQueryCenter && locationOff && (
                    <View className="gap-2">
                        <Notice tone="info" lines={[t("Map.LocationOff")]} />
                        <Button
                            variant="secondary"
                            size="sm"
                            className="self-start"
                            accessibilityLabel={t("Map.AllowLocation")}
                            onPress={() => {
                                void locate()
                            }}
                        >
                            <Text>{t("Map.AllowLocation")}</Text>
                        </Button>
                    </View>
                )}
                {searchFailed && <Notice tone="error" lines={[t("Map.Error")]} />}
                {results?.truncated === true && (
                    <Notice tone="warning" lines={[t("Map.Truncated")]} />
                )}
            </View>
            <View
                className="absolute right-4 flex-row items-center gap-2"
                style={{ bottom: insets.bottom + CONTROLS_BOTTOM_OFFSET }}
            >
                {searchFetching && <Spinner label={t("Map.Loading")} size="sm" />}
                <IconButton
                    icon="locate"
                    label={t("Map.Locate")}
                    onPress={() => {
                        void locate()
                    }}
                />
            </View>
            <EventPreview
                open={selectedRef !== undefined || selectedVenueId !== undefined}
                entry={selected}
                loadFailed={selectedRef === undefined ? venueDetailFailed : detailFailed}
                categories={categoriesById}
                now={now}
                paging={
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
                }
                onClose={() => {
                    setQuery(CLEARED_SELECTION)
                }}
            />
        </View>
    )
}

export default MapScreen

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { centerQueryOf, nextLocateRequest, searchCenterOf } from "domain/map-center"
import type { LocateRequest } from "domain/map-center"
import { hasActiveFilters } from "domain/map-filters"
import { placeQueryOf, textQueryOf } from "domain/map-search"
import { isSameSpotEntry, spotEntriesOf } from "domain/spot-entries"
import { Link, router } from "expo-router"
import type { OccurrenceSummary } from "models"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { BackHandler, Keyboard, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { match } from "ts-pattern"

import { CategoryChips } from "@/components/map/category-chips"
import { DateChips } from "@/components/map/date-chips"
import { EntityDetailSheet } from "@/components/map/entity-detail-sheet"
import { EventMap } from "@/components/map/event-map"
import { EventPreview } from "@/components/map/event-preview"
import type { PreviewEntry, PreviewVenue } from "@/components/map/event-preview"
import { PlaceSearch } from "@/components/map/place-search"
import { useDeviceLocation } from "@/components/map/use-device-location"
import { useMapQuery } from "@/components/map/use-map-query"
import { Button } from "@/components/ui/button/button"
import { IconButton } from "@/components/ui/icon-button/icon-button"
import { Notice } from "@/components/ui/notice/notice"
import { PixelPanel } from "@/components/ui/pixel-panel/pixel-panel"
import { Spinner } from "@/components/ui/spinner/spinner"
import { Text } from "@/components/ui/text/text"
import { showToast } from "@/components/ui/toast/toast-store"
import { ApiResponseError } from "@/lib/api/api-response-error"
import { isSameSearchFilters, latestQueryData } from "@/lib/api/cached-answers"
import { api } from "@/lib/api/client"
import { useNow } from "@/lib/hooks/use-now"
import { useOnline } from "@/lib/hooks/use-online"

const TOAST_DURATION_MS = 5000

const CLOCK_TICK_MS = 60_000

// Clears the attribution line at the bottom edge
const CONTROLS_BOTTOM_OFFSET = 32

const CLEARED_SELECTION = {
    event: undefined,
    occurrence: undefined,
    venue: undefined,
    detail: undefined,
}

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
    const queryClient = useQueryClient()
    const { query, setQuery } = useMapQuery()
    const location = useDeviceLocation()
    const now = useNow(CLOCK_TICK_MS)
    const online = useOnline()
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [locateRequest, setLocateRequest] = useState<LocateRequest>()
    const filtersActive = hasActiveFilters(query)
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
    const searchQuery = {
        lat: center.latitude,
        lng: center.longitude,
        q: query.q,
        categoryIds: query.category === undefined ? undefined : [query.category],
        free: query.free,
        date: query.date ?? "default",
        from: query.from,
        to: query.to,
    }
    const searchOptions = api.searchOccurrencesQuery({ params: {}, query: searchQuery })
    const {
        data: searchAnswer,
        isFetching: searchFetching,
        error: searchError,
    } = useQuery({ ...searchOptions, enabled: searchReady })
    // With no answer, offline or failed, the last search of the same filters stands in, whatever its center
    const search =
        searchAnswer ??
        (searchError !== null || !online
            ? latestQueryData(queryClient, searchOptions.queryKey, cachedKey =>
                  isSameSearchFilters(cachedKey, searchQuery),
              )
            : undefined)

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
    const previewOpen = selectedRef !== undefined || selectedVenueId !== undefined
    const detailOpen = previewOpen && query.detail === true

    // The Android back button leaves the detail for the preview
    useEffect(() => {
        if (!detailOpen) {
            return undefined
        }
        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            setQuery({ detail: undefined })
            return true
        })
        return () => {
            subscription.remove()
        }
    }, [detailOpen, setQuery])
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
                setLocateRequest(previous =>
                    nextLocateRequest(granted.position, previous),
                )
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
                locateRequest={locateRequest}
                position={position}
                occurrences={results?.occurrences ?? []}
                permanentVenues={results?.permanentVenues ?? []}
                iconOf={iconOf}
                selectedVenueId={spotVenueId}
                now={now}
                onSelect={ref => {
                    setQuery({
                        event: ref.eventId,
                        occurrence: ref.date,
                        venue: undefined,
                        detail: undefined,
                    })
                }}
                onSelectVenue={venueId => {
                    setQuery({
                        event: undefined,
                        occurrence: undefined,
                        venue: venueId,
                        detail: undefined,
                    })
                }}
                onPress={() => {
                    Keyboard.dismiss()
                }}
            />
            <View
                className="absolute inset-x-4 gap-2"
                style={{ top: insets.top + 8 }}
                pointerEvents="box-none"
            >
                <View className="flex-row items-start gap-2">
                    <View className="min-w-0 flex-1">
                        <PlaceSearch
                            // A new place, or a recenter that clears it, resets the typed text
                            key={query.place ?? ""}
                            center={center}
                            initialText={query.place ?? query.q ?? ""}
                            onPlaceSelect={place => {
                                setQuery(placeQueryOf(place))
                            }}
                            onEventSelect={ref => {
                                setQuery({
                                    event: ref.eventId,
                                    occurrence: ref.date,
                                    venue: undefined,
                                    detail: undefined,
                                })
                            }}
                            onVenueSelect={venueId => {
                                setQuery({
                                    event: undefined,
                                    occurrence: undefined,
                                    venue: venueId,
                                    detail: true,
                                })
                            }}
                            onTextSubmit={text => {
                                setQuery(textQueryOf(text))
                            }}
                        />
                    </View>
                    <View className="h-11 justify-center">
                        <IconButton
                            icon="filter"
                            label={
                                filtersActive
                                    ? t("Filters.LabelActive")
                                    : t("Filters.Label")
                            }
                            tone={filtersOpen ? "inverse" : "surface"}
                            expanded={filtersOpen}
                            onPress={() => {
                                setFiltersOpen(open => !open)
                            }}
                        />
                        {filtersActive && (
                            <View
                                pointerEvents="none"
                                className="absolute -right-0.5 top-0 h-3 w-3 border-2 border-line bg-live"
                            />
                        )}
                    </View>
                </View>
                {filtersOpen && (
                    <PixelPanel shadow="md">
                        <View className="gap-2 p-2">
                            <CategoryChips
                                categories={categories ?? []}
                                counts={results?.categoryCounts}
                                selected={query.category}
                                onChange={setQuery}
                            />
                            <DateChips query={query} now={now} onChange={setQuery} />
                        </View>
                    </PixelPanel>
                )}
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
                {!online && <Notice tone="info" lines={[t("Map.Offline")]} />}
                {online && searchError !== null && (
                    <Notice
                        tone="error"
                        lines={[
                            searchError instanceof ApiResponseError &&
                            searchError.apiError?.code === "PastDateRange"
                                ? t("Map.PastDateRange")
                                : t("Map.Error"),
                        ]}
                    />
                )}
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
                    icon="saved"
                    label={t("Saved.Open")}
                    onPress={() => {
                        router.push("/saved")
                    }}
                />
                <IconButton
                    icon="locate"
                    label={t("Map.Locate")}
                    onPress={() => {
                        void locate()
                    }}
                />
            </View>
            <EventPreview
                open={previewOpen && !detailOpen}
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
                onOpenDetail={() => {
                    setQuery({ detail: true })
                }}
                onOpenVenue={venueId => {
                    setQuery({
                        event: undefined,
                        occurrence: undefined,
                        venue: venueId,
                        detail: true,
                    })
                }}
                onClose={() => {
                    setQuery(CLEARED_SELECTION)
                }}
            />
            <EntityDetailSheet
                open={detailOpen}
                selection={
                    selectedRef === undefined
                        ? selectedVenueId === undefined
                            ? undefined
                            : { type: "venue", venueId: selectedVenueId }
                        : { type: "occurrence", ref: selectedRef }
                }
                onBack={() => {
                    setQuery({ detail: undefined })
                }}
                onClose={() => {
                    setQuery(CLEARED_SELECTION)
                }}
                onOpenVenue={venueId => {
                    setQuery({
                        event: undefined,
                        occurrence: undefined,
                        venue: venueId,
                        detail: true,
                    })
                }}
                onOpenEvent={ref => {
                    setQuery({
                        event: ref.eventId,
                        occurrence: ref.date,
                        venue: undefined,
                        detail: true,
                    })
                }}
            />
        </View>
    )
}

export default MapScreen

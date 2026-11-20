import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
    centerQueryOf,
    isInsideMap,
    nextLocateRequest,
    searchCenterOf,
} from "domain/map-center"
import type { LocateRequest } from "domain/map-center"
import { hasActiveFilters, shownKindsOf, shownResultsOf } from "domain/map-filters"
import { placeQueryOf, textQueryOf } from "domain/map-search"
import { nextSearchArea, searchBoxOf } from "domain/search-box"
import type { SearchArea } from "domain/search-box"
import { isSameSpotEntry, spotEntriesOf } from "domain/spot-entries"
import { Link } from "expo-router"
import type { OccurrenceSummary } from "models"
import { useEffect, useMemo, useState } from "react"
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
import { KindChips } from "@/components/map/kind-chips"
import { MapAttribution } from "@/components/map/map-attribution"
import { PlaceSearch } from "@/components/map/place-search"
import { useDeviceLocation } from "@/components/map/use-device-location"
import { useMapQuery } from "@/components/map/use-map-query"
import { SavedList } from "@/components/saves/saved-list"
import { Button } from "@/components/ui/button/button"
import { DetailSheet } from "@/components/ui/detail-sheet/detail-sheet"
import { IconButton } from "@/components/ui/icon-button/icon-button"
import { Notice } from "@/components/ui/notice/notice"
import { PixelPanel } from "@/components/ui/pixel-panel/pixel-panel"
import { RadarLoader } from "@/components/ui/radar-loader/radar-loader"
import { Text } from "@/components/ui/text/text"
import { showToast } from "@/components/ui/toast/toast-store"
import { ApiResponseError } from "@/lib/api/api-response-error"
import { isSameSearchFilters, latestQueryData } from "@/lib/api/cached-answers"
import { api } from "@/lib/api/client"
import { useDeviceStorage } from "@/lib/hooks/use-device-storage"
import { useNow } from "@/lib/hooks/use-now"
import { useOnline } from "@/lib/hooks/use-online"
import { playSound } from "@/lib/sounds/play-sound"

const TOAST_DURATION_MS = 5000

const CLOCK_TICK_MS = 60_000

const CONTROLS_BOTTOM_OFFSET = 8

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
    const [soundsMuted, setSoundsMuted] = useDeviceStorage("sounds-muted")
    const [filtersOpen, setFiltersOpen] = useState(false)
    // Folded on load and by a pan or a zoom of the visitor
    const [creditOpen, setCreditOpen] = useState(false)
    const [locateRequest, setLocateRequest] = useState<LocateRequest>()
    const [searchArea, setSearchArea] = useState<SearchArea>()
    const filtersActive = hasActiveFilters(query)
    const { center, hasQueryCenter, locationOff, outsideMap, position, searchReady } =
        searchCenterOf(query, location.state)

    // The first fix inside the map becomes the center, unless the params already name one.
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
        ...searchBoxOf(searchArea, center),
        q: query.q,
        categoryIds: query.categories,
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
    // With no answer, offline or failed, the last search of the same filters stands in, whatever its box
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
    const { showLive, showUpcoming, showPermanent, showEnded } = query
    const shownKinds = useMemo(
        () => shownKindsOf({ showLive, showUpcoming, showPermanent, showEnded }),
        [showLive, showUpcoming, showPermanent, showEnded],
    )
    // The map rebuilds its markers on new result arrays, so they change with their inputs alone
    const shownResults = useMemo(
        () =>
            results === undefined ? undefined : shownResultsOf(results, shownKinds, now),
        [results, shownKinds, now],
    )

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
    // An event opened from the list shows over it, and the list comes back once it closes
    const savedOpen = query.saved === true && !previewOpen

    // The Android back button leaves the detail for the preview, and closes the saved list
    useEffect(() => {
        if (!detailOpen && !savedOpen) {
            return undefined
        }
        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            setQuery(detailOpen ? { detail: undefined } : { saved: undefined })
            return true
        })
        return () => {
            subscription.remove()
        }
    }, [detailOpen, savedOpen, setQuery])
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
        spotVenueId === undefined || shownResults === undefined
            ? []
            : spotEntriesOf(shownResults, spotVenueId)
    const spotIndex = sameSpot.findIndex(entry => isSameSpotEntry(entry, selected))

    // A press or a pan of the map closes the preview, not the detail over it
    const closePreview = () => {
        if (previewOpen && !detailOpen) {
            setQuery(CLEARED_SELECTION)
        }
    }

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
                if (!isInsideMap(granted.position)) {
                    showToast(
                        {
                            tone: "info",
                            title: t("Map.OutsideMap.Title"),
                            message: t("Map.OutsideMap.Description"),
                        },
                        TOAST_DURATION_MS,
                    )
                    return
                }
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
                occurrences={shownResults?.occurrences ?? []}
                permanentVenues={shownResults?.permanentVenues ?? []}
                iconOf={iconOf}
                selectedVenueId={spotVenueId}
                now={now}
                onViewportChange={bbox => {
                    setSearchArea(area =>
                        nextSearchArea(bbox, center, area, results?.truncated === true),
                    )
                }}
                onSelect={ref => {
                    setFiltersOpen(false)
                    setQuery({
                        event: ref.eventId,
                        occurrence: ref.date,
                        venue: undefined,
                        detail: undefined,
                    })
                }}
                onSelectVenue={venueId => {
                    setFiltersOpen(false)
                    setQuery({
                        event: undefined,
                        occurrence: undefined,
                        venue: venueId,
                        detail: undefined,
                    })
                }}
                onPress={() => {
                    Keyboard.dismiss()
                    setFiltersOpen(false)
                    closePreview()
                    if (savedOpen) {
                        setQuery({ saved: undefined })
                    }
                }}
                onUserMoveStart={() => {
                    setCreditOpen(false)
                    closePreview()
                }}
                onClusterZoom={closePreview}
            />
            <View
                className="absolute inset-x-4 gap-2"
                style={{ top: insets.top + 8 }}
                pointerEvents="box-none"
            >
                {/* Above the chips, so the place suggestions cover them */}
                <View className="z-10 flex-row items-start gap-2">
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
                            icon={filtersOpen ? "close" : "filter"}
                            label={
                                filtersActive
                                    ? t("Filters.LabelActive")
                                    : t("Filters.Label")
                            }
                            tone={filtersOpen ? "inverse" : "surface"}
                            expanded={filtersOpen}
                            onPress={() => {
                                playSound(filtersOpen ? "save-off" : "save-on")
                                setFiltersOpen(!filtersOpen)
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
                <KindChips shown={shownKinds} onChange={setQuery} />
                {filtersOpen && (
                    <PixelPanel shadow="md">
                        <View className="gap-2 p-2">
                            <CategoryChips
                                categories={categories ?? []}
                                selected={query.categories}
                                free={query.free === true}
                                onChange={setQuery}
                            />
                            <View className="h-0.5 bg-line" />
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
                {!hasQueryCenter && outsideMap && (
                    <Notice tone="info" lines={[t("Map.OutsideMap.Description")]} />
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
            </View>
            {/* A preview, a detail or the saved list covers the bottom of the map, so the controls give way */}
            {!previewOpen && !savedOpen && (
                <View
                    className="absolute right-4 items-end gap-2"
                    style={{ bottom: insets.bottom + CONTROLS_BOTTOM_OFFSET }}
                >
                    <MapAttribution open={creditOpen} onOpenChange={setCreditOpen} />
                    <View className="flex-row items-center gap-2">
                        {searchFetching && (
                            <RadarLoader label={t("Map.Loading")} cellSize={1} />
                        )}
                        <IconButton
                            icon="saved"
                            label={t("Saved.Open")}
                            onPress={() => {
                                setQuery({ saved: true })
                            }}
                        />
                        <IconButton
                            icon="locate"
                            label={t("Map.Locate")}
                            onPress={() => {
                                void locate()
                            }}
                        />
                        <IconButton
                            icon={soundsMuted ? "muted" : "sound"}
                            label={t(
                                soundsMuted ? "Map.Sounds.Unmute" : "Map.Sounds.Mute",
                            )}
                            onPress={() => {
                                setSoundsMuted(!soundsMuted)
                            }}
                        />
                    </View>
                </View>
            )}
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
                    playSound("expand")
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
            <DetailSheet
                open={savedOpen}
                onClose={() => {
                    setQuery({ saved: undefined })
                }}
            >
                <SavedList
                    now={now}
                    onOpen={ref => {
                        setQuery({
                            event: ref.eventId,
                            occurrence: ref.date,
                            venue: undefined,
                            detail: true,
                        })
                    }}
                    onClose={() => {
                        setQuery({ saved: undefined })
                    }}
                />
            </DetailSheet>
            <EntityDetailSheet
                open={detailOpen}
                selection={
                    selectedRef === undefined
                        ? selectedVenueId === undefined
                            ? undefined
                            : { type: "venue", venueId: selectedVenueId }
                        : { type: "occurrence", ref: selectedRef }
                }
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

import { useQuery } from "@tanstack/react-query"
import { centerQueryOf, searchCenterOf } from "domain/map-center"
import { Link } from "expo-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { match } from "ts-pattern"

import { EventMap } from "@/components/map/event-map"
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
    const { data: search, isFetching: searchFetching } = useQuery({
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
        </View>
    )
}

export default MapScreen

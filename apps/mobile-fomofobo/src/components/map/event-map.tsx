import { Camera, Map, Marker } from "@maplibre/maplibre-react-native"
import type { CameraRef } from "@maplibre/maplibre-react-native"
import { markerLayer, venueSpots } from "domain/event-clusters"
import type { MapPointKind, MapSpot } from "domain/event-clusters"
import { mapStyle } from "domain/map-style"
import { occurrenceStatus } from "domain/occurrence-status"
import { pinStartOf } from "domain/pin-tag"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import type {
    CategoryIcon,
    GeoPoint,
    OccurrenceRef,
    OccurrenceSummary,
    PermanentVenueSummary,
} from "models"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"

import { hardShadow } from "@/lib/theme/hard-shadow"

import { EventPin } from "./event-pin"
import { MapAttribution } from "./map-attribution"
import { VenuePin } from "./venue-pin"

const INITIAL_ZOOM = 13

interface EventMapProps {
    center: GeoPoint
    position: GeoPoint | undefined
    occurrences: readonly OccurrenceSummary[]
    permanentVenues: readonly PermanentVenueSummary[]
    iconOf: (categoryId: string) => CategoryIcon
    now: Date
    onSelect: (ref: OccurrenceRef) => void
    onSelectVenue: (venueId: string) => void
}

export const EventMap = (props: EventMapProps) => {
    const { t } = useTranslation("shared")
    const cameraRef = useRef<CameraRef>(null)
    const { latitude, longitude } = props.center

    useEffect(() => {
        cameraRef.current?.flyTo({ center: [longitude, latitude] })
    }, [latitude, longitude])

    // The result index of a permanent venue follows every occurrence.
    const spots = venueSpots([
        ...props.occurrences.map(occurrence => ({
            venueId: occurrence.venue.id,
            coordinates: occurrence.venue.coordinates,
            kind: occurrenceStatus(
                {
                    startsAt: new Date(occurrence.startsAt),
                    endsAt: new Date(occurrence.endsAt),
                },
                props.now,
            ),
        })),
        ...props.permanentVenues.map(
            (venue): { venueId: string; coordinates: GeoPoint; kind: MapPointKind } => ({
                venueId: venue.id,
                coordinates: venue.coordinates,
                kind: "permanent",
            }),
        ),
    ]).toSorted((first, second) => markerLayer(first.kind) - markerLayer(second.kind))

    const pinOf = (spot: MapSpot) => {
        const lngLat: [number, number] = [
            spot.coordinates.longitude,
            spot.coordinates.latitude,
        ]
        const layerStyle = { zIndex: markerLayer(spot.kind) }

        if (spot.kind === "permanent") {
            const venue = props.permanentVenues.at(spot.index - props.occurrences.length)
            return venue === undefined ? undefined : (
                <Marker
                    key={`venue-${venue.id}`}
                    lngLat={lngLat}
                    anchor="bottom"
                    style={layerStyle}
                >
                    <VenuePin
                        name={venue.name}
                        kind={venue.kind}
                        icon={props.iconOf(venue.categoryId)}
                        onSelect={() => {
                            props.onSelectVenue(venue.id)
                        }}
                    />
                </Marker>
            )
        }

        const occurrence = props.occurrences.at(spot.index)
        return occurrence === undefined ? undefined : (
            <Marker
                key={`${occurrence.eventId}:${occurrence.date}`}
                lngLat={lngLat}
                anchor="bottom"
                style={layerStyle}
            >
                <EventPin
                    title={occurrence.title}
                    status={spot.kind}
                    start={pinStartOf(
                        new Date(occurrence.startsAt),
                        props.now,
                        PLATFORM_TIME_ZONE,
                    )}
                    icon={props.iconOf(occurrence.primaryCategoryId)}
                    moreCount={spot.moreCount}
                    onSelect={() => {
                        props.onSelect({
                            eventId: occurrence.eventId,
                            date: occurrence.date,
                        })
                    }}
                />
            </Marker>
        )
    }

    return (
        <View accessibilityLabel={t("Map.Label")} className="flex-1 bg-map-ground">
            {/* `dot-dither` ground pattern draws on web only: MapLibre RN 11.5 on iOS never
                passes an `Images` entry, bundled or embedded, to the style */}
            <Map
                mapStyle={mapStyle}
                attribution={false}
                logo={false}
                compass={false}
                touchRotate={false}
                touchPitch={false}
            >
                <Camera
                    ref={cameraRef}
                    initialViewState={{
                        center: [longitude, latitude],
                        zoom: INITIAL_ZOOM,
                    }}
                />
                {spots.map(pinOf)}
                {props.position !== undefined && (
                    <Marker
                        lngLat={[props.position.longitude, props.position.latitude]}
                        anchor="center"
                        style={{ zIndex: markerLayer("live") + 1 }}
                    >
                        <View
                            accessible={true}
                            accessibilityRole="image"
                            accessibilityLabel={t("Map.Position")}
                            className="h-4 w-4 rounded-full border-2 border-line bg-position"
                            style={hardShadow("sm")}
                        />
                    </Marker>
                )}
            </Map>
            <MapAttribution />
        </View>
    )
}

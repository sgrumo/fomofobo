import { Camera, Images, Map, Marker } from "@maplibre/maplibre-react-native"
import type { CameraRef, MapRef, ViewState } from "@maplibre/maplibre-react-native"
import {
    buildEventClusters,
    CLUSTER_MAX_ZOOM,
    clusterLayer,
    firstLeafIndex,
    markerLayer,
    venueSpots,
} from "domain/event-clusters"
import type { EventMapFeature, MapPointKind } from "domain/event-clusters"
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
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"

import { hardShadow } from "@/lib/theme/hard-shadow"

import dotDitherPattern from "../../../assets/map/dot-dither.png"
import { EventCluster } from "./event-cluster"
import { EventPin } from "./event-pin"
import { MapAttribution } from "./map-attribution"
import { VenuePin } from "./venue-pin"

const INITIAL_ZOOM = 13
const MAP_IMAGES = { "dot-dither": dotDitherPattern }

interface Viewport {
    bbox: [number, number, number, number]
    zoom: number
}

/**
 * @description Returns the bounds and the whole zoom level of a view of the map
 * @param view View the map reported
 */
const viewportOf = (view: Pick<ViewState, "bounds" | "zoom">): Viewport => ({
    bbox: view.bounds,
    zoom: Math.floor(view.zoom),
})

/**
 * @description Returns the layer of a cluster or of a single spot, higher on top
 * @param feature Cluster or single spot
 */
const featureLayer = (feature: EventMapFeature): number =>
    "cluster" in feature.properties
        ? clusterLayer(feature.properties)
        : markerLayer(feature.properties.kind)

interface EventMapProps {
    center: GeoPoint
    position: GeoPoint | undefined
    occurrences: readonly OccurrenceSummary[]
    permanentVenues: readonly PermanentVenueSummary[]
    iconOf: (categoryId: string) => CategoryIcon
    now: Date
    onSelect: (ref: OccurrenceRef) => void
    onSelectVenue: (venueId: string) => void
    onPress: () => void
}

export const EventMap = (props: EventMapProps) => {
    const { t } = useTranslation("shared")
    const mapRef = useRef<MapRef>(null)
    const cameraRef = useRef<CameraRef>(null)
    const [viewport, setViewport] = useState<Viewport>()
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
    ])
    const clusters = buildEventClusters(spots)
    const features =
        viewport === undefined
            ? []
            : clusters
                  .getClusters(viewport.bbox, viewport.zoom)
                  .toSorted((first, second) => featureLayer(first) - featureLayer(second))

    const readViewport = async () => {
        const view = await mapRef.current?.getViewState()
        if (view !== undefined) {
            setViewport(viewportOf(view))
        }
    }

    const selectIndex = (index: number) => {
        const occurrence = props.occurrences.at(index)
        if (occurrence !== undefined) {
            props.onSelect({ eventId: occurrence.eventId, date: occurrence.date })
            return
        }
        const venue = props.permanentVenues.at(index - props.occurrences.length)
        if (venue !== undefined) {
            props.onSelectVenue(venue.id)
        }
    }

    const markerOf = (feature: EventMapFeature) => {
        const [featureLongitude = 0, featureLatitude = 0] = feature.geometry.coordinates
        const lngLat: [number, number] = [featureLongitude, featureLatitude]
        const layerStyle = { zIndex: featureLayer(feature) }

        if ("cluster" in feature.properties) {
            const clusterId = feature.properties.cluster_id
            return (
                <Marker
                    key={`cluster-${String(clusterId)}`}
                    lngLat={lngLat}
                    anchor="center"
                    style={layerStyle}
                >
                    <EventCluster
                        count={feature.properties.point_count}
                        liveCount={feature.properties.liveCount}
                        upcomingCount={feature.properties.upcomingCount}
                        endedCount={feature.properties.endedCount}
                        permanentCount={feature.properties.permanentCount}
                        onExpand={() => {
                            const zoom = clusters.getClusterExpansionZoom(clusterId)
                            // Past the last cluster zoom the points share one spot, so no zoom splits them.
                            const first =
                                zoom > CLUSTER_MAX_ZOOM
                                    ? firstLeafIndex(
                                          clusters.getLeaves(clusterId, Infinity),
                                      )
                                    : undefined
                            if (first !== undefined) {
                                selectIndex(first)
                                return
                            }
                            cameraRef.current?.easeTo({ center: lngLat, zoom })
                        }}
                    />
                </Marker>
            )
        }

        const spot = feature.properties

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
            <Map
                ref={mapRef}
                mapStyle={mapStyle}
                attribution={false}
                logo={false}
                compass={false}
                touchRotate={false}
                touchPitch={false}
                onPress={props.onPress}
                onDidFinishLoadingMap={() => {
                    void readViewport()
                }}
                onRegionDidChange={event => {
                    setViewport(viewportOf(event.nativeEvent))
                }}
            >
                <Images images={MAP_IMAGES} />
                <Camera
                    ref={cameraRef}
                    initialViewState={{
                        center: [longitude, latitude],
                        zoom: INITIAL_ZOOM,
                    }}
                />
                {features.map(markerOf)}
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

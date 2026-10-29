import { Camera, Images, Map, Marker } from "@maplibre/maplibre-react-native"
import type { CameraRef, MapRef, ViewState } from "@maplibre/maplibre-react-native"
import {
    buildEventClusters,
    CLUSTER_MAX_ZOOM,
    clusterLayer,
    firstLeafIndex,
    markerEmphasis,
    markerLayer,
    POSITION_MARKER_LAYER,
    SELECTED_MARKER_LAYER,
    venueSpots,
} from "domain/event-clusters"
import type { EventMapFeature, MapPointKind, MarkerEmphasis } from "domain/event-clusters"
import { mapFlightOf } from "domain/map-center"
import type { LocateRequest } from "domain/map-center"
import { mapStyle } from "domain/map-style"
import {
    enterMoveOf,
    leaveMoveOf,
    MARKER_MOTION_MS,
    NO_MARKER_TRANSITIONS,
    resultIdOf,
    sceneTransitionsOf,
    shownMarkersOf,
} from "domain/marker-motion"
import type { MarkerMove, MarkerTransitions, ShownMarker } from "domain/marker-motion"
import { occurrenceStatus } from "domain/occurrence-status"
import { pinStartOf } from "domain/pin-tag"
import { MAP_BOUNDS, MAP_MIN_ZOOM, PLATFORM_TIME_ZONE } from "domain/platform"
import type {
    CategoryIcon,
    GeoPoint,
    OccurrenceRef,
    OccurrenceSummary,
    PermanentVenueSummary,
} from "models"
import { useEffect, useEffectEvent, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"

import dotDitherPattern from "../../../assets/map/dot-dither.png"
import { EventCluster } from "./event-cluster"
import { EventPin } from "./event-pin"
import { MapAttribution } from "./map-attribution"
import { MarkerMotion } from "./marker-motion"
import { PositionMarker } from "./position-marker"
import { VenuePin } from "./venue-pin"

const INITIAL_ZOOM = 13
const MAP_IMAGES = { "dot-dither": dotDitherPattern }

interface Viewport {
    bbox: [number, number, number, number]
    zoom: number
    exactZoom: number
}

interface ResultSource {
    occurrences: readonly OccurrenceSummary[]
    permanentVenues: readonly PermanentVenueSummary[]
}

interface MarkerScene extends ResultSource {
    viewport: Viewport
    markers: ShownMarker[]
    transitions: MarkerTransitions
    // Results the leaving markers read, the replaced ones while new results fade in
    leavingFrom: ResultSource
    // Counts the scenes, so a timer drops the leaving markers of its own scene alone
    generation: number
}

/**
 * @description Returns the bounds and the whole zoom level of a view of the map
 * @param view View the map reported
 */
const viewportOf = (view: Pick<ViewState, "bounds" | "zoom">): Viewport => ({
    bbox: view.bounds,
    zoom: Math.floor(view.zoom),
    exactZoom: view.zoom,
})

/**
 * @description Returns the layer of a cluster or of a single spot, higher on top
 * @param feature Cluster or single spot
 * @param emphasis Emphasis of the marker
 */
const featureLayer = (feature: EventMapFeature, emphasis: MarkerEmphasis): number =>
    "cluster" in feature.properties
        ? clusterLayer(feature.properties)
        : emphasis === "selected"
          ? SELECTED_MARKER_LAYER
          : markerLayer(feature.properties.kind)

interface EventMapProps {
    center: GeoPoint
    locateRequest: LocateRequest | undefined
    position: GeoPoint | undefined
    occurrences: readonly OccurrenceSummary[]
    permanentVenues: readonly PermanentVenueSummary[]
    iconOf: (categoryId: string) => CategoryIcon
    selectedVenueId: string | undefined
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

    const readLocateRequest = useEffectEvent(() => props.locateRequest)
    // Each locate flies, an unchanged center too
    const locateCount = props.locateRequest?.count
    useEffect(() => {
        const flight = mapFlightOf(
            { latitude, longitude },
            locateCount === undefined ? undefined : readLocateRequest(),
        )
        const center: [number, number] = [flight.center.longitude, flight.center.latitude]
        cameraRef.current?.flyTo(
            flight.zoom === undefined ? { center } : { center, zoom: flight.zoom },
        )
    }, [latitude, longitude, locateCount])

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
    const selectedVenueId = props.selectedVenueId
    const selectedIndex =
        selectedVenueId === undefined
            ? undefined
            : spots.find(spot => spot.venueIds.includes(selectedVenueId))?.index
    const markers =
        viewport === undefined
            ? []
            : shownMarkersOf(
                  clusters.getClusters(viewport.bbox, viewport.zoom),
                  clusters,
                  index => resultIdOf(props, index),
              )

    const [scene, setScene] = useState<MarkerScene>()
    const sameResults =
        scene?.occurrences === props.occurrences &&
        scene.permanentVenues === props.permanentVenues
    if (viewport !== undefined && (scene?.viewport !== viewport || !sameResults)) {
        setScene({
            viewport,
            occurrences: props.occurrences,
            permanentVenues: props.permanentVenues,
            markers,
            transitions: sceneTransitionsOf(scene, sameResults, viewport.zoom, markers),
            leavingFrom:
                scene === undefined || sameResults
                    ? props
                    : {
                          occurrences: scene.occurrences,
                          permanentVenues: scene.permanentVenues,
                      },
            generation: (scene?.generation ?? 0) + 1,
        })
    }
    const generation = scene?.generation
    const transitions = scene?.transitions ?? NO_MARKER_TRANSITIONS
    const leaving = transitions.leaving
    const hasLeaving = leaving.length > 0
    useEffect(() => {
        if (!hasLeaving) {
            return undefined
        }
        const timer = setTimeout(() => {
            setScene(current =>
                current === undefined || current.generation !== generation
                    ? current
                    : {
                          ...current,
                          transitions: { ...current.transitions, leaving: [] },
                      },
            )
        }, MARKER_MOTION_MS)
        return () => {
            clearTimeout(timer)
        }
    }, [generation, hasLeaving])

    const exactZoom = viewport?.exactZoom ?? 0
    const entryOf = (
        marker: ShownMarker,
        move: MarkerMove | undefined,
        source: ResultSource,
    ) => {
        // A leaving marker can come from replaced results that the cluster index no longer holds
        const emphasis: MarkerEmphasis =
            move?.type === "leave"
                ? "normal"
                : markerEmphasis(marker.feature, clusters, selectedIndex)
        return {
            marker,
            move,
            emphasis,
            layer: featureLayer(marker.feature, emphasis),
            source,
        }
    }
    const shown = [
        ...markers.map(marker =>
            entryOf(marker, enterMoveOf(marker, transitions, exactZoom), props),
        ),
        ...leaving.map(left =>
            entryOf(
                left.marker,
                leaveMoveOf(left, exactZoom),
                scene?.leavingFrom ?? props,
            ),
        ),
    ].toSorted((first, second) => first.layer - second.layer)

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

    const markerOf = (entry: {
        marker: ShownMarker
        move: MarkerMove | undefined
        emphasis: MarkerEmphasis
        layer: number
        source: ResultSource
    }) => {
        const { marker, move, emphasis, layer, source } = entry
        const { feature, coordinates } = marker
        const lngLat: [number, number] = [coordinates.longitude, coordinates.latitude]
        const layerStyle = { zIndex: layer }
        // A press on a pin centers the map on it
        const centerOnMarker = () => {
            cameraRef.current?.easeTo({ center: lngLat })
        }
        const key = `${move?.type === "leave" ? "leaving" : "shown"}:${marker.key}`

        if ("cluster" in feature.properties) {
            const clusterId = feature.properties.cluster_id
            return (
                <Marker key={key} lngLat={lngLat} anchor="center" style={layerStyle}>
                    <MarkerMotion move={move}>
                        <EventCluster
                            count={feature.properties.point_count}
                            liveCount={feature.properties.liveCount}
                            upcomingCount={feature.properties.upcomingCount}
                            endedCount={feature.properties.endedCount}
                            permanentCount={feature.properties.permanentCount}
                            emphasis={emphasis}
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
                                    centerOnMarker()
                                    selectIndex(first)
                                    return
                                }
                                cameraRef.current?.easeTo({ center: lngLat, zoom })
                            }}
                        />
                    </MarkerMotion>
                </Marker>
            )
        }

        const spot = feature.properties

        if (spot.kind === "permanent") {
            const venue = source.permanentVenues.at(
                spot.index - source.occurrences.length,
            )
            return venue === undefined ? undefined : (
                <Marker key={key} lngLat={lngLat} anchor="bottom" style={layerStyle}>
                    <MarkerMotion move={move}>
                        <VenuePin
                            name={venue.name}
                            kind={venue.kind}
                            icon={props.iconOf(venue.categoryId)}
                            emphasis={emphasis}
                            onSelect={() => {
                                centerOnMarker()
                                props.onSelectVenue(venue.id)
                            }}
                        />
                    </MarkerMotion>
                </Marker>
            )
        }

        const occurrence = source.occurrences.at(spot.index)
        return occurrence === undefined ? undefined : (
            <Marker key={key} lngLat={lngLat} anchor="bottom" style={layerStyle}>
                <MarkerMotion move={move}>
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
                        emphasis={emphasis}
                        onSelect={() => {
                            centerOnMarker()
                            props.onSelect({
                                eventId: occurrence.eventId,
                                date: occurrence.date,
                            })
                        }}
                    />
                </MarkerMotion>
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
                    minZoom={MAP_MIN_ZOOM}
                    maxBounds={MAP_BOUNDS}
                    initialViewState={{
                        center: [longitude, latitude],
                        zoom: INITIAL_ZOOM,
                    }}
                />
                {shown.map(markerOf)}
                {props.position !== undefined && (
                    <Marker
                        lngLat={[props.position.longitude, props.position.latitude]}
                        anchor="center"
                        style={{ zIndex: POSITION_MARKER_LAYER }}
                    >
                        <PositionMarker />
                    </Marker>
                )}
            </Map>
            <MapAttribution />
        </View>
    )
}

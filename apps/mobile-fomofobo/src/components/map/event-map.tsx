import { Camera, Images, Map, Marker } from "@maplibre/maplibre-react-native"
import type { CameraRef, MapRef, ViewState } from "@maplibre/maplibre-react-native"
import {
    buildEventClusters,
    CLUSTER_MAX_ZOOM,
    clusterLayer,
    firstLeafIndex,
    frozenClusterZoomOf,
    markerEmphasis,
    markerLayer,
    POSITION_MARKER_LAYER,
    SELECTED_MARKER_LAYER,
    shownFeaturesOf,
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
    leavingEmphasisOf,
    NO_MARKER_TRANSITIONS,
    resultIdOf,
    sceneTransitionsOf,
    shownMarkersOf,
} from "domain/marker-motion"
import type { MarkerMove, MarkerTransitions, ShownMarker } from "domain/marker-motion"
import { occurrenceStatus } from "domain/occurrence-status"
import { pinStartOf } from "domain/pin-tag"
import { PIN_DISC_RADIUS_PX } from "domain/pixel-markers"
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
import { Platform, View } from "react-native"

import { endMark, startMark } from "@/lib/perf/perf-store"
import { playSound } from "@/lib/sounds/play-sound"

import dotDitherPattern from "../../../assets/map/dot-dither.png"
import { EventCluster } from "./event-cluster"
import { EventPin } from "./event-pin"
import { MarkerMotion } from "./marker-motion"
import { PositionMarker } from "./position-marker"
import { VenuePin } from "./venue-pin"

// Puts the center of the disc of a pin on its point, as the kit anchors it
const PIN_OFFSET: [number, number] = [0, PIN_DISC_RADIUS_PX]

const INITIAL_ZOOM = 13
const MAP_IMAGES = { "dot-dither": dotDitherPattern }

// The map reports a press on a marker as a press of its own, right after the marker
const MARKER_PRESS_ECHO_MS = 250

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
    clusterZoom: number
    markers: ShownMarker[]
    transitions: MarkerTransitions
    // Results the leaving markers read, the replaced ones while new results fade in
    leavingFrom: ResultSource
    // Result index of the selected spot when the scene began
    selectedIndex: number | undefined
    // True when the leaving markers fade out from the dimmed look of a selection
    leavingDimmed: boolean
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
    // West, south, east and north edges of the map once it loads and after each move
    onViewportChange: (bbox: [number, number, number, number]) => void
    onSelect: (ref: OccurrenceRef) => void
    onSelectVenue: (venueId: string) => void
    // A press on the map itself, outside every marker
    onPress: () => void
    // A pan or a zoom of the map by the visitor
    onUserMoveStart: () => void
    // A press on a cluster that the map zooms into
    onClusterZoom: () => void
}

export const EventMap = (props: EventMapProps) => {
    const { t } = useTranslation("shared")
    const mapRef = useRef<MapRef>(null)
    const cameraRef = useRef<CameraRef>(null)
    const [viewport, setViewport] = useState<Viewport>()
    const markerPressedAtRef = useRef(0)
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
    // A preview or a detail freezes the clusters, so a move to another pin never regroups them
    const [frozenZoom, setFrozenZoom] = useState<number>()
    const nextFrozenZoom = frozenClusterZoomOf(
        frozenZoom,
        viewport?.zoom,
        selectedIndex !== undefined,
    )
    if (nextFrozenZoom !== frozenZoom) {
        setFrozenZoom(nextFrozenZoom)
    }
    const clusterZoom = nextFrozenZoom ?? viewport?.zoom
    const markers =
        viewport === undefined || clusterZoom === undefined
            ? []
            : shownMarkersOf(
                  shownFeaturesOf(clusters, viewport.bbox, clusterZoom, selectedIndex),
                  clusters,
                  index => resultIdOf(props, index),
              )

    const [scene, setScene] = useState<MarkerScene>()
    const sameResults =
        scene?.occurrences === props.occurrences &&
        scene.permanentVenues === props.permanentVenues
    if (
        viewport !== undefined &&
        clusterZoom !== undefined &&
        (scene?.viewport !== viewport ||
            !sameResults ||
            scene.selectedIndex !== selectedIndex)
    ) {
        setScene({
            viewport,
            clusterZoom,
            occurrences: props.occurrences,
            permanentVenues: props.permanentVenues,
            markers,
            transitions: sceneTransitionsOf(
                scene,
                sameResults,
                { clusterZoom, selectedIndex },
                markers,
            ),
            leavingFrom:
                scene === undefined || sameResults
                    ? props
                    : {
                          occurrences: scene.occurrences,
                          permanentVenues: scene.permanentVenues,
                      },
            selectedIndex,
            leavingDimmed: scene?.selectedIndex !== undefined,
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

    // Marks end on the frame after the commit of a new scene, when the markers reach the screen
    useEffect(() => {
        if (generation === undefined) {
            return undefined
        }
        const frame = requestAnimationFrame(() => {
            endMark("chip-markers")
            endMark("pan-markers")
        })
        return () => {
            cancelAnimationFrame(frame)
        }
    }, [generation])

    const exactZoom = viewport?.exactZoom ?? 0
    const entryOf = (
        marker: ShownMarker,
        move: MarkerMove | undefined,
        source: ResultSource,
    ) => {
        // A leaving marker can come from replaced results that the cluster index no longer holds
        const emphasis: MarkerEmphasis =
            move?.type === "leave"
                ? leavingEmphasisOf(scene?.leavingDimmed === true)
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

    const showViewport = (next: Viewport) => {
        setViewport(next)
        props.onViewportChange(next.bbox)
    }
    const readViewport = async () => {
        const view = await mapRef.current?.getViewState()
        if (view !== undefined) {
            showViewport(viewportOf(view))
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
        // A press on a pin centers the map on it, and its time drops the map press that echoes it
        const centerOnMarker = () => {
            markerPressedAtRef.current = Date.now()
            cameraRef.current?.easeTo({ center: lngLat })
        }
        // A leaving marker keeps its key, so it stays on its native annotation: a new annotation
        // reaches the screen a few frames late, and the move would play before it shows
        const key = marker.key
        // Android hands a press on a marker to the marker alone, never to the pressable inside it
        const pressesNatively = Platform.OS === "android" && move?.type !== "leave"

        if ("cluster" in feature.properties) {
            const clusterId = feature.properties.cluster_id
            const expand = () => {
                markerPressedAtRef.current = Date.now()
                const zoom = clusters.getClusterExpansionZoom(clusterId)
                // Past the last cluster zoom the points share one spot, so no zoom splits them.
                const first =
                    zoom > CLUSTER_MAX_ZOOM
                        ? firstLeafIndex(clusters.getLeaves(clusterId, Infinity))
                        : undefined
                if (first !== undefined) {
                    playSound("event")
                    centerOnMarker()
                    selectIndex(first)
                    return
                }
                props.onClusterZoom()
                cameraRef.current?.easeTo({ center: lngLat, zoom })
            }
            return (
                <Marker
                    key={key}
                    lngLat={lngLat}
                    anchor="center"
                    style={layerStyle}
                    onPress={pressesNatively ? expand : undefined}
                >
                    <MarkerMotion move={move}>
                        <EventCluster
                            count={feature.properties.point_count}
                            liveCount={feature.properties.liveCount}
                            upcomingCount={feature.properties.upcomingCount}
                            endedCount={feature.properties.endedCount}
                            permanentCount={feature.properties.permanentCount}
                            emphasis={emphasis}
                            onExpand={expand}
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
            if (venue === undefined) {
                return undefined
            }
            const selectVenue = () => {
                centerOnMarker()
                props.onSelectVenue(venue.id)
            }
            return (
                <Marker
                    key={key}
                    lngLat={lngLat}
                    anchor="bottom"
                    offset={PIN_OFFSET}
                    style={layerStyle}
                    onPress={pressesNatively ? selectVenue : undefined}
                >
                    <MarkerMotion move={move}>
                        <VenuePin
                            name={venue.name}
                            kind={venue.kind}
                            icon={props.iconOf(venue.categoryId)}
                            emphasis={emphasis}
                            onSelect={selectVenue}
                        />
                    </MarkerMotion>
                </Marker>
            )
        }

        const occurrence = source.occurrences.at(spot.index)
        if (occurrence === undefined) {
            return undefined
        }
        const selectOccurrence = () => {
            playSound("event")
            centerOnMarker()
            props.onSelect({ eventId: occurrence.eventId, date: occurrence.date })
        }
        return (
            <Marker
                key={key}
                lngLat={lngLat}
                anchor="bottom"
                offset={PIN_OFFSET}
                style={layerStyle}
                onPress={pressesNatively ? selectOccurrence : undefined}
            >
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
                        onSelect={selectOccurrence}
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
                onPress={() => {
                    if (Date.now() - markerPressedAtRef.current > MARKER_PRESS_ECHO_MS) {
                        props.onPress()
                    }
                }}
                onDidFinishLoadingMap={() => {
                    void readViewport()
                }}
                onRegionWillChange={event => {
                    if (event.nativeEvent.userInteraction) {
                        props.onUserMoveStart()
                    }
                }}
                onRegionDidChange={event => {
                    if (event.nativeEvent.userInteraction) {
                        startMark("pan-markers")
                    }
                    showViewport(viewportOf(event.nativeEvent))
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
        </View>
    )
}

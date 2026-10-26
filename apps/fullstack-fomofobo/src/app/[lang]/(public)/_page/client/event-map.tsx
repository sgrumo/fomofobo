"use client"

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
import type { MapPointKind } from "domain/event-clusters"
import { mapFlightOf } from "domain/map-center"
import type { LocateRequest } from "domain/map-center"
import { mapStyle } from "domain/map-style"
import {
    enterMoveOf,
    leaveMoveOf,
    MARKER_MOTION_MS,
    markerTransitions,
    NO_MARKER_TRANSITIONS,
    shownMarkersOf,
} from "domain/marker-motion"
import type { MarkerMove, MarkerTransitions, ShownMarker } from "domain/marker-motion"
import { occurrenceStatus } from "domain/occurrence-status"
import { pinStartOf } from "domain/pin-tag"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl"
import type {
    CategoryIcon,
    GeoPoint,
    OccurrenceRef,
    OccurrenceSummary,
    PermanentVenueSummary,
} from "models"
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

import { EventCluster } from "./event-cluster"
import { EventPin } from "./event-pin"
import { MapMarker } from "./map-marker"
import { MarkerMotion } from "./marker-motion"
import { PositionMarker } from "./position-marker"
import { VenuePin } from "./venue-pin"

setWorkerUrl(
    new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString(),
)

const INITIAL_ZOOM = 13
const DOT_DITHER_IMAGE = "dot-dither"

interface Viewport {
    bbox: [number, number, number, number]
    zoom: number
    exactZoom: number
}

interface MarkerScene {
    viewport: Viewport
    occurrences: OccurrenceSummary[]
    permanentVenues: PermanentVenueSummary[]
    markers: ShownMarker[]
    transitions: MarkerTransitions
    // Counts the scenes, so a timer drops the leaving markers of its own scene alone
    generation: number
}

/**
 * @description Returns the bounds and the whole zoom level the map shows
 * @param map Map read
 */
const viewportOf = (map: MapLibreMap): Viewport => {
    const bounds = map.getBounds()
    return {
        bbox: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
        zoom: Math.floor(map.getZoom()),
        exactZoom: map.getZoom(),
    }
}

/**
 * @description True when the browser creates a WebGL2 context, which MapLibre needs
 */
const supportsWebGl2 = (): boolean =>
    document.createElement("canvas").getContext("webgl2") !== null

/**
 * @description Loads the dot pattern image that the ground layer of the style paints with
 * @param map Map the image is added to
 */
const addDotDither = async (map: MapLibreMap): Promise<void> => {
    const image = await map.loadImage(
        mapStyle.metadata["fomofobo:patterns"][DOT_DITHER_IMAGE],
    )
    map.addImage(DOT_DITHER_IMAGE, image.data)
}

interface EventMapProps extends RouteClientComponentProps<"root"> {
    center: GeoPoint
    locateRequest: LocateRequest | undefined
    position: GeoPoint | undefined
    occurrences: OccurrenceSummary[]
    permanentVenues: PermanentVenueSummary[]
    iconOf: (categoryId: string) => CategoryIcon
    selectedVenueId: string | undefined
    now: Date
    onSelect: (ref: OccurrenceRef) => void
    onSelectVenue: (venueId: string) => void
}

export const EventMap = (props: EventMapProps) => {
    const { t } = useTranslation("shared")
    const containerRef = useRef<HTMLDivElement>(null)
    const supported = useMemo(() => supportsWebGl2(), [])
    const [map, setMap] = useState<MapLibreMap>()
    const [viewport, setViewport] = useState<Viewport>()
    const readCenter = useEffectEvent(() => props.center)

    useEffect(() => {
        const container = containerRef.current
        if (!supported || container === null) {
            return undefined
        }

        const { latitude, longitude } = readCenter()
        const instance = new MapLibreMap({
            container,
            style: mapStyle,
            center: [longitude, latitude],
            zoom: INITIAL_ZOOM,
            // The expanded control wraps over the bottom controls on a phone, so the map
            // draws its own one-line credit below.
            attributionControl: false,
        })
        const publishViewport = () => {
            setViewport(viewportOf(instance))
        }
        instance.on("load", () => {
            setMap(instance)
            publishViewport()
        })
        instance.on("moveend", publishViewport)
        void addDotDither(instance)

        return () => {
            instance.remove()
        }
    }, [supported])

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
        map?.flyTo(flight.zoom === undefined ? { center } : { center, zoom: flight.zoom })
    }, [map, latitude, longitude, locateCount])

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
    const selectedIndex = spots.find(
        spot => spot.venueId === props.selectedVenueId,
    )?.index
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
    const markers =
        viewport === undefined
            ? []
            : shownMarkersOf(clusters.getClusters(viewport.bbox, viewport.zoom), clusters)

    const [scene, setScene] = useState<MarkerScene>()
    const sameResults =
        scene?.occurrences === props.occurrences &&
        scene.permanentVenues === props.permanentVenues
    if (viewport !== undefined && (scene?.viewport !== viewport || !sameResults)) {
        // Markers move only between two zoom levels of the same results
        const zoomed = sameResults && scene.viewport.zoom !== viewport.zoom
        setScene({
            viewport,
            occurrences: props.occurrences,
            permanentVenues: props.permanentVenues,
            markers,
            transitions: zoomed
                ? markerTransitions(scene.markers, markers)
                : NO_MARKER_TRANSITIONS,
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

    const markerOf = (
        shownOn: MapLibreMap,
        marker: ShownMarker,
        move: MarkerMove | undefined,
    ) => {
        const { feature, coordinates } = marker
        const key = `${move?.type === "leave" ? "leaving" : "shown"}:${marker.key}`
        const emphasis = markerEmphasis(feature, clusters, selectedIndex)
        if ("cluster" in feature.properties) {
            const clusterId = feature.properties.cluster_id
            return (
                <MapMarker
                    route={props.route}
                    key={key}
                    map={shownOn}
                    coordinates={coordinates}
                    anchor="center"
                    layer={clusterLayer(feature.properties)}
                >
                    <MarkerMotion route={props.route} move={move}>
                        <EventCluster
                            route={props.route}
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
                                    selectIndex(first)
                                    return
                                }
                                shownOn.easeTo({
                                    center: [coordinates.longitude, coordinates.latitude],
                                    zoom,
                                })
                            }}
                        />
                    </MarkerMotion>
                </MapMarker>
            )
        }

        const { index, kind, moreCount } = feature.properties
        const layer = emphasis === "selected" ? SELECTED_MARKER_LAYER : markerLayer(kind)
        if (kind === "permanent") {
            const venue = props.permanentVenues.at(index - props.occurrences.length)
            return venue === undefined ? undefined : (
                <MapMarker
                    route={props.route}
                    key={key}
                    map={shownOn}
                    coordinates={coordinates}
                    anchor="bottom"
                    layer={layer}
                >
                    <MarkerMotion route={props.route} move={move}>
                        <VenuePin
                            route={props.route}
                            name={venue.name}
                            kind={venue.kind}
                            icon={props.iconOf(venue.categoryId)}
                            emphasis={emphasis}
                            onSelect={() => {
                                props.onSelectVenue(venue.id)
                            }}
                        />
                    </MarkerMotion>
                </MapMarker>
            )
        }

        const occurrence = props.occurrences.at(index)
        return occurrence === undefined ? undefined : (
            <MapMarker
                route={props.route}
                key={key}
                map={shownOn}
                coordinates={coordinates}
                anchor="bottom"
                layer={layer}
            >
                <MarkerMotion route={props.route} move={move}>
                    <EventPin
                        route={props.route}
                        title={occurrence.title}
                        status={kind}
                        start={pinStartOf(
                            new Date(occurrence.startsAt),
                            props.now,
                            PLATFORM_TIME_ZONE,
                        )}
                        icon={props.iconOf(occurrence.primaryCategoryId)}
                        moreCount={moreCount}
                        emphasis={emphasis}
                        onSelect={() => {
                            props.onSelect({
                                eventId: occurrence.eventId,
                                date: occurrence.date,
                            })
                        }}
                    />
                </MarkerMotion>
            </MapMarker>
        )
    }

    if (!supported) {
        return <Alert type="error" text={t("Map.Unsupported")} className="m-4" />
    }

    return (
        <>
            {/* MapLibre sets `position: relative` on its container, so a wrapper places it. */}
            <div className="absolute inset-0">
                <div ref={containerRef} className="size-full" />
            </div>
            <p className="tp-body-sm text-fg-inverse absolute right-4 bottom-1.5 left-4 truncate text-right [&>a]:underline">
                <a href="https://openfreemap.org" target="_blank" rel="noreferrer">
                    OpenFreeMap
                </a>{" "}
                <a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">
                    © OpenMapTiles
                </a>{" "}
                <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noreferrer"
                >
                    © OpenStreetMap
                </a>
            </p>
            {map === undefined || viewport === undefined
                ? undefined
                : [
                      ...markers.map(marker =>
                          markerOf(
                              map,
                              marker,
                              enterMoveOf(marker, transitions, viewport.exactZoom),
                          ),
                      ),
                      ...leaving.map(left =>
                          markerOf(
                              map,
                              left.marker,
                              leaveMoveOf(left, viewport.exactZoom),
                          ),
                      ),
                  ]}
            {map === undefined || props.position === undefined ? undefined : (
                <MapMarker
                    route={props.route}
                    map={map}
                    coordinates={props.position}
                    anchor="center"
                    layer={POSITION_MARKER_LAYER}
                >
                    <PositionMarker route={props.route} />
                </MapMarker>
            )}
        </>
    )
}

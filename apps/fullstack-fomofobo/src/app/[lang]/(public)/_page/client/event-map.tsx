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
import { LOCATE_ZOOM, mapFlightOf } from "domain/map-center"
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
import { PLATFORM_TIME_ZONE } from "domain/platform"
import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl"
import type {
    CategoryIcon,
    GeoPoint,
    OccurrenceRef,
    OccurrenceSummary,
    PermanentVenueSummary,
} from "models"
import type { ReactNode, RefObject } from "react"
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"

import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { FIXED_MAP_OPTIONS, fixMapGestures } from "@/lib/map/fixed-map"

import { EventCluster } from "./event-cluster"
import { EventPin } from "./event-pin"
import { MapMarker } from "./map-marker"
import { MarkerMotion } from "./marker-motion"
import { PositionMarker } from "./position-marker"
import { VenuePin } from "./venue-pin"

setWorkerUrl(
    new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString(),
)

// A wide screen opens at the zoom of a locate, a phone one level out to show more of the area
const PHONE_INITIAL_ZOOM = LOCATE_ZOOM - 1
const DOT_DITHER_IMAGE = "dot-dither"

interface Viewport {
    bbox: [number, number, number, number]
    zoom: number
    exactZoom: number
}

interface ResultSource {
    occurrences: OccurrenceSummary[]
    permanentVenues: PermanentVenueSummary[]
}

interface MarkerScene extends ResultSource {
    viewport: Viewport
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

// Space kept between the selected pin, or the card, and the edges of the free part of the map
const PIN_FRAME_MARGIN = 16

const PREVIEW_CARD_LAYER = SELECTED_MARKER_LAYER + 1

// Lifts the card above the pin and its tag
const PREVIEW_CARD_OFFSET: [number, number] = [0, -88]

interface PreviewCard {
    coordinates: GeoPoint
    content: ReactNode
}

// Box of a pin and its tag, above the anchor at its bottom center, in px
const PIN_BOX = { width: 96, height: 80 }

/**
 * @description Returns how far the map pans so a box fits inside a frame, zero on an axis where it fits
 * @param box Box drawn on the map
 * @param frame Part of the map free of the controls, less the margin
 */
const fitPanOf = (box: DOMRect, frame: DOMRect): [number, number] => {
    const across = (start: number, end: number, frameStart: number, frameEnd: number) =>
        start < frameStart ? start - frameStart : Math.max(0, end - frameEnd)
    return [
        across(box.left, box.right, frame.left, frame.right),
        across(box.top, box.bottom, frame.top, frame.bottom),
    ]
}

interface EventMapProps extends RouteClientComponentProps<"root"> {
    center: GeoPoint
    locateRequest: LocateRequest | undefined
    position: GeoPoint | undefined
    occurrences: OccurrenceSummary[]
    permanentVenues: PermanentVenueSummary[]
    iconOf: (categoryId: string) => CategoryIcon
    selectedVenueId: string | undefined
    previewCard: PreviewCard | undefined
    // Place of the selected pin, which pans clear of the controls and of the panel
    revealedPoint: GeoPoint | undefined
    // Controls drawn over the top of the map
    overlayRef: RefObject<HTMLElement | null>
    // Panel drawn over the right side of the map
    panelRef: RefObject<HTMLElement | null>
    now: Date
    onSelect: (ref: OccurrenceRef) => void
    onSelectVenue: (venueId: string) => void
    // A click on the map itself, outside every marker
    onBackgroundClick: () => void
    // A click on the pin of the selected spot
    onSelectedClick: () => void
    // A drag of the map by the visitor
    onDragStart: () => void
    // True when a press on a pin moves the map to center it, as on a phone
    centersSelection: boolean
}

export const EventMap = (props: EventMapProps) => {
    const { t } = useTranslation("shared")
    const containerRef = useRef<HTMLDivElement>(null)
    const supported = useMemo(() => supportsWebGl2(), [])
    const [map, setMap] = useState<MapLibreMap>()
    const [viewport, setViewport] = useState<Viewport>()
    const readCenter = useEffectEvent(() => props.center)
    const clickBackground = useEffectEvent(() => {
        props.onBackgroundClick()
    })
    const startDrag = useEffectEvent(() => {
        props.onDragStart()
    })

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
            zoom: globalThis.matchMedia("(min-width: 48rem)").matches
                ? LOCATE_ZOOM
                : PHONE_INITIAL_ZOOM,
            ...FIXED_MAP_OPTIONS,
            // The expanded control wraps over the bottom controls on a phone, so the map
            // draws its own one-line credit below.
            attributionControl: false,
        })
        const releaseGestures = fixMapGestures(instance)
        const publishViewport = () => {
            setViewport(viewportOf(instance))
        }
        instance.on("load", () => {
            setMap(instance)
            publishViewport()
        })
        instance.on("moveend", publishViewport)
        instance.on("dragstart", startDrag)
        instance.on("click", event => {
            if (event.originalEvent.target === instance.getCanvas()) {
                clickBackground()
            }
        })
        void addDotDither(instance)

        return () => {
            releaseGestures()
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

    // Part of the map free of the controls and of the panel, less the margin
    const readFreeFrame = useEffectEvent((container: HTMLElement): DOMRect => {
        const bounds = container.getBoundingClientRect()
        const top = Math.max(
            bounds.top,
            props.overlayRef.current?.getBoundingClientRect().bottom ?? 0,
        )
        const right = Math.min(
            bounds.right,
            props.panelRef.current?.getBoundingClientRect().left ?? bounds.right,
        )
        return new DOMRect(
            bounds.left + PIN_FRAME_MARGIN,
            top + PIN_FRAME_MARGIN,
            right - bounds.left - 2 * PIN_FRAME_MARGIN,
            bounds.bottom - top - 2 * PIN_FRAME_MARGIN,
        )
    })

    const cardRef = useRef<HTMLDivElement>(null)
    const cardPlace =
        props.previewCard === undefined
            ? undefined
            : `${String(props.previewCard.coordinates.latitude)} ${String(props.previewCard.coordinates.longitude)}`
    // A card that opens past the edges, or under the controls, pans into view
    useEffect(() => {
        const card = cardRef.current
        const container = containerRef.current
        if (
            map === undefined ||
            cardPlace === undefined ||
            card === null ||
            container === null
        ) {
            return
        }
        const [x, y] = fitPanOf(card.getBoundingClientRect(), readFreeFrame(container))
        if (x !== 0 || y !== 0) {
            map.panBy([x, y])
        }
    }, [map, cardPlace])

    const readRevealedPoint = useEffectEvent(() => props.revealedPoint)
    const revealedPlace =
        props.revealedPoint === undefined
            ? undefined
            : `${String(props.revealedPoint.latitude)} ${String(props.revealedPoint.longitude)}`
    // A selected pin past the edges, or under the controls or the panel, pans into view
    useEffect(() => {
        const point = readRevealedPoint()
        const container = containerRef.current
        if (
            map === undefined ||
            revealedPlace === undefined ||
            point === undefined ||
            container === null
        ) {
            return
        }
        const bounds = container.getBoundingClientRect()
        const anchor = map.project([point.longitude, point.latitude])
        const [x, y] = fitPanOf(
            new DOMRect(
                bounds.left + anchor.x - PIN_BOX.width / 2,
                bounds.top + anchor.y - PIN_BOX.height,
                PIN_BOX.width,
                PIN_BOX.height,
            ),
            readFreeFrame(container),
        )
        if (x !== 0 || y !== 0) {
            map.panBy([x, y])
        }
    }, [map, revealedPlace])

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
            : shownMarkersOf(
                  clusters.getClusters(viewport.bbox, viewport.zoom),
                  clusters,
                  index => resultIdOf(props, index),
              )

    const [scene, setScene] = useState<MarkerScene>()
    const sameResults =
        scene?.occurrences === props.occurrences &&
        scene.permanentVenues === props.permanentVenues
    if (
        viewport !== undefined &&
        (scene?.viewport !== viewport ||
            !sameResults ||
            scene.selectedIndex !== selectedIndex)
    ) {
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

    const markerOf = (
        shownOn: MapLibreMap,
        marker: ShownMarker,
        move: MarkerMove | undefined,
        source: ResultSource,
    ) => {
        const { feature, coordinates } = marker
        const centerOnMarker = () => {
            if (props.centersSelection) {
                shownOn.easeTo({ center: [coordinates.longitude, coordinates.latitude] })
            }
        }
        const leavingMarker = move?.type === "leave"
        const key = `${leavingMarker ? "leaving" : "shown"}:${marker.key}`
        // A leaving marker can come from replaced results that the cluster index no longer holds
        const emphasis = leavingMarker
            ? leavingEmphasisOf(scene?.leavingDimmed === true)
            : markerEmphasis(feature, clusters, selectedIndex)
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
                                    centerOnMarker()
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
            const venue = source.permanentVenues.at(index - source.occurrences.length)
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
                                if (emphasis === "selected") {
                                    props.onSelectedClick()
                                    return
                                }
                                centerOnMarker()
                                props.onSelectVenue(venue.id)
                            }}
                        />
                    </MarkerMotion>
                </MapMarker>
            )
        }

        const occurrence = source.occurrences.at(index)
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
                            if (emphasis === "selected") {
                                props.onSelectedClick()
                                return
                            }
                            centerOnMarker()
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
            {/* MapLibre sets `position: relative` on its container, so a wrapper places it.
                It isolates the layers of the markers, so the controls above draw on top. */}
            <div className="absolute inset-0 isolate">
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
                              props,
                          ),
                      ),
                      ...leaving.map(left =>
                          markerOf(
                              map,
                              left.marker,
                              leaveMoveOf(left, viewport.exactZoom),
                              scene?.leavingFrom ?? props,
                          ),
                      ),
                  ]}
            {map === undefined || props.previewCard === undefined ? undefined : (
                <MapMarker
                    route={props.route}
                    map={map}
                    coordinates={props.previewCard.coordinates}
                    anchor="bottom"
                    offset={PREVIEW_CARD_OFFSET}
                    layer={PREVIEW_CARD_LAYER}
                >
                    <div
                        ref={cardRef}
                        className="animate-in [--tw-enter-opacity:0] [--tw-enter-scale:0.95] [--tw-enter-translate-y:0.5rem] motion-reduce:animate-none"
                    >
                        {props.previewCard.content}
                    </div>
                </MapMarker>
            )}
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

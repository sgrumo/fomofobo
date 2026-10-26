import type { GeoPoint } from "models"
import type Supercluster from "supercluster"

import type {
    EventClusterProperties,
    EventMapFeature,
    EventPointProperties,
} from "./event-clusters"

export const MARKER_MOTION_MS = 250

// Side of the whole world in px at zoom 0, the tile size of MapLibre
const WORLD_SIZE = 512

export interface ShownMarker {
    // Result indexes the marker holds, sorted and joined: a cluster keeps it across zoom levels
    key: string
    coordinates: GeoPoint
    leaves: number[]
    feature: EventMapFeature
}

export interface LeavingMarker {
    marker: ShownMarker
    target: GeoPoint | undefined
}

export interface MarkerTransitions {
    // Point each new marker starts from, none for a marker that only fades in
    entering: ReadonlyMap<string, GeoPoint | undefined>
    leaving: LeavingMarker[]
}

export const NO_MARKER_TRANSITIONS: MarkerTransitions = {
    entering: new Map(),
    leaving: [],
}

export interface PixelOffset {
    x: number
    y: number
}

/**
 * @description Builds the markers that the map shows for its features, each with the result indexes it holds
 * @param features Clusters and single spots of the viewport
 * @param clusters Cluster index of the features
 */
export const shownMarkersOf = (
    features: readonly EventMapFeature[],
    clusters: Supercluster<EventPointProperties, EventClusterProperties>,
): ShownMarker[] =>
    features.map(feature => {
        const [longitude = 0, latitude = 0] = feature.geometry.coordinates
        const leaves = (
            "cluster" in feature.properties
                ? clusters
                      .getLeaves(feature.properties.cluster_id, Infinity)
                      .map(leaf => leaf.properties.index)
                : [feature.properties.index]
        ).toSorted((first, second) => first - second)
        return {
            key: leaves.join(" "),
            coordinates: { latitude, longitude },
            leaves,
            feature,
        }
    })

/**
 * @description True when the first marker holds every result of the second one, and more
 * @param outer Marker that may hold the other
 * @param inner Marker that may be held
 */
const holds = (outer: ShownMarker, inner: ShownMarker): boolean =>
    outer.leaves.length > inner.leaves.length &&
    inner.leaves.every(leaf => outer.leaves.includes(leaf))

/**
 * @description Returns how the markers change between two zoom levels: a marker split from a cluster starts at that cluster, a marker merged into a cluster moves to it
 * @param previous Markers shown before
 * @param next Markers shown now
 */
export const markerTransitions = (
    previous: readonly ShownMarker[],
    next: readonly ShownMarker[],
): MarkerTransitions => {
    const previousKeys = new Set(previous.map(marker => marker.key))
    const nextKeys = new Set(next.map(marker => marker.key))
    return {
        entering: new Map(
            next
                .filter(marker => !previousKeys.has(marker.key))
                .map(marker => [
                    marker.key,
                    previous.find(shown => holds(shown, marker))?.coordinates,
                ]),
        ),
        leaving: previous
            .filter(marker => !nextKeys.has(marker.key))
            .map(marker => ({
                marker,
                target: next.find(shown => holds(shown, marker))?.coordinates,
            })),
    }
}

/**
 * @description Returns the point in px of the Web Mercator world at a zoom
 * @param point Point projected
 * @param zoom Zoom level, fractional
 */
const worldPixelOf = (point: GeoPoint, zoom: number): PixelOffset => {
    const size = WORLD_SIZE * 2 ** zoom
    const latitude = (point.latitude * Math.PI) / 180
    return {
        x: ((point.longitude + 180) / 360) * size,
        y:
            ((1 - Math.log(Math.tan(latitude) + 1 / Math.cos(latitude)) / Math.PI) / 2) *
            size,
    }
}

/**
 * @description Returns the screen offset from one point to another at a zoom
 * @param from Point the offset starts at
 * @param to Point the offset ends at
 * @param zoom Zoom level, fractional
 */
export const pixelOffset = (from: GeoPoint, to: GeoPoint, zoom: number): PixelOffset => {
    const start = worldPixelOf(from, zoom)
    const end = worldPixelOf(to, zoom)
    return { x: end.x - start.x, y: end.y - start.y }
}

export type MarkerMove =
    | { type: "enter"; from: PixelOffset | undefined }
    | { type: "leave"; to: PixelOffset | undefined }

/**
 * @description Returns the move of a marker on screen: from the cluster it split from, a fade-in when it is new with no such cluster, none when it stays
 * @param marker Marker shown
 * @param transitions Transitions of the markers on screen
 * @param zoom Zoom level of the map, fractional
 */
export const enterMoveOf = (
    marker: ShownMarker,
    transitions: MarkerTransitions,
    zoom: number,
): MarkerMove | undefined => {
    if (!transitions.entering.has(marker.key)) {
        return undefined
    }
    const origin = transitions.entering.get(marker.key)
    return {
        type: "enter",
        from:
            origin === undefined
                ? undefined
                : pixelOffset(marker.coordinates, origin, zoom),
    }
}

/**
 * @description Returns the move of a marker that leaves the screen: to the cluster it merged into, else a fade-out in place
 * @param leaving Marker that leaves, with its target
 * @param zoom Zoom level of the map, fractional
 */
export const leaveMoveOf = (leaving: LeavingMarker, zoom: number): MarkerMove => ({
    type: "leave",
    to:
        leaving.target === undefined
            ? undefined
            : pixelOffset(leaving.marker.coordinates, leaving.target, zoom),
})

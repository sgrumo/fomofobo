import { sum } from "es-toolkit"
import type { GeoPoint, OccurrenceStatus } from "models"
import Supercluster from "supercluster"
import type { ClusterFeature, PointFeature } from "supercluster"

export const CLUSTER_MAX_ZOOM = 17

const CLUSTER_RADIUS = 48

export type MapPointKind = OccurrenceStatus | "permanent"

export interface EventPointProperties {
    index: number
    kind: MapPointKind
    moreCount: number
}

export interface MapSpot extends EventPointProperties {
    venueIds: string[]
    coordinates: GeoPoint
}

export interface VenuePoint {
    venueId: string
    coordinates: GeoPoint
}

export interface EventClusterProperties {
    liveCount: number
    upcomingCount: number
    endedCount: number
    permanentCount: number
}

export type EventMapFeature =
    | ClusterFeature<EventClusterProperties>
    | PointFeature<EventPointProperties>

// Bottom to top: a live result draws above every other marker.
const LAYER_ORDER: readonly MapPointKind[] = ["permanent", "ended", "upcoming", "live"]

/**
 * @description Returns the stacking layer of a marker of the kind, higher on top
 * @param kind Kind of the point
 */
export const markerLayer = (kind: MapPointKind): number => LAYER_ORDER.indexOf(kind)

export const SELECTED_MARKER_LAYER = LAYER_ORDER.length

export const POSITION_MARKER_LAYER = SELECTED_MARKER_LAYER + 1

/**
 * @description Groups the venues that the cluster index still merges at its last zoom, one
 * group of venue ids per spot
 * @param venues Venue of each result, a venue repeated once per result
 */
export const sharedSpotsOf = (venues: readonly VenuePoint[]): string[][] => {
    const unique = [...new Map(venues.map(venue => [venue.venueId, venue])).values()]
    const index = new Supercluster<Pick<VenuePoint, "venueId">>({
        radius: CLUSTER_RADIUS,
        maxZoom: CLUSTER_MAX_ZOOM,
    }).load(
        unique.map(venue => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [venue.coordinates.longitude, venue.coordinates.latitude],
            },
            properties: { venueId: venue.venueId },
        })),
    )
    return index
        .getClusters([-180, -90, 180, 90], CLUSTER_MAX_ZOOM)
        .map(feature =>
            "cluster" in feature.properties
                ? index
                      .getLeaves(feature.properties.cluster_id, Infinity)
                      .map(leaf => leaf.properties.venueId)
                : [feature.properties.venueId],
        )
}

/**
 * @description Groups the results into one spot per group of venues too close to tell apart,
 * marked by its result of the highest layer, the first in result order among equals
 * @param results Venue and kind of each result, in result order: occurrences first, then
 * permanent venues
 */
export const venueSpots = (
    results: ReadonlyArray<VenuePoint & { kind: MapPointKind }>,
): MapSpot[] => {
    const byVenue = Map.groupBy(
        results.map((result, index) => ({ ...result, index })),
        result => result.venueId,
    )
    const firstIndexOf = (venueIds: readonly string[]) =>
        Math.min(...venueIds.map(venueId => byVenue.get(venueId)?.[0]?.index ?? Infinity))
    return sharedSpotsOf(results)
        .toSorted((first, second) => firstIndexOf(first) - firstIndexOf(second))
        .map(venueIds => {
            const group = venueIds
                .flatMap(venueId => byVenue.get(venueId) ?? [])
                .toSorted((first, second) => first.index - second.index)
            const top = group.reduce((best, result) =>
                markerLayer(result.kind) > markerLayer(best.kind) ? result : best,
            )
            return {
                venueIds: venueIds.toSorted(
                    (first, second) => firstIndexOf([first]) - firstIndexOf([second]),
                ),
                coordinates: top.coordinates,
                kind: top.kind,
                index: top.index,
                moreCount: group.length - 1,
            }
        })
}

/**
 * @description Builds the cluster index of the venue spots, each cluster counting its spots
 * per kind
 * @param spots One spot per group of venues too close to tell apart
 */
export const buildEventClusters = (
    spots: readonly MapSpot[],
): Supercluster<EventPointProperties, EventClusterProperties> =>
    new Supercluster<EventPointProperties, EventClusterProperties>({
        radius: CLUSTER_RADIUS,
        maxZoom: CLUSTER_MAX_ZOOM,
        map: properties => ({
            liveCount: properties.kind === "live" ? 1 : 0,
            upcomingCount: properties.kind === "upcoming" ? 1 : 0,
            endedCount: properties.kind === "ended" ? 1 : 0,
            permanentCount: properties.kind === "permanent" ? 1 : 0,
        }),
        reduce: (accumulated, properties) => {
            accumulated.liveCount += properties.liveCount
            accumulated.upcomingCount += properties.upcomingCount
            accumulated.endedCount += properties.endedCount
            accumulated.permanentCount += properties.permanentCount
        },
    }).load(
        spots.map(spot => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [spot.coordinates.longitude, spot.coordinates.latitude],
            },
            properties: { index: spot.index, kind: spot.kind, moreCount: spot.moreCount },
        })),
    )

/**
 * @description Returns the counts of a cluster per kind
 * @param cluster Counts of the cluster per kind
 */
const kindCountsOf = (cluster: EventClusterProperties): Record<MapPointKind, number> => ({
    live: cluster.liveCount,
    upcoming: cluster.upcomingCount,
    ended: cluster.endedCount,
    permanent: cluster.permanentCount,
})

/**
 * @description Returns the stacking layer of a cluster: the layer of the highest kind it holds
 * @param cluster Counts of the cluster per kind
 */
export const clusterLayer = (cluster: EventClusterProperties): number => {
    const counts = kindCountsOf(cluster)
    return LAYER_ORDER.findLastIndex(kind => counts[kind] > 0)
}

export interface ClusterArc {
    kind: MapPointKind
    // Percentages of the ring, 0 to 100
    from: number
    to: number
}

/**
 * @description Returns the arcs of the ring of a cluster, one per kind from the top layer down, each sized by the share of its kind
 * @param cluster Counts of the cluster per kind
 */
export const clusterArcs = (cluster: EventClusterProperties): ClusterArc[] => {
    const counts = kindCountsOf(cluster)
    const total = sum(Object.values(counts))
    return LAYER_ORDER.toReversed().reduce<{ arcs: ClusterArc[]; counted: number }>(
        ({ arcs, counted }, kind) => ({
            arcs: [
                ...arcs,
                {
                    kind,
                    from: (counted / total) * 100,
                    to: ((counted + counts[kind]) / total) * 100,
                },
            ],
            counted: counted + counts[kind],
        }),
        { arcs: [], counted: 0 },
    ).arcs
}

/**
 * @description Returns the lowest result index among the leaves of a cluster: the results
 * hold the occurrences first, then the permanent venues
 * @param leaves Points of the cluster
 */
export const firstLeafIndex = (
    leaves: ReadonlyArray<{ properties: Pick<EventPointProperties, "index"> }>,
): number | undefined =>
    leaves.length === 0
        ? undefined
        : Math.min(...leaves.map(leaf => leaf.properties.index))

export type MarkerEmphasis = "selected" | "dimmed" | "normal"

/**
 * @description Returns the emphasis of a marker while a spot is selected: the selected spot
 * stands out, the cluster that holds it stays as it is, every other marker dims
 * @param feature Cluster or single spot
 * @param clusters Cluster index of the feature
 * @param selectedIndex Result index of the selected spot, if any
 */
export const markerEmphasis = (
    feature: EventMapFeature,
    clusters: Supercluster<EventPointProperties, EventClusterProperties>,
    selectedIndex: number | undefined,
): MarkerEmphasis => {
    if (selectedIndex === undefined) {
        return "normal"
    }
    if ("cluster" in feature.properties) {
        return clusters
            .getLeaves(feature.properties.cluster_id, Infinity)
            .some(leaf => leaf.properties.index === selectedIndex)
            ? "normal"
            : "dimmed"
    }
    return feature.properties.index === selectedIndex ? "selected" : "dimmed"
}

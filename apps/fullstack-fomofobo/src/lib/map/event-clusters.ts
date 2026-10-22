import type { GeoPoint, OccurrenceStatus } from "models"
import { isDefined } from "shared/values"
import Supercluster from "supercluster"
import type { ClusterFeature, PointFeature } from "supercluster"

export const CLUSTER_MAX_ZOOM = 17

export type MapPointKind = OccurrenceStatus | "permanent"

export interface EventPointProperties {
    index: number
    kind: MapPointKind
    moreCount: number
}

export interface MapSpot extends EventPointProperties {
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

/**
 * @description Groups the results into one spot per venue, marked by its result of the highest
 * layer, the first in result order among equals
 * @param results Venue and kind of each result, in result order: occurrences first, then
 * permanent venues
 */
export const venueSpots = (
    results: ReadonlyArray<{
        venueId: string
        coordinates: GeoPoint
        kind: MapPointKind
    }>,
): MapSpot[] =>
    Object.values(
        Object.groupBy(
            results.map((result, index) => ({ ...result, index })),
            result => result.venueId,
        ),
    )
        .filter(isDefined)
        .map(group => {
            const top = group.reduce((best, result) =>
                markerLayer(result.kind) > markerLayer(best.kind) ? result : best,
            )
            return {
                coordinates: top.coordinates,
                kind: top.kind,
                index: top.index,
                moreCount: group.length - 1,
            }
        })

/**
 * @description Builds the cluster index of the venue spots, each cluster counting its spots
 * per kind
 * @param spots One spot per venue
 */
export const buildEventClusters = (
    spots: readonly MapSpot[],
): Supercluster<EventPointProperties, EventClusterProperties> =>
    new Supercluster<EventPointProperties, EventClusterProperties>({
        radius: 48,
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
 * @description Returns the stacking layer of a cluster: the layer of the highest kind it holds
 * @param cluster Counts of the cluster per kind
 */
export const clusterLayer = (cluster: EventClusterProperties): number => {
    const counts: Record<MapPointKind, number> = {
        live: cluster.liveCount,
        upcoming: cluster.upcomingCount,
        ended: cluster.endedCount,
        permanent: cluster.permanentCount,
    }
    return LAYER_ORDER.findLastIndex(kind => counts[kind] > 0)
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

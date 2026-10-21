import type { GeoPoint, OccurrenceStatus } from "models"
import Supercluster from "supercluster"
import type { ClusterFeature, PointFeature } from "supercluster"

export const CLUSTER_MAX_ZOOM = 17

export interface EventPointProperties {
    index: number
    status: OccurrenceStatus
}

export interface EventClusterProperties {
    liveCount: number
    upcomingCount: number
    endedCount: number
}

export type EventMapFeature =
    | ClusterFeature<EventClusterProperties>
    | PointFeature<EventPointProperties>

/**
 * @description Builds the cluster index of the event points, each cluster counting its points
 * per status
 * @param points Venue and status of each result, in result order
 */
export const buildEventClusters = (
    points: ReadonlyArray<{ coordinates: GeoPoint; status: OccurrenceStatus }>,
): Supercluster<EventPointProperties, EventClusterProperties> =>
    new Supercluster<EventPointProperties, EventClusterProperties>({
        radius: 48,
        maxZoom: CLUSTER_MAX_ZOOM,
        map: properties => ({
            liveCount: properties.status === "live" ? 1 : 0,
            upcomingCount: properties.status === "upcoming" ? 1 : 0,
            endedCount: properties.status === "ended" ? 1 : 0,
        }),
        reduce: (accumulated, properties) => {
            accumulated.liveCount += properties.liveCount
            accumulated.upcomingCount += properties.upcomingCount
            accumulated.endedCount += properties.endedCount
        },
    }).load(
        points.map((point, index) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [point.coordinates.longitude, point.coordinates.latitude],
            },
            properties: { index, status: point.status },
        })),
    )

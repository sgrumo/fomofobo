import type { GeoPoint } from "models"
import Supercluster from "supercluster"
import type { ClusterFeature, PointFeature } from "supercluster"

export interface EventPointProperties {
    index: number
    live: boolean
}

export interface EventClusterProperties {
    liveCount: number
}

export type EventMapFeature =
    | ClusterFeature<EventClusterProperties>
    | PointFeature<EventPointProperties>

/**
 * @description Builds the cluster index of the event points, each cluster counting its live
 * points
 * @param points Venue and live flag of each result, in result order
 */
export const buildEventClusters = (
    points: ReadonlyArray<{ coordinates: GeoPoint; live: boolean }>,
): Supercluster<EventPointProperties, EventClusterProperties> =>
    new Supercluster<EventPointProperties, EventClusterProperties>({
        radius: 48,
        maxZoom: 17,
        map: properties => ({ liveCount: properties.live ? 1 : 0 }),
        reduce: (accumulated, properties) => {
            accumulated.liveCount += properties.liveCount
        },
    }).load(
        points.map((point, index) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [point.coordinates.longitude, point.coordinates.latitude],
            },
            properties: { index, live: point.live },
        })),
    )

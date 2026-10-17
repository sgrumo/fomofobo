import { clamp } from "es-toolkit"
import type { GeoPoint } from "models"

import { EARTH_RADIUS_METERS, toRadians } from "./haversine-distance"

export interface BoundingBox {
    minLatitude: number
    maxLatitude: number
    minLongitude: number
    maxLongitude: number
}

/**
 * @description Returns the latitude and longitude box that holds every point within the radius of the center
 * @param center Center of the circle
 * @param radiusMeters Radius of the circle
 * @remarks Does not wrap the antimeridian and covers every longitude near a pole
 */
export const boundingBox = (center: GeoPoint, radiusMeters: number): BoundingBox => {
    const latitudeDelta = (radiusMeters / EARTH_RADIUS_METERS) * (180 / Math.PI)
    const longitudeDelta = Math.min(
        180,
        latitudeDelta / Math.cos(toRadians(center.latitude)),
    )
    return {
        minLatitude: clamp(center.latitude - latitudeDelta, -90, 90),
        maxLatitude: clamp(center.latitude + latitudeDelta, -90, 90),
        minLongitude: center.longitude - longitudeDelta,
        maxLongitude: center.longitude + longitudeDelta,
    }
}

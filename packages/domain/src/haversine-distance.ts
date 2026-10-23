import type { GeoPoint } from "models"

export const EARTH_RADIUS_METERS = 6_371_000

/**
 * @description Returns the degrees as radians
 * @param degrees Angle in degrees
 */
export const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

/**
 * @description Returns the great-circle distance in meters between two points
 * @param from First point
 * @param to Second point
 */
export const haversineDistance = (from: GeoPoint, to: GeoPoint): number => {
    const latitudeDelta = toRadians(to.latitude - from.latitude)
    const longitudeDelta = toRadians(to.longitude - from.longitude)
    const a =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(toRadians(from.latitude)) *
            Math.cos(toRadians(to.latitude)) *
            Math.sin(longitudeDelta / 2) ** 2
    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)))
}

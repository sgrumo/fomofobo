import type { GeoPoint } from "models"

const CENTER_GRID_FACTOR = 1000

/**
 * @description Returns the point snapped to a grid of about 100 m
 * @param point Point snapped
 */
export const roundCenter = (point: GeoPoint): GeoPoint => ({
    latitude: Math.round(point.latitude * CENTER_GRID_FACTOR) / CENTER_GRID_FACTOR,
    longitude: Math.round(point.longitude * CENTER_GRID_FACTOR) / CENTER_GRID_FACTOR,
})

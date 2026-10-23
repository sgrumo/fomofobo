import type { GeoPoint } from "models"

import type { MapQuery } from "./map-query"
import { DEFAULT_CITY } from "./platform"
import { roundCenter } from "./round-center"

// `unknown` until the device answers: the permission prompt may stay open
export type LocationStatus = "unknown" | "granted" | "denied" | "unavailable"

export interface SearchCenter {
    center: GeoPoint
    hasQueryCenter: boolean
    locationOff: boolean
    searchReady: boolean
}

/**
 * @description Returns the center of the map search: the center of the map query, else the
 * default city, and whether the search may start
 * @param query Map query
 * @param location Status of the device location
 * @remarks Holds the search with no query center until the device answers, so the default city
 * never flashes by before the first fix moves the center
 */
export const searchCenterOf = (
    query: Pick<MapQuery, "lat" | "lng">,
    location: LocationStatus,
): SearchCenter => {
    const queryCenter =
        query.lat === undefined || query.lng === undefined
            ? undefined
            : { latitude: query.lat, longitude: query.lng }
    const locationOff = location === "denied" || location === "unavailable"
    return {
        center: queryCenter ?? DEFAULT_CITY.center,
        hasQueryCenter: queryCenter !== undefined,
        locationOff,
        searchReady: queryCenter !== undefined || locationOff,
    }
}

/**
 * @description Returns the map query keys that make the point the search center
 * @param point Point that becomes the center
 */
export const centerQueryOf = (point: GeoPoint): Pick<MapQuery, "lat" | "lng"> => {
    const { latitude, longitude } = roundCenter(point)
    return { lat: latitude, lng: longitude }
}

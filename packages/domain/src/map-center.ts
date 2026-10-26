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

// Zoom after a locate: a few blocks around the visitor
export const LOCATE_ZOOM = 15

// Exact position of the last locate, and how many locates ran
export interface LocateRequest {
    position: GeoPoint
    count: number
}

/**
 * @description Builds the request of a new locate at a position
 * @param position Position of the device
 * @param previous Request of the last locate, if any
 */
export const nextLocateRequest = (
    position: GeoPoint,
    previous: LocateRequest | undefined,
): LocateRequest => ({ position, count: (previous?.count ?? 0) + 1 })

interface MapFlight {
    center: GeoPoint
    zoom: number | undefined
}

/**
 * @description Returns where the map flies for a search center: to the exact position at the
 * locate zoom when the last locate set this center, else to the center at the current zoom
 * @param center Search center, rounded
 * @param locate Request of the last locate, if any
 */
export const mapFlightOf = (
    center: GeoPoint,
    locate: LocateRequest | undefined,
): MapFlight => {
    if (locate === undefined) {
        return { center, zoom: undefined }
    }
    const located = roundCenter(locate.position)
    return located.latitude === center.latitude && located.longitude === center.longitude
        ? { center: locate.position, zoom: LOCATE_ZOOM }
        : { center, zoom: undefined }
}

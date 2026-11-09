import { clamp } from "es-toolkit"
import type { GeoPoint } from "models"

import { boundingBox } from "./bounding-box"
import { MAP_BOUNDS, SEARCH_RADIUS_METERS } from "./platform"

export interface SearchBox {
    west: number
    south: number
    east: number
    north: number
}

// Box searched, and the search center it started from
export interface SearchArea {
    center: GeoPoint
    box: SearchBox
}

// Share of the width and the height of the viewport added on each side, so a short pan needs no new search
const SEARCH_BOX_MARGIN = 0.25

// Steps per degree of the grid that the edges snap outward to, about 1 km, so close views share one answer
const SEARCH_BOX_GRID = 100

const [MAP_WEST, MAP_SOUTH, MAP_EAST, MAP_NORTH] = MAP_BOUNDS

/**
 * @description Returns the box cut to the edges of the map
 * @param box Box cut
 */
const clampToMap = (box: SearchBox): SearchBox => ({
    west: clamp(box.west, MAP_WEST, MAP_EAST),
    south: clamp(box.south, MAP_SOUTH, MAP_NORTH),
    east: clamp(box.east, MAP_WEST, MAP_EAST),
    north: clamp(box.north, MAP_SOUTH, MAP_NORTH),
})

/**
 * @description Returns the box grown to the nearest lines of the grid
 * @param box Box grown
 */
const snapOutward = (box: SearchBox): SearchBox => ({
    west: Math.floor(box.west * SEARCH_BOX_GRID) / SEARCH_BOX_GRID,
    south: Math.floor(box.south * SEARCH_BOX_GRID) / SEARCH_BOX_GRID,
    east: Math.ceil(box.east * SEARCH_BOX_GRID) / SEARCH_BOX_GRID,
    north: Math.ceil(box.north * SEARCH_BOX_GRID) / SEARCH_BOX_GRID,
})

/**
 * @description True when the first box holds the whole second box
 * @param outer Box that may hold the other
 * @param inner Box that may be held
 */
const holdsBox = (outer: SearchBox, inner: SearchBox): boolean =>
    outer.west <= inner.west &&
    outer.south <= inner.south &&
    outer.east >= inner.east &&
    outer.north >= inner.north

/**
 * @description Returns the box of the search radius around the center, cut to the map and snapped to the grid
 * @param center Search center
 */
const radiusBoxOf = (center: GeoPoint): SearchBox => {
    const box = boundingBox(center, SEARCH_RADIUS_METERS)
    return snapOutward(
        clampToMap({
            west: box.minLongitude,
            south: box.minLatitude,
            east: box.maxLongitude,
            north: box.maxLatitude,
        }),
    )
}

/**
 * @description Returns the box of the map search: the box of the area while the search center
 * stays the same, else the box of the search radius around the center
 * @param area Area searched last, if any
 * @param center Search center
 */
export const searchBoxOf = (area: SearchArea | undefined, center: GeoPoint): SearchBox =>
    area !== undefined &&
    area.center.latitude === center.latitude &&
    area.center.longitude === center.longitude
        ? area.box
        : radiusBoxOf(center)

/**
 * @description Builds the area to search once the map shows a viewport: the box searched last
 * while it holds the viewport and its answer left no result out, else the viewport with a margin
 * @param viewport West, south, east and north edges of the map on screen
 * @param center Search center
 * @param area Area searched last, if any
 * @param truncated True when the answer of the last search left results out
 */
export const nextSearchArea = (
    viewport: readonly [number, number, number, number],
    center: GeoPoint,
    area: SearchArea | undefined,
    truncated: boolean,
): SearchArea => {
    const [west, south, east, north] = viewport
    const shown = clampToMap({ west, south, east, north })
    const box = searchBoxOf(area, center)
    if (!truncated && holdsBox(box, shown)) {
        return { center, box }
    }
    const marginX = (shown.east - shown.west) * SEARCH_BOX_MARGIN
    const marginY = (shown.north - shown.south) * SEARCH_BOX_MARGIN
    return {
        center,
        box: snapOutward(
            clampToMap({
                west: shown.west - marginX,
                south: shown.south - marginY,
                east: shown.east + marginX,
                north: shown.north + marginY,
            }),
        ),
    }
}

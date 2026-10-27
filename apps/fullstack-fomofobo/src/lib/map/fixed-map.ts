import { MAP_BOUNDS, MAP_MIN_ZOOM } from "domain/platform"
import type { Map as MapLibreMap, MapOptions } from "maplibre-gl"

/**
 * @remarks Keeps the map inside Italy, with no turn or tilt, since no map draws a compass to
 * undo them
 */
export const FIXED_MAP_OPTIONS = {
    minZoom: MAP_MIN_ZOOM,
    maxBounds: MAP_BOUNDS,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
} satisfies Partial<MapOptions>

/**
 * @description Turns off the rotation gestures that the options leave on, and the browser menu
 * of a right click outside a link, returning the call that gives the menu back
 * @param map Map fixed
 */
export const fixMapGestures = (map: MapLibreMap): (() => void) => {
    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()
    const container = map.getContainer()
    const blockMenu = (event: MouseEvent) => {
        const onLink =
            event.target instanceof Element && event.target.closest("a") !== null
        if (!onLink) {
            event.preventDefault()
        }
    }
    container.addEventListener("contextmenu", blockMenu)
    return () => {
        container.removeEventListener("contextmenu", blockMenu)
    }
}

export const RESULT_MARKER_ATTRIBUTE = "data-map-result"

/**
 * @description True when the target of an event lies inside a result marker of the map
 * @param target Target of the event
 */
export const isResultMarkerTarget = (target: EventTarget | null): boolean =>
    target instanceof Element && target.closest(`[${RESULT_MARKER_ATTRIBUTE}]`) !== null

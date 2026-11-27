/** @remarks Falls on Saturday 2026-10-24, 12:00 in Rome, so the default window runs to 2026-11-22 included */
export const SATURDAY_NOON = "2026-10-24T12:00:00+02:00"

/**
 * @description Builds the search box that reaches a margin in degrees on each side of a point
 * @param point Center of the box
 * @param margin Degrees from the point to each edge
 */
export const boxAround = (
    point: { latitude: number; longitude: number },
    margin = 0.05,
) => ({
    west: point.longitude - margin,
    south: point.latitude - margin,
    east: point.longitude + margin,
    north: point.latitude + margin,
})

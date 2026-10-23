import type { GeoPoint } from "models"
import { match } from "ts-pattern"

export type MapsProvider = "apple" | "google"

/**
 * @description Builds the link that opens the maps app with directions to the point
 * @param destination Point the directions lead to
 * @param provider Maps app of the device
 */
export const directionsUrl = (destination: GeoPoint, provider: MapsProvider): string => {
    const point = `${String(destination.latitude)},${String(destination.longitude)}`
    return match(provider)
        .with("apple", () => `https://maps.apple.com/directions?destination=${point}`)
        .with(
            "google",
            () => `https://www.google.com/maps/dir/?api=1&destination=${point}`,
        )
        .exhaustive()
}

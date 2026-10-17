import type { GeoPoint } from "models"
import { match } from "ts-pattern"

export type MapsProvider = "apple" | "google"

/**
 * @description Returns the maps app of the device: Apple Maps on iOS and iPadOS, Google
 * Maps elsewhere
 * @param userAgent User agent of the browser
 * @param maxTouchPoints Touch points of the device, which tell an iPad apart from a Mac
 */
export const mapsProviderOf = (
    userAgent: string,
    maxTouchPoints: number,
): MapsProvider =>
    /iPad|iPhone|iPod/u.test(userAgent) ||
    (/Macintosh/u.test(userAgent) && maxTouchPoints > 1)
        ? "apple"
        : "google"

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

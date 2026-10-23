import type { MapsProvider } from "domain/directions-url"

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

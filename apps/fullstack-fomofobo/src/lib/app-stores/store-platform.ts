import { mapsProviderOf } from "@/lib/geo/maps-provider"

export type StorePlatform = "ios" | "android"

/**
 * @description Returns the app store of the device: the App Store on iOS and iPadOS, Google Play on Android, none elsewhere
 * @param userAgent User agent of the browser
 * @param maxTouchPoints Touch points of the device, which tell an iPad apart from a Mac
 */
export const storePlatformOf = (
    userAgent: string,
    maxTouchPoints: number,
): StorePlatform | undefined => {
    if (mapsProviderOf(userAgent, maxTouchPoints) === "apple") {
        return "ios"
    }
    return /Android/u.test(userAgent) ? "android" : undefined
}

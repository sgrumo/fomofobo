import type { MapsProvider } from "domain/directions-url"
import type { PlatformOSType } from "react-native"

interface MapsAppCandidate {
    provider: MapsProvider
    // URL whose support tells the app is installed; none for an app the device always opens
    probeUrl: string | undefined
}

// The schemes of the probe URLs are in `LSApplicationQueriesSchemes` of `app.config.ts`
const IOS_MAPS_APPS: readonly MapsAppCandidate[] = [
    { provider: "apple", probeUrl: undefined },
    { provider: "google", probeUrl: "comgooglemaps://" },
    { provider: "waze", probeUrl: "waze://" },
]

// A link of an app missing from the device opens in the browser
const ANDROID_MAPS_APPS: readonly MapsAppCandidate[] = [
    { provider: "google", probeUrl: undefined },
    { provider: "waze", probeUrl: undefined },
]

/**
 * @description Fetches the maps apps the device offers for directions, in display order
 * @param os Operating system of the device, `Platform.OS`
 * @param canOpenUrl True when the device opens the URL, `Linking.canOpenURL`
 */
export const installedMapsProvidersOf = async (
    os: PlatformOSType,
    canOpenUrl: (url: string) => Promise<boolean>,
): Promise<MapsProvider[]> => {
    const candidates = os === "ios" ? IOS_MAPS_APPS : ANDROID_MAPS_APPS
    const installed = await Promise.all(
        candidates.map(candidate =>
            candidate.probeUrl === undefined
                ? Promise.resolve(true)
                : canOpenUrl(candidate.probeUrl).catch(() => false),
        ),
    )
    return candidates
        .filter((_candidate, index) => installed[index])
        .map(candidate => candidate.provider)
}

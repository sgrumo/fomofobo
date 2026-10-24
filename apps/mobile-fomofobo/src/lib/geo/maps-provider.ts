import type { MapsProvider } from "domain/directions-url"
import type { PlatformOSType } from "react-native"

/**
 * @description Returns the maps app of the device: Apple Maps on iOS, Google Maps elsewhere
 * @param os Operating system of the device, `Platform.OS`
 */
export const mapsProviderOf = (os: PlatformOSType): MapsProvider =>
    os === "ios" ? "apple" : "google"

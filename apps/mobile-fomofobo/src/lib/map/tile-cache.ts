import { OfflineManager } from "@maplibre/maplibre-react-native"

// About 500 vector tiles of OpenFreeMap, the cap of the web cache: the provider allows 3,000 tiles offline
const AMBIENT_CACHE_BYTES = 25 * 1024 * 1024

/**
 * @remarks MapLibre keeps the tiles the map loads in its ambient cache and draws them offline.
 * This caps the cache once, before the first map renders
 */
OfflineManager.setMaximumAmbientCacheSize(AMBIENT_CACHE_BYTES).catch((error: unknown) => {
    console.error("Tile cache size failed:", error)
})

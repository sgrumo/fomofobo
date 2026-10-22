const NETWORK_ONLY_PREFIXES = [
    "/backoffice",
    "/api/backoffice",
    "/api/auth",
    "/api/test",
    "/auth",
]
const NEXT_STATIC_PREFIX = "/_next/static/"
const FALLBACK_IMAGES_PREFIX = "/fallbacks/"
const PUBLIC_DATA_PREFIX = "/api/public/"
const PLACES_PATH = "/api/public/places"
const SEARCH_PATH = "/api/public/occurrences"
const SEARCH_CENTER_KEYS = new Set(["lat", "lng"])
const TILE_HOST = "tiles.openfreemap.org"
const TILEJSON_PATH = "/planet"

/**
 * @description True when the path is a prefix itself or sits under it
 * @param pathname Path tested
 * @param prefix Path prefix, with no trailing slash
 */
const isUnder = (pathname: string, prefix: string): boolean =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)

/**
 * @description True when the service worker leaves a same-origin request to the network: the backoffice, its API, the auth handlers and the test routes
 * @param pathname Path of the request
 */
export const isNetworkOnlyPath = (pathname: string): boolean =>
    NETWORK_ONLY_PREFIXES.some(prefix => isUnder(pathname, prefix))

/**
 * @description True when the path is a generated fallback image of an event with no photo
 * @param pathname Path of the request
 */
export const isFallbackImagePath = (pathname: string): boolean =>
    pathname.startsWith(FALLBACK_IMAGES_PREFIX)

/**
 * @description True when the path is a hashed build file of Next
 * @param pathname Path of the request
 */
export const isNextStaticPath = (pathname: string): boolean =>
    pathname.startsWith(NEXT_STATIC_PREFIX)

/**
 * @description True when the request asks for a page: a navigation, or the copy of the open page that the window asks the worker to keep
 * @param request Request tested
 */
export const isPageRequest = (request: Request): boolean =>
    request.destination === "document" ||
    (request.headers.get("accept")?.startsWith("text/html") ?? false)

/**
 * @description True when the path is a public API read the worker caches, the place search aside
 * @param pathname Path of the request
 */
export const isPublicDataPath = (pathname: string): boolean =>
    pathname.startsWith(PUBLIC_DATA_PREFIX) && !isUnder(pathname, PLACES_PATH)

/**
 * @description True when the path is the occurrence search of the map
 * @param pathname Path of the request
 */
export const isSearchPath = (pathname: string): boolean => pathname === SEARCH_PATH

/**
 * @description Returns the search URL with no center, so two searches with the same filters share one key
 * @param url Search URL
 */
export const searchFiltersKey = (url: URL): string => {
    const filters = new URLSearchParams(
        [...url.searchParams].filter(([name]) => !SEARCH_CENTER_KEYS.has(name)),
    )
    filters.sort()
    return `${url.origin}${url.pathname}?${filters.toString()}`
}

/**
 * @description True when the URL is a map tile or a glyph range of the tile provider
 * @param url Request URL
 */
export const isMapTileUrl = (url: URL): boolean =>
    url.hostname === TILE_HOST && url.pathname !== TILEJSON_PATH

/**
 * @description True when the URL is the TileJSON of the tile provider, which names the current tile version
 * @param url Request URL
 */
export const isTileJsonUrl = (url: URL): boolean =>
    url.hostname === TILE_HOST && url.pathname === TILEJSON_PATH

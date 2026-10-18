import type {
    PrecacheEntry,
    RuntimeCaching,
    SerwistGlobalConfig,
    SerwistPlugin,
} from "serwist"
import {
    CacheFirst,
    CacheableResponsePlugin,
    ExpirationPlugin,
    NetworkFirst,
    Serwist,
} from "serwist"

import {
    isMapTileUrl,
    isNetworkOnlyPath,
    isNextStaticPath,
    isPageRequest,
    isPublicDataPath,
    isSearchPath,
    isTileJsonUrl,
    searchFiltersKey,
} from "../lib/pwa/request-rules"

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: Array<PrecacheEntry | string> | undefined
    }
}

// Path of the offline page of each language, written by the route that builds the worker
declare const OFFLINE_PAGES: Record<string, string>
// Paths of the precached pages, written by the same route
declare const SHELL_PAGES: string[]

declare const self: ServiceWorkerGlobalScope

const DAY_SECONDS = 24 * 60 * 60
const LAST_SEARCH_CACHE = "last-search"
// Stays under the 3,000 tiles and 50 MB of one OpenFreeMap offline download
const MAX_CACHED_TILES = 500
const NEXT_STATIC_URL = /\/_next\/static\/[^"'\s\\)]+/gu

/**
 * @description Builds the expiration plugin of one runtime cache
 * @param maxEntries Entries kept, oldest used first out
 * @param maxAgeDays Days an entry lives after its last use
 */
const expiration = (maxEntries: number, maxAgeDays: number) =>
    new ExpirationPlugin({
        maxEntries,
        maxAgeSeconds: maxAgeDays * DAY_SECONDS,
        maxAgeFrom: "last-used",
        purgeOnQuotaError: true,
    })

/**
 * @description Caches every Next build file that the page names, so the page hydrates offline
 * @param html Markup of the page
 * @param event Event that keeps the worker alive while the files load
 */
const cachePageFiles = async (html: string, event: ExtendableEvent) => {
    const urls = new Set(html.match(NEXT_STATIC_URL))
    await Promise.allSettled(
        [...urls].map(
            url =>
                serwist.handleRequest({
                    request: new Request(new URL(url, self.location.origin)),
                    event,
                }) ?? Promise.resolve(undefined),
        ),
    )
}

// A cached page brings its chunks along: a page cached in the background never ran them.
const pageFilesPlugin: SerwistPlugin = {
    cacheDidUpdate: async ({ newResponse, event }) => {
        await cachePageFiles(await newResponse.text(), event)
    },
}

// Keys a page by its path: the map page renders one shell for every query.
const pageKeyPlugin: SerwistPlugin = {
    cacheKeyWillBeUsed: ({ request }) => {
        const url = new URL(request.url)
        return `${url.origin}${url.pathname}`
    },
}

// Keeps the last search that answered, and serves it offline to a search with the same filters at another center.
const lastSearchPlugin: SerwistPlugin = {
    fetchDidSucceed: async ({ request, response }) => {
        if (response.ok) {
            const cache = await caches.open(LAST_SEARCH_CACHE)
            const stored = await cache.keys()
            await Promise.all(stored.map(key => cache.delete(key)))
            await cache.put(searchFiltersKey(new URL(request.url)), response.clone())
        }
        return response
    },
    handlerDidError: async ({ request }) => {
        const cache = await caches.open(LAST_SEARCH_CACHE)
        return cache.match(searchFiltersKey(new URL(request.url)))
    },
}

const runtimeCaching: RuntimeCaching[] = [
    // Hashed file names: a deploy never changes the content behind one URL.
    {
        matcher: ({ sameOrigin, url }) => sameOrigin && isNextStaticPath(url.pathname),
        handler: new CacheFirst({
            cacheName: "next-static",
            plugins: [
                new CacheableResponsePlugin({ statuses: [200] }),
                expiration(300, 30),
            ],
        }),
    },
    {
        matcher: ({ request, sameOrigin, url }) =>
            sameOrigin && isPageRequest(request) && !isNetworkOnlyPath(url.pathname),
        handler: new NetworkFirst({
            cacheName: "public-pages",
            plugins: [pageKeyPlugin, pageFilesPlugin, expiration(100, 30)],
        }),
    },
    {
        matcher: ({ sameOrigin, url }) => sameOrigin && isSearchPath(url.pathname),
        handler: new NetworkFirst({
            cacheName: "public-searches",
            plugins: [lastSearchPlugin, expiration(50, 7)],
        }),
    },
    {
        matcher: ({ sameOrigin, url }) => sameOrigin && isPublicDataPath(url.pathname),
        handler: new NetworkFirst({
            cacheName: "public-data",
            plugins: [expiration(200, 30)],
        }),
    },
    {
        matcher: ({ url }) => isTileJsonUrl(url),
        handler: new NetworkFirst({
            cacheName: "map-tilejson",
            plugins: [expiration(1, 30)],
        }),
    },
    {
        matcher: ({ url }) => isMapTileUrl(url),
        handler: new CacheFirst({
            cacheName: "map-tiles",
            plugins: [
                new CacheableResponsePlugin({ statuses: [200] }),
                expiration(MAX_CACHED_TILES, 30),
            ],
        }),
    },
    // After the tile rules, the one other host is the public photos bucket. Its CORS rule allows uploads alone, so the
    // responses are opaque: each one weighs megabytes of quota, hence the low cap.
    {
        matcher: ({ sameOrigin }) => !sameOrigin,
        handler: new CacheFirst({
            cacheName: "event-photos",
            plugins: [
                new CacheableResponsePlugin({ statuses: [0, 200] }),
                expiration(60, 30),
            ],
        }),
    },
]

const serwist = new Serwist({
    // oxlint-disable-next-line eslint/no-underscore-dangle -- injection point of Serwist
    precacheEntries: self.__SW_MANIFEST,
    // A new worker waits until the Visitor accepts the reload prompt.
    skipWaiting: false,
    clientsClaim: true,
    runtimeCaching,
    fallbacks: {
        entries: Object.entries(OFFLINE_PAGES).map(([language, url]) => ({
            url,
            matcher: ({ request }) =>
                request.destination === "document" &&
                new URL(request.url).pathname.split("/")[1] === language,
        })),
    },
})

// The precached pages hydrate offline only with their chunks, which no page may have loaded yet.
self.addEventListener("install", event => {
    event.waitUntil(
        Promise.allSettled(
            SHELL_PAGES.map(async url => {
                const response = await fetch(url)
                await cachePageFiles(await response.text(), event)
            }),
        ),
    )
})

serwist.addEventListeners()

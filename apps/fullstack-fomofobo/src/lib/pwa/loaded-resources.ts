import { isNetworkOnlyPath, isNextStaticPath, isPublicDataPath } from "./request-rules"

const PAGE_REQUEST_INIT = { headers: { accept: "text/html" } }

interface LoadedResource {
    name: string
    initiatorType: string
}

/**
 * @description Builds the `CACHE_URLS` entries of what the page loaded before the worker controlled it: the page, its chunks, its public reads and its photos
 * @param pageUrl URL of the open page
 * @param resources Resource timing entries of the page
 */
export const loadedResourceEntries = (
    pageUrl: URL,
    resources: LoadedResource[],
): Array<string | [string, RequestInit]> => {
    const urls = resources.flatMap(resource => {
        const url = new URL(resource.name)
        const keep =
            url.origin === pageUrl.origin
                ? isNextStaticPath(url.pathname) || isPublicDataPath(url.pathname)
                : resource.initiatorType === "img"
        return keep ? [url.href] : []
    })
    const page: Array<[string, RequestInit]> = isNetworkOnlyPath(pageUrl.pathname)
        ? []
        : [[pageUrl.href, PAGE_REQUEST_INIT]]
    return [...page, ...new Set(urls)]
}

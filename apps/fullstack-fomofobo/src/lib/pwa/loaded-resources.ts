import { isNetworkOnlyPath, isNextStaticPath, isPublicDataPath } from "./request-rules"

const PAGE_REQUEST_INIT = { headers: { accept: "text/html" } }
// The same request as the `<img>` that loaded the photo
const PHOTO_REQUEST_INIT: RequestInit = { mode: "no-cors" }

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
    const sameOrigin = resources.flatMap(resource => {
        const url = new URL(resource.name)
        return url.origin === pageUrl.origin &&
            (isNextStaticPath(url.pathname) || isPublicDataPath(url.pathname))
            ? [url.href]
            : []
    })
    const photos = new Set(
        resources.flatMap(resource =>
            new URL(resource.name).origin !== pageUrl.origin &&
            resource.initiatorType === "img"
                ? [resource.name]
                : [],
        ),
    )
    const page: Array<[string, RequestInit]> = isNetworkOnlyPath(pageUrl.pathname)
        ? []
        : [[pageUrl.href, PAGE_REQUEST_INIT]]
    return [
        ...page,
        ...new Set(sameOrigin),
        ...Array.from(photos, (url): [string, RequestInit] => [url, PHOTO_REQUEST_INIT]),
    ]
}

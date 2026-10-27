/**
 * @description Builds the URL of an API path on the app origin
 * @param baseUrl Origin of the app
 * @param path Path of the endpoint with its query, such as `/api/backoffice/events?page=2`
 * @throws When the path is outside `/api/`
 */
export const apiUrlOf = (baseUrl: string, path: string): URL => {
    if (!path.startsWith("/api/")) {
        throw new Error(`${path} is not an API path: it must start with /api/`)
    }
    return new URL(path, baseUrl)
}

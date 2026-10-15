import "server-only"
import { Result } from "shared/result"

/**
 * @description True when the request comes from a page of this application
 * @param request Request read
 * @remarks Compares the `Origin` with the host the request names, instead of with a
 * configured origin, so the check holds behind a proxy and on every environment
 * @remarks Reads a request without an `Origin` as same-origin: a browser sends the
 * header on every cross-site call, and these routes answer no other caller
 */
export const isSameOrigin = (request: Request): boolean => {
    const origin = request.headers.get("Origin")
    if (origin === null) {
        return true
    }

    const host = request.headers.get("Host")
    const originHost = Result.try(() => new URL(origin).host)
    return originHost.success && host !== null && originHost.value === host
}

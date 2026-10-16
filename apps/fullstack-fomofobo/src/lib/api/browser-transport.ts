import type { ApiMethod, ApiRequest } from "api-client/client"
import { HttpStatus } from "models"

import { apiAction } from "@/actions/api-action"

import { clientTransport } from "./client-transport"
import { redirectToLogin } from "./login-redirect"
import { ApiTransportError } from "./transport-error"

/**
 * Methods the browser can send to the API over HTTP.
 *
 * Next routes a request to this app only when its method is one the App Router
 * knows, and `QUERY` is not one of them: it answers `400` before the request ever
 * reaches Hono. A route declared with `method: "query"` therefore travels through
 * an action, which dispatches in process and bypasses Next routing entirely.
 */
const httpMethods: ReadonlySet<ApiMethod> = new Set<ApiMethod>(["get"])

/**
 * @description Sends the request the way its method allows
 * @param request Method, path, query and body of the call
 * @throws When the API answers outside the `2xx` range
 */
const dispatch = async (request: ApiRequest): Promise<unknown> => {
    if (httpMethods.has(request.method)) {
        return await clientTransport(request)
    }

    const result = await apiAction(request)
    if (result.outcome === "error") {
        throw new ApiTransportError(result.message, {
            status: result.status,
            apiError: result.apiError,
        })
    }

    return result.data
}

/**
 * @description True when the failure is the API refusing the session
 * @param error Failure the dispatch raised
 */
const isUnauthenticated = (error: unknown): boolean =>
    error instanceof ApiTransportError && error.status === HttpStatus.Unauthorized

/**
 * @description Sends the request, and sends the browser to the login page when the API refuses the session
 * @param request Method, path, query and body of the call
 * @throws When the API answers outside the `2xx` range
 * @remarks Routes a plain read over same-origin HTTP. Everything else goes through a
 * Server Action: a change, because it must, and a `QUERY` read, because Next rejects
 * that method
 * @remarks Retries nothing on a `401`: a database session has no refresh, so a refused
 * session is over
 */
export const browserTransport = async (request: ApiRequest): Promise<unknown> => {
    try {
        return await dispatch(request)
    } catch (error) {
        if (isUnauthenticated(error)) {
            redirectToLogin()
        }
        throw error
    }
}

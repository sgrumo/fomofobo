"use server"

import type { ApiRequest } from "api-client/client"
import { logger } from "backend-shared"
import { serializeError } from "backend-shared/http"

import type { ApiActionResult } from "@/lib/api/api-action-result"
import { serverTransport } from "@/lib/api/server/transport"
import { ApiTransportError } from "@/lib/api/transport-error"

/**
 * @description Sends one API request from the browser through the server
 * @param request Method, path, query and body of the call
 * @remarks Wraps the **transport**, not one endpoint, so `api-client` keeps owning every
 * endpoint, its cache key and the invalidation of its mutation options
 * @remarks Returns a failure instead of throwing one. React rebuilds a thrown Server
 * Action error as a bare `Error`, which loses the status and the body the toast reads
 * @remarks Serves mutations and the `QUERY` reads Next cannot route. Client-invoked
 * Server Actions run serially, so a plain read uses `clientTransport` instead
 */
export const apiAction = async (request: ApiRequest): Promise<ApiActionResult> => {
    try {
        return { outcome: "ok", data: await serverTransport(request) }
    } catch (error) {
        if (error instanceof ApiTransportError) {
            return {
                outcome: "error",
                status: error.status,
                apiError: error.apiError,
                message: error.message,
            }
        }

        // The browser cannot see this one, so the server keeps the detail.
        logger.error("Unhandled action error", { error: serializeError(error) })
        return {
            outcome: "error",
            status: 0,
            apiError: undefined,
            message: "The request failed before it reached the API",
        }
    }
}

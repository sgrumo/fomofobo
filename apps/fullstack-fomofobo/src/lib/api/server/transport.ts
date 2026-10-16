import "server-only"
import type { ApiRequest } from "api-client/client"
import { Result } from "shared/result"

import { getApi } from "@/server/api"
import { getSessionCookieHeader } from "@/server/auth/session"

import { buildQueryString } from "../client-transport"
import { buildTransportError } from "../transport-error"

/** Host of the in-process dispatch. No socket opens, so the value never leaves here. */
const dispatchHost = "http://api.internal"

export interface ApiDispatcher {
    request: (input: string, init?: RequestInit) => Promise<Response> | Response
}

/**
 * @description Sends the request into an application and parses its answer
 * @param api Application the request is dispatched into
 * @param request Method, path, query and body of the call
 * @param options Session cookies forwarded to the API, when the caller holds them
 * @throws When the application answers outside the `2xx` range
 */
export const dispatchToApi = async (
    api: ApiDispatcher,
    request: ApiRequest,
    options?: { cookie?: string },
): Promise<unknown> => {
    const headers = {
        ...(request.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(options?.cookie === undefined ? {} : { Cookie: options.cookie }),
    }

    const response = await api.request(
        new URL(
            `${request.path}${buildQueryString(request.query)}`,
            dispatchHost,
        ).toString(),
        {
            method: request.method.toUpperCase(),
            headers,
            body: request.body === undefined ? undefined : JSON.stringify(request.body),
        },
    )

    const body = await Result.tryAsync((): Promise<unknown> => response.json())
    const parsed = body.success ? body.value : undefined

    if (!response.ok) {
        throw buildTransportError(response.status, parsed)
    }

    return parsed
}

/**
 * @description Dispatches the request into the Hono application, inside this process
 * @param request Method, path, query and body of the call
 * @throws When the API answers outside the `2xx` range
 * @remarks Runs on the server only. It opens no socket, so a Server Component and a
 * Server Action both reach the API with no network hop and with no base URL to resolve
 * @remarks Forwards the session cookies of the request, so the API identifies the
 * visitor on a prefetch and inside a Server Action exactly as it does over HTTP
 */
export const serverTransport = async (request: ApiRequest): Promise<unknown> =>
    await dispatchToApi(getApi(), request, { cookie: await getSessionCookieHeader() })

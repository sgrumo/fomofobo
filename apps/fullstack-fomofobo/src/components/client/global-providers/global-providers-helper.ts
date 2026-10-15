import type { Mutation, Query } from "@tanstack/react-query"
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { isBrowser, memoize } from "es-toolkit"
import { match, P } from "ts-pattern"
import type { UiTranslate } from "ui-components/i18n"
import { createToastManager } from "ui-components/toast"
import { ZodError } from "zod"

import { ApiTransportError } from "@/lib/api/transport-error"
import { queryClientDefaultOptions } from "@/lib/query/query-client-options"

/**
 * @remarks Holds the key itself until `GlobalProviders` mounts and sets the `ui` translator of
 * its `i18next` instance. `createToastManager` reads `t` on every toast
 */
export const globalToastTranslation: { t: UiTranslate } = { t: key => key }

export const globalToastManager = createToastManager(globalToastTranslation)

/**
 * @description Adds an error toast matching the error kind
 * @param error Error raised by the request
 * @param request Query or mutation that failed
 * @remarks Matches `ApiTransportError`, which both transports of this app raise. A
 * transport that answered no `ApiError` body reports the status alone
 */
const onError = (
    error: unknown,
    request:
        | {
              type: "query"
              query: Query<unknown, unknown, unknown>
          }
        | {
              type: "mutation"
              mutation: Mutation<unknown, unknown, unknown>
          },
) => {
    match({ error, request })
        .with({ error: P.instanceOf(ApiTransportError) }, ({ error: transportError }) => {
            globalToastManager.add({
                type: "error",
                error: {
                    type: "api",
                    unknown: false,
                    status: transportError.status,
                    messages: [transportError.message],
                },
            })
        })
        .with({ error: P.instanceOf(ZodError) }, ({ error: zodError }) => {
            globalToastManager.add({
                type: "error",
                error: { type: "api-validation", zodError },
            })
        })
        .otherwise(() => {
            globalToastManager.add({
                type: "error",
                error: {
                    type: "api",
                    unknown: true,
                },
            })
        })
}

/**
 * @description Builds the query client of the browser
 */
const buildQueryClient = (): QueryClient =>
    new QueryClient({
        defaultOptions: queryClientDefaultOptions,
        queryCache: new QueryCache({
            onError: (error, query) => {
                onError(error, { type: "query", query })
            },
        }),
        mutationCache: new MutationCache({
            onError: (error, _1, _2, mutation) => {
                onError(error, { type: "mutation", mutation })
            },
        }),
    })

const getBrowserQueryClient = memoize(buildQueryClient)

/**
 * @description Returns the query client of the current environment
 * @remarks Keeps one client per browser session, so a navigation reuses the cache the
 * hydration filled
 * @remarks Builds a **new** client on every server render. The provider is a client
 * component, so it also renders during SSR, and a shared client there would put the data
 * of one visitor into the HTML of the next
 */
export const getQueryClient = (): QueryClient =>
    // `typeof window`, not the `isServer` of the library: that export is deprecated and
    // its replacement is not re-exported by the React package.
    isBrowser() ? getBrowserQueryClient() : buildQueryClient()

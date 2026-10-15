import { HttpStatus } from "models"
import { Result } from "shared/result"

import { routeHandlers } from "@/framework/routes/routes"

/** Refresh in flight, shared by every call that met a `401` at the same time. */
let pendingRefresh: Promise<boolean> | undefined = undefined

/**
 * @description Rotates the session tokens, one call at a time
 * @remarks Shares one request between every caller that arrives while it runs. A page
 * runs several queries at once, and each one meets the same `401`: without this, every
 * one of them would send its own refresh and the provider would reject all but the first
 */
export const refreshSession = async (): Promise<boolean> => {
    pendingRefresh ??= (async (): Promise<boolean> => {
        const response = await Result.tryAsync(() =>
            fetch(routeHandlers.authRefresh.path({ parameters: {} }), { method: "POST" }),
        )
        return response.success && response.value.status === HttpStatus.NoContent
    })().finally(() => {
        pendingRefresh = undefined
    })

    return await pendingRefresh
}

/**
 * @description Sends the browser to the provider, keeping the current path
 * @remarks Replaces the entry instead of pushing one, so `Back` does not land on a page
 * the visitor cannot read
 */
export const redirectToLogin = (): void => {
    const returnTo = `${globalThis.location.pathname}${globalThis.location.search}`
    globalThis.location.replace(
        `${routeHandlers.authLogin.path({ parameters: {} })}?returnTo=${encodeURIComponent(returnTo)}`,
    )
}

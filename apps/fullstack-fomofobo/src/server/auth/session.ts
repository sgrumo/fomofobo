import "server-only"
import type { Account } from "models"
import { headers } from "next/headers"
import { cache } from "react"

import { getContainer } from "../container"

/**
 * @description Fetches the account of the request session, absent when nobody is signed in
 * @throws When the environment misses a variable of its `APP_ENV` variant
 * @remarks Reads the session row of the database once per request, so a revoked session
 * or a block applies on the next page, where a blocked account reads as signed out
 * @remarks Never extends the session: a Server Component cannot write the cookie, and
 * the API extends it on the next backoffice call
 */
export const getSession = cache(async (): Promise<Account | undefined> => {
    const account = await getContainer().authAccounts.readSession(await headers(), {
        refresh: false,
    })
    return account === null || account.isBlocked ? undefined : account
})

/**
 * @description Returns the session cookies of the request, for a call to the API
 * @remarks Forwards the whole `Cookie` header: the auth library names its cookies, and
 * the API reads them as the browser sent them
 */
export const getSessionCookieHeader = async (): Promise<string | undefined> => {
    const requestHeaders = await headers()
    return requestHeaders.get("cookie") ?? undefined
}

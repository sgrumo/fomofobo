import "server-only"
import { accountRoleSchema } from "models"
import type { AccountRole } from "models"
import { headers } from "next/headers"
import { cache } from "react"

import { getContainer } from "../container"

export interface Session {
    accountId: string
    name: string
    email: string
    role: AccountRole
}

/**
 * @description Fetches the session of the request, absent when nobody is signed in
 * @throws When the environment misses a variable of its `APP_ENV` variant
 * @remarks Reads the session row of the database once per request, so a revoked session
 * or a block applies on the next page, where a blocked account reads as signed out
 */
export const getSession = cache(async (): Promise<Session | undefined> => {
    const result = await getContainer().auth.api.getSession({ headers: await headers() })
    if (result === null || result.user.isBlocked) {
        return undefined
    }

    return {
        accountId: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: accountRoleSchema.parse(result.user.role),
    }
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

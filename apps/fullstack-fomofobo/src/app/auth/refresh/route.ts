import { logger } from "backend-shared"
import { serializeError } from "backend-shared/http"
import { HttpStatus } from "models"
import { NextResponse } from "next/server"
import { refreshTokenGrant } from "openid-client"
import { Result } from "shared/result"

import { getOidcSetup } from "@/server/auth/oidc-config"
import { isSameOrigin } from "@/server/auth/same-origin"
import { getRefreshToken, writeSessionCookies } from "@/server/auth/session"

// Reads and writes the session cookies of the request.
export const dynamic = "force-dynamic"

/**
 * @description Rotates the tokens of the session
 * @param request Request of the browser
 * @remarks Answers `401` on a refused refresh and **keeps** the cookies. Two tabs that
 * meet a `401` together send two grants with one refresh token; a rotating provider
 * refuses the second, and a deletion here would wipe the tokens the first one just
 * wrote, for both tabs. The browser goes to the login on the `401` either way, and
 * the callback overwrites whatever is left
 * @remarks Answers `503` when the provider itself is unreachable, so the browser reads
 * an outage and not a dead session
 * @remarks Runs on a `401` from the API, never on a timer. There is no middleware to
 * hold one, and a Vercel deploy bills every middleware invocation apart
 */
export const POST = async (request: Request): Promise<Response> => {
    if (!isSameOrigin(request)) {
        return new NextResponse(null, { status: HttpStatus.Forbidden })
    }

    const refreshToken = await getRefreshToken()
    if (refreshToken === undefined) {
        return new NextResponse(null, { status: HttpStatus.Unauthorized })
    }

    const setup = await Result.tryAsync(() => getOidcSetup())
    if (!setup.success) {
        logger.error("The OpenID provider is unreachable at refresh", {
            error: serializeError(setup.error),
        })
        return new NextResponse(null, { status: HttpStatus.ServiceUnavailable })
    }

    const tokens = await Result.tryAsync(() =>
        refreshTokenGrant(setup.value.configuration, refreshToken),
    )
    if (!tokens.success) {
        logger.error("Token refresh failed", { error: serializeError(tokens.error) })
        return new NextResponse(null, { status: HttpStatus.Unauthorized })
    }

    const response = new NextResponse(null, { status: HttpStatus.NoContent })
    writeSessionCookies(response, {
        accessToken: tokens.value.access_token,
        // A provider that rotates its refresh tokens sends a new one. One that does
        // not sends none, and the cookie in place stays valid.
        refreshToken: tokens.value.refresh_token,
        idToken: tokens.value.id_token,
    })
    return response
}

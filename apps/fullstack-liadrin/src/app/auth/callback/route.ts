import { logger } from "backend-shared"
import { serializeError } from "backend-shared/http"
import { defaultLanguage } from "i18n/i18n"
import { NextResponse } from "next/server"
import { authorizationCodeGrant } from "openid-client"
import { Result } from "shared/result"

import { routeHandlers, routes } from "@/framework/routes/routes"
import { getOidcSetup } from "@/server/auth/oidc-config"
import { sanitizeReturnPath } from "@/server/auth/return-path"
import { clearLoginFlow, readLoginFlow, writeSessionCookies } from "@/server/auth/session"

// Reads the cookies of the round trip and writes the session cookies.
export const dynamic = "force-dynamic"

/**
 * @description Exchanges the authorization code and opens the session
 * @param request Request the provider sent the visitor back with
 * @remarks Rebuilds the callback URL from `APP_BASE_URL` and keeps only the query of
 * the request. Behind a proxy the app reads its internal host, which matches no
 * registered redirect URI
 * @remarks Restarts the login when the flow cookie is gone: the visitor spent longer
 * at the provider than the cookie lives, and a second round trip ends at once, because
 * the provider holds a session by now. A browser that stores no cookie at all loops
 * through the provider until it stops the chain itself
 * @remarks Ends a failed exchange at the root instead of raising a `500`. A denied
 * consent and an expired code are both normal answers, and the root is public
 */
export const GET = async (request: Request): Promise<Response> => {
    const setup = await Result.tryAsync(() => getOidcSetup())
    if (!setup.success) {
        logger.error("The OpenID provider is unreachable at the callback", {
            error: serializeError(setup.error),
        })
        return NextResponse.redirect(
            new URL(
                routes.root.path({ parameters: { lang: defaultLanguage }, query: {} }),
                request.url,
            ),
        )
    }

    const { baseUrl, configuration, redirectUri } = setup.value
    const root = new URL(
        routes.root.path({ parameters: { lang: defaultLanguage }, query: {} }),
        baseUrl,
    )

    const flow = await readLoginFlow()
    if (flow === undefined) {
        return NextResponse.redirect(
            new URL(routeHandlers.authLogin.path({ parameters: {} }), baseUrl),
        )
    }

    const currentUrl = new URL(`${redirectUri}${new URL(request.url).search}`)
    const tokens = await Result.tryAsync(() =>
        authorizationCodeGrant(configuration, currentUrl, {
            pkceCodeVerifier: flow.verifier,
            expectedState: flow.state,
        }),
    )

    if (!tokens.success) {
        logger.error("Authorization code exchange failed", {
            error: serializeError(tokens.error),
        })
        const failed = NextResponse.redirect(root)
        clearLoginFlow(failed)
        return failed
    }

    // Sanitized again on the way out: the cookie is `HttpOnly`, and a planted one
    // would otherwise pick where a signed-in visitor lands.
    const returnTo = sanitizeReturnPath(flow.returnTo, baseUrl)
    const response = NextResponse.redirect(new URL(returnTo, baseUrl))
    writeSessionCookies(response, {
        accessToken: tokens.value.access_token,
        refreshToken: tokens.value.refresh_token,
        idToken: tokens.value.id_token,
    })
    clearLoginFlow(response)
    return response
}

import { logger } from "backend-shared"
import { serializeError } from "backend-shared/http"
import { defaultLanguage } from "i18n/i18n"
import { NextResponse } from "next/server"
import {
    buildAuthorizationUrl,
    calculatePKCECodeChallenge,
    randomPKCECodeVerifier,
    randomState,
} from "openid-client"
import { Result } from "shared/result"

import { routes } from "@/framework/routes/routes"
import { getOidcSetup } from "@/server/auth/oidc-config"
import { sanitizeReturnPath } from "@/server/auth/return-path"
import { writeLoginFlow } from "@/server/auth/session"

// Mints a verifier and a state per call, and writes a cookie. Nothing here is
// ever the same twice, so the route must never prerender.
export const dynamic = "force-dynamic"

/**
 * @description Starts the login and sends the visitor to the provider
 * @param request Request carrying the `returnTo` of the guard or of the browser
 * @remarks Keeps the PKCE verifier and the `state` in a cookie, never in the URL: the
 * callback is what proves it started this flow, and the provider never sees either
 * @remarks Writes the cookie on the redirect it returns. `redirect()` of
 * `next/navigation` drops whatever `cookies()` holds, and the flow would then end at
 * the callback with nothing to check the answer of the provider against
 * @remarks Ends at the root, with the cause logged, when the provider metadata is
 * unreachable. A bare `500` would tell the visitor nothing and the log even less
 */
export const GET = async (request: Request): Promise<Response> => {
    const setup = await Result.tryAsync(() => getOidcSetup())
    if (!setup.success) {
        logger.error("The OpenID provider is unreachable at login", {
            error: serializeError(setup.error),
        })
        return NextResponse.redirect(
            new URL(
                routes.root.path({ parameters: { lang: defaultLanguage }, query: {} }),
                request.url,
            ),
        )
    }

    const verifier = randomPKCECodeVerifier()
    const codeChallenge = await calculatePKCECodeChallenge(verifier)
    const state = randomState()
    const returnTo = sanitizeReturnPath(
        new URL(request.url).searchParams.get("returnTo"),
        setup.value.baseUrl,
    )

    const authorizationUrl = buildAuthorizationUrl(setup.value.configuration, {
        redirect_uri: setup.value.redirectUri,
        scope: setup.value.scope,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state,
        // Several providers mint the access token for the API named here. One that
        // does not know the parameter ignores it.
        audience: setup.value.audience,
    })

    const response = NextResponse.redirect(authorizationUrl.href)
    writeLoginFlow(response, { verifier, state, returnTo })
    return response
}

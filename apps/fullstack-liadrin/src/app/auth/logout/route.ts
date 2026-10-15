import { defaultLanguage } from "i18n/i18n"
import { HttpStatus } from "models"
import { NextResponse } from "next/server"
import { buildEndSessionUrl } from "openid-client"
import { Result } from "shared/result"

import { routes } from "@/framework/routes/routes"
import { getOidcSetup } from "@/server/auth/oidc-config"
import { isSameOrigin } from "@/server/auth/same-origin"
import { clearSessionCookies, getIdToken } from "@/server/auth/session"

// Clears the session cookies of the request.
export const dynamic = "force-dynamic"

/**
 * Status of every redirect this route answers.
 *
 * `303`, not the `307` default: the sign-out arrives as a form `POST`, and a `307`
 * replays that `POST` at the end-session endpoint of the provider. Several
 * providers serve that endpoint on `GET` alone, and the provider session would
 * survive.
 */
const seeOther = 303

/**
 * @description Ends the session here, then at the provider
 * @param request Request of the browser
 * @remarks Answers `POST` from this origin alone. A `GET` logout follows any image a
 * third-party page embeds, and a cross-site `POST` lands its deletion cookies on a
 * top-level navigation, which the browser honors: either one signs the visitor out
 * from a page they never opened
 * @remarks Ends at the root when the provider publishes no end-session endpoint, or
 * cannot be reached. The cookies are gone at that point either way
 */
export const POST = async (request: Request): Promise<Response> => {
    if (!isSameOrigin(request)) {
        return new NextResponse(null, { status: HttpStatus.Forbidden })
    }

    const idToken = await getIdToken()
    const setup = await Result.tryAsync(() => getOidcSetup())

    if (!setup.success) {
        const local = NextResponse.redirect(
            new URL(
                routes.root.path({ parameters: { lang: defaultLanguage }, query: {} }),
                request.url,
            ),
            seeOther,
        )
        clearSessionCookies(local)
        return local
    }

    // Bare `/`, not the language root: the provider matches the sign-out URL registered in
    // `infra/auth-oidc.md` exactly.
    const root = new URL("/", setup.value.baseUrl)
    const endSessionUrl = Result.try(() =>
        buildEndSessionUrl(setup.value.configuration, {
            post_logout_redirect_uri: root.href,
            ...(idToken === undefined ? {} : { id_token_hint: idToken }),
        }),
    )

    const response = NextResponse.redirect(
        endSessionUrl.success ? endSessionUrl.value : root,
        seeOther,
    )
    clearSessionCookies(response)
    return response
}

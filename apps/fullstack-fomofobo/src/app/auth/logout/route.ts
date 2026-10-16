import { HttpStatus } from "models"
import { NextResponse } from "next/server"
import { Result } from "shared/result"

import { BACKOFFICE_LOGIN_PATH } from "@/lib/auth/return-path"
import { isSameOrigin } from "@/server/auth/same-origin"
import { getContainer } from "@/server/container"

// Ends the session of the request, so the route never prerenders.
export const dynamic = "force-dynamic"

/**
 * Status of the redirect this route answers.
 *
 * `303`, not the `307` default: the sign-out arrives as a form `POST`, and a `307`
 * replays that `POST` at the login page.
 */
const seeOther = 303

/**
 * @description Ends the session, then sends the visitor to the login page
 * @param request Request of the browser
 * @remarks Answers `POST` from this origin alone. A `GET` logout follows any image a
 * third-party page embeds, and a cross-site `POST` lands its deletion cookies on a
 * top-level navigation, which the browser honors: either one signs the visitor out
 * from a page they never opened
 * @remarks Copies the cookie deletions of the auth library onto the redirect, which
 * lands on the login page even with no session left to end
 */
export const POST = async (request: Request): Promise<Response> => {
    if (!isSameOrigin(request)) {
        return new NextResponse(null, { status: HttpStatus.Forbidden })
    }

    const signOut = await Result.tryAsync(() =>
        getContainer().auth.api.signOut({ headers: request.headers, asResponse: true }),
    )

    const response = NextResponse.redirect(
        new URL(BACKOFFICE_LOGIN_PATH, request.url),
        seeOther,
    )
    for (const cookie of signOut.success ? signOut.value.headers.getSetCookie() : []) {
        response.headers.append("Set-Cookie", cookie)
    }
    return response
}

import "server-only"
import { redirect } from "next/navigation"

import { routeHandlers } from "@/framework/routes/routes"

import type { Session } from "./session"
import { getSession } from "./session"

/**
 * @description Returns the session of the request, or sends the visitor to the login
 * @param returnTo Path of the page, which the login round trip ends on
 * @throws When nobody is signed in, through the redirect Next raises
 * @remarks Called by every page of the `(protected)` route group, not by its layout: Next
 * hands a layout no pathname, and the layout would then send the visitor to the login
 * with no way back to the page they asked for
 * @remarks Gates the page, not the data. The API verifies the token of every call on
 * its own, so a page that skips this reads nothing either way
 */
export const requireSession = async (returnTo: string): Promise<Session> => {
    const session = await getSession()
    if (session === undefined) {
        redirect(
            `${routeHandlers.authLogin.path({ parameters: {} })}?returnTo=${encodeURIComponent(returnTo)}`,
        )
    }
    return session
}

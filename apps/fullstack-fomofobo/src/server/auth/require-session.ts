import "server-only"
import { redirect } from "next/navigation"

import { buildLoginPath } from "@/lib/auth/return-path"

import type { Session } from "./session"
import { getSession } from "./session"

/**
 * @description Returns the session of the request, or sends the visitor to the login page
 * @param returnTo Path of the page, which the sign-in ends on
 * @throws When nobody is signed in, through the redirect Next raises
 * @remarks Called by every protected page, not by its layout: Next hands a layout no
 * pathname, and the layout would then send the visitor to the login page with no way
 * back to the page they asked for
 * @remarks Gates the page, not the data. The API checks the session of every
 * backoffice call on its own
 */
export const requireSession = async (returnTo: string): Promise<Session> => {
    const session = await getSession()
    if (session === undefined) {
        redirect(buildLoginPath(returnTo))
    }
    return session
}

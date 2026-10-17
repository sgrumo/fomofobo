import "server-only"
import type { Account } from "models"
import { notFound, redirect } from "next/navigation"

import { buildLoginPath } from "@/lib/auth/return-path"

import { getSession } from "./session"

/**
 * @description Returns the account of the request session, or sends the visitor to the login page
 * @param returnTo Path of the page, which the sign-in ends on
 * @throws When nobody is signed in, through the redirect Next raises
 * @remarks Called by every protected page, not by its layout: Next hands a layout no
 * pathname, and the layout would then send the visitor to the login page with no way
 * back to the page they asked for
 * @remarks Gates the page, not the data. The API checks the session of every
 * backoffice call on its own
 */
export const requireSession = async (returnTo: string): Promise<Account> => {
    const account = await getSession()
    if (account === undefined) {
        redirect(buildLoginPath(returnTo))
    }
    return account
}

/**
 * @description Returns the Admin account of the request session, sends the visitor to the login page, or answers not found to an Organizer
 * @param returnTo Path of the page, which the sign-in ends on
 * @throws When the account is not an Admin, through the not-found error Next raises
 */
export const requireAdminSession = async (returnTo: string): Promise<Account> => {
    const account = await requireSession(returnTo)
    if (account.role !== "admin") {
        notFound()
    }
    return account
}

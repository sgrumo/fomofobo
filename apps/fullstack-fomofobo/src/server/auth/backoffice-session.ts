import "server-only"
import { createMiddleware } from "hono/factory"
import type { Account, AccountRole } from "models"

import type { ClockEnv } from "../clock"
import { appError } from "../errors"
import type { AuthAccountsService } from "../services/auth-accounts-service"

export interface BackofficeEnv {
    Variables: ClockEnv["Variables"] & { account: Account }
}

/**
 * @description Builds the middleware that sets the account of the session on every
 * backoffice call
 * @param authAccounts Session reads and revocations of the auth library
 * @remarks Answers a blocked account with `401` and ends its remaining sessions, so a
 * block signs the account out of every open tab
 */
export const backofficeSession = (
    authAccounts: Pick<AuthAccountsService, "readSession" | "revokeSessions">,
) =>
    createMiddleware<BackofficeEnv>(async (c, next) => {
        const account = await authAccounts.readSession(c.req.raw.headers, {
            refresh: true,
        })
        if (account === null) {
            throw appError("Unauthenticated", "No valid session")
        }
        if (account.isBlocked) {
            await authAccounts.revokeSessions(account.id)
            throw appError("AccountBlocked", "The account is blocked")
        }

        c.set("account", account)
        await next()
    })

/**
 * @description Builds the middleware that refuses an account outside the role
 * @param role Role the route needs
 * @remarks Reads the account that `backofficeSession` sets, so it runs after it
 */
export const requireRole = (role: AccountRole) =>
    createMiddleware<BackofficeEnv>(async (c, next) => {
        if (c.var.account.role !== role) {
            throw appError("ForbiddenAction", `The action needs the ${role} role`)
        }
        await next()
    })

import "server-only"
import type { Account } from "models"

import { appError } from "../errors"
import type { AuthAccountsService } from "../services/auth-accounts-service"

/**
 * @description Fetches the Admin account that an MCP access token names
 * @param authAccounts Account reads and session revocations
 * @param subject `sub` claim of the verified access token
 * @throws When the account is unknown, blocked, or not an Admin
 * @remarks Runs on every call: an access token is a JWT that stays valid until it
 * expires, so a block lands here and not at the token check
 */
export const resolveMcpAccount = async (
    authAccounts: Pick<AuthAccountsService, "findById" | "revokeSessions">,
    subject: string | undefined,
): Promise<Account> => {
    const account = subject === undefined ? null : await authAccounts.findById(subject)
    if (account === null) {
        throw appError("Unauthenticated", "No account for the access token")
    }
    if (account.isBlocked) {
        await authAccounts.revokeSessions(account.id)
        throw appError("AccountBlocked", "The account is blocked")
    }
    if (account.role !== "admin") {
        throw appError("ForbiddenAction", "The action needs the admin role")
    }
    return account
}

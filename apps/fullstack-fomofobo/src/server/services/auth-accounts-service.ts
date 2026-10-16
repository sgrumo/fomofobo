import "server-only"
import type { Account } from "models"
import { accountRoleSchema } from "models"

import type { Auth } from "../auth/auth"

/**
 * @description Maps the user of a library session to its account
 * @param user User of the session the library read
 */
const toAccount = (user: Auth["$Infer"]["Session"]["user"]): Account => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: accountRoleSchema.parse(user.role),
    isBlocked: user.isBlocked,
    createdAt: user.createdAt.toISOString(),
})

export class AuthAccountsService {
    private readonly auth: Auth
    public constructor(auth: Auth) {
        this.auth = auth
    }

    /**
     * @description Fetches the account of the session the request carries, or `null`
     * when it carries none
     * @param headers Headers of the request, its cookies included
     * @param options `refresh` extends a session past its update age
     * @remarks Writes the extended session cookie through the Next cookie store, which a
     * Server Component cannot write, so a page reads with `refresh` off
     */
    public async readSession(
        headers: Headers,
        options: { refresh: boolean },
    ): Promise<Account | null> {
        const result = await this.auth.api.getSession({
            headers,
            query: { disableRefresh: !options.refresh },
        })
        return result === null ? null : toAccount(result.user)
    }

    /**
     * @description Persists the end of every session of the account
     * @param accountId Account signed out
     */
    public async revokeSessions(accountId: string): Promise<void> {
        const context = await this.auth.$context
        await context.internalAdapter.deleteUserSessions(accountId)
    }
}

import "server-only"
import type { Account, AccountRole, OrganizerCreation } from "models"
import { accountRoleSchema } from "models"
import type { AccountsStorage } from "storage"

import type { Auth } from "../auth/auth"
import { appError } from "../errors"

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
    private readonly accountsStorage: AccountsStorage
    public constructor(auth: Auth, accountsStorage: AccountsStorage) {
        this.auth = auth
        this.accountsStorage = accountsStorage
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
        await this.accountsStorage.deleteSessions(accountId)
    }

    /**
     * @description Fetches one account, or `null` when no row matches
     * @param accountId Account read
     */
    public async findById(accountId: string): Promise<Account | null> {
        return await this.accountsStorage.findById(accountId)
    }

    /**
     * @description Persists a new account that signs in with the password of the creation
     * @param creation Name, email and password of the account
     * @param role Role of the account
     */
    public async createAccount(
        creation: OrganizerCreation,
        role: AccountRole,
    ): Promise<Account> {
        const email = creation.email.toLowerCase()
        if ((await this.accountsStorage.findByEmail(email)) !== null) {
            throw appError("EmailTaken", `Email ${email} is taken by another account`)
        }

        const account = {
            id: crypto.randomUUID(),
            name: creation.name,
            email,
            role,
            createdAt: new Date(),
        }
        await this.accountsStorage.createWithPassword(account, {
            id: crypto.randomUUID(),
            passwordHash: await this.hashPassword(creation.password),
        })
        return {
            ...account,
            isBlocked: false,
            createdAt: account.createdAt.toISOString(),
        }
    }

    /**
     * @description Persists a new password of the account and ends its sessions, or
     * returns `null` when no account matches
     * @param accountId Account changed
     * @param password New password, in clear
     */
    public async setPassword(
        accountId: string,
        password: string,
    ): Promise<Account | null> {
        const account = await this.accountsStorage.findById(accountId)
        if (account === null) {
            return null
        }

        await this.accountsStorage.replacePasswordAndEndSessions(
            accountId,
            { id: crypto.randomUUID(), passwordHash: await this.hashPassword(password) },
            new Date(),
        )
        return account
    }

    /**
     * @description Persists the block state of the account, or returns `null` when no
     * account matches
     * @param accountId Account changed
     * @param blocked True to block, which ends every session of the account
     */
    public async setBlocked(
        accountId: string,
        blocked: boolean,
    ): Promise<Account | null> {
        return blocked
            ? await this.accountsStorage.blockAndEndSessions(accountId, new Date())
            : await this.accountsStorage.unblock(accountId, new Date())
    }

    /**
     * @description Returns the hash of the password, with the hasher of the auth library
     * @param password Password, in clear
     */
    private async hashPassword(password: string): Promise<string> {
        const context = await this.auth.$context
        return await context.password.hash(password)
    }
}

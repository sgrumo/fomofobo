import { and, count, desc, eq, or } from "drizzle-orm"
import type { Account, AccountRole, OrganizerListQuery } from "models"

import type { DbInstanceFromSchema } from "../db-config"
import { accounts, authCredentials, authSessions } from "../db-schema"
import { likeContains } from "../utils/like"
import { toLimitOffset } from "../utils/pagination"

const PASSWORD_PROVIDER_ID = "credential"

export interface AccountInsert {
    id: string
    name: string
    email: string
    role: AccountRole
    createdAt: Date
}

export interface PasswordCredentialInsert {
    id: string
    passwordHash: string
}

/**
 * @description Maps an `accounts` row to its model
 * @param row Row read from `accounts`
 */
const toAccount = (row: typeof accounts.$inferSelect): Account => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isBlocked: row.isBlocked,
    createdAt: row.createdAt.toISOString(),
})

/**
 * @description Maps a password credential to its `auth_credentials` row
 * @param accountId Account the credential signs in
 * @param credential Credential inserted, carrying its id and the password hash
 * @param createdAt Instant of the insert
 */
const toPasswordCredentialRow = (
    accountId: string,
    credential: PasswordCredentialInsert,
    createdAt: Date,
): typeof authCredentials.$inferInsert => ({
    id: credential.id,
    accountId,
    providerId: PASSWORD_PROVIDER_ID,
    providerAccountId: accountId,
    password: credential.passwordHash,
    createdAt,
    updatedAt: createdAt,
})

export class AccountsStorage {
    private readonly db: DbInstanceFromSchema
    public constructor(db: DbInstanceFromSchema) {
        this.db = db
    }

    /**
     * @description Fetches one account, or `null` when no row matches
     * @param id Account read
     */
    public async findById(id: string): Promise<Account | null> {
        const [row] = await this.db.select().from(accounts).where(eq(accounts.id, id))
        return row ? toAccount(row) : null
    }

    /**
     * @description Fetches the account of an email, or `null` when no row matches
     * @param email Lower-case email read
     */
    public async findByEmail(email: string): Promise<Account | null> {
        const [row] = await this.db
            .select()
            .from(accounts)
            .where(eq(accounts.email, email))
        return row ? toAccount(row) : null
    }

    /**
     * @description Fetches one page of the organizers, newest first, with the total
     * @param query Page, text searched in name and email, block state
     */
    public async listOrganizers(
        query: OrganizerListQuery,
    ): Promise<{ items: Account[]; total: number }> {
        const whereClause = and(
            eq(accounts.role, "organizer"),
            query.q === undefined
                ? undefined
                : or(
                      likeContains(accounts.name, query.q),
                      likeContains(accounts.email, query.q),
                  ),
            query.isBlocked === undefined
                ? undefined
                : eq(accounts.isBlocked, query.isBlocked),
        )
        const { limit, offset } = toLimitOffset(query)

        const [countResult, rows] = await this.db.batch([
            this.db.select({ value: count() }).from(accounts).where(whereClause),
            this.db
                .select()
                .from(accounts)
                .where(whereClause)
                .orderBy(desc(accounts.createdAt), accounts.id)
                .limit(limit)
                .offset(offset),
        ])
        return { items: rows.map(toAccount), total: countResult[0]?.value ?? 0 }
    }

    /**
     * @description Persists one account and its password credential
     * @param account Account inserted, carrying its id
     * @param credential Credential inserted, carrying its id and the password hash
     */
    public async createWithPassword(
        account: AccountInsert,
        credential: PasswordCredentialInsert,
    ): Promise<void> {
        await this.db.batch([
            this.db.insert(accounts).values({
                id: account.id,
                name: account.name,
                email: account.email,
                role: account.role,
                createdAt: account.createdAt,
                updatedAt: account.createdAt,
            }),
            this.db
                .insert(authCredentials)
                .values(
                    toPasswordCredentialRow(account.id, credential, account.createdAt),
                ),
        ])
    }

    /**
     * @description Persists the new password credential of one account and deletes its
     * sessions
     * @param accountId Account changed
     * @param credential Credential inserted in place of the old one
     * @param changedAt Instant of the change
     * @remarks Fails on the foreign key when no account matches the id
     */
    public async replacePasswordAndEndSessions(
        accountId: string,
        credential: PasswordCredentialInsert,
        changedAt: Date,
    ): Promise<void> {
        await this.db.batch([
            this.db
                .delete(authCredentials)
                .where(
                    and(
                        eq(authCredentials.accountId, accountId),
                        eq(authCredentials.providerId, PASSWORD_PROVIDER_ID),
                    ),
                ),
            this.db
                .insert(authCredentials)
                .values(toPasswordCredentialRow(accountId, credential, changedAt)),
            this.db.delete(authSessions).where(eq(authSessions.accountId, accountId)),
        ])
    }

    /**
     * @description Persists the block of one account and deletes its sessions, or returns
     * `null` when no row matches
     * @param id Account blocked
     * @param blockedAt Instant of the block
     */
    public async blockAndEndSessions(
        id: string,
        blockedAt: Date,
    ): Promise<Account | null> {
        const [[row]] = await this.db.batch([
            this.db
                .update(accounts)
                .set({ isBlocked: true, blockedAt, updatedAt: blockedAt })
                .where(eq(accounts.id, id))
                .returning(),
            this.db.delete(authSessions).where(eq(authSessions.accountId, id)),
        ])
        return row ? toAccount(row) : null
    }

    /**
     * @description Persists the unblock of one account, or returns `null` when no row matches
     * @param id Account unblocked
     * @param unblockedAt Instant of the unblock
     */
    public async unblock(id: string, unblockedAt: Date): Promise<Account | null> {
        const [row] = await this.db
            .update(accounts)
            .set({ isBlocked: false, blockedAt: null, updatedAt: unblockedAt })
            .where(eq(accounts.id, id))
            .returning()
        return row ? toAccount(row) : null
    }

    /**
     * @description Deletes every session of one account
     * @param accountId Account signed out
     */
    public async deleteSessions(accountId: string): Promise<void> {
        await this.db.delete(authSessions).where(eq(authSessions.accountId, accountId))
    }
}

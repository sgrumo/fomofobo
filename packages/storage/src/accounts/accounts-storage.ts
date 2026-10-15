import { and, count, desc, eq, or } from "drizzle-orm"
import type { Account, OrganizerListQuery } from "models"

import type { DbInstanceFromSchema } from "../db-config"
import { accounts } from "../db-schema"
import { likeContains } from "../utils/like"
import { toLimitOffset } from "../utils/pagination"

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
     * @description Persists one account, unblocked
     * @param account Account inserted, carrying its id and lower-case email
     */
    public async insert(
        account: Pick<Account, "id" | "name" | "email" | "role" | "createdAt">,
    ): Promise<void> {
        await this.db.insert(accounts).values({
            id: account.id,
            name: account.name,
            email: account.email,
            role: account.role,
            createdAt: new Date(account.createdAt),
        })
    }

    /**
     * @description Persists the block state of one account, or returns `null` when no row matches
     * @param id Account changed
     * @param blockedAt Instant of the block, `null` to unblock
     */
    public async setBlocked(id: string, blockedAt: Date | null): Promise<Account | null> {
        const [row] = await this.db
            .update(accounts)
            .set({ isBlocked: blockedAt !== null, blockedAt })
            .where(eq(accounts.id, id))
            .returning()
        return row ? toAccount(row) : null
    }
}

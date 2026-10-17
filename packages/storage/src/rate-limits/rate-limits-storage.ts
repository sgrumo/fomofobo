import { sql } from "drizzle-orm"

import type { DbInstanceFromSchema } from "../db-config"
import { rateLimits } from "../db-schema"

export class RateLimitsStorage {
    private readonly db: DbInstanceFromSchema
    public constructor(db: DbInstanceFromSchema) {
        this.db = db
    }

    /**
     * @description Persists one call of the key and returns the count of its calls in the current window
     * @param key Client and action counted
     * @param now Instant of the call
     * @param windowMs Length of a window: a call past it starts a new one at 1
     */
    public async hit(key: string, now: Date, windowMs: number): Promise<number> {
        const expired = sql`${rateLimits.windowStartedAt} <= ${now.getTime() - windowMs}`
        const [row] = await this.db
            .insert(rateLimits)
            .values({ key, windowStartedAt: now, count: 1 })
            .onConflictDoUpdate({
                target: rateLimits.key,
                set: {
                    count: sql`case when ${expired} then 1 else ${rateLimits.count} + 1 end`,
                    windowStartedAt: sql`case when ${expired} then ${now.getTime()} else ${rateLimits.windowStartedAt} end`,
                },
            })
            .returning({ count: rateLimits.count })
        return row?.count ?? 1
    }
}

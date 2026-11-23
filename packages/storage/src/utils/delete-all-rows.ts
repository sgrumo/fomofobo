import { is, sql } from "drizzle-orm"
import { SQLiteTable } from "drizzle-orm/sqlite-core"

import type { DbInstanceFromSchema } from "../db-config"
// oxlint-disable-next-line import/no-namespace -- Drizzle requires a namespace import for schema
import * as schema from "../db-schema"

/**
 * @description Deletes every row of every table of the schema in one batch
 * @param db Database emptied
 * @param keep Tables whose rows stay
 */
export const deleteAllRows = async (
    db: DbInstanceFromSchema,
    keep: readonly SQLiteTable[] = [],
): Promise<void> => {
    const deletes = Object.values(schema)
        .filter(value => is(value, SQLiteTable))
        .filter(table => !keep.includes(table))
        .map(table => db.delete(table))
    await db.batch([db.run(sql`PRAGMA defer_foreign_keys = on`), ...deletes])
}

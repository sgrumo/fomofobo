import { is, sql } from "drizzle-orm"
import { SQLiteTable } from "drizzle-orm/sqlite-core"

import type { DbInstanceFromSchema } from "../db-config"
// oxlint-disable-next-line import/no-namespace -- Drizzle requires a namespace import for schema
import * as schema from "../db-schema"

/**
 * @description Deletes every row of every table of the schema in one batch
 * @param db Database emptied
 */
export const deleteAllRows = async (db: DbInstanceFromSchema): Promise<void> => {
    const deletes = Object.values(schema)
        .filter(value => is(value, SQLiteTable))
        .map(table => db.delete(table))
    await db.batch([db.run(sql`PRAGMA defer_foreign_keys = on`), ...deletes])
}

import type { SQL } from "drizzle-orm"
import { sql } from "drizzle-orm"
import type { SQLiteColumn } from "drizzle-orm/sqlite-core"

/**
 * @description Builds a `LIKE` condition that matches the text anywhere in the column, with its wildcards escaped
 * @param column Column searched
 * @param text Caller text searched
 * @remarks Ignores case for ASCII letters only: SQLite compares `É` and `é` as different
 */
export const likeContains = (column: SQLiteColumn, text: string): SQL =>
    sql`${column} like ${`%${text.replaceAll(/[\\%_]/gu, String.raw`\$&`)}%`} escape '\\'`

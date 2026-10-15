import type { D1Database } from "@cloudflare/workers-types"
import { logger } from "backend-shared"
import { DefaultLogger } from "drizzle-orm"
import type { DrizzleD1Database } from "drizzle-orm/d1"
import { drizzle } from "drizzle-orm/d1"

// oxlint-disable-next-line import/no-namespace -- Drizzle requires a namespace import for schema
import * as schema from "./db-schema"

export type DbInstanceFromSchema = DrizzleD1Database<typeof schema>
export type DbSelect = Pick<DbInstanceFromSchema, "select">

/**
 * @description Builds the Drizzle instance over a D1 binding
 * @param database D1 binding of the request
 * @remarks Silences the query log when `DISABLE_DRIZZLE_LOGS` is `true`
 */
export const buildDbInstance = (database: D1Database): DbInstanceFromSchema => {
    const shouldDisableLogs = process.env.DISABLE_DRIZZLE_LOGS === "true"
    const drizzleLogger = shouldDisableLogs
        ? false
        : new DefaultLogger({
              writer: {
                  write: message => {
                      logger.debug(message)
                  },
              },
          })
    return drizzle(database, { logger: drizzleLogger, schema })
}

import { createClient } from "@libsql/client"
import { logger } from "backend-shared"
import { DefaultLogger } from "drizzle-orm"
import type { LibSQLDatabase } from "drizzle-orm/libsql"
import { drizzle } from "drizzle-orm/libsql"

// oxlint-disable-next-line import/no-namespace -- Drizzle requires a namespace import for schema
import * as schema from "./db-schema"

export type DbInstanceFromSchema = LibSQLDatabase<typeof schema>
export type DbSelect = Pick<DbInstanceFromSchema, "select">

export interface DbConnection {
    url: string
    authToken: string | undefined
}

/**
 * @description Builds the Drizzle instance over a libSQL client
 * @param connection URL and auth token of the database
 * @remarks Opens one client per call: build the instance once per process and share it
 * @remarks Silences the query log when `DISABLE_DRIZZLE_LOGS` is `true`
 */
export const buildDbInstance = (connection: DbConnection): DbInstanceFromSchema => {
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
    return drizzle({
        client: createClient(connection),
        logger: drizzleLogger,
        schema,
    })
}

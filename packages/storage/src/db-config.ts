import { logger } from "backend-shared"
import { DefaultLogger } from "drizzle-orm"
import type { NodePgDatabase } from "drizzle-orm/node-postgres"
import { drizzle } from "drizzle-orm/node-postgres"
import type { PoolConfig } from "pg"
import { Pool } from "pg"

// oxlint-disable-next-line import/no-namespace -- Drizzle requires a namespace import for schema
import * as schema from "./db-schema"

export type DbInstanceFromSchema = NodePgDatabase<typeof schema>
export type DbTransaction = Parameters<
    Parameters<DbInstanceFromSchema["transaction"]>[0]
>[0]
export type DbSelect = Pick<DbInstanceFromSchema, "select">

/**
 * @description Builds the Drizzle instance and the pg pool backing it
 * @param config Pool configuration of the connection
 * @remarks Silences the query log when `DISABLE_DRIZZLE_LOGS` is `true`
 */
export const buildDbInstance = (
    config: PoolConfig,
): { dbInstance: DbInstanceFromSchema; pgPool: Pool } => {
    const pgPool = new Pool(config)
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
    const dbInstance = drizzle({ client: pgPool, logger: drizzleLogger, schema })

    return { dbInstance, pgPool }
}

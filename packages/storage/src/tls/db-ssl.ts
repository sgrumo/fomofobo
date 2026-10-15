import type { ConnectionOptions } from "node:tls"

import { z } from "@hono/zod-openapi"
import { match } from "ts-pattern"

import { rdsEuWest1Ca } from "./rds-ca"

export const dbSslModeSchema = z.enum(["off", "verify-rds"])
export type DbSslMode = z.infer<typeof dbSslModeSchema>

/**
 * @description Returns the pg `ssl` option of a TLS mode
 * @param mode `off` for plaintext, `verify-rds` to check the chain against the RDS roots and the hostname against the certificate
 * @remarks Needs the RDS endpoint hostname as `host`: a CNAME or an IP fails the hostname check
 */
export const buildDbSsl = (mode: DbSslMode): ConnectionOptions | undefined =>
    match(mode)
        .returnType<ConnectionOptions | undefined>()
        .with("off", () => undefined)
        .with("verify-rds", () => ({ ca: rdsEuWest1Ca, rejectUnauthorized: true }))
        .exhaustive()

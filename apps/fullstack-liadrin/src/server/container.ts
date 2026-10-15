import "server-only"
import { logger, S3ObjectStorage } from "backend-shared"
import type { TokenVerifier } from "backend-shared/auth"
import { createTokenVerifier } from "backend-shared/auth"
import { serializeError } from "backend-shared/http"
import { memoize } from "es-toolkit"
import { buildDbInstance, buildDbSsl, FilesStorage, TodoStorage } from "storage"

import type { AppConfig } from "./config/app-config"
import { resolveAppConfig } from "./config/app-config"
import { parseEnv } from "./config/env"
import { FilesService } from "./services/files-service"
import { TodoService } from "./services/todo-service"

export interface Container {
    appConfig: AppConfig
    todoService: TodoService
    filesService: FilesService
    tokenVerifier: TokenVerifier
}

/**
 * @description Builds the dependencies the API handlers read
 * @throws When the environment misses a variable of its `APP_ENV` variant
 * @remarks Registers the pool `error` listener. Without it, a connection that the
 * pooler drops raises an uncaught exception and kills the instance
 */
const buildContainer = (): Container => {
    const env = parseEnv(process.env)
    const appConfig = resolveAppConfig(env.APP_ENV)

    const { dbInstance, pgPool } = buildDbInstance({
        host: env.PGHOST,
        user: env.PGUSER,
        database: env.PGDATABASE,
        password: env.PGPASSWORD,
        port: env.PGPORT,
        max: appConfig.dbPoolSize,
        ssl: buildDbSsl(appConfig.dbSsl),
    })

    pgPool.on("error", error => {
        logger.error("Postgres pool error", { error: serializeError(error) })
    })

    const objectStorage = new S3ObjectStorage({
        bucket: env.S3_BUCKET,
        region: env.S3_REGION,
        endpoint: env.S3_ENDPOINT,
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
    })

    return {
        appConfig,
        todoService: new TodoService(new TodoStorage(dbInstance)),
        filesService: new FilesService(new FilesStorage(dbInstance), objectStorage),
        // Holds the key set of the provider. It fetches it on the first verified
        // request, so a provider that is down delays no boot.
        tokenVerifier: createTokenVerifier({
            issuer: env.OIDC_ISSUER,
            audience: env.OIDC_AUDIENCE,
            // Absent by default: discovery resolves the key set from the issuer.
            jwksUrl: env.OIDC_JWKS_URL,
            // Plain HTTP for the container of `local` and `test` alone. A deployed
            // shape refuses it, and the boot fails on the first request.
            allowInsecure: appConfig.allowInsecureOidc,
        }),
    }
}

/**
 * @description Returns the dependencies, building them on the first call
 * @remarks Keeps one database pool per warm serverless instance
 * @remarks Caches a successful build only, so a boot failure reports its real cause on
 * every request
 */
export const getContainer = memoize(buildContainer)

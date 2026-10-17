import "server-only"
import { S3ObjectStorage } from "backend-shared"
import { memoize } from "es-toolkit"
import type { DbInstanceFromSchema } from "storage"
import { AccountsStorage, buildDbInstance } from "storage"

import type { Auth } from "./auth/auth"
import { buildAuth } from "./auth/auth"
import type { AppConfig } from "./config/app-config"
import { resolveAppConfig } from "./config/app-config"
import { parseEnv } from "./config/env"
import { AuthAccountsService } from "./services/auth-accounts-service"

export interface Container {
    appConfig: AppConfig
    db: DbInstanceFromSchema
    auth: Auth
    authAccounts: AuthAccountsService
    photoStorage: S3ObjectStorage
    photosPublicBaseUrl: string
    geocoding: { baseUrl: string; apiKey: string | undefined }
}

/**
 * @description Builds the dependencies the API handlers read
 * @throws When the environment misses a variable of its `APP_ENV` variant
 */
const buildContainer = (): Container => {
    const env = parseEnv(process.env)
    const appConfig = resolveAppConfig(env.APP_ENV)
    const db = buildDbInstance({
        url: env.DATABASE_URL,
        authToken: env.DATABASE_AUTH_TOKEN,
    })

    const auth = buildAuth(db, {
        baseUrl: env.APP_BASE_URL,
        secret: env.BETTER_AUTH_SECRET,
        secureCookies: appConfig.secureCookies,
        rateLimitEnabled: appConfig.authRateLimitEnabled,
    })

    return {
        appConfig,
        db,
        auth,
        authAccounts: new AuthAccountsService(auth, new AccountsStorage(db)),
        photoStorage: new S3ObjectStorage({
            bucket: env.S3_BUCKET,
            region: env.S3_REGION,
            endpoint: env.S3_ENDPOINT,
            accessKeyId: env.S3_ACCESS_KEY,
            secretAccessKey: env.S3_SECRET_KEY,
        }),
        photosPublicBaseUrl: env.PHOTOS_PUBLIC_BASE_URL,
        geocoding: { baseUrl: env.GEOAPIFY_BASE_URL, apiKey: env.GEOAPIFY_API_KEY },
    }
}

/**
 * @description Returns the dependencies, building them on the first call
 * @remarks Caches a successful build only, so a boot failure reports its real cause on
 * every request
 */
export const getContainer = memoize(buildContainer)

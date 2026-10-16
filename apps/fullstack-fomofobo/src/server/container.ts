import "server-only"
import { memoize } from "es-toolkit"
import type { DbInstanceFromSchema } from "storage"
import { buildDbInstance } from "storage"

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
        authAccounts: new AuthAccountsService(auth),
    }
}

/**
 * @description Returns the dependencies, building them on the first call
 * @remarks Caches a successful build only, so a boot failure reports its real cause on
 * every request
 */
export const getContainer = memoize(buildContainer)

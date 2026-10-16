import "server-only"
import type { TokenVerifier } from "backend-shared/auth"
import { createTokenVerifier } from "backend-shared/auth"
import { memoize } from "es-toolkit"
import type { DbInstanceFromSchema } from "storage"
import { buildDbInstance } from "storage"

import type { Auth } from "./auth/auth"
import { buildAuth } from "./auth/auth"
import type { AppConfig } from "./config/app-config"
import { resolveAppConfig } from "./config/app-config"
import { parseEnv } from "./config/env"

export interface Container {
    appConfig: AppConfig
    db: DbInstanceFromSchema
    auth: Auth
    tokenVerifier: TokenVerifier
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

    return {
        appConfig,
        db,
        auth: buildAuth(db, {
            baseUrl: env.APP_BASE_URL,
            secret: env.BETTER_AUTH_SECRET,
            secureCookies: appConfig.secureCookies,
            rateLimitEnabled: appConfig.authRateLimitEnabled,
        }),
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
 * @remarks Caches a successful build only, so a boot failure reports its real cause on
 * every request
 */
export const getContainer = memoize(buildContainer)

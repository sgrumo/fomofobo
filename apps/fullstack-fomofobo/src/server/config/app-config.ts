import "server-only"
import { match } from "ts-pattern"

/**
 * @description Names the deployment shape, with a schema in `env.ts` and a behavior in
 * `resolveAppConfig`
 * @remarks Drives every environment-shaped capability through `APP_ENV` alone, with no
 * per-feature override flag:
 * - `test` — E2E and CI
 * - `local` — host development
 * - `preview` — a non-production deployment on Vercel, with Turso and R2
 * - `vercel` — a production deployment on Vercel, with Turso and R2
 */
export const appEnvValues = ["test", "local", "preview", "vercel"] as const
export type AppEnv = (typeof appEnvValues)[number]

export interface AppConfig {
    /**
     * Expose the stack, the cause and the `5xx` message in error responses. A server
     * failure names the host a driver could not reach or the column a constraint guards.
     */
    verboseErrors: boolean
    /** Serve the OpenAPI document and its Swagger UI. */
    apiDocsEnabled: boolean
    /**
     * Serve the `/dev/*` pages, which render the internal component showcase and the
     * sample props the E2E suite drives.
     */
    devPagesEnabled: boolean
    /**
     * Mark the session cookies `Secure`, and prefix them with `__Host-`.
     *
     * Off where the app answers over plain HTTP: Chromium refuses a `__Host-`
     * cookie on `http://localhost`, which is where dev and the E2E suite run.
     */
    secureCookies: boolean
    /**
     * Limit the sign-in attempts per IP. Off where one client signs in again and again:
     * the E2E suite and development.
     */
    authRateLimitEnabled: boolean
    /** Serve `POST /api/test/reset-database`, which deletes every row of the database. */
    databaseResetEnabled: boolean
}

/**
 * @description Returns the runtime capabilities of the environment
 * @param appEnv Environment driving the capabilities
 */
export const resolveAppConfig = (appEnv: AppEnv): AppConfig =>
    match(appEnv)
        .returnType<AppConfig>()
        .with("test", () => ({
            databaseResetEnabled: true,
            authRateLimitEnabled: false,
            secureCookies: false,
            devPagesEnabled: true,
            verboseErrors: true,
            apiDocsEnabled: true,
        }))
        .with("local", () => ({
            databaseResetEnabled: false,
            authRateLimitEnabled: false,
            secureCookies: false,
            devPagesEnabled: true,
            verboseErrors: true,
            apiDocsEnabled: true,
        }))
        .with("preview", () => ({
            databaseResetEnabled: false,
            authRateLimitEnabled: true,
            secureCookies: true,
            devPagesEnabled: true,
            verboseErrors: true,
            apiDocsEnabled: true,
        }))
        .with("vercel", () => ({
            databaseResetEnabled: false,
            authRateLimitEnabled: true,
            secureCookies: true,
            devPagesEnabled: false,
            verboseErrors: false,
            apiDocsEnabled: false,
        }))
        .exhaustive()

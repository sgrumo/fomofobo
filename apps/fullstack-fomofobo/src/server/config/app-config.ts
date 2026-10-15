import "server-only"
import { match } from "ts-pattern"

/**
 * @description Names the deployment shape, with a schema in `env.ts` and a behavior in
 * `resolveAppConfig`
 * @remarks Drives every environment-shaped capability through `APP_ENV` alone, with no
 * per-feature override flag:
 * - `test` — E2E and CI
 * - `local` — host development and the local Worker preview
 * - `cloudflare` — a deployed Worker, D1 and R2
 */
export const appEnvValues = ["test", "local", "cloudflare"] as const
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
     * Accept an OpenID provider served over plain HTTP.
     *
     * On for the mock provider of the E2E suite and for a local one. A deployed
     * instance refuses it, so a token never crosses the network in the clear.
     */
    allowInsecureOidc: boolean
}

/**
 * @description Returns the runtime capabilities of the environment
 * @param appEnv Environment driving the capabilities
 */
export const resolveAppConfig = (appEnv: AppEnv): AppConfig =>
    match(appEnv)
        .returnType<AppConfig>()
        .with("test", () => ({
            secureCookies: false,
            allowInsecureOidc: true,
            devPagesEnabled: true,
            verboseErrors: true,
            apiDocsEnabled: true,
        }))
        .with("local", () => ({
            secureCookies: false,
            allowInsecureOidc: true,
            devPagesEnabled: true,
            verboseErrors: true,
            apiDocsEnabled: true,
        }))
        .with("cloudflare", () => ({
            secureCookies: true,
            allowInsecureOidc: false,
            devPagesEnabled: false,
            verboseErrors: false,
            apiDocsEnabled: false,
        }))
        .exhaustive()

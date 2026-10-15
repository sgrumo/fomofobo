import "server-only"
import { z } from "@hono/zod-openapi"
import { logger } from "backend-shared"
import {
    oidcAudienceSchema,
    oidcIssuerSchema,
    oidcJwksUrlSchema,
} from "backend-shared/auth"
import { s3EndpointSchema } from "backend-shared/config"
import { formatEnvFailure, optionalEnv } from "shared/env"

import { appEnvValues } from "./app-config"

const appEnv = z.enum(appEnvValues)

/**
 * Origin this application answers on, with no trailing slash.
 *
 * Every redirect URI is built from it, and the provider compares the result with
 * the one registered for the client. A wrong value fails the login, never the boot.
 */
const appBaseUrlSchema = z
    .string()
    .nonempty()
    .pipe(
        z.url({
            error: "must be the full origin of this app, for example https://app.example.com",
        }),
    )
    .transform(value => value.replace(/\/$/u, ""))

/** Scopes asked at login. `offline_access` is what several providers answer a refresh token to. */
const defaultScope = "openid profile email offline_access"

/**
 * @description Builds one schema block per deployment shape, with every field in every
 * block
 * @remarks Repeats every field on purpose, and uses `.nonempty()` everywhere because
 * Docker Compose turns an unset variable into `""`:
 * - `.nonempty()`, no `.default()`: value needed, no safe default. A missing value
 *   stops the boot
 * - `.default("value")`: safe default exists, such as a local stack value or a standard
 *   port. Never `.default("")`, which passes the boot check and then fails in a driver
 */
const envVariants = z.discriminatedUnion("APP_ENV", [
    z.object({
        APP_ENV: appEnv.extract(["local", "test"]),
        OIDC_ISSUER: oidcIssuerSchema.default("http://localhost:8090/default"),
        OIDC_CLIENT_ID: z.string().nonempty().default("fomofobo"),
        OIDC_CLIENT_SECRET: optionalEnv(z.string().nonempty()),
        // The mock provider of `infra/local` mints this audience, and it equals the
        // client id there: its claims land on the id token too, which must name the
        // client. A real provider sets the two apart and both variables carry it.
        OIDC_AUDIENCE: oidcAudienceSchema.default("fomofobo"),
        OIDC_JWKS_URL: optionalEnv(oidcJwksUrlSchema),
        OIDC_SCOPE: z.string().nonempty().default(defaultScope),
        APP_BASE_URL: appBaseUrlSchema.default("http://localhost:3000"),
        S3_BUCKET: z.string().nonempty().default("fomofobo"),
        S3_REGION: z.string().nonempty().default("eu-west-1"),
        S3_ENDPOINT: s3EndpointSchema.default("http://localhost:9000"),
        S3_ACCESS_KEY: z.string().nonempty().default("admin"),
        S3_SECRET_KEY: z.string().nonempty().default("admin"),
    }),
    z.object({
        APP_ENV: appEnv.extract(["docker"]),
        OIDC_ISSUER: oidcIssuerSchema,
        OIDC_CLIENT_ID: z.string().nonempty(),
        OIDC_CLIENT_SECRET: optionalEnv(z.string().nonempty()),
        OIDC_AUDIENCE: oidcAudienceSchema,
        OIDC_JWKS_URL: optionalEnv(oidcJwksUrlSchema),
        OIDC_SCOPE: z.string().nonempty().default(defaultScope),
        APP_BASE_URL: appBaseUrlSchema,
        S3_BUCKET: z.string().nonempty().default("fomofobo"),
        S3_REGION: z.string().nonempty().default("eu-west-1"),
        S3_ENDPOINT: s3EndpointSchema,
        S3_ACCESS_KEY: z.string().nonempty(),
        S3_SECRET_KEY: z.string().nonempty(),
    }),
    z.object({
        APP_ENV: appEnv.extract(["vercel"]),
        OIDC_ISSUER: oidcIssuerSchema,
        OIDC_CLIENT_ID: z.string().nonempty(),
        OIDC_CLIENT_SECRET: optionalEnv(z.string().nonempty()),
        OIDC_AUDIENCE: oidcAudienceSchema,
        OIDC_JWKS_URL: optionalEnv(oidcJwksUrlSchema),
        OIDC_SCOPE: z.string().nonempty().default(defaultScope),
        APP_BASE_URL: appBaseUrlSchema,
        S3_BUCKET: z.string().nonempty(),
        S3_REGION: z.string().nonempty(),
        S3_ENDPOINT: s3EndpointSchema,
        S3_ACCESS_KEY: z.string().nonempty(),
        S3_SECRET_KEY: z.string().nonempty(),
    }),
])
export type Env = z.infer<typeof envVariants>

/** Shape of `process.env`, without the framework augmentations of the global type. */
export type EnvSource = Partial<Record<string, string>>

/**
 * @description Returns the environment matching the `APP_ENV` variant
 * @param source Raw process environment
 * @throws When `APP_ENV` is unset or names a development shape on Vercel, or when a
 * variable of the variant is missing or invalid
 * @remarks Reads an unset `APP_ENV` as `local` except on Vercel, and refuses `local` or
 * `test` there even when set by hand. Either one would run a deployed instance with a
 * plaintext database connection, stack traces in every error body, and the API
 * documentation and the `/dev/*` pages open to the public
 * @remarks Reads `APP_BASE_URL` from the production domain of the project on Vercel
 * when it is unset, because a preview deployment carries a hostname no provider holds
 * as a redirect URI. Set it by hand to log in on a preview
 * @remarks `NODE_ENV=production` is **not** a deployment signal and must not gate this:
 * `next start` needs a production build everywhere, the E2E suite included, which runs
 * it with `APP_ENV=test`. Docker needs no guard either, because its fragment sets
 * `APP_ENV=docker` outright
 */
export const parseEnv = (source: EnvSource): Env => {
    const isVercel = source.VERCEL === "1"
    const appEnvValue = source.APP_ENV ?? (isVercel ? undefined : "local")

    if (isVercel && (appEnvValue === "local" || appEnvValue === "test")) {
        const message = `Cannot start: APP_ENV="${appEnvValue}" on Vercel. Use "vercel".`
        logger.error(message)
        throw new Error(message)
    }

    // The production domain, not `VERCEL_URL`: that one names the deployment and
    // changes with every push, so no provider can hold it as a redirect URI.
    const vercelBaseUrl =
        source.VERCEL_PROJECT_PRODUCTION_URL === undefined
            ? undefined
            : `https://${source.VERCEL_PROJECT_PRODUCTION_URL}`

    const result = envVariants.safeParse({
        ...source,
        APP_ENV: appEnvValue,
        APP_BASE_URL: source.APP_BASE_URL ?? (isVercel ? vercelBaseUrl : undefined),
    })
    if (result.success) {
        return result.data
    }

    const message = formatEnvFailure(
        result.error.issues,
        `Cannot start: invalid environment for APP_ENV="${appEnvValue ?? "<unset>"}".`,
        "Set these variables, then restart. See the README of the deploy target.",
    )

    logger.error(message)
    throw new Error(message)
}

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

/** libSQL URL of the database. A relative `file:` path resolves from the directory of the process. */
const databaseUrlSchema = z
    .string()
    .nonempty()
    .regex(/^(?:file|libsql|https?|wss?):/u, {
        error: "must be a file: URL or the libsql: URL of the database",
    })

/**
 * Key that signs the session cookies and the tokens of the auth library. Rotating it
 * ends every session.
 */
const authSecretSchema = z
    .string()
    .nonempty()
    .min(32, { error: "must hold at least 32 random characters" })

/** Scopes asked at login. `offline_access` is what several providers answer a refresh token to. */
const defaultScope = "openid profile email offline_access"

/**
 * @description Builds one schema block per deployment shape, with every field in every
 * block
 * @remarks Repeats every field on purpose, and uses `.nonempty()` everywhere because
 * an env file turns a key with no value into `""`:
 * - `.nonempty()`, no `.default()`: value needed, no safe default. A missing value
 *   stops the boot
 * - `.default("value")`: safe default exists, such as a local stack value. Never
 *   `.default("")`, which passes the boot check and then fails in a driver
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
        BETTER_AUTH_SECRET: authSecretSchema.default(
            "local-and-test-only-auth-secret-0123456789",
        ),
        // Local file of `pnpm db:migrate`, relative to the app directory
        DATABASE_URL: databaseUrlSchema.default("file:../../.data/local.db"),
        DATABASE_AUTH_TOKEN: optionalEnv(z.string().nonempty()),
        S3_BUCKET: z.string().nonempty().default("fomofobo"),
        S3_REGION: z.string().nonempty().default("eu-west-1"),
        S3_ENDPOINT: s3EndpointSchema.default("http://localhost:9000"),
        S3_ACCESS_KEY: z.string().nonempty().default("admin"),
        S3_SECRET_KEY: z.string().nonempty().default("admin"),
    }),
    z.object({
        APP_ENV: appEnv.extract(["preview", "vercel"]),
        OIDC_ISSUER: oidcIssuerSchema,
        OIDC_CLIENT_ID: z.string().nonempty(),
        OIDC_CLIENT_SECRET: optionalEnv(z.string().nonempty()),
        OIDC_AUDIENCE: oidcAudienceSchema,
        OIDC_JWKS_URL: optionalEnv(oidcJwksUrlSchema),
        OIDC_SCOPE: z.string().nonempty().default(defaultScope),
        APP_BASE_URL: appBaseUrlSchema,
        BETTER_AUTH_SECRET: authSecretSchema,
        DATABASE_URL: databaseUrlSchema,
        DATABASE_AUTH_TOKEN: z.string().nonempty(),
        S3_BUCKET: z.string().nonempty(),
        S3_REGION: z.string().nonempty().default("auto"),
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
 * @param onVercel True when the code runs on Vercel, which sets `VERCEL=1`
 * @throws When `APP_ENV` is unset on Vercel, or when a variable of the variant is
 * missing or invalid
 * @remarks Reads an unset `APP_ENV` as `local` off Vercel only. On Vercel the shape
 * comes from the variables of the project, and a missing value stops the boot: a
 * deployed `local` would serve stack traces in every error body, and the API
 * documentation and the `/dev/*` pages to the public
 * @remarks `NODE_ENV=production` is **not** a deployment signal and must not gate this:
 * every build is a production build, the E2E suite included, which runs it with
 * `APP_ENV=test`
 */
export const parseEnv = (source: EnvSource, onVercel = source.VERCEL === "1"): Env => {
    const appEnvValue = source.APP_ENV ?? (onVercel ? undefined : "local")

    const result = envVariants.safeParse({ ...source, APP_ENV: appEnvValue })
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

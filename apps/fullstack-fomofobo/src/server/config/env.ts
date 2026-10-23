import "server-only"
import { z } from "@hono/zod-openapi"
import { logger } from "backend-shared"
import { s3EndpointSchema } from "backend-shared/config"
import { semverSchema } from "models"
import { formatEnvFailure, optionalEnv } from "shared/env"

import { appEnvValues } from "./app-config"

const appEnv = z.enum(appEnvValues)

/**
 * Origin this application answers on, with no trailing slash.
 *
 * The auth library trusts requests from this origin alone. A wrong value fails the
 * sign-in, never the boot.
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

/** Origin and path that a photo key joins to form its public URL, with no trailing slash. */
const photosPublicBaseUrlSchema = z
    .string()
    .nonempty()
    .pipe(z.url())
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
        PHOTOS_PUBLIC_BASE_URL: photosPublicBaseUrlSchema.default(
            "http://localhost:9000/fomofobo",
        ),
        GEOAPIFY_BASE_URL: z.url().default("https://api.geoapify.com"),
        // Unset: the places route answers 503 without a call
        GEOAPIFY_API_KEY: optionalEnv(z.string().nonempty()),
        IOS_MIN_VERSION: optionalEnv(semverSchema),
        IOS_CURRENT_VERSION: optionalEnv(semverSchema),
        IOS_RELEASE_LIVE: optionalEnv(z.stringbool()),
        IOS_STORE_URL: optionalEnv(z.string().nonempty()),
        ANDROID_MIN_VERSION: optionalEnv(semverSchema),
        ANDROID_CURRENT_VERSION: optionalEnv(semverSchema),
        ANDROID_RELEASE_LIVE: optionalEnv(z.stringbool()),
        ANDROID_STORE_URL: optionalEnv(z.string().nonempty()),
    }),
    z.object({
        APP_ENV: appEnv.extract(["preview", "vercel"]),
        APP_BASE_URL: appBaseUrlSchema,
        BETTER_AUTH_SECRET: authSecretSchema,
        DATABASE_URL: databaseUrlSchema,
        DATABASE_AUTH_TOKEN: z.string().nonempty(),
        S3_BUCKET: z.string().nonempty(),
        S3_REGION: z.string().nonempty().default("auto"),
        S3_ENDPOINT: s3EndpointSchema,
        S3_ACCESS_KEY: z.string().nonempty(),
        S3_SECRET_KEY: z.string().nonempty(),
        PHOTOS_PUBLIC_BASE_URL: photosPublicBaseUrlSchema,
        GEOAPIFY_BASE_URL: z.url(),
        GEOAPIFY_API_KEY: z.string().nonempty(),
        IOS_MIN_VERSION: optionalEnv(semverSchema),
        IOS_CURRENT_VERSION: optionalEnv(semverSchema),
        IOS_RELEASE_LIVE: optionalEnv(z.stringbool()),
        IOS_STORE_URL: optionalEnv(z.string().nonempty()),
        ANDROID_MIN_VERSION: optionalEnv(semverSchema),
        ANDROID_CURRENT_VERSION: optionalEnv(semverSchema),
        ANDROID_RELEASE_LIVE: optionalEnv(z.stringbool()),
        ANDROID_STORE_URL: optionalEnv(z.string().nonempty()),
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

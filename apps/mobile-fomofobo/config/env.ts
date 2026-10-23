import { formatEnvFailure, optionalEnv } from "shared/env"
import { isSemver } from "shared/semver"
import { z } from "zod"

import { appEnvValues } from "./target.ts"

const appEnv = z.enum(appEnvValues)

const versionSchema = z
    .string()
    .nonempty()
    .refine(isSemver, "must be a semver version, for example 1.4.0")

const buildNumberSchema = z
    .string()
    .nonempty()
    .transform(Number)
    .pipe(z.number({ error: "must be a number" }).int().positive())

/**
 * @description Builds one schema block per environment, with every field in every block
 * @remarks Uses `.nonempty()` everywhere, so a `KEY=` line in `.env` fails the build instead
 * of crashing the app on first launch:
 * - `.nonempty()`, no `.default()`: value needed, no safe default
 * - `.default("value")`: safe default exists, such as a local stack value. Never
 *   `.default("")`
 * - `optionalEnv`: no value is a normal state, such as the version of a workstation build
 */
const envVariants = z.discriminatedUnion("APP_ENV", [
    z.object({
        APP_ENV: appEnv.extract(["local"]),
        API_URL: z.string().nonempty().default("http://localhost:3000"),
        APP_VERSION: optionalEnv(versionSchema),
        APP_BUILD_NUMBER: optionalEnv(buildNumberSchema),
    }),
    z.object({
        APP_ENV: appEnv.extract(["dev", "prod"]),
        API_URL: z
            .string()
            .nonempty()
            .pipe(z.url({ protocol: /^https$/u, error: "must be an https URL" })),
        APP_VERSION: optionalEnv(versionSchema),
        APP_BUILD_NUMBER: optionalEnv(buildNumberSchema),
    }),
])
export type Env = z.infer<typeof envVariants>

/**
 * @description Returns the environment matching the `APP_ENV` variant
 * @param source Raw process environment
 * @throws When a variable of the variant is missing or invalid
 * @remarks Falls back to the `local` variant when `APP_ENV` is unset
 */
export const parseEnv = (source: NodeJS.ProcessEnv): Env => {
    const result = envVariants.safeParse({
        ...source,
        APP_ENV: source.APP_ENV ?? "local",
    })
    if (result.success) {
        return result.data
    }

    throw new Error(
        formatEnvFailure(
            result.error.issues,
            `Invalid environment for APP_ENV="${source.APP_ENV ?? "local"}".`,
            "Set these variables in .env, then run the command again. See .env.template.",
        ),
    )
}

import { z } from "@hono/zod-openapi"
import { s3EndpointSchema } from "backend-shared/config"
import { formatEnvFailure, optionalEnv } from "shared/env"

const envSchema = z.object({
    DATABASE_URL: z
        .string()
        .nonempty()
        .regex(/^(?:file|libsql|https?|wss?):/u, {
            error: "must be a file: URL or the libsql: URL of the database",
        }),
    DATABASE_AUTH_TOKEN: optionalEnv(z.string().nonempty()),
    S3_BUCKET: z.string().nonempty(),
    S3_REGION: z.string().nonempty().default("auto"),
    S3_ENDPOINT: s3EndpointSchema,
    S3_ACCESS_KEY: z.string().nonempty(),
    S3_SECRET_KEY: z.string().nonempty(),
})
export type Env = z.infer<typeof envSchema>

/**
 * @description Returns the database and bucket variables of the process
 * @param source Raw process environment
 * @throws When a variable is missing or invalid
 */
export const parseEnv = (source: Partial<Record<string, string>>): Env => {
    const result = envSchema.safeParse(source)
    if (!result.success) {
        throw new Error(
            formatEnvFailure(
                result.error.issues,
                "Cannot purge: invalid environment.",
                "Set these variables, then run again.",
            ),
        )
    }
    return result.data
}

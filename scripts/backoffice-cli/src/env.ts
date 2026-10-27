import { z } from "@hono/zod-openapi"
import { formatEnvFailure } from "shared/env"

const envSchema = z.object({
    APP_BASE_URL: z.url({ protocol: /^https?$/u }),
    BACKOFFICE_EMAIL: z.email(),
    BACKOFFICE_PASSWORD: z.string().nonempty(),
})
export type Env = z.infer<typeof envSchema>

/**
 * @description Returns the app origin and the credentials of the account
 * @param source Raw process environment
 * @throws When a variable is missing or invalid
 */
export const parseEnv = (source: Partial<Record<string, string>>): Env => {
    const result = envSchema.safeParse(source)
    if (!result.success) {
        throw new Error(
            formatEnvFailure(
                result.error.issues,
                "Cannot call the backoffice: invalid environment.",
                "Set these variables in scripts/backoffice-cli/.env.local, or in .env.<ENV_NAME> there.",
            ),
        )
    }
    return result.data
}

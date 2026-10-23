import Constants from "expo-constants"
import { z } from "zod"

import { appEnvValues } from "../../config/target"

const envSchema = z.object({
    appEnv: z.enum(appEnvValues),
    apiUrl: z.string().nonempty(),
    versioned: z.boolean(),
})

/**
 * @remarks Throws at import time when `extra` misses a variable
 */
export const env = envSchema.parse(Constants.expoConfig?.extra)

import "server-only"
import { parseEnv } from "./env"

/**
 * @description Returns the origin this application answers on
 * @throws When the environment misses a variable of its `APP_ENV` variant
 */
export const appBaseUrl = (): URL => new URL(parseEnv(process.env).APP_BASE_URL)

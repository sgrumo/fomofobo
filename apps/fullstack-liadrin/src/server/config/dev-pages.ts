import "server-only"
import { resolveAppConfig } from "./app-config"
import { parseEnv } from "./env"

/**
 * @description True when this environment serves the `/dev/*` pages
 * @throws When the environment misses a variable of its `APP_ENV` variant
 * @remarks Reads `APP_ENV`, not `NODE_ENV`: the E2E suite runs a production build of
 * this app with `APP_ENV=test` and drives the dev pages, so a `NODE_ENV` gate would
 * hide the very pages that suite needs
 */
export const devPagesEnabled = (): boolean =>
    resolveAppConfig(parseEnv(process.env).APP_ENV).devPagesEnabled

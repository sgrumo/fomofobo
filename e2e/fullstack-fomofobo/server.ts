import { mkdirSync, rmSync } from "node:fs"
import path from "node:path"

import { exec, ROOT_DIR } from "e2e-kit/infra"
import type { ServerSpec } from "e2e-kit/server"

const APP_DIR = path.resolve(ROOT_DIR, "apps/fullstack-fomofobo")
const STORAGE_DIR = path.resolve(ROOT_DIR, "packages/storage")
const DATABASE_DIR = path.resolve(ROOT_DIR, ".ignored/e2e-databases")

export const LOCALES_DIR = path.resolve(APP_DIR, "public/locales")

/**
 * @description Builds the production bundle of the app with `next build`
 */
export const buildApp = () => {
    exec("pnpm build", "Next build", APP_DIR)
}

/**
 * @description Replaces the database file of one runner, applies every migration, and returns its URL
 * @param runner Runner of the suite, so two runners never share a database
 */
export const prepareDatabase = (runner: string): string => {
    const file = path.resolve(DATABASE_DIR, `${runner}.db`)
    mkdirSync(DATABASE_DIR, { recursive: true })
    rmSync(file, { force: true })
    const url = `file:${file}`
    exec("pnpm db:migrate", "Database migrations", STORAGE_DIR, { DATABASE_URL: url })
    return url
}

/**
 * @description Builds the spec of the production server of the app
 * @param port Port the app listens on
 * @param origin Origin the browser and the tests read the app on, which the auth library trusts
 * @param databaseUrl Database URL of the runner
 */
export const appServer = (
    port: string,
    origin: string,
    databaseUrl: string,
): ServerSpec => ({
    label: "app",
    command: "pnpm",
    args: ["exec", "next", "start", "--port", port],
    cwd: APP_DIR,
    env: {
        APP_ENV: "test",
        APP_BASE_URL: origin,
        DISABLE_DRIZZLE_LOGS: "true",
        DATABASE_URL: databaseUrl,
    },
    // The app answers here in every environment; the Swagger route does not.
    healthUrl: `http://127.0.0.1:${port}/api/health`,
})

import { mkdirSync, rmSync } from "node:fs"
import path from "node:path"

import { exec, ROOT_DIR } from "e2e-kit/infra"
import type { ServerSpec } from "e2e-kit/server"

const APP_DIR = path.resolve(ROOT_DIR, "apps/fullstack-fomofobo")
const SUITE_DIR = import.meta.dirname
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
 * @param options Port, origin the auth library trusts, database URL of the runner, public URL of the photos bucket and origin of the geocoding mock
 */
export const appServer = (options: {
    port: string
    origin: string
    databaseUrl: string
    photosPublicBaseUrl: string
    geocodingBaseUrl: string
}): ServerSpec => ({
    label: "app",
    command: "pnpm",
    args: ["exec", "next", "start", "--port", options.port],
    cwd: APP_DIR,
    env: {
        APP_ENV: "test",
        APP_BASE_URL: options.origin,
        DISABLE_DRIZZLE_LOGS: "true",
        DATABASE_URL: options.databaseUrl,
        PHOTOS_PUBLIC_BASE_URL: options.photosPublicBaseUrl,
        GEOAPIFY_BASE_URL: options.geocodingBaseUrl,
        GEOAPIFY_API_KEY: "e2e-geoapify-key",
    },
    // The app answers here in every environment; the Swagger route does not.
    healthUrl: `http://127.0.0.1:${options.port}/api/health`,
})

/**
 * @description Builds the spec of the fake of the Geoapify autocomplete API
 * @param port Port the fake listens on
 */
export const geocodingMockServer = (port: string): ServerSpec => ({
    label: "geocoding-mock",
    command: "node",
    args: [path.resolve(SUITE_DIR, "geocoding-mock.ts"), "--port", port],
    cwd: SUITE_DIR,
    env: {},
    healthUrl: `http://127.0.0.1:${port}/health`,
})

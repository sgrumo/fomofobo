import { rmSync } from "node:fs"
import path from "node:path"

import { exec, ROOT_DIR } from "e2e-kit/infra"
import type { ServerSpec } from "e2e-kit/server"

const APP_DIR = path.resolve(ROOT_DIR, "apps/fullstack-fomofobo")

export const LOCALES_DIR = path.resolve(APP_DIR, "public/locales")

/**
 * @remarks Gates the lifecycle variables that reach the Worker: Wrangler passes no process
 * variable, so a name left out never reaches it
 */
const WORKER_VARIABLES = [
    "APP_BASE_URL",
    "OIDC_ISSUER",
    "OIDC_CLIENT_ID",
    "OIDC_AUDIENCE",
    "S3_ENDPOINT",
    "S3_ACCESS_KEY",
    "S3_SECRET_KEY",
    "S3_BUCKET",
    "S3_REGION",
]

/**
 * @description Builds the Worker bundle with the OpenNext adapter, the artifact a deploy uploads
 */
export const buildApp = () => {
    exec("pnpm build:worker", "OpenNext build", APP_DIR)
}

/**
 * @description Empties the D1 state folder of one runner, applies every migration, and returns the folder
 * @param runner Runner of the suite, so two runners never share a database
 */
export const prepareDatabase = (runner: string): string => {
    const persistDir = path.resolve(APP_DIR, `.wrangler/e2e-${runner}`)
    rmSync(persistDir, { recursive: true, force: true })
    exec(
        `pnpm exec wrangler d1 migrations apply DB --local --persist-to ${persistDir}`,
        "D1 migrations",
        APP_DIR,
    )
    return persistDir
}

/**
 * @description Builds the spec of the local Worker that serves the bundle on workerd
 * @param ports Port of the app and port of the inspector
 * @param persistDir Local D1 state folder of the runner
 */
export const appServer = (
    ports: { app: string; inspector: string },
    persistDir: string,
): ServerSpec => {
    const variables = {
        APP_ENV: "test",
        DISABLE_DRIZZLE_LOGS: "true",
        ...Object.fromEntries(
            WORKER_VARIABLES.flatMap(name => {
                const value = process.env[name]
                return value === undefined ? [] : [[name, value]]
            }),
        ),
    }
    return {
        label: "app",
        command: "pnpm",
        args: [
            "exec",
            "opennextjs-cloudflare",
            "preview",
            "--port",
            ports.app,
            "--inspector-port",
            ports.inspector,
            "--persist-to",
            persistDir,
            ...Object.entries(variables).flatMap(([name, value]) => [
                "--var",
                `${name}:${value}`,
            ]),
        ],
        cwd: APP_DIR,
        env: {},
        // The app answers here in every environment; the Swagger route does not.
        healthUrl: `http://127.0.0.1:${ports.app}/api/health`,
    }
}

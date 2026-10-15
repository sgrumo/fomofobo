import { cpSync } from "node:fs"
import path from "node:path"

import { exec, ROOT_DIR } from "e2e-kit/infra"
import type { ServerSpec } from "e2e-kit/server"

const APP_DIR = path.resolve(ROOT_DIR, "apps/fullstack-liadrin")
// `outputFileTracingRoot` is the repo root, so the bundle keeps the workspace layout.
const STANDALONE_DIR = path.resolve(APP_DIR, ".next/standalone/apps/fullstack-liadrin")

export const LOCALES_DIR = path.resolve(APP_DIR, "public/locales")

/**
 * @description Builds the app and completes the standalone bundle the way the deploy image does
 * @remarks Mirrors the `nextjs` stage of `infra/docker/Dockerfile`: the standalone server
 * serves `public/` and `.next/static/` only when they sit beside it
 */
export const buildApp = () => {
    exec("pnpm build", "Next build", APP_DIR)
    cpSync(
        path.resolve(APP_DIR, ".next/static"),
        path.resolve(STANDALONE_DIR, ".next/static"),
        {
            recursive: true,
        },
    )
    cpSync(path.resolve(APP_DIR, "public"), path.resolve(STANDALONE_DIR, "public"), {
        recursive: true,
    })
}

/**
 * @description Builds the spec of the standalone server, the artifact the deploy image runs
 * @param port Port the server listens on
 */
export const appServer = (port: string): ServerSpec => ({
    label: "app",
    command: "node",
    args: ["server.js"],
    cwd: STANDALONE_DIR,
    env: {
        PORT: port,
        // Set on purpose: a CI job container carries its own `HOSTNAME`, which the
        // server would bind instead.
        HOSTNAME: "0.0.0.0",
        APP_ENV: "test",
        NODE_ENV: "production",
    },
    // The app answers here in every environment; the Swagger route does not.
    healthUrl: `http://127.0.0.1:${port}/api/health`,
})

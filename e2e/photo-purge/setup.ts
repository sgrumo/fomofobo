import { mkdirSync, rmSync } from "node:fs"
import path from "node:path"

import { createLog, reportName } from "e2e-kit/env"
import { exec, ROOT_DIR } from "e2e-kit/infra"
import { defineLifecycle } from "e2e-kit/lifecycle"

const DATABASE_FILE = path.resolve(ROOT_DIR, ".ignored/e2e-databases/photo-purge.db")

/**
 * @remarks Starts no server: each test runs the job itself, on the database file and the
 * bucket that this setup publishes through `process.env`
 */
export default defineLifecycle({ log: createLog(reportName()) }, async stack => {
    await stack.startObjectStore({ corsOrigins: ["http://localhost"] })
    mkdirSync(path.dirname(DATABASE_FILE), { recursive: true })
    rmSync(DATABASE_FILE, { force: true })
    const databaseUrl = `file:${DATABASE_FILE}`
    exec(
        "pnpm db:migrate",
        "Database migrations",
        path.resolve(ROOT_DIR, "packages/storage"),
        { DATABASE_URL: databaseUrl },
    )
    process.env.DATABASE_URL = databaseUrl
})

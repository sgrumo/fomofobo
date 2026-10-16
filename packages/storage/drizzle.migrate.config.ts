import { defineConfig } from "drizzle-kit"

// Config of `migrate` only. `generate` uses `drizzle.config.ts`: its sqlite dialect writes plain
// SQLite, where the turso dialect may write libSQL-only statements.
const url = process.env.DATABASE_URL
if (url === undefined || url === "") {
    throw new Error(
        "Set DATABASE_URL: a file: URL for a local database, or the libsql: URL of Turso",
    )
}

export default defineConfig({
    out: "./migrations",
    dialect: "turso",
    dbCredentials: { url, authToken: process.env.DATABASE_AUTH_TOKEN },
})

import { defineConfig } from "drizzle-kit"

import { buildDbSsl, dbSslModeSchema } from "./src/tls/db-ssl"

// `verify-rds` for a migration against RDS from CI. Unset for the local Postgres.
const dbSsl = dbSslModeSchema.default("off").parse(process.env.DB_SSL)

export default defineConfig({
    out: "./migrations",
    schema: "./src/db-schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        host: process.env.PGHOST ?? "localhost",
        user: process.env.PGUSER ?? "postgres",
        password: process.env.PGPASSWORD ?? "postgres",
        database: process.env.PGDATABASE ?? "postgres",
        port: Number.parseInt(process.env.PGPORT ?? "5432"),
        ssl: buildDbSsl(dbSsl) ?? false,
    },
})

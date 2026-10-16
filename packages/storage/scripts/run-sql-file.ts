import { readFileSync } from "node:fs"

import { createClient } from "@libsql/client"

const [file] = process.argv.slice(2)
const url = process.env.DATABASE_URL
if (file === undefined || url === undefined || url === "") {
    throw new Error("Usage: DATABASE_URL=<url> node scripts/run-sql-file.ts <file.sql>")
}

const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN })
await client.executeMultiple(readFileSync(file, "utf8"))
client.close()

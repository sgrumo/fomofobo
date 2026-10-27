import { readFile } from "node:fs/promises"
import path from "node:path"
import { parseArgs } from "node:util"

import { z } from "@hono/zod-openapi"
import { match } from "ts-pattern"

import { BackofficeClient } from "./backoffice-client"
import { parseEnv } from "./env"
import { EVENT_PHOTO_TICKET_PATH, uploadPhoto } from "./upload-photo"

const USAGE = `Usage, from the repo root:
  [ENV_NAME=<name>] pnpm -s backoffice request <METHOD> <path> [--body <json> | --body-file <file>]
  [ENV_NAME=<name>] pnpm -s backoffice upload-photo <file> [--ticket <path>]

request      Sends one API call as the account of BACKOFFICE_EMAIL. Prints the status on
             stderr and the response body on stdout. Exits with 1 unless the status is 2xx.
upload-photo Dithers a JPEG, PNG or WebP file, uploads it through the upload ticket route
             (${EVENT_PHOTO_TICKET_PATH} by default) and prints its key.

The variables come from scripts/backoffice-cli/.env.local, or from .env.<ENV_NAME> there.
See .env.template.`

// oxlint-disable-next-line custom/kebab-case-enum-values
const methodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"])

/**
 * @description Returns the path of a file argument, relative to the folder where the command started
 * @param file File argument
 */
const callerPath = (file: string): string =>
    path.resolve(process.env.INIT_CWD ?? process.cwd(), file)

/**
 * @description Runs the command of the arguments against the backoffice API
 * @throws When the command or its operands are missing or unknown
 */
const main = async (): Promise<void> => {
    const { values, positionals } = parseArgs({
        allowPositionals: true,
        options: {
            body: { type: "string" },
            "body-file": { type: "string" },
            ticket: { type: "string", default: EVENT_PHOTO_TICKET_PATH },
        },
    })
    const [command, ...operands] = positionals

    await match(command)
        .with("request", async () => {
            const [method, apiPath] = operands
            if (apiPath === undefined) {
                throw new Error("request needs a method and a path")
            }
            const bodyFile = values["body-file"]
            const client = new BackofficeClient(parseEnv(process.env))
            const response = await client.request({
                method: methodSchema.parse(method?.toUpperCase()),
                path: apiPath,
                body:
                    bodyFile === undefined
                        ? values.body
                        : await readFile(callerPath(bodyFile), "utf8"),
            })
            console.error(`HTTP ${String(response.status)}`)
            console.info(response.text)
            process.exitCode = response.ok ? 0 : 1
        })
        .with("upload-photo", async () => {
            const [file] = operands
            if (file === undefined) {
                throw new Error("upload-photo needs a file")
            }
            const client = new BackofficeClient(parseEnv(process.env))
            const key = await uploadPhoto(client, callerPath(file), values.ticket)
            console.info(JSON.stringify({ key }))
        })
        .otherwise(() => {
            throw new Error(`Unknown command: ${command ?? "none"}`)
        })
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    console.error(`\n${USAGE}`)
    process.exitCode = 1
})

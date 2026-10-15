#!/usr/bin/env node
import { spawn } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { constants } from "node:os"
import { parseEnv } from "node:util"

import { envFileOf, mergeEnv } from "./env-file.ts"

/**
 * @description Fetches the variables of the env file
 * @param path Env file path, or nothing to load
 * @throws When the file is missing
 */
const readEnvFile = (path: string | undefined) => {
    if (path === undefined) {
        return {}
    }
    if (!existsSync(path)) {
        throw new Error(`${path} not found in ${process.cwd()}`)
    }
    return parseEnv(readFileSync(path, "utf8"))
}

/**
 * @description Runs the command with the env file of `ENV_NAME` under the shell variables
 * @throws When the command is missing
 */
const run = () => {
    const [bin, ...binArgs] = process.argv.slice(2)
    if (bin === undefined) {
        throw new Error("missing command")
    }

    const path = envFileOf(process.env.ENV_NAME)
    const fileVars = readEnvFile(path)
    if (fileVars.NODE_ENV !== undefined) {
        console.warn(`with-env: ignoring NODE_ENV of ${path ?? ""}, the command sets it`)
    }

    const child = spawn(bin, binArgs, {
        stdio: "inherit",
        env: mergeEnv(fileVars, process.env),
    })

    for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
        process.on(signal, () => {
            child.kill(signal)
        })
    }
    child.on("error", error => {
        console.error(`with-env: ${error.message}`)
        process.exit(127)
    })
    child.on("exit", (code, signal) => {
        process.exit(code ?? (signal === null ? 1 : 128 + constants.signals[signal]))
    })
}

try {
    run()
} catch (error) {
    console.error(`with-env: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
}

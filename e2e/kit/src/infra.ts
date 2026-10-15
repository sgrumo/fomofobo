import { execSync } from "node:child_process"
import path from "node:path"

/**
 * @description Returns the `stderr` and `stdout` carried by a thrown `execSync` error
 * @param error Value thrown by `execSync`
 */
const getCommandOutput = (error: unknown): string => {
    if (typeof error !== "object" || error === null) {
        return String(error)
    }
    const parts: string[] = []
    if ("stderr" in error) {
        const stderr = error.stderr
        if (Buffer.isBuffer(stderr)) {
            parts.push(stderr.toString())
        }
    }
    if ("stdout" in error) {
        const stdout = error.stdout
        if (Buffer.isBuffer(stdout)) {
            parts.push(stdout.toString())
        }
    }
    if (parts.length > 0) {
        return parts.join("\n")
    }
    return error instanceof Error ? error.message : JSON.stringify(error)
}

/** Root of the monorepo, where the workspace scripts run. */
export const ROOT_DIR = path.resolve(import.meta.dirname, "../../..")

/**
 * @description Runs a shell command synchronously
 * @param command Command line run
 * @param label Name used in the error message
 * @param cwd Working directory of the command
 * @param extraEnv Variables added to the environment of the command
 * @throws When the command exits non-zero, with its output attached
 */
export const exec = (
    command: string,
    label: string,
    cwd: string,
    extraEnv: Record<string, string> = {},
) => {
    try {
        execSync(command, { cwd, env: { ...process.env, ...extraEnv }, stdio: "pipe" })
    } catch (error) {
        throw new Error(`${label} failed:\n${getCommandOutput(error)}`, {
            cause: error,
        })
    }
}

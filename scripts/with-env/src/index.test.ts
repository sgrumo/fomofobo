import { spawnSync } from "node:child_process"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterAll, beforeAll, describe, expect, it } from "vitest"

const bin = path.join(import.meta.dirname, "index.ts")
const cwd = path.join(tmpdir(), `with-env-${String(process.pid)}`)

/**
 * @description Runs the bin with a Node one-liner as the command
 * @param script Code the child runs
 * @param env Variables of the wrapper
 */
const runBin = (script: string, env: NodeJS.ProcessEnv) =>
    spawnSync(process.execPath, [bin, process.execPath, "-e", script], {
        cwd,
        encoding: "utf8",
        env: { PATH: process.env.PATH, ...env },
    })

const printEnv =
    "console.log(JSON.stringify([process.env.FROM_FILE, process.env.SHARED, process.env.NODE_ENV]))"

describe("with-env", () => {
    beforeAll(() => {
        mkdirSync(cwd, { recursive: true })
        writeFileSync(
            path.join(cwd, ".env.dev"),
            "FROM_FILE=file\nSHARED=file\nNODE_ENV=production\n",
        )
    })

    afterAll(() => {
        rmSync(cwd, { recursive: true })
    })

    it("should load the file of ENV_NAME under the shell variables", () => {
        const result = runBin(printEnv, { ENV_NAME: "dev", SHARED: "shell" })

        expect(result.status).toBe(0)
        expect(JSON.parse(result.stdout)).toStrictEqual(["file", "shell", null])
        expect(result.stderr).toContain("ignoring NODE_ENV of .env.dev")
    })

    it("should load nothing when ENV_NAME is unset", () => {
        const result = runBin(printEnv, {})

        expect(result.status).toBe(0)
        expect(JSON.parse(result.stdout)).toStrictEqual([null, null, null])
    })

    it("should stop when the file of ENV_NAME is missing", () => {
        const result = runBin(printEnv, { ENV_NAME: "prod" })

        expect(result.status).toBe(1)
        expect(result.stderr).toContain(".env.prod not found")
    })

    it("should exit with the code of the command", () => {
        expect(runBin("process.exit(3)", {}).status).toBe(3)
    })
})

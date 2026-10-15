import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"
import { z } from "zod"

const appsDir = path.join(import.meta.dirname, "../../../apps")
const manifestSchema = z.object({ scripts: z.record(z.string(), z.string()) })

/**
 * @description True when the command reads `ENV_NAME`
 * @param command Script command
 */
const readsEnvName = (command: string) =>
    command.includes("ENV_NAME") || command.startsWith("with-env ")

const apps = readdirSync(appsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
        const { scripts } = manifestSchema.parse(
            JSON.parse(
                readFileSync(path.join(appsDir, entry.name, "package.json"), "utf8"),
            ),
        )
        return {
            name: entry.name,
            devReadsEnvName: readsEnvName(scripts.dev ?? scripts.start ?? ""),
            buildsReadingEnvName: Object.entries(scripts)
                .filter(([name]) => name.startsWith("build") || name === "preview")
                .filter(([, command]) => readsEnvName(command))
                .map(([name]) => name),
        }
    })

describe("app scripts", () => {
    it.each(apps)(
        "should let ENV_NAME pick the env file of $name in dev",
        ({ devReadsEnvName }) => {
            expect(devReadsEnvName).toBe(true)
        },
    )

    it.each(apps)(
        "should keep ENV_NAME out of the builds of $name",
        ({ buildsReadingEnvName }) => {
            expect(buildsReadingEnvName).toStrictEqual([])
        },
    )
})

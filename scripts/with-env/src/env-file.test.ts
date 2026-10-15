import { describe, expect, it } from "vitest"

import { envFileOf, mergeEnv } from "./env-file.ts"

describe("envFileOf", () => {
    it("should map the env name to its file", () => {
        expect(envFileOf("dev")).toBe(".env.dev")
    })

    it("should select nothing when ENV_NAME is unset or empty", () => {
        expect(envFileOf(undefined)).toBeUndefined()
        expect(envFileOf("")).toBeUndefined()
    })
})

describe("mergeEnv", () => {
    it("should let the shell win over the file", () => {
        expect(mergeEnv({ A: "file", B: "file" }, { B: "shell" })).toStrictEqual({
            A: "file",
            B: "shell",
        })
    })

    it("should drop NODE_ENV of the file", () => {
        expect(mergeEnv({ NODE_ENV: "production", A: "file" }, {})).toStrictEqual({
            A: "file",
        })
    })

    it("should keep NODE_ENV of the shell", () => {
        expect(mergeEnv({ NODE_ENV: "production" }, { NODE_ENV: "test" })).toStrictEqual({
            NODE_ENV: "test",
        })
    })
})

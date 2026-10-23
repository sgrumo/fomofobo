import { describe, expect, it } from "vitest"

import { parseEnv } from "./env"

describe("parseEnv", () => {
    // quality.yaml and the checklist build with no .env, so a local build needs no value.
    it("parses an empty environment as local with full defaults", () => {
        const env = parseEnv({})
        expect(env.APP_ENV).toBe("local")
        expect(env.API_URL).toBe("http://localhost:3000")
        expect(env.APP_VERSION).toBeUndefined()
        expect(env.APP_BUILD_NUMBER).toBeUndefined()
    })

    it("rejects an unrecognised APP_ENV", () => {
        expect(() => parseEnv({ APP_ENV: "staging" })).toThrow('APP_ENV="staging"')
    })

    it("requires API_URL on a dev and a prod build", () => {
        expect(() => parseEnv({ APP_ENV: "dev" })).toThrow("API_URL: not set")
        expect(() => parseEnv({ APP_ENV: "prod" })).toThrow("API_URL: not set")
    })

    it("rejects an empty API_URL", () => {
        expect(() => parseEnv({ APP_ENV: "dev", API_URL: "" })).toThrow(
            "API_URL: set but empty",
        )
    })

    // A tester or store build reaches devices off this machine, and iOS refuses plain HTTP.
    it("requires an https API_URL on a dev and a prod build", () => {
        expect(() =>
            parseEnv({ APP_ENV: "dev", API_URL: "http://192.168.1.20:3000" }),
        ).toThrow("API_URL: must be an https URL")
        expect(() =>
            parseEnv({ APP_ENV: "prod", API_URL: "http://localhost:3000" }),
        ).toThrow("API_URL: must be an https URL")
    })

    it("reads API_URL on a dev build", () => {
        const env = parseEnv({ APP_ENV: "dev", API_URL: "https://api.example.com" })
        expect(env.API_URL).toBe("https://api.example.com")
    })

    it("rejects an APP_VERSION that is not semver", () => {
        expect(() => parseEnv({ APP_VERSION: "1.2" })).toThrow("APP_VERSION")
    })

    // The template ships `APP_VERSION=`, which dotenv reads as an empty string.
    it("reads an empty APP_VERSION as unset", () => {
        expect(parseEnv({ APP_VERSION: "" }).APP_VERSION).toBeUndefined()
    })

    // Play only accepts a positive integer.
    it("rejects an APP_BUILD_NUMBER that is not a positive integer", () => {
        expect(() => parseEnv({ APP_BUILD_NUMBER: "not-a-number" })).toThrow(
            "APP_BUILD_NUMBER",
        )
        expect(() => parseEnv({ APP_BUILD_NUMBER: "0" })).toThrow("APP_BUILD_NUMBER")
    })

    it("parses APP_BUILD_NUMBER as a number", () => {
        expect(parseEnv({ APP_BUILD_NUMBER: "42" }).APP_BUILD_NUMBER).toBe(42)
    })
})

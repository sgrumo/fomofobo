import { describe, expect, it } from "vitest"

import { appEnvValues, resolveAppConfig } from "./app-config"

describe("resolveAppConfig", () => {
    it("should answer for every declared environment", () => {
        expect(appEnvValues.map(resolveAppConfig)).toHaveLength(appEnvValues.length)
    })

    it("should serve the dev pages but never the database reset in the preview shape", () => {
        const config = resolveAppConfig("preview")

        expect({
            devPagesEnabled: config.devPagesEnabled,
            apiDocsEnabled: config.apiDocsEnabled,
            verboseErrors: config.verboseErrors,
            secureCookies: config.secureCookies,
            allowInsecureOidc: config.allowInsecureOidc,
            databaseResetEnabled: config.databaseResetEnabled,
        }).toStrictEqual({
            devPagesEnabled: true,
            apiDocsEnabled: true,
            verboseErrors: true,
            secureCookies: true,
            allowInsecureOidc: false,
            databaseResetEnabled: false,
        })
    })

    it("should hide the error detail and the API documentation in the vercel shape", () => {
        const config = resolveAppConfig("vercel")

        expect({
            verboseErrors: config.verboseErrors,
            apiDocsEnabled: config.apiDocsEnabled,
        }).toStrictEqual({ verboseErrors: false, apiDocsEnabled: false })
    })
})

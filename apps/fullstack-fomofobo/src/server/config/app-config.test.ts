import { describe, expect, it } from "vitest"

import { appEnvValues, resolveAppConfig } from "./app-config"

describe("resolveAppConfig", () => {
    it("should answer for every declared environment", () => {
        expect(appEnvValues.map(resolveAppConfig)).toHaveLength(appEnvValues.length)
    })

    it("should hide the error detail and the API documentation in a deployed shape", () => {
        const config = resolveAppConfig("cloudflare")

        expect({
            verboseErrors: config.verboseErrors,
            apiDocsEnabled: config.apiDocsEnabled,
        }).toStrictEqual({ verboseErrors: false, apiDocsEnabled: false })
    })
})

import { describe, expect, it } from "vitest"

import type { AppEnv } from "./app-config"
import { appEnvValues, resolveAppConfig } from "./app-config"

describe("resolveAppConfig", () => {
    it("should answer for every declared environment", () => {
        expect(appEnvValues.map(resolveAppConfig)).toHaveLength(appEnvValues.length)
    })

    it("should hide the error detail and the API documentation in a deployed shape", () => {
        const deployed: AppEnv[] = ["docker", "vercel"]

        expect(
            deployed
                .map(appEnv => resolveAppConfig(appEnv))
                .map(config => ({
                    verboseErrors: config.verboseErrors,
                    apiDocsEnabled: config.apiDocsEnabled,
                })),
        ).toStrictEqual([
            { verboseErrors: false, apiDocsEnabled: false },
            { verboseErrors: false, apiDocsEnabled: false },
        ])
    })
})

import { buildDbSsl } from "storage"
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

    it("should encrypt the database connection on Vercel only", () => {
        expect(
            appEnvValues.filter(appEnv => resolveAppConfig(appEnv).dbSsl !== "off"),
        ).toStrictEqual(["vercel"])
    })

    it("should verify the RDS certificate wherever it encrypts", () => {
        expect(buildDbSsl(resolveAppConfig("vercel").dbSsl)).toMatchObject({
            rejectUnauthorized: true,
        })
    })

    it("should keep the pool small on Vercel, where each instance holds its own", () => {
        expect(resolveAppConfig("vercel").dbPoolSize).toBeLessThan(
            resolveAppConfig("local").dbPoolSize,
        )
    })
})

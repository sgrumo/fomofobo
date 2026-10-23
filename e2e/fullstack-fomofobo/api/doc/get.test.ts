import {
    BackofficeCategoriesRoutes,
    BackofficeEventsRoutes,
    BackofficeOrganizersRoutes,
    BackofficeSessionRoutes,
    BackofficeSettingsRoutes,
    BackofficeVenuesRoutes,
    ClientCompatibilityRoutes,
    PublicRoutes,
} from "api-routes"
import axios from "axios"
import { expectRawStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, expect, it } from "vitest"
import { z } from "zod"

describe("GET /api/doc", () => {
    it("documents every route that the app serves", async () => {
        const groups: Array<Record<string, { method: string; path: string }>> = [
            PublicRoutes,
            ClientCompatibilityRoutes,
            BackofficeSessionRoutes,
            BackofficeCategoriesRoutes,
            BackofficeVenuesRoutes,
            BackofficeEventsRoutes,
            BackofficeOrganizersRoutes,
            BackofficeSettingsRoutes,
        ]
        const served = groups.flatMap(routes =>
            Object.values(routes).map(route => `${route.method} ${route.path}`),
        )

        const res = await axios.get(`${publishedAppUrl()}/api/doc`, {
            validateStatus: () => true,
        })

        expectRawStatus(res, 200)
        const { paths } = z
            .object({ paths: z.record(z.string(), z.record(z.string(), z.unknown())) })
            .parse(res.data)
        expect(
            Object.entries(paths)
                .flatMap(([path, methods]) =>
                    Object.keys(methods).map(method => `${method} ${path}`),
                )
                .toSorted(),
        ).toStrictEqual(served.toSorted())
    })
})

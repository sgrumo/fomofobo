import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { VERSION_GATE_ENV } from "../../server"
import { checkClientCompatibility } from "./api"

describe("GET /api/client-compatibility", () => {
    it("answers ok to the current version of the platform", async () => {
        const res = await checkClientCompatibility({
            headers: {
                "x-app-platform": "ios",
                "x-app-version": VERSION_GATE_ENV.IOS_CURRENT_VERSION,
            },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({ action: "ok" })
    })

    it("answers ok to a caller with no app headers", async () => {
        const res = await checkClientCompatibility({})

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({ action: "ok" })
    })

    it("answers ok to a version semver cannot compare", async () => {
        const res = await checkClientCompatibility({
            headers: { "x-app-platform": "ios", "x-app-version": "1.0" },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({ action: "ok" })
    })

    it("offers an optional update between the minimum and the current version", async () => {
        const res = await checkClientCompatibility({
            headers: { "x-app-platform": "ios", "x-app-version": "1.5.0" },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            action: "update-optional",
            storeUrl: VERSION_GATE_ENV.IOS_STORE_URL,
        })
    })

    it("requires an update below the minimum of a live release", async () => {
        const res = await checkClientCompatibility({
            headers: { "x-app-platform": "ios", "x-app-version": "1.3.9" },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            action: "update-required",
            storeUrl: VERSION_GATE_ENV.IOS_STORE_URL,
        })
    })

    it("answers maintenance below the minimum of a release not live yet", async () => {
        const res = await checkClientCompatibility({
            headers: { "x-app-platform": "android", "x-app-version": "1.9.0" },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({ action: "maintenance" })
    })
})

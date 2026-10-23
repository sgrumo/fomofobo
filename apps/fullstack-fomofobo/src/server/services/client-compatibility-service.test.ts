import { logger } from "backend-shared"
import { semverSchema } from "models"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { ClientPolicy, PlatformPolicy } from "./client-compatibility-service"
import {
    ClientCompatibilityService,
    resolveClientCompatibility,
} from "./client-compatibility-service"

const storeUrl = "market://details?id=it.quinck.fomofobo"

const livePolicy: PlatformPolicy = {
    minVersion: semverSchema.parse("1.4.0"),
    currentVersion: semverSchema.parse("1.6.0"),
    releaseLive: true,
    storeUrl,
}

describe("resolveClientCompatibility", () => {
    it("should return ok for the current version", () => {
        expect(resolveClientCompatibility(livePolicy, "1.6.0")).toStrictEqual({
            action: "ok",
        })
    })

    it("should return ok for a version above the current one", () => {
        expect(resolveClientCompatibility(livePolicy, "1.7.0")).toStrictEqual({
            action: "ok",
        })
    })

    it("should offer an optional update between the two thresholds", () => {
        expect(resolveClientCompatibility(livePolicy, "1.5.0")).toStrictEqual({
            action: "update-optional",
            storeUrl,
        })
    })

    it("should offer an optional update at the minimum version", () => {
        expect(resolveClientCompatibility(livePolicy, "1.4.0")).toStrictEqual({
            action: "update-optional",
            storeUrl,
        })
    })

    it("should require an update below the minimum when the release is live", () => {
        expect(resolveClientCompatibility(livePolicy, "1.3.0")).toStrictEqual({
            action: "update-required",
            storeUrl,
        })
    })

    it("should return maintenance below the minimum while the release is not live", () => {
        const policy: PlatformPolicy = { ...livePolicy, releaseLive: false }

        expect(resolveClientCompatibility(policy, "1.3.0")).toStrictEqual({
            action: "maintenance",
        })
    })

    it("should return maintenance below the minimum when the store URL is absent", () => {
        const policy: PlatformPolicy = { ...livePolicy, storeUrl: undefined }

        expect(resolveClientCompatibility(policy, "1.3.0")).toStrictEqual({
            action: "maintenance",
        })
    })

    it("should return ok instead of an optional update with no store URL", () => {
        const policy: PlatformPolicy = { ...livePolicy, storeUrl: undefined }

        expect(resolveClientCompatibility(policy, "1.5.0")).toStrictEqual({
            action: "ok",
        })
    })

    it("should compare versions by number and not by string", () => {
        const policy: PlatformPolicy = {
            ...livePolicy,
            minVersion: semverSchema.parse("1.10.0"),
            currentVersion: semverSchema.parse("1.10.0"),
        }

        expect(resolveClientCompatibility(policy, "1.9.0")).toStrictEqual({
            action: "update-required",
            storeUrl,
        })
    })

    it("should return ok for a version semver cannot compare", () => {
        expect(resolveClientCompatibility(livePolicy, "1.2")).toStrictEqual({
            action: "ok",
        })
    })

    it("should block nobody while the minimum is absent", () => {
        const policy: PlatformPolicy = { ...livePolicy, minVersion: undefined }

        expect(resolveClientCompatibility(policy, "1.0.0")).toStrictEqual({
            action: "update-optional",
            storeUrl,
        })
    })

    it("should nudge nobody while the current version is absent", () => {
        const policy: PlatformPolicy = { ...livePolicy, currentVersion: undefined }

        expect(resolveClientCompatibility(policy, "1.5.0")).toStrictEqual({
            action: "ok",
        })
    })

    it("should stay asleep for a policy with nothing configured", () => {
        const policy: PlatformPolicy = {
            minVersion: undefined,
            currentVersion: undefined,
            releaseLive: undefined,
            storeUrl: undefined,
        }

        expect(resolveClientCompatibility(policy, "1.0.0")).toStrictEqual({
            action: "ok",
        })
    })

    it("should read an absent release flag as live", () => {
        const policy: PlatformPolicy = { ...livePolicy, releaseLive: undefined }

        expect(resolveClientCompatibility(policy, "1.3.0")).toStrictEqual({
            action: "update-required",
            storeUrl,
        })
    })
})

describe("ClientCompatibilityService.check", () => {
    // Spy keeps the warning of a partial identity out of the test output
    beforeEach(() => {
        vi.spyOn(logger, "warn").mockReturnValue(undefined)
    })

    const blockingPolicy: PlatformPolicy = { ...livePolicy, releaseLive: false }
    const policy: ClientPolicy = { ios: livePolicy, android: blockingPolicy }
    const service = new ClientCompatibilityService(policy)

    it("should answer ok without a warning when neither header arrives", () => {
        expect(service.check(undefined, undefined)).toStrictEqual({ action: "ok" })
        expect(logger.warn).not.toHaveBeenCalled()
    })

    it("should answer ok with a warning for a platform with no version", () => {
        expect(service.check("ios", undefined)).toStrictEqual({ action: "ok" })
        expect(logger.warn).toHaveBeenCalledOnce()
    })

    it("should answer ok with a warning for a version with no platform", () => {
        expect(service.check(undefined, "1.3.0")).toStrictEqual({ action: "ok" })
        expect(logger.warn).toHaveBeenCalledOnce()
    })

    it("should resolve against the policy of the calling platform", () => {
        expect(service.check("ios", "1.3.0")).toStrictEqual({
            action: "update-required",
            storeUrl,
        })
        expect(service.check("android", "1.3.0")).toStrictEqual({
            action: "maintenance",
        })
    })
})

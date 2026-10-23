import { describe, expect, it } from "vitest"

import { isVersionGateBlocking, resolveVersionGateScreen } from "./version-gate-state"

const storeUrl = "market://details?id=it.quinck.fomofobo"

describe("resolveVersionGateScreen", () => {
    it("should hide the gate before the first answer arrives", () => {
        // A failed first request must never block a user.
        expect(resolveVersionGateScreen(undefined)).toStrictEqual({ kind: "hidden" })
    })

    it("should hide the gate for an ok answer", () => {
        expect(resolveVersionGateScreen({ action: "ok" })).toStrictEqual({
            kind: "hidden",
        })
    })

    it("should show a popup for an optional update", () => {
        expect(
            resolveVersionGateScreen({ action: "update-optional", storeUrl }),
        ).toStrictEqual({ kind: "popup", storeUrl })
    })

    it("should block for a required update and keep the store URL", () => {
        expect(
            resolveVersionGateScreen({ action: "update-required", storeUrl }),
        ).toStrictEqual({ kind: "blocked", reason: "update-required", storeUrl })
    })

    it("should block for maintenance with no store URL", () => {
        expect(resolveVersionGateScreen({ action: "maintenance" })).toStrictEqual({
            kind: "blocked",
            reason: "maintenance",
            storeUrl: undefined,
        })
    })

    it("should drop a store URL that arrives with a maintenance answer", () => {
        // The server omits it, and the screen must never show a store button.
        expect(
            resolveVersionGateScreen({ action: "maintenance", storeUrl }),
        ).toStrictEqual({
            kind: "blocked",
            reason: "maintenance",
            storeUrl: undefined,
        })
    })
})

describe("isVersionGateBlocking", () => {
    it("should report no block before the first answer", () => {
        expect(isVersionGateBlocking(undefined)).toBe(false)
    })

    it("should report no block for an optional update", () => {
        expect(isVersionGateBlocking({ action: "update-optional", storeUrl })).toBe(false)
    })

    it("should report a block for a required update", () => {
        expect(isVersionGateBlocking({ action: "update-required", storeUrl })).toBe(true)
    })

    it("should report a block for maintenance", () => {
        expect(isVersionGateBlocking({ action: "maintenance" })).toBe(true)
    })
})

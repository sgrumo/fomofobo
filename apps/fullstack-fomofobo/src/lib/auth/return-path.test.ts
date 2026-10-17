import { describe, expect, it } from "vitest"

import { buildLoginPath, sanitizeReturnPath } from "./return-path"

describe("sanitizeReturnPath", () => {
    it("should keep a backoffice path with its query", () => {
        expect(sanitizeReturnPath("/backoffice")).toBe("/backoffice")
        expect(sanitizeReturnPath("/backoffice/events?page=2")).toBe(
            "/backoffice/events?page=2",
        )
    })

    it("should refuse an absolute URL, which leaves this origin", () => {
        for (const candidate of [
            "https://evil.example.com/backoffice",
            "http://evil.example.com",
        ]) {
            expect(sanitizeReturnPath(candidate)).toBe("/backoffice/events")
        }
    })

    it("should refuse a protocol-relative path and a backslash path, which leave this origin", () => {
        for (const candidate of [
            "//evil.example.com/backoffice",
            String.raw`/\evil.example.com/backoffice`,
            String.raw`/\/evil.example.com`,
        ]) {
            expect(sanitizeReturnPath(candidate)).toBe("/backoffice/events")
        }
    })

    it("should refuse an encoded variant, which stays a path outside the backoffice", () => {
        for (const candidate of [
            "/%2F%2Fevil.example.com",
            "/%5Cevil.example.com",
            "/backoffice/..%2F..%2Fen",
        ]) {
            expect(sanitizeReturnPath(candidate)).not.toMatch(/^\/\/|evil/u)
        }
        expect(sanitizeReturnPath("/%2F%2Fevil.example.com")).toBe("/backoffice/events")
    })

    it("should refuse a path outside the backoffice, dot segments included", () => {
        for (const candidate of ["/en", "/backofficex", "/backoffice/../en", ""]) {
            expect(sanitizeReturnPath(candidate)).toBe("/backoffice/events")
        }
    })

    it("should read an absent value as the events list", () => {
        expect(sanitizeReturnPath(undefined)).toBe("/backoffice/events")
    })
})

describe("buildLoginPath", () => {
    it("should encode the path to return to", () => {
        expect(buildLoginPath("/backoffice/events?page=2")).toBe(
            "/backoffice/login?return-to=%2Fbackoffice%2Fevents%3Fpage%3D2",
        )
    })

    it("should carry the reason the session ended", () => {
        expect(buildLoginPath("/backoffice/venues", "blocked")).toBe(
            "/backoffice/login?return-to=%2Fbackoffice%2Fvenues&reason=blocked",
        )
        expect(buildLoginPath()).toBe("/backoffice/login")
    })
})

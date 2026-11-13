import { describe, expect, it } from "vitest"

import { closingInfoOf } from "./venue-closing"

describe("closingInfoOf", () => {
    it("shows nothing for the closing days of a regular venue that nobody set", () => {
        expect(closingInfoOf({ kind: "regular", closingDays: null })).toStrictEqual({
            type: "unknown",
        })
    })

    it("reads unset closing days of a permanent venue as open every day", () => {
        for (const kind of ["cinema", "museum", "theatre"] as const) {
            expect(closingInfoOf({ kind, closingDays: null })).toStrictEqual({
                type: "always-open",
            })
        }
    })

    it("reads no closing day as open every day", () => {
        expect(closingInfoOf({ kind: "regular", closingDays: [] })).toStrictEqual({
            type: "always-open",
        })
    })

    it("lists the closing days from Monday on", () => {
        expect(
            closingInfoOf({
                kind: "regular",
                closingDays: ["sunday", "tuesday", "monday"],
            }),
        ).toStrictEqual({
            type: "closed",
            days: ["monday", "tuesday", "sunday"],
        })
    })
})

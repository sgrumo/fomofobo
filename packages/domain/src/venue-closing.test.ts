import { describe, expect, it } from "vitest"

import { closingInfoOf } from "./venue-closing"

describe("closingInfoOf", () => {
    it("shows nothing for closing days nobody set", () => {
        expect(closingInfoOf(null)).toStrictEqual({ type: "unknown" })
    })

    it("reads no closing day as open every day", () => {
        expect(closingInfoOf([])).toStrictEqual({ type: "always-open" })
    })

    it("lists the closing days from Monday on", () => {
        expect(closingInfoOf(["sunday", "tuesday", "monday"])).toStrictEqual({
            type: "closed",
            days: ["monday", "tuesday", "sunday"],
        })
    })
})

import { describe, expect, it } from "vitest"

import { checkInDateOf, isCheckInDue } from "./active-device"

describe("isCheckInDue", () => {
    it("asks for one check-in per local date of Rome, the first one included", () => {
        // 23:30 of 27 November in Rome
        const lateEvening = new Date("2026-11-27T22:30:00Z")
        // 00:30 of 28 November in Rome
        const pastMidnight = new Date("2026-11-27T23:30:00Z")

        expect([
            checkInDateOf(lateEvening),
            isCheckInDue(null, lateEvening),
            isCheckInDue("2026-11-27", lateEvening),
            isCheckInDue("2026-11-27", pastMidnight),
        ]).toStrictEqual(["2026-11-27", true, false, true])
    })
})

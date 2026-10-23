import { describe, expect, it } from "vitest"

import { pinStartOf, pinTagOf } from "./pin-tag"

const ROME = "Europe/Rome"
// Friday 2026-10-23, 12:00 in Rome
const FRIDAY_NOON = new Date("2026-10-23T10:00:00Z")

describe("pinStartOf", () => {
    it("returns the time alone for a start today in the zone", () => {
        expect(
            pinStartOf(new Date("2026-10-23T19:30:00Z"), FRIDAY_NOON, ROME),
        ).toStrictEqual({ time: "21:30", day: undefined })
    })

    it("returns the date of a start on another day in the zone", () => {
        // 22:30 UTC on Friday is 00:30 on Saturday in Rome.
        expect(
            pinStartOf(new Date("2026-10-23T22:30:00Z"), FRIDAY_NOON, ROME),
        ).toStrictEqual({ time: "00:30", day: "24/10" })
    })
})

describe("pinTagOf", () => {
    const today = { time: "21:30", day: undefined }
    const otherDay = { time: "21:30", day: "24/10" }

    it("tags a live occurrence as live and an ended one as ended", () => {
        expect([pinTagOf("live", otherDay), pinTagOf("ended", today)]).toStrictEqual([
            { type: "live" },
            { type: "ended" },
        ])
    })

    it("tags an upcoming occurrence with its time today and its date on another day", () => {
        expect([
            pinTagOf("upcoming", today),
            pinTagOf("upcoming", otherDay),
        ]).toStrictEqual([
            { type: "start", text: "21:30" },
            { type: "start", text: "24/10" },
        ])
    })
})

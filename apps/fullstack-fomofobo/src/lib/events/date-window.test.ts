import { describe, expect, it } from "vitest"

import { dateWindow, localDateOf } from "./date-window"

const ROME = "Europe/Rome"
// Friday 2026-10-23, 12:00 in Rome
const FRIDAY_NOON = new Date("2026-10-23T10:00:00Z")

describe("dateWindow", () => {
    it("spans today and the following days by default", () => {
        expect(dateWindow({ date: "default" }, FRIDAY_NOON, ROME)).toStrictEqual({
            from: new Date("2026-10-22T22:00:00Z"),
            to: new Date("2026-10-29T23:00:00Z"),
        })
    })

    it("spans one local day for today and for tomorrow", () => {
        expect([
            dateWindow({ date: "today" }, FRIDAY_NOON, ROME),
            dateWindow({ date: "tomorrow" }, FRIDAY_NOON, ROME),
        ]).toStrictEqual([
            {
                from: new Date("2026-10-22T22:00:00Z"),
                to: new Date("2026-10-23T22:00:00Z"),
            },
            {
                from: new Date("2026-10-23T22:00:00Z"),
                to: new Date("2026-10-24T22:00:00Z"),
            },
        ])
    })

    it("spans the coming weekend on a Friday, across the DST change", () => {
        expect(dateWindow({ date: "weekend" }, FRIDAY_NOON, ROME)).toStrictEqual({
            from: new Date("2026-10-23T22:00:00Z"),
            to: new Date("2026-10-25T23:00:00Z"),
        })
    })

    it("spans the current weekend on a Saturday and on a Sunday", () => {
        const weekend = {
            from: new Date("2026-10-23T22:00:00Z"),
            to: new Date("2026-10-25T23:00:00Z"),
        }

        expect([
            dateWindow({ date: "weekend" }, new Date("2026-10-24T10:00:00Z"), ROME),
            dateWindow({ date: "weekend" }, new Date("2026-10-25T22:30:00Z"), ROME),
        ]).toStrictEqual([weekend, weekend])
    })

    it("spans a custom range from the start of its first day to the end of its last", () => {
        expect(
            dateWindow(
                { date: "range", from: "2026-10-24", to: "2026-10-25" },
                FRIDAY_NOON,
                ROME,
            ),
        ).toStrictEqual({
            from: new Date("2026-10-23T22:00:00Z"),
            to: new Date("2026-10-25T23:00:00Z"),
        })
    })

    it("starts today in the zone, not in UTC, just after local midnight", () => {
        expect(
            dateWindow({ date: "today" }, new Date("2026-10-23T22:30:00Z"), ROME),
        ).toStrictEqual({
            from: new Date("2026-10-23T22:00:00Z"),
            to: new Date("2026-10-24T22:00:00Z"),
        })
    })
})

describe("localDateOf", () => {
    it("returns the local date of the zone", () => {
        expect(localDateOf(new Date("2026-10-23T22:30:00Z"), ROME)).toBe("2026-10-24")
    })
})

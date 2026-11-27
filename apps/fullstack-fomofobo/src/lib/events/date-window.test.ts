import { describe, expect, it } from "vitest"

import { dateWindow, dayPartWindows } from "./date-window"

const ROME = "Europe/Rome"
// Friday 2026-10-23, 12:00 in Rome
const FRIDAY_NOON = new Date("2026-10-23T10:00:00Z")

describe("dateWindow", () => {
    it("spans today and the following days by default", () => {
        expect(dateWindow({ date: "default" }, FRIDAY_NOON, ROME)).toStrictEqual({
            from: new Date("2026-10-22T22:00:00Z"),
            to: new Date("2026-11-21T23:00:00Z"),
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

describe("dayPartWindows", () => {
    const today = dateWindow({ date: "today" }, FRIDAY_NOON, ROME)

    it("spans each day part of the day in local hours, the evening to 06:00 of the next day", () => {
        expect([
            dayPartWindows(today, ["morning"], ROME),
            dayPartWindows(today, ["afternoon"], ROME),
            dayPartWindows(today, ["evening"], ROME),
        ]).toStrictEqual([
            [
                {
                    from: new Date("2026-10-23T04:00:00Z"),
                    to: new Date("2026-10-23T10:00:00Z"),
                },
            ],
            [
                {
                    from: new Date("2026-10-23T10:00:00Z"),
                    to: new Date("2026-10-23T16:00:00Z"),
                },
            ],
            [
                {
                    from: new Date("2026-10-23T16:00:00Z"),
                    to: new Date("2026-10-24T04:00:00Z"),
                },
            ],
        ])
    })

    it("merges the parts that touch, in the order of the day", () => {
        expect(dayPartWindows(today, ["evening", "afternoon"], ROME)).toStrictEqual([
            {
                from: new Date("2026-10-23T10:00:00Z"),
                to: new Date("2026-10-24T04:00:00Z"),
            },
        ])
    })

    it("repeats the parts on each day of the window, across the DST change", () => {
        const weekend = dateWindow({ date: "weekend" }, FRIDAY_NOON, ROME)

        expect(dayPartWindows(weekend, ["morning", "evening"], ROME)).toStrictEqual([
            {
                from: new Date("2026-10-24T04:00:00Z"),
                to: new Date("2026-10-24T10:00:00Z"),
            },
            {
                from: new Date("2026-10-24T16:00:00Z"),
                to: new Date("2026-10-25T11:00:00Z"),
            },
            {
                from: new Date("2026-10-25T17:00:00Z"),
                to: new Date("2026-10-26T05:00:00Z"),
            },
        ])
    })
})

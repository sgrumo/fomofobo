import { describe, expect, it } from "vitest"

import { formatLocalDateTime, weekdayDateOf } from "./local-format"

describe("weekdayDateOf", () => {
    // 22:30 UTC on Wednesday the 14th is 00:30 on Thursday the 15th in Rome.
    const lateEvening = new Date("2026-10-14T22:30:00Z")

    it.each([
        { language: "it", timeZone: "Europe/Rome", expected: "gio 15.10" },
        { language: "en", timeZone: "Europe/Rome", expected: "Thu 15.10" },
        { language: "en", timeZone: "UTC", expected: "Wed 14.10" },
    ])(
        "reads $expected in $language and $timeZone",
        ({ language, timeZone, expected }) => {
            expect(weekdayDateOf(lateEvening, timeZone, language)).toBe(expected)
        },
    )
})

describe("formatLocalDateTime", () => {
    it("reads the wall clock of the value, whatever the zone of the machine", () => {
        expect(formatLocalDateTime("2026-10-24T21:00")).toBe("24.10.26 21:00")
        expect(formatLocalDateTime("2026-03-29T02:30")).toBe("29.03.26 02:30")
    })
})

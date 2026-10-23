import { describe, expect, it } from "vitest"

import {
    dateTimeOf,
    dayMonthOf,
    formatLocalDate,
    formatLocalDateTime,
    localDateOf,
    weekdayDateOf,
} from "./local-format"

describe("localDateOf", () => {
    it("returns the local date of the zone", () => {
        expect(localDateOf(new Date("2026-10-23T22:30:00Z"), "Europe/Rome")).toBe(
            "2026-10-24",
        )
    })
})

describe("dayMonthOf", () => {
    it("reads the day of the zone", () => {
        // 22:30 UTC on the 14th is 00:30 on the 15th in Rome.
        const lateEvening = new Date("2026-10-14T22:30:00Z")
        expect(dayMonthOf(lateEvening, "Europe/Rome")).toBe("15/10")
        expect(dayMonthOf(lateEvening, "UTC")).toBe("14/10")
    })
})

describe("dateTimeOf", () => {
    it("reads the date and the time of the zone", () => {
        // 22:30 UTC on the 14th is 00:30 on the 15th in Rome.
        const lateEvening = new Date("2026-10-14T22:30:00Z")
        expect(dateTimeOf(lateEvening, "Europe/Rome")).toBe("15/10/2026 00:30")
        expect(dateTimeOf(lateEvening, "UTC")).toBe("14/10/2026 22:30")
    })
})

describe("weekdayDateOf", () => {
    // 22:30 UTC on Wednesday the 14th is 00:30 on Thursday the 15th in Rome.
    const lateEvening = new Date("2026-10-14T22:30:00Z")

    it.each([
        { language: "it", timeZone: "Europe/Rome", expected: "gio 15/10" },
        { language: "it", timeZone: "UTC", expected: "mer 14/10" },
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

describe("formatLocalDate", () => {
    it("reads the day, the month and the year of the value", () => {
        expect(formatLocalDate("2026-10-04")).toBe("04/10/2026")
    })
})

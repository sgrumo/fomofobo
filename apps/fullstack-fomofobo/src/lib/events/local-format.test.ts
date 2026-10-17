import { describe, expect, it } from "vitest"

import { weekdayDateOf } from "./local-format"

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

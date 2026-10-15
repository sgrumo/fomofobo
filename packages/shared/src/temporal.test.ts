import { afterEach, describe, expect, it, vi } from "vitest"

import {
    dateFromIso,
    humanDate,
    isoDate,
    isoTime,
    sleep,
    timeFromString,
} from "./temporal"
import type { Time } from "./temporal"

describe("dateFromIso", () => {
    it("parses yyyy-MM-dd as a local date", () => {
        const date = dateFromIso("2024-03-15")
        expect(date.getFullYear()).toBe(2024)
        expect(date.getMonth()).toBe(2)
        expect(date.getDate()).toBe(15)
    })

    it("round-trips through isoDate", () => {
        expect(isoDate(dateFromIso("2024-01-05"))).toBe("2024-01-05")
    })

    it("yields an invalid date for a malformed value", () => {
        expect(Number.isNaN(dateFromIso("not-a-date").getTime())).toBe(true)
    })
})

describe("isoDate", () => {
    it("formats a valid date to yyyy-MM-dd", () => {
        expect(isoDate(new Date("2024-03-15"))).toBe("2024-03-15")
    })

    it("pads single-digit month and day", () => {
        expect(isoDate(new Date("2024-01-05"))).toBe("2024-01-05")
    })

    it("does not throw for an invalid date", () => {
        const invalid = new Date("not-a-date")
        expect(() => isoDate(invalid)).not.toThrow()
    })
})

describe("humanDate", () => {
    it("returns a locale date string", () => {
        const date = new Date("2024-03-15")
        expect(humanDate(date)).toBe(date.toLocaleDateString())
    })
})

describe("isoTime", () => {
    it("formats hours and minutes", () => {
        expect(isoTime({ hours: 9, minutes: 5, seconds: 0, milliseconds: 0 })).toBe(
            "09:05",
        )
    })

    it("formats hours, minutes and seconds when seconds > 0", () => {
        expect(isoTime({ hours: 1, minutes: 2, seconds: 3, milliseconds: 0 })).toBe(
            "01:02:03",
        )
    })

    it("formats hours, minutes, seconds and milliseconds when milliseconds > 0", () => {
        expect(isoTime({ hours: 1, minutes: 2, seconds: 3, milliseconds: 456 })).toBe(
            "01:02:03.456",
        )
    })

    it("includes seconds when milliseconds > 0 but seconds = 0", () => {
        expect(isoTime({ hours: 1, minutes: 2, seconds: 0, milliseconds: 100 })).toBe(
            "01:02:00.100",
        )
    })

    it("pads hours and minutes to 2 digits", () => {
        expect(isoTime({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })).toBe(
            "00:00",
        )
    })

    it("pads milliseconds to 3 digits", () => {
        expect(isoTime({ hours: 0, minutes: 0, seconds: 1, milliseconds: 5 })).toBe(
            "00:00:01.005",
        )
    })
})

describe("timeFromString", () => {
    it("parses HH:MM format", () => {
        expect(timeFromString("09:05")).toStrictEqual<Time>({
            hours: 9,
            minutes: 5,
            seconds: 0,
            milliseconds: 0,
        })
    })

    it("parses HH:MM:SS format", () => {
        expect(timeFromString("01:02:03")).toStrictEqual<Time>({
            hours: 1,
            minutes: 2,
            seconds: 3,
            milliseconds: 0,
        })
    })

    it("parses HH:MM:SS.mmm format", () => {
        expect(timeFromString("01:02:03.456")).toStrictEqual<Time>({
            hours: 1,
            minutes: 2,
            seconds: 3,
            milliseconds: 456,
        })
    })

    it("parses midnight", () => {
        expect(timeFromString("00:00")).toStrictEqual<Time>({
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
        })
    })

    it("round-trips with isoTime", () => {
        const original: Time = { hours: 14, minutes: 30, seconds: 45, milliseconds: 123 }
        expect(timeFromString(isoTime(original))).toStrictEqual(original)
    })

    it("round-trips isoTime with no seconds", () => {
        const original: Time = { hours: 8, minutes: 0, seconds: 0, milliseconds: 0 }
        expect(timeFromString(isoTime(original))).toStrictEqual(original)
    })
})

describe("sleep", () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    it("resolves only once the given milliseconds have elapsed", async () => {
        vi.useFakeTimers()
        const onResolved = vi.fn<() => void>()
        const settled = sleep({ ms: 100 }).then(onResolved)

        await vi.advanceTimersByTimeAsync(99)
        expect(onResolved).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(1)
        await settled
        expect(onResolved).toHaveBeenCalledOnce()
    })
})

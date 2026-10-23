import { parseISO } from "date-fns"
import { describe, expect, it } from "vitest"

import {
    categoryCountOf,
    categoryQueryOf,
    earliestRangeDayOf,
    freeQueryOf,
    hasActiveFilters,
    isValidRange,
    quickDateQueryOf,
    rangeLabelOf,
    rangeQueryOf,
} from "./map-filters"

describe("categoryQueryOf", () => {
    it("sets the category on a press and clears it on a release", () => {
        const categoryId = crypto.randomUUID()

        expect(categoryQueryOf(categoryId, true)).toStrictEqual({ category: categoryId })
        expect(categoryQueryOf(categoryId, false)).toStrictEqual({ category: undefined })
    })
})

describe("quickDateQueryOf", () => {
    it("sets the kind and clears the range on a press", () => {
        expect(quickDateQueryOf("weekend", true)).toStrictEqual({
            date: "weekend",
            from: undefined,
            to: undefined,
        })
    })

    it("clears the date filter on a release", () => {
        expect(quickDateQueryOf("today", false)).toStrictEqual({
            date: undefined,
            from: undefined,
            to: undefined,
        })
    })
})

describe("rangeQueryOf", () => {
    it("writes the local days of the range", () => {
        expect(
            rangeQueryOf(parseISO("2026-10-24"), parseISO("2026-10-31")),
        ).toStrictEqual({ date: "range", from: "2026-10-24", to: "2026-10-31" })
    })
})

describe("freeQueryOf", () => {
    it("sets true on a press and clears the key on a release", () => {
        expect(freeQueryOf(true)).toStrictEqual({ free: true })
        expect(freeQueryOf(false)).toStrictEqual({ free: undefined })
    })
})

describe("hasActiveFilters", () => {
    it("is false with no category, date or free filter", () => {
        expect(hasActiveFilters({ free: false })).toBe(false)
    })

    it("is true with a category, a date filter or the free filter", () => {
        expect(hasActiveFilters({ category: crypto.randomUUID() })).toBe(true)
        expect(hasActiveFilters({ date: "tomorrow" })).toBe(true)
        expect(hasActiveFilters({ free: true })).toBe(true)
    })
})

describe("categoryCountOf", () => {
    it("returns the count of the category, else 0", () => {
        const music = crypto.randomUUID()
        const counts = [{ categoryId: music, count: 4 }]

        expect(categoryCountOf(counts, music)).toBe(4)
        expect(categoryCountOf(counts, crypto.randomUUID())).toBe(0)
    })
})

describe("earliestRangeDayOf", () => {
    it("returns the day of the platform zone", () => {
        expect(earliestRangeDayOf(new Date("2026-10-23T22:30:00Z"))).toStrictEqual(
            parseISO("2026-10-24"),
        )
    })
})

describe("isValidRange", () => {
    const earliest = parseISO("2026-10-23")

    it("accepts a range from the earliest day, one day long", () => {
        expect(isValidRange(earliest, earliest, earliest)).toBe(true)
    })

    it("rejects a range that starts before the earliest day", () => {
        expect(isValidRange(parseISO("2026-10-22"), earliest, earliest)).toBe(false)
    })

    it("rejects a range that ends before its start", () => {
        expect(
            isValidRange(parseISO("2026-10-25"), parseISO("2026-10-24"), earliest),
        ).toBe(false)
    })
})

describe("rangeLabelOf", () => {
    it("labels a custom range with its days", () => {
        expect(
            rangeLabelOf({ date: "range", from: "2026-10-24", to: "2026-11-02" }),
        ).toBe("24/10–02/11")
    })

    it("returns undefined for another date filter", () => {
        expect(
            rangeLabelOf({ date: "today", from: undefined, to: undefined }),
        ).toBeUndefined()
    })
})

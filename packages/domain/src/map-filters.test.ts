import { parseISO } from "date-fns"
import { describe, expect, it } from "vitest"

import {
    categoryChipOrderOf,
    categoryQueryOf,
    earliestRangeDayOf,
    freeQueryOf,
    hasActiveFilters,
    isValidRange,
    kindQueryOf,
    quickDateQueryOf,
    rangeLabelOf,
    rangeQueryOf,
    shownKindsOf,
    shownResultsOf,
} from "./map-filters"

const now = new Date("2026-10-23T20:00:00Z")

/**
 * @description Builds an occurrence result with the start and end instants
 * @param startsAt Start instant
 * @param endsAt End instant
 */
const buildOccurrence = (startsAt: string, endsAt: string) => ({
    id: crypto.randomUUID(),
    startsAt,
    endsAt,
})

const live = buildOccurrence("2026-10-23T19:00:00Z", "2026-10-23T22:00:00Z")
const upcoming = buildOccurrence("2026-10-24T19:00:00Z", "2026-10-24T22:00:00Z")
const ended = buildOccurrence("2026-10-22T19:00:00Z", "2026-10-22T22:00:00Z")

describe("categoryQueryOf", () => {
    const music = crypto.randomUUID()
    const food = crypto.randomUUID()

    it("adds the category on a press, beside the pressed ones", () => {
        expect(categoryQueryOf(undefined, music, true)).toStrictEqual({
            categories: [music],
        })
        expect(categoryQueryOf([music], food, true)).toStrictEqual({
            categories: [music, food],
        })
    })

    it("takes the category away on a release, and clears the key with none left", () => {
        expect(categoryQueryOf([music, food], music, false)).toStrictEqual({
            categories: [food],
        })
        expect(categoryQueryOf([food], food, false)).toStrictEqual({
            categories: undefined,
        })
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
        expect(hasActiveFilters({ categories: [crypto.randomUUID()] })).toBe(true)
        expect(hasActiveFilters({ date: "tomorrow" })).toBe(true)
        expect(hasActiveFilters({ free: true })).toBe(true)
    })
})

describe("categoryChipOrderOf", () => {
    it("keeps the list order and moves the other category last", () => {
        const other = { name: "Altro", icon: "other" as const }
        const music = { name: "Musica", icon: "music" as const }
        const food = { name: "Cibo", icon: "food" as const }

        expect(categoryChipOrderOf([other, music, food])).toStrictEqual([
            music,
            food,
            other,
        ])
    })
})

describe("shownKindsOf", () => {
    it("shows the live and upcoming results with no kind filter", () => {
        expect(shownKindsOf({})).toStrictEqual(new Set(["live", "upcoming"]))
    })

    it("applies each kind filter over its default", () => {
        expect(
            shownKindsOf({ showLive: false, showPermanent: true, showEnded: true }),
        ).toStrictEqual(new Set(["upcoming", "permanent", "ended"]))
    })
})

describe("kindQueryOf", () => {
    it("writes a tap that leaves the default of its kind", () => {
        expect(kindQueryOf("live", false)).toStrictEqual({ showLive: false })
        expect(kindQueryOf("ended", true)).toStrictEqual({ showEnded: true })
    })

    it("clears the key of a tap that gives back the default of its kind", () => {
        expect(kindQueryOf("upcoming", true)).toStrictEqual({ showUpcoming: undefined })
        expect(kindQueryOf("permanent", false)).toStrictEqual({
            showPermanent: undefined,
        })
    })
})

describe("shownResultsOf", () => {
    const venue = { id: crypto.randomUUID() }
    const results = {
        occurrences: [live, upcoming, ended],
        permanentVenues: [venue],
        truncated: false,
    }

    it("keeps the occurrences of a shown status and the rest of the response", () => {
        expect(shownResultsOf(results, new Set(["live", "ended"]), now)).toStrictEqual({
            occurrences: [live, ended],
            permanentVenues: [],
            truncated: false,
        })
    })

    it("keeps the permanent venues when their kind is shown", () => {
        expect(
            shownResultsOf(results, new Set(["permanent"]), now).permanentVenues,
        ).toStrictEqual([venue])
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

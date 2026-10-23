import { it as italian } from "date-fns/locale"
import { describe, expect, it } from "vitest"

import { monthWeeks, nextDateRange } from "./date-range"

describe("nextDateRange", () => {
    it("starts a range on the first tap", () => {
        expect(nextDateRange({}, new Date(2026, 9, 10))).toStrictEqual({
            from: new Date(2026, 9, 10),
        })
    })

    it("ends the range on a later day", () => {
        expect(
            nextDateRange({ from: new Date(2026, 9, 10) }, new Date(2026, 9, 12)),
        ).toStrictEqual({ from: new Date(2026, 9, 10), to: new Date(2026, 9, 12) })
    })

    it("starts over on a day before the start", () => {
        expect(
            nextDateRange({ from: new Date(2026, 9, 10) }, new Date(2026, 9, 8)),
        ).toStrictEqual({ from: new Date(2026, 9, 8) })
    })

    it("starts over after a full range", () => {
        expect(
            nextDateRange(
                { from: new Date(2026, 9, 10), to: new Date(2026, 9, 12) },
                new Date(2026, 9, 20),
            ),
        ).toStrictEqual({ from: new Date(2026, 9, 20) })
    })
})

describe("monthWeeks", () => {
    it("starts the Italian week on Monday and pads the month with empty cells", () => {
        const weeks = monthWeeks(new Date(2026, 9, 23), italian)

        expect(weeks).toHaveLength(5)
        expect(weeks[0]?.slice(0, 4)).toStrictEqual([
            undefined,
            undefined,
            undefined,
            new Date(2026, 9, 1),
        ])
        expect(weeks[4]?.slice(4)).toStrictEqual([
            new Date(2026, 9, 30),
            new Date(2026, 9, 31),
            undefined,
        ])
    })

    it("needs no leading cell when the month starts on Monday", () => {
        expect(monthWeeks(new Date(2026, 5, 1), italian)[0]?.[0]).toStrictEqual(
            new Date(2026, 5, 1),
        )
    })
})

import { describe, expect, it } from "vitest"

import type { Recurrence } from "./recurrence"
import { recurrenceSchema } from "./recurrence"

/**
 * @description Builds a weekly recurrence on Wednesdays, with the overrides on top
 * @param overrides Fields replaced
 */
const buildRecurrence = (overrides: Partial<Recurrence> = {}): Recurrence => ({
    rule: { frequency: "weekly", weekdays: ["wednesday"], until: "2026-12-30" },
    addedDates: [],
    removedDates: [],
    ...overrides,
})

describe("recurrenceSchema", () => {
    it("accepts added and removed dates that differ", () => {
        expect(
            recurrenceSchema.safeParse(
                buildRecurrence({
                    addedDates: ["2026-10-17"],
                    removedDates: ["2026-10-21"],
                }),
            ).success,
        ).toBe(true)
    })

    it("rejects a date listed twice", () => {
        const result = recurrenceSchema.safeParse(
            buildRecurrence({ removedDates: ["2026-10-21", "2026-10-21"] }),
        )

        expect(result.error?.issues).toMatchObject([
            { code: "custom", params: { errorCode: "duplicate-date" } },
        ])
    })

    it("rejects a date both added and removed", () => {
        const result = recurrenceSchema.safeParse(
            buildRecurrence({ addedDates: ["2026-10-21"], removedDates: ["2026-10-21"] }),
        )

        expect(result.error?.issues).toMatchObject([
            { code: "custom", params: { errorCode: "date-added-and-removed" } },
        ])
    })

    it("rejects a weekly rule with no weekday", () => {
        expect(
            recurrenceSchema.safeParse(
                buildRecurrence({
                    rule: { frequency: "weekly", weekdays: [], until: "2026-12-30" },
                }),
            ).success,
        ).toBe(false)
    })
})
